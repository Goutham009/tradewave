import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, Button, InfoBox } from './BaseEmail';

interface QuoteAcceptedEmailProps {
  partyName: string;
  isSupplier: boolean;
  amount: string;
  currency: string;
  transactionLink: string;
  requirementTitle: string;
  otherPartyName: string;
  unsubscribeUrl?: string;
}

export const QuoteAcceptedEmail: React.FC<QuoteAcceptedEmailProps> = ({
  partyName,
  isSupplier,
  amount,
  currency,
  transactionLink,
  requirementTitle,
  otherPartyName,
  unsubscribeUrl,
}) => {
  return (
    <BaseEmail preview={`Quote accepted - ${currency} ${amount}`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>Quote Accepted! 🎉</Text>
      <Text style={paragraph}>Hi {partyName},</Text>
      <InfoBox variant="success">
        <Text style={successText}>
          <strong>Great news!</strong> {isSupplier ? 'Your quote has been accepted.' : 'You have successfully accepted a quote.'}
        </Text>
      </InfoBox>
      <Section style={detailsBox}>
        <table style={table}>
          <tbody>
            <tr>
              <td style={labelCell}>Requirement</td>
              <td style={valueCell}>{requirementTitle}</td>
            </tr>
            <tr>
              <td style={labelCell}>{isSupplier ? 'Buyer' : 'Supplier'}</td>
              <td style={valueCell}>{otherPartyName}</td>
            </tr>
            <tr>
              <td style={labelCell}>Amount</td>
              <td style={valueCellBold}>{currency} {amount}</td>
            </tr>
          </tbody>
        </table>
      </Section>
      <Text style={paragraph}>
        {isSupplier
          ? 'A new transaction has been created. The buyer will proceed with payment. You will be notified once payment is confirmed.'
          : 'A new transaction has been created. Please proceed with payment to move forward with this order.'}
      </Text>
      <Text style={subheading}>Next Steps:</Text>
      <Text style={listItem}>
        {isSupplier
          ? '1. Wait for buyer to complete payment'
          : '1. Complete payment to escrow'}
      </Text>
      <Text style={listItem}>
        {isSupplier
          ? '2. Prepare order for shipment'
          : '2. Wait for supplier to ship'}
      </Text>
      <Text style={listItem}>3. Track transaction progress</Text>
      <Section style={buttonContainer}>
        <Button href={transactionLink}>View Transaction</Button>
      </Section>
    </BaseEmail>
  );
};

const heading = { fontSize: '24px', fontWeight: '700', color: '#18181b', margin: '0 0 16px 0' };
const subheading = { fontSize: '16px', fontWeight: '600', color: '#18181b', margin: '24px 0 8px 0' };
const paragraph = { fontSize: '14px', color: '#3f3f46', lineHeight: '24px', margin: '16px 0' };
const listItem = { fontSize: '14px', color: '#3f3f46', margin: '4px 0' };
const detailsBox = { backgroundColor: '#f4f4f5', padding: '16px', borderRadius: '8px', margin: '16px 0' };
const table = { width: '100%', borderCollapse: 'collapse' as const };
const labelCell = { padding: '8px 0', fontSize: '14px', color: '#71717a', width: '40%' };
const valueCell = { padding: '8px 0', fontSize: '14px', color: '#18181b', textAlign: 'right' as const };
const valueCellBold = { ...valueCell, fontWeight: '700', fontSize: '16px', color: '#22c55e' };
const successText = { fontSize: '14px', color: '#166534', margin: '0' };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };

export default QuoteAcceptedEmail;
