import { ethers, JsonRpcProvider, Wallet, Contract } from 'ethers';

const NETWORKS = {
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL_SEPOLIA || 'https://sepolia.infura.io/v3/',
    explorerUrl: 'https://sepolia.etherscan.io',
    currency: 'ETH',
  },
  polygon: {
    chainId: 80001,
    name: 'Polygon Mumbai',
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL_POLYGON || 'https://polygon-mumbai.infura.io/v3/',
    explorerUrl: 'https://mumbai.polygonscan.com',
    currency: 'MATIC',
  },
  mainnet: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    explorerUrl: 'https://etherscan.io',
    currency: 'ETH',
  },
};

export type NetworkName = keyof typeof NETWORKS;

let provider: JsonRpcProvider | null = null;
let signer: Wallet | null = null;

export function getNetwork(networkName: NetworkName = 'sepolia') {
  return NETWORKS[networkName];
}

export function getProvider(networkName: NetworkName = 'sepolia'): JsonRpcProvider {
  const network = NETWORKS[networkName];
  if (!provider) {
    provider = new JsonRpcProvider(network.rpcUrl);
  }
  return provider;
}

export function getSigner(privateKey: string, networkName: NetworkName = 'sepolia'): Wallet {
  const provider = getProvider(networkName);
  if (!signer) {
    signer = new Wallet(privateKey, provider);
  }
  return signer;
}

export function getDeployerSigner(networkName: NetworkName = 'sepolia'): Wallet {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('DEPLOYER_PRIVATE_KEY is not set');
  }
  return getSigner(privateKey, networkName);
}

export async function getBlockNumber(networkName: NetworkName = 'sepolia'): Promise<number> {
  const provider = getProvider(networkName);
  return await provider.getBlockNumber();
}

export async function getGasPrice(networkName: NetworkName = 'sepolia'): Promise<bigint> {
  const provider = getProvider(networkName);
  const feeData = await provider.getFeeData();
  return feeData.gasPrice || BigInt(0);
}

export async function getBalance(address: string, networkName: NetworkName = 'sepolia'): Promise<string> {
  const provider = getProvider(networkName);
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

export async function getTransactionReceipt(txHash: string, networkName: NetworkName = 'sepolia') {
  const provider = getProvider(networkName);
  return await provider.getTransactionReceipt(txHash);
}

export async function waitForTransaction(
  txHash: string,
  confirmations: number = 2,
  networkName: NetworkName = 'sepolia'
) {
  const provider = getProvider(networkName);
  return await provider.waitForTransaction(txHash, confirmations);
}

export function getContract(
  contractAddress: string,
  abi: any[],
  signerOrProvider?: Wallet | JsonRpcProvider,
  networkName: NetworkName = 'sepolia'
): Contract {
  const providerOrSigner = signerOrProvider || getProvider(networkName);
  return new Contract(contractAddress, abi, providerOrSigner);
}

export function getExplorerUrl(
  hash: string,
  type: 'tx' | 'address' = 'tx',
  networkName: NetworkName = 'sepolia'
): string {
  const network = NETWORKS[networkName];
  return `${network.explorerUrl}/${type}/${hash}`;
}

export async function isConnected(networkName: NetworkName = 'sepolia'): Promise<boolean> {
  try {
    const provider = getProvider(networkName);
    await provider.getBlockNumber();
    return true;
  } catch {
    return false;
  }
}

export async function getNetworkStatus(networkName: NetworkName = 'sepolia') {
  try {
    const provider = getProvider(networkName);
    const network = NETWORKS[networkName];
    const [blockNumber, gasPrice, isConnectedResult] = await Promise.all([
      provider.getBlockNumber(),
      getGasPrice(networkName),
      isConnected(networkName),
    ]);

    return {
      network: networkName,
      chainId: network.chainId,
      name: network.name,
      isConnected: isConnectedResult,
      blockNumber,
      gasPrice: ethers.formatUnits(gasPrice, 'gwei'),
      explorerUrl: network.explorerUrl,
      rpcUrl: network.rpcUrl,
    };
  } catch (error) {
    return {
      network: networkName,
      chainId: NETWORKS[networkName].chainId,
      name: NETWORKS[networkName].name,
      isConnected: false,
      blockNumber: 0,
      gasPrice: '0',
      explorerUrl: NETWORKS[networkName].explorerUrl,
      rpcUrl: NETWORKS[networkName].rpcUrl,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export { ethers };
