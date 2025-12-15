export const TradeAgreementABI = [
  {
    inputs: [
      { name: '_buyer', type: 'address' },
      { name: '_supplier', type: 'address' },
      { name: '_tradeId', type: 'string' },
      { name: '_amount', type: 'uint256' },
      { name: '_terms', type: 'string' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tradeId', type: 'string' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'TradeInitiated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tradeId', type: 'string' },
      { indexed: false, name: 'newStatus', type: 'uint8' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'StatusUpdated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tradeId', type: 'string' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'DeliveryConfirmed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tradeId', type: 'string' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'TradeCompleted',
    type: 'event',
  },
  {
    inputs: [],
    name: 'getTradeDetails',
    outputs: [
      { name: 'buyer', type: 'address' },
      { name: 'supplier', type: 'address' },
      { name: 'tradeId', type: 'string' },
      { name: 'amount', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'createdAt', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_status', type: 'uint8' }],
    name: 'updateStatus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'confirmDelivery',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'completeTrade',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const DocumentVerificationABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'documentHash', type: 'bytes32' },
      { indexed: false, name: 'documentType', type: 'string' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'DocumentRegistered',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'documentHash', type: 'bytes32' },
      { indexed: false, name: 'verifier', type: 'address' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'DocumentVerified',
    type: 'event',
  },
  {
    inputs: [
      { name: '_documentHash', type: 'bytes32' },
      { name: '_documentType', type: 'string' },
      { name: '_transactionId', type: 'string' },
    ],
    name: 'registerDocument',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_documentHash', type: 'bytes32' }],
    name: 'verifyDocument',
    outputs: [
      { name: 'exists', type: 'bool' },
      { name: 'documentType', type: 'string' },
      { name: 'transactionId', type: 'string' },
      { name: 'registeredAt', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: '_documentHash', type: 'bytes32' }],
    name: 'isDocumentRegistered',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const EscrowManagementABI = [
  {
    inputs: [
      { name: '_transactionId', type: 'string' },
      { name: '_amount', type: 'uint256' },
      { name: '_buyer', type: 'address' },
      { name: '_supplier', type: 'address' },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'transactionId', type: 'string' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'EscrowCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'transactionId', type: 'string' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'FundsHeld',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'transactionId', type: 'string' },
      { indexed: false, name: 'conditionType', type: 'string' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'ConditionMet',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'transactionId', type: 'string' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'FundsReleased',
    type: 'event',
  },
  {
    inputs: [],
    name: 'getEscrowDetails',
    outputs: [
      { name: 'transactionId', type: 'string' },
      { name: 'amount', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'createdAt', type: 'uint256' },
      { name: 'releasedAt', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'recordHold',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_conditionType', type: 'string' }],
    name: 'markConditionMet',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'recordRelease',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export const AuditLogABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'logId', type: 'uint256' },
      { indexed: false, name: 'action', type: 'string' },
      { indexed: false, name: 'actor', type: 'address' },
      { indexed: false, name: 'timestamp', type: 'uint256' },
    ],
    name: 'LogEntry',
    type: 'event',
  },
  {
    inputs: [
      { name: '_action', type: 'string' },
      { name: '_transactionId', type: 'string' },
      { name: '_details', type: 'string' },
    ],
    name: 'recordAction',
    outputs: [{ name: 'logId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ name: '_logId', type: 'uint256' }],
    name: 'getLogEntry',
    outputs: [
      { name: 'action', type: 'string' },
      { name: 'transactionId', type: 'string' },
      { name: 'details', type: 'string' },
      { name: 'actor', type: 'address' },
      { name: 'timestamp', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getLogCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const CONTRACT_ABIS = {
  TradeAgreement: TradeAgreementABI,
  DocumentVerification: DocumentVerificationABI,
  EscrowManagement: EscrowManagementABI,
  AuditLog: AuditLogABI,
};

export type ContractName = keyof typeof CONTRACT_ABIS;

export function getContractABI(contractName: ContractName) {
  return CONTRACT_ABIS[contractName];
}
