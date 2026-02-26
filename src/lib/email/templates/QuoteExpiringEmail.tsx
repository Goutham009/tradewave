import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, Button, InfoBox } from './BaseEmail';

interface QuoteExpiringEmailProps {
  buyerName: string;
  supplierName: string;
  quoteAmount: string;
  currency: string;
  expiresIn: string;
  quotationLink: string;
  requirementTitle: string;
  unsubscribeUrl?: string;
}

export const QuoteExpiringEmail: React.FC<QuoteExpiringEmailProps> = ({
  buyerName,
  supplierName,
  quoteAmount,
  currency,
  expiresIn,
  quotationLink,
  requirementTitle,
  unsubscribeUrl,
}) => {
  return (
    <BaseEmail preview={`Quote expiring in ${expiresIn} - Action Required`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>⚠️ Quote Expiring Soon</Text>
      <Text style={paragraph}>Hi {buyerName},</Text>
      <Text style={paragraph}>
        A quote for your requirement <strong>&ldquo;{requirementTitle}&rdquo;</strong> is about to expire.
      </Text>
      <InfoBox variant="warning">
        <Text style={urgentText}>
          <strong>⏰ Expires in {expiresIn}</strong>
        </Text>
        <Text style={infoText}>
          Don&rsquo;t miss out on this opportunity. Review and respond before the quote expires.
        </Text>
      </InfoBox>
      <Section style={detailsBox}>
        <table style={table}>
          <tbody>
            <tr>
              <td style={labelCell}>Supplier</td>
              <td style={valueCell}>{supplierName}</td>
            </tr>
            <tr>
              <td style={labelCell}>Quote Amount</td>
              <td style={valueCellBold}>{currency} {quoteAmount}</td>
            </tr>
          </tbody>
        </table>
      </Section>
      <Section style={buttonContainer}>
        <Button href={quotationLink}>Review Quote Now</Button>
      </Section>
    </BaseEmail>
  );
};

const heading = { fontSize: '24px', fontWeight: '700', color: '#dc2626', margin: '0 0 16px 0' };
const paragraph = { fontSize: '14px', color: '#3f3f46', lineHeight: '24px', margin: '16px 0' };
const detailsBox = { backgroundColor: '#f4f4f5', padding: '16px', borderRadius: '8px', margin: '16px 0' };
const table = { width: '100%', borderCollapse: 'collapse' as const };
const labelCell = { padding: '8px 0', fontSize: '14px', color: '#71717a', width: '40%' };
const valueCell = { padding: '8px 0', fontSize: '14px', color: '#18181b', textAlign: 'right' as const };
const valueCellBold = { ...valueCell, fontWeight: '700', fontSize: '16px', color: '#0ea5e9' };
const urgentText = { fontSize: '18px', color: '#dc2626', margin: '0 0 8px 0' };
const infoText = { fontSize: '14px', color: '#92400e', margin: '0' };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };

export default QuoteExpiringEmail;
