import { ethers, Contract, Wallet } from 'ethers';
import { getProvider, getSigner, getExplorerUrl, NetworkName } from './web3Client';

// Escrow Smart Contract ABI (Fiat Currency Version)
const ESCROW_ABI = [
  "function createEscrow(address buyer, address supplier, uint256 amount, string currency) external returns (uint256)",
  "function releasePayment(uint256 escrowId) external",
  "function refundBuyer(uint256 escrowId) external",
  "function getEscrowStatus(uint256 escrowId) external view returns (uint8)",
  "function getEscrowDetails(uint256 escrowId) external view returns (address buyer, address supplier, uint256 amount, string currency, uint8 status)",
  "event EscrowCreated(uint256 indexed escrowId, address buyer, address supplier, uint256 amount, string currency)",
  "event PaymentReleased(uint256 indexed escrowId, address supplier, uint256 amount)",
  "event PaymentRefunded(uint256 indexed escrowId, address buyer, uint256 amount)",
  "event EscrowDisputed(uint256 indexed escrowId, address initiator)"
];

export type EscrowStatus = 'CREATED' | 'ACTIVE' | 'RELEASED' | 'REFUNDED' | 'DISPUTED' | 'UNKNOWN';
export type SupportedCurrency = 'USD' | 'EUR' | 'INR';

export interface EscrowCreateResult {
  success: boolean;
  escrowId: string;
  transactionHash: string;
  blockNumber: number;
  amount: number;
  currency: SupportedCurrency;
}

export interface EscrowActionResult {
  success: boolean;
  transactionHash: string;
  blockNumber: number;
}

export interface GasEstimate {
  gasEstimate: string;
  gasCostUSD: number;
}

export class EscrowService {
  private networkName: NetworkName;
  private escrowContract: Contract;

  constructor(networkName: NetworkName = 'sepolia') {
    this.networkName = networkName;
    const provider = getProvider(networkName);
    const contractAddress = process.env.ESCROW_CONTRACT_ADDRESS;
    
    if (!contractAddress) {
      console.warn('ESCROW_CONTRACT_ADDRESS not set, using mock mode');
    }

    this.escrowContract = new Contract(
      contractAddress || '0x0000000000000000000000000000000000000000',
      ESCROW_ABI,
      provider
    );
  }

  /**
   * Create escrow for transaction with fiat currency
   */
  async createEscrow(
    buyerAddress: string,
    supplierAddress: string,
    amount: number,
    currency: SupportedCurrency,
    buyerPrivateKey: string
  ): Promise<EscrowCreateResult> {
    try {
      const wallet = getSigner(buyerPrivateKey, this.networkName);
      const escrowWithSigner = this.escrowContract.connect(wallet) as Contract;

      // Convert amount to wei equivalent (18 decimals for consistency)
      const amountInWei = ethers.parseEther(amount.toString());

      const createTx = await escrowWithSigner.createEscrow(
        buyerAddress,
        supplierAddress,
        amountInWei,
        currency
      );
      const receipt = await createTx.wait();

      // Extract escrow ID from event
      const event = receipt.logs?.find((log: any) => {
        try {
          const parsed = this.escrowContract.interface.parseLog(log);
          return parsed?.name === 'EscrowCreated';
        } catch { return false; }
      });
      
      let escrowId = '0';
      if (event) {
        const parsed = this.escrowContract.interface.parseLog(event);
        escrowId = parsed?.args?.escrowId?.toString() || '0';
      }

      return {
        success: true,
        escrowId,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        amount,
        currency,
      };
    } catch (error) {
      console.error('Escrow creation error:', error);
      throw new Error('Failed to create escrow');
    }
  }

  /**
   * Release payment to supplier (after delivery confirmation)
   */
  async releasePayment(escrowId: string, adminPrivateKey: string): Promise<EscrowActionResult> {
    try {
      const wallet = getSigner(adminPrivateKey, this.networkName);
      const escrowWithSigner = this.escrowContract.connect(wallet) as Contract;

      const releaseTx = await escrowWithSigner.releasePayment(escrowId);
      const receipt = await releaseTx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Payment release error:', error);
      throw new Error('Failed to release payment');
    }
  }

