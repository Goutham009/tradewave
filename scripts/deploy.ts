import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

interface DeployedContracts {
  network: string;
  deployedAt: string;
  contracts: {
    [key: string]: {
      address: string;
      transactionHash: string;
    };
  };
}

async function main() {
  console.log('Starting deployment...\n');

  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log('Deploying contracts with account:', deployer.address);
  console.log('Network:', network.name, '(Chain ID:', network.chainId, ')');
  console.log('Account balance:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'ETH\n');

  const deployedContracts: DeployedContracts = {
    network: network.name,
    deployedAt: new Date().toISOString(),
    contracts: {},
  };

  // Deploy DocumentVerification
  console.log('Deploying DocumentVerification...');
  const DocumentVerification = await ethers.getContractFactory('DocumentVerification');
  const documentVerification = await DocumentVerification.deploy();
  await documentVerification.waitForDeployment();
  const docVerificationAddress = await documentVerification.getAddress();
  console.log('DocumentVerification deployed to:', docVerificationAddress);
  deployedContracts.contracts['DocumentVerification'] = {
    address: docVerificationAddress,
    transactionHash: documentVerification.deploymentTransaction()?.hash || '',
  };

  // Deploy AuditLog
  console.log('\nDeploying AuditLog...');
  const AuditLog = await ethers.getContractFactory('AuditLog');
  const auditLog = await AuditLog.deploy();
  await auditLog.waitForDeployment();
  const auditLogAddress = await auditLog.getAddress();
  console.log('AuditLog deployed to:', auditLogAddress);
  deployedContracts.contracts['AuditLog'] = {
    address: auditLogAddress,
    transactionHash: auditLog.deploymentTransaction()?.hash || '',
  };

  // Save deployment info
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deployedContracts, null, 2));
  console.log('\nDeployment info saved to:', deploymentFile);

  // Generate TypeScript constants
  const constantsContent = `// Auto-generated contract addresses
// Network: ${network.name}
// Deployed: ${deployedContracts.deployedAt}

export const CONTRACT_ADDRESSES = {
  DocumentVerification: '${docVerificationAddress}',
  AuditLog: '${auditLogAddress}',
} as const;

export const DEPLOYMENT_NETWORK = '${network.name}';
export const DEPLOYMENT_CHAIN_ID = ${network.chainId};
`;

  const constantsFile = path.join(__dirname, '..', 'src', 'lib', 'blockchain', 'contractAddresses.ts');
  fs.writeFileSync(constantsFile, constantsContent);
  console.log('Contract addresses saved to:', constantsFile);

  console.log('\n=== Deployment Complete ===');
  console.log('DocumentVerification:', docVerificationAddress);
  console.log('AuditLog:', auditLogAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
