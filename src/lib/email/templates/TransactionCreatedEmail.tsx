import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, Button, InfoBox } from './BaseEmail';

interface TransactionCreatedEmailProps {
  partyName: string;
  isBuyer: boolean;
  amount: string;
  currency: string;
  deliveryDate: string;
  transactionId: string;
  transactionLink: string;
  requirementTitle: string;
  otherPartyName: string;
  unsubscribeUrl?: string;
}

export const TransactionCreatedEmail: React.FC<TransactionCreatedEmailProps> = ({
  partyName,
  isBuyer,
  amount,
  currency,
  deliveryDate,
  transactionId,
  transactionLink,
  requirementTitle,
  otherPartyName,
  unsubscribeUrl,
}) => {
  return (
    <BaseEmail preview={`Transaction created - ${transactionId}`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>Transaction Created 📦</Text>
      <Text style={paragraph}>Hi {partyName},</Text>
      <Text style={paragraph}>
        A new transaction has been created for your order.
      </Text>
      <Section style={detailsBox}>
        <table style={table}>
          <tbody>
            <tr>
              <td style={labelCell}>Transaction ID</td>
              <td style={valueCell}>{transactionId}</td>
            </tr>
            <tr>
              <td style={labelCell}>Item</td>
              <td style={valueCell}>{requirementTitle}</td>
            </tr>
            <tr>
              <td style={labelCell}>{isBuyer ? 'Supplier' : 'Buyer'}</td>
              <td style={valueCell}>{otherPartyName}</td>
            </tr>
            <tr>
              <td style={labelCell}>Amount</td>
              <td style={valueCellBold}>{currency} {amount}</td>
            </tr>
            <tr>
              <td style={labelCell}>Expected Delivery</td>
              <td style={valueCell}>{deliveryDate}</td>
            </tr>
          </tbody>
        </table>
      </Section>
      <InfoBox variant="info">
        <Text style={infoText}>
          {isBuyer
            ? '💳 Next step: Complete your payment to escrow to proceed with this order.'
            : '📋 Next step: Wait for buyer payment confirmation, then prepare the order for shipment.'}
        </Text>
      </InfoBox>
      <Section style={buttonContainer}>
        <Button href={transactionLink}>View Transaction</Button>
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
const infoText = { fontSize: '14px', color: '#0369a1', margin: '0' };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };

export default TransactionCreatedEmail;
