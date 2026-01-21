import { ethers } from 'ethers';
import {
  getProvider,
  getDeployerSigner,
  getContract,
  getExplorerUrl,
  NetworkName,
} from '@/lib/blockchain/web3Client';
import {
  DocumentVerificationABI,
  AuditLogABI,
  TradeAgreementABI,
  EscrowManagementABI,
} from '@/lib/blockchain/contractABIs';
import prisma from '@/lib/db';

const DEFAULT_NETWORK: NetworkName = 'sepolia';

export interface BlockchainResult {
  success: boolean;
  transactionHash?: string;
  blockNumber?: number;
  contractAddress?: string;
  error?: string;
}

// Document Verification Service
export async function registerDocumentHash(
  documentHash: string,
  documentType: string,
  transactionId: string,
  contractAddress: string
): Promise<BlockchainResult> {
  try {
    const signer = getDeployerSigner(DEFAULT_NETWORK);
    const contract = getContract(contractAddress, DocumentVerificationABI, signer, DEFAULT_NETWORK);

    const hashBytes = ethers.keccak256(ethers.toUtf8Bytes(documentHash));
    const tx = await contract.registerDocument(hashBytes, documentType, transactionId);
    const receipt = await tx.wait();

    // Save to database
    await prisma.documentHash.create({
      data: {
        transactionId,
        documentType,
        originalName: documentType,
        hash: documentHash,
        algorithm: 'SHA256',
        contractAddress,
        blockchainTxHash: receipt.hash,
        verified: true,
        verifiedAt: new Date(),
      },
    });

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error: any) {
    console.error('Document registration failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to register document',
    };
  }
}

export async function verifyDocumentHash(
  documentHash: string,
  contractAddress: string
): Promise<{ verified: boolean; details?: any }> {
  try {
    const provider = getProvider(DEFAULT_NETWORK);
    const contract = getContract(contractAddress, DocumentVerificationABI, provider, DEFAULT_NETWORK);

    const hashBytes = ethers.keccak256(ethers.toUtf8Bytes(documentHash));
    const result = await contract.verifyDocument(hashBytes);

    return {
      verified: result.exists,
      details: {
        documentType: result.documentType,
        transactionId: result.transactionId,
        registeredBy: result.registeredBy,
        registeredAt: new Date(Number(result.registeredAt) * 1000),
      },
    };
  } catch (error: any) {
    return {
      verified: false,
    };
  }
}

// Audit Log Service
export async function recordAuditAction(
  action: string,
  transactionId: string,
  entityType: string,
  entityId: string,
  details: string,
  contractAddress: string
): Promise<BlockchainResult> {
  try {
    const signer = getDeployerSigner(DEFAULT_NETWORK);
    const contract = getContract(contractAddress, AuditLogABI, signer, DEFAULT_NETWORK);

    const tx = await contract.recordAction(action, transactionId, entityType, entityId, details);
    const receipt = await tx.wait();

    // Save to database
    await prisma.blockchainAuditLog.create({
      data: {
        transactionId: transactionId || null,
        contractAddress,
        eventType: 'AUDIT_LOG',
        action,
        actor: await signer.getAddress(),
        details: { entityType, entityId, details },
        blockNumber: receipt.blockNumber,
        txHash: receipt.hash,
      },
    });

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error: any) {
    console.error('Audit log recording failed:', error);
    return {
      success: false,
      error: error.message || 'Failed to record audit log',
    };
  }
}

// Trade Agreement Deployment
export async function deployTradeAgreement(
  buyerAddress: string,
  supplierAddress: string,
  tradeId: string,
  amount: number,
  currency: string,
  terms: string
): Promise<BlockchainResult> {
  try {
    const signer = getDeployerSigner(DEFAULT_NETWORK);
    
    const factory = new ethers.ContractFactory(
      TradeAgreementABI,
      '0x' as any, // Bytecode would come from compiled contract
      signer
    );

    // Note: In production, you'd deploy the actual contract
    // This is a placeholder for the deployment logic
    
    return {
      success: false,
      error: 'Contract deployment requires compiled bytecode',
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to deploy trade agreement',
    };
  }
}

// Record Trade Milestone
export async function recordTradeMilestone(
  contractAddress: string,
  description: string
): Promise<BlockchainResult> {
  try {
    const signer = getDeployerSigner(DEFAULT_NETWORK);
    const contract = getContract(contractAddress, TradeAgreementABI, signer, DEFAULT_NETWORK);

    const tx = await contract.recordMilestone(description);
    const receipt = await tx.wait();

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to record milestone',
    };
  }
}

// Get Blockchain Transaction Details
export async function getBlockchainTransaction(txHash: string) {
  try {
    const provider = getProvider(DEFAULT_NETWORK);
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);

    return {
      hash: tx?.hash,
      blockNumber: receipt?.blockNumber,
      from: tx?.from,
      to: tx?.to,
      status: receipt?.status === 1 ? 'success' : 'failed',
      gasUsed: receipt?.gasUsed?.toString(),
      explorerUrl: getExplorerUrl(txHash, 'tx', DEFAULT_NETWORK),
    };
  } catch (error: any) {
    throw new Error(`Failed to get transaction: ${error.message}`);
  }
}

// Save Blockchain Deployment Record
export async function saveDeploymentRecord(
  transactionId: string | null,
  contractType: 'TRADE_AGREEMENT' | 'DOCUMENT_VERIFICATION' | 'ESCROW_MANAGEMENT' | 'AUDIT_LOG',
  contractAddress: string,
  deploymentTxHash: string,
  blockNumber: number,
  gasUsed?: number,
  gasCost?: string
) {
  return await prisma.blockchainDeployment.create({
    data: {
      transactionId,
      contractType,
      contractAddress,
      deploymentTxHash,
      blockNumber,
      gasUsed,
      gasCost,
      network: 'SEPOLIA',
      status: 'DEPLOYED',
    },
  });
}
