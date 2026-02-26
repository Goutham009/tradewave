import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, Button, InfoBox } from './BaseEmail';

interface QuoteReceivedEmailProps {
  buyerName: string;
  supplierName: string;
  quoteAmount: string;
  currency: string;
  expiryDate: string;
  quotationLink: string;
  requirementTitle: string;
  unsubscribeUrl?: string;
}

export const QuoteReceivedEmail: React.FC<QuoteReceivedEmailProps> = ({
  buyerName,
  supplierName,
  quoteAmount,
  currency,
  expiryDate,
  quotationLink,
  requirementTitle,
  unsubscribeUrl,
}) => {
  return (
    <BaseEmail preview={`New quote received from ${supplierName}`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>New Quote Received 📋</Text>
      <Text style={paragraph}>Hi {buyerName},</Text>
      <Text style={paragraph}>
        You&rsquo;ve received a new quote for your requirement <strong>&ldquo;{requirementTitle}&rdquo;</strong>.
      </Text>
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
            <tr>
              <td style={labelCell}>Valid Until</td>
              <td style={valueCell}>{expiryDate}</td>
            </tr>
          </tbody>
        </table>
      </Section>
      <InfoBox variant="warning">
        <Text style={infoText}>
          <strong>⏰ Act Now:</strong> This quote expires on {expiryDate}. Review and respond before it expires.
        </Text>
      </InfoBox>
      <Section style={buttonContainer}>
        <Button href={quotationLink}>View Quote</Button>
      </Section>
    </BaseEmail>
  );
};

const heading = { fontSize: '24px', fontWeight: '700', color: '#18181b', margin: '0 0 16px 0' };
const paragraph = { fontSize: '14px', color: '#3f3f46', lineHeight: '24px', margin: '16px 0' };
const detailsBox = { backgroundColor: '#f4f4f5', padding: '16px', borderRadius: '8px', margin: '16px 0' };
const table = { width: '100%', borderCollapse: 'collapse' as const };
const labelCell = { padding: '8px 0', fontSize: '14px', color: '#71717a', width: '40%' };
const valueCell = { padding: '8px 0', fontSize: '14px', color: '#18181b', textAlign: 'right' as const };
const valueCellBold = { ...valueCell, fontWeight: '700', fontSize: '16px', color: '#0ea5e9' };
const infoText = { fontSize: '14px', color: '#92400e', margin: '0' };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };

export default QuoteReceivedEmail;
