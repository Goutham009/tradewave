const REFERENCE_SUFFIX_LENGTH = 8;

function sanitizeIdSuffix(rawId: string): string {
  const cleaned = rawId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  if (cleaned.length >= REFERENCE_SUFFIX_LENGTH) {
    return cleaned.slice(-REFERENCE_SUFFIX_LENGTH);
  }

  return cleaned.padStart(REFERENCE_SUFFIX_LENGTH, '0');
}

export function formatRequirementReference(requirementId: string): string {
  return `REQ-${sanitizeIdSuffix(requirementId)}`;
}

export function formatQuotationReference(quotationId: string): string {
  return `QUO-${sanitizeIdSuffix(quotationId)}`;
}

export function formatTransactionReference(transactionId: string): string {
  return `TXN-${sanitizeIdSuffix(transactionId)}`;
}

export function buildOrderReferences(transactionId: string): {
  internalOrderId: string;
  buyerOrderId: string;
  supplierOrderId: string;
} {
  const suffix = sanitizeIdSuffix(transactionId);

  return {
    internalOrderId: `ORD-${suffix}`,
    buyerOrderId: `PO-${suffix}`,
    supplierOrderId: `SO-${suffix}`,
  };
}