  /**
   * Refund buyer (in case of dispute resolution)
   */
  async refundBuyer(escrowId: string, adminPrivateKey: string): Promise<EscrowActionResult> {
    try {
      const wallet = getSigner(adminPrivateKey, this.networkName);
      const escrowWithSigner = this.escrowContract.connect(wallet) as Contract;

      const refundTx = await escrowWithSigner.refundBuyer(escrowId);
      const receipt = await refundTx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      console.error('Refund error:', error);
      throw new Error('Failed to refund buyer');
    }
  }

  /**
   * Get escrow status
   * 0: Created, 1: Active, 2: Released, 3: Refunded, 4: Disputed
   */
  async getEscrowStatus(escrowId: string): Promise<{ status: EscrowStatus; statusCode: number }> {
    try {
      const status = await this.escrowContract.getEscrowStatus(escrowId);
      const statusCode = Number(status);
      
      const statusMap: Record<number, EscrowStatus> = {
        0: 'CREATED',
        1: 'ACTIVE',
        2: 'RELEASED',
        3: 'REFUNDED',
        4: 'DISPUTED',
      };

      return {
        status: statusMap[statusCode] || 'UNKNOWN',
        statusCode,
      };
    } catch (error) {
      console.error('Get status error:', error);
      throw new Error('Failed to get escrow status');
    }
  }

  /**
   * Get escrow details
   */
  async getEscrowDetails(escrowId: string) {
    try {
      const details = await this.escrowContract.getEscrowDetails(escrowId);
      return {
        buyer: details[0],
        supplier: details[1],
        amount: ethers.formatEther(details[2]),
        currency: details[3],
        status: this.mapStatusCode(Number(details[4])),
      };
    } catch (error) {
      console.error('Get escrow details error:', error);
      throw new Error('Failed to get escrow details');
    }
  }

  /**
   * Get gas estimate for transaction
   */
  async estimateGasCost(
    action: 'CREATE' | 'RELEASE' | 'REFUND',
    params: Record<string, any>
  ): Promise<GasEstimate> {
    try {
      const provider = getProvider(this.networkName);
      let gasEstimate: bigint;
      
      switch (action) {
        case 'CREATE':
          gasEstimate = await this.escrowContract.createEscrow.estimateGas(
            params.buyer,
            params.supplier,
            ethers.parseEther(params.amount.toString()),
            params.currency
          );
          break;
        case 'RELEASE':
          gasEstimate = await this.escrowContract.releasePayment.estimateGas(params.escrowId);
          break;
        case 'REFUND':
          gasEstimate = await this.escrowContract.refundBuyer.estimateGas(params.escrowId);
          break;
        default:
          throw new Error('Invalid action');
      }

      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt(0);
      const gasCostWei = gasEstimate * gasPrice;
      const gasCostEth = parseFloat(ethers.formatEther(gasCostWei));
      
      // Convert to USD (fetch from oracle in production)
      const ethPriceUSD = 2000;
      const gasCostUSD = gasCostEth * ethPriceUSD;

      return {
        gasEstimate: gasEstimate.toString(),
        gasCostUSD: parseFloat(gasCostUSD.toFixed(2)),
      };
    } catch (error) {
      console.error('Gas estimation error:', error);
      throw new Error('Failed to estimate gas cost');
    }
  }

  /**
   * Get blockchain explorer URL for transaction
   */
  getExplorerUrl(txHash: string): string {
    return getExplorerUrl(txHash, 'tx', this.networkName);
  }

  private mapStatusCode(code: number): EscrowStatus {
    const statusMap: Record<number, EscrowStatus> = {
      0: 'CREATED',
      1: 'ACTIVE',
      2: 'RELEASED',
      3: 'REFUNDED',
      4: 'DISPUTED',
    };
    return statusMap[code] || 'UNKNOWN';
  }
}

// Singleton instance
let escrowServiceInstance: EscrowService | null = null;

export function getEscrowService(networkName: NetworkName = 'sepolia'): EscrowService {
  if (!escrowServiceInstance) {
    escrowServiceInstance = new EscrowService(networkName);
  }
  return escrowServiceInstance;
}
