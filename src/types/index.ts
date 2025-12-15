// =============================================================================
// TRADEWAVE TYPE DEFINITIONS
// =============================================================================

// =============================================================================
// USER TYPES
// =============================================================================

export type UserRole = 'BUYER' | 'ADMIN' | 'SUPPLIER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';

export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  companyName?: string;
  phone?: string;
  avatar?: string;
  walletAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBuyerProfile extends IUser {
  role: 'BUYER';
  industry?: string;
  annualVolume?: string;
  preferredCategories?: string[];
  assignedAccountManager?: string;
}

export interface IAdminProfile extends IUser {
  role: 'ADMIN';
  department?: string;
  permissions?: string[];
}

export interface ISupplierProfile extends IUser {
  role: 'SUPPLIER';
  certifications?: ICertification[];
  rating?: ISupplierRating;
  categories?: string[];
  location?: string;
  leadTime?: number;
  minimumOrderValue?: number;
}

// =============================================================================
// REQUIREMENT TYPES
// =============================================================================

export type RequirementStatus = 
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SOURCING'
  | 'QUOTATIONS_READY'
  | 'NEGOTIATING'
  | 'ACCEPTED'
  | 'COMPLETED'
  | 'CANCELLED';

export type RequirementPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface IProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

export interface IRequirement {
  id: string;
  buyerId: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  specifications: Record<string, unknown>;
  quantity: number;
  unit: string;
  targetPrice?: number;
  currency: string;
  deliveryLocation: string;
  deliveryDeadline: Date;
  priority: RequirementPriority;
  status: RequirementStatus;
  attachments?: IAttachment[];
  assignedTo?: string;
  quotationsCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

// =============================================================================
// QUOTATION TYPES
// =============================================================================

export type QuotationStatus = 
  | 'PENDING'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export interface IPriceBreakdown {
  unitPrice: number;
  quantity: number;
  subtotal: number;
  shipping?: number;
  insurance?: number;
  customs?: number;
  taxes?: number;
  platformFee?: number;
  total: number;
  currency: string;
}

export interface IQuotation {
  id: string;
  requirementId: string;
  supplierId: string;
  supplier?: ISupplierProfile;
  priceBreakdown: IPriceBreakdown;
  leadTime: number;
  validUntil: Date;
  terms?: string;
  notes?: string;
  certifications?: string[];
  samples?: boolean;
  sampleCost?: number;
  status: QuotationStatus;
  ranking?: number;
  createdAt: Date;
  updatedAt: Date;
}

// =============================================================================
// SUPPLIER TYPES
// =============================================================================

export interface ISupplier {
  id: string;
  name: string;
  email: string;
  phone?: string;
  companyName: string;
  location: string;
  categories: string[];
  certifications: ICertification[];
  rating: ISupplierRating;
  yearsInBusiness?: number;
  minimumOrderValue?: number;
  leadTime?: number;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICertification {
  id: string;
  name: string;
  issuingBody: string;
  validUntil: Date;
  documentUrl?: string;
  verified: boolean;
}

export interface ISupplierRating {
  overall: number;
  quality: number;
  delivery: number;
  communication: number;
  pricing: number;
  totalReviews: number;
}

// =============================================================================
// TRANSACTION TYPES
// =============================================================================

export type TransactionStatus = 
  | 'INITIATED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_RECEIVED'
  | 'ESCROW_HELD'
  | 'PRODUCTION'
  | 'QUALITY_CHECK'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'CUSTOMS'
  | 'DELIVERED'
  | 'CONFIRMED'
  | 'ESCROW_RELEASED'
  | 'COMPLETED'
  | 'DISPUTED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface ITransaction {
  id: string;
  requirementId: string;
  quotationId: string;
  buyerId: string;
  supplierId: string;
  status: TransactionStatus;
  amount: number;
  currency: string;
  escrowId?: string;
  smartContractAddress?: string;
  paymentMethod?: string;
  paymentStatus?: PaymentStatus;
  shippingDetails?: IShippingDetails;
  timeline: ITransactionMilestone[];
  documents?: ITransactionDocument[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionMilestone {
  id: string;
  status: TransactionStatus;
  timestamp: Date;
  description?: string;
  actor?: string;
  blockchainTxHash?: string;
}

export interface ITransactionDocument {
  id: string;
  type: 'INVOICE' | 'PACKING_LIST' | 'CERTIFICATE' | 'CUSTOMS' | 'OTHER';
  name: string;
  url: string;
  hash?: string;
  verified?: boolean;
  uploadedAt: Date;
}

export interface IShippingDetails {
  carrier?: string;
  trackingNumber?: string;
  origin: string;
  destination: string;
  estimatedDelivery?: Date;
  actualDelivery?: Date;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
}

// =============================================================================
// PAYMENT & ESCROW TYPES
// =============================================================================

export type PaymentStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'REFUNDED'
  | 'CANCELLED';

export type EscrowStatus = 
  | 'PENDING'
  | 'HELD'
  | 'RELEASING'
  | 'RELEASED'
  | 'DISPUTED'
  | 'REFUNDED';

export type PaymentMethod = 'BANK_TRANSFER' | 'CREDIT_CARD' | 'WIRE' | 'STRIPE';

export interface IEscrowTransaction {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: EscrowStatus;
  holdDate: Date;
  releaseDate?: Date;
  releaseConditions: IReleaseCondition[];
  contractAddress?: string;
  blockchainTxHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReleaseCondition {
  id: string;
  type: 'DELIVERY_CONFIRMED' | 'QUALITY_APPROVED' | 'DOCUMENTS_VERIFIED' | 'TIME_ELAPSED';
  description: string;
  satisfied: boolean;
  satisfiedAt?: Date;
  satisfiedBy?: string;
}

export interface IPaymentInitiation {
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  returnUrl: string;
}

export interface IPaymentConfirmation {
  paymentId: string;
  transactionId: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  processedAt: Date;
  receiptUrl?: string;
}

export interface IPaymentRelease {
  escrowId: string;
  transactionId: string;
  amount: number;
  releasedTo: string;
  releasedAt: Date;
  blockchainTxHash?: string;
}

// =============================================================================
// BLOCKCHAIN TYPES
// =============================================================================

export type BlockchainNetwork = 'sepolia' | 'polygon' | 'mainnet';
export type ContractType = 'TRADE_AGREEMENT' | 'DOCUMENT_VERIFICATION' | 'ESCROW_MANAGEMENT' | 'AUDIT_LOG';

export type SmartContractStatus = 
  | 'PENDING_DEPLOYMENT'
  | 'DEPLOYING'
  | 'DEPLOYED'
  | 'EXECUTING'
  | 'EXECUTED'
  | 'FAILED';

export type BlockchainTransactionStatus = 
  | 'PENDING'
  | 'BROADCASTING'
  | 'CONFIRMING'
  | 'CONFIRMED'
  | 'FAILED';

export interface ISmartContract {
  id: string;
  transactionId?: string;
  contractType: ContractType;
  contractAddress: string;
  deploymentTxHash: string;
  blockNumber: number;
  network: BlockchainNetwork;
  status: SmartContractStatus;
  gasUsed?: number;
  gasCost?: string;
  deployedAt: Date;
  abi?: unknown[];
}

export interface IContractDeployment {
  contractType: ContractType;
  network: BlockchainNetwork;
  deployerAddress: string;
  constructorArgs?: unknown[];
  estimatedGas?: number;
  estimatedCost?: string;
}

export interface ISmartContractExecution {
  id: string;
  contractAddress: string;
  functionName: string;
  parameters: Record<string, unknown>;
  transactionHash: string;
  blockNumber: number;
  status: BlockchainTransactionStatus;
  gasUsed?: number;
  gasCost?: string;
  returnValues?: Record<string, unknown>;
  executedAt: Date;
}

export interface IBlockchainTransaction {
  id: string;
  transactionHash: string;
  contractAddress?: string;
  functionCalled?: string;
  parameters?: Record<string, unknown>;
  status: BlockchainTransactionStatus;
  confirmations: number;
  blockNumber?: number;
  gasUsed?: number;
  gasCost?: string;
  network: BlockchainNetwork;
  createdAt: Date;
  confirmedAt?: Date;
}

export interface IDocumentHash {
  id: string;
  transactionId: string;
  documentType: string;
  originalName: string;
  hash: string;
  algorithm: 'SHA256' | 'KECCAK256';
  contractAddress?: string;
  blockchainTxHash?: string;
  verified: boolean;
  uploadedAt: Date;
  verifiedAt?: Date;
}

export interface IDocumentVerification {
  documentHash: string;
  storedHash: string;
  isAuthentic: boolean;
  verifiedAt: Date;
  verifiedOnChain: boolean;
  blockNumber?: number;
  transactionHash?: string;
}

export interface IAuditLogEntry {
  id: string;
  transactionId?: string;
  contractAddress?: string;
  eventType: string;
  action: string;
  actor: string;
  details: Record<string, unknown>;
  blockNumber?: number;
  transactionHash?: string;
  timestamp: Date;
  immutable: boolean;
}

export interface IBlockchainEvent {
  eventName: string;
  contractAddress: string;
  blockNumber: number;
  transactionHash: string;
  args: Record<string, unknown>;
  timestamp: Date;
}

export interface IWalletConnection {
  address: string;
  network: BlockchainNetwork;
  chainId: number;
  balance?: string;
  connected: boolean;
  connectedAt?: Date;
}

export interface INetworkStatus {
  network: BlockchainNetwork;
  chainId: number;
  isConnected: boolean;
  blockNumber?: number;
  gasPrice?: string;
  rpcUrl: string;
  explorerUrl: string;
}

export interface IGasEstimate {
  gasLimit: number;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  estimatedCostWei: string;
  estimatedCostEth: string;
  estimatedCostUsd?: number;
}

// =============================================================================
// API TYPES
// =============================================================================

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: IApiError;
  message?: string;
  pagination?: IPagination;
}

export interface IApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

// =============================================================================
// FORM TYPES
// =============================================================================

export interface IRequirementFormData {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  specifications: Record<string, unknown>;
  quantity: number;
  unit: string;
  targetPrice?: number;
  currency: string;
  deliveryLocation: string;
  deliveryDeadline: string;
  priority: RequirementPriority;
  attachments?: File[];
}

export interface ILoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface IRegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName: string;
  phone?: string;
  industry?: string;
  acceptTerms: boolean;
}

export interface IPaymentFormData {
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
}

// =============================================================================
// DASHBOARD & ANALYTICS TYPES
// =============================================================================

export interface IDashboardStats {
  activeRequirements: number;
  pendingQuotations: number;
  activeTransactions: number;
  completedTransactions: number;
  totalSpend?: number;
  escrowBalance?: number;
}

export interface IActivityItem {
  id: string;
  type: 'REQUIREMENT' | 'QUOTATION' | 'TRANSACTION' | 'PAYMENT' | 'BLOCKCHAIN';
  title: string;
  description: string;
  timestamp: Date;
  link?: string;
  icon?: string;
}

// =============================================================================
// NOTIFICATION TYPES
// =============================================================================

export type NotificationType = 
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ERROR'
  | 'BLOCKCHAIN';

export interface INotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: Date;
}
