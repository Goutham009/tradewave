import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, Button, InfoBox } from './BaseEmail';

interface QualityApprovedEmailProps {
  supplierName: string;
  amount: string;
  currency: string;
  orderId: string;
  transactionLink: string;
  unsubscribeUrl?: string;
}

export const QualityApprovedEmail: React.FC<QualityApprovedEmailProps> = ({
  supplierName,
  amount,
  currency,
  orderId,
  transactionLink,
  unsubscribeUrl,
}) => {
  return (
    <BaseEmail preview={`Quality approved - Funds being released`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>Quality Approved! 🎉</Text>
      <Text style={paragraph}>Hi {supplierName},</Text>
      <InfoBox variant="success">
        <Text style={successText}>
          <strong>Excellent news!</strong> The buyer has approved the quality of the delivered goods.
        </Text>
      </InfoBox>
      <Section style={detailsBox}>
        <table style={table}>
          <tbody>
            <tr>
              <td style={labelCell}>Order ID</td>
              <td style={valueCell}>{orderId}</td>
            </tr>
            <tr>
              <td style={labelCell}>Amount to Receive</td>
              <td style={valueCellBold}>{currency} {amount}</td>
            </tr>
            <tr>
              <td style={labelCell}>Status</td>
              <td style={statusCell}>Processing Release</td>
            </tr>
          </tbody>
        </table>
      </Section>
      <Text style={paragraph}>
        The escrow funds are now being released. You will receive {currency} {amount} in your account within 1-3 business days.
      </Text>
      <InfoBox variant="info">
        <Text style={infoText}>
          💰 The funds will be transferred to your registered bank account. You'll receive a confirmation email once the transfer is complete.
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
const valueCellBold = { ...valueCell, fontWeight: '700', fontSize: '18px', color: '#22c55e' };
const statusCell = { ...valueCell, color: '#0ea5e9', fontWeight: '600' };
const successText = { fontSize: '14px', color: '#166534', margin: '0' };
const infoText = { fontSize: '14px', color: '#0369a1', margin: '0' };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };

export default QualityApprovedEmail;
