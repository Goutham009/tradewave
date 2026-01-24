import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, Button, InfoBox } from './BaseEmail';

interface PaymentReleasedEmailProps {
  supplierName: string;
  amount: string;
  currency: string;
  orderId: string;
  transactionLink: string;
  unsubscribeUrl?: string;
}

export const PaymentReleasedEmail: React.FC<PaymentReleasedEmailProps> = ({
  supplierName,
  amount,
  currency,
  orderId,
  transactionLink,
  unsubscribeUrl,
}) => {
  return (
    <BaseEmail preview={`Payment released - ${currency} ${amount}`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>Payment Released! 💸</Text>
      <Text style={paragraph}>Hi {supplierName},</Text>
      <InfoBox variant="success">
        <Text style={successText}>
          <strong>Congratulations!</strong> {currency} {amount} has been released from escrow and transferred to your account.
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
              <td style={labelCell}>Amount Released</td>
              <td style={valueCellBold}>{currency} {amount}</td>
            </tr>
            <tr>
              <td style={labelCell}>Status</td>
              <td style={statusCell}>✓ Completed</td>
            </tr>
          </tbody>
        </table>
      </Section>
      <Text style={paragraph}>
        The transaction has been completed successfully. Thank you for using Tradewave!
      </Text>
      <InfoBox variant="info">
        <Text style={infoText}>
          🏦 The funds have been transferred to your registered bank account. Processing time varies by bank (typically 1-3 business days).
        </Text>
      </InfoBox>
      <Section style={buttonContainer}>
        <Button href={transactionLink}>View Transaction Details</Button>
      </Section>
    </BaseEmail>
  );
};

const heading = { fontSize: '24px', fontWeight: '700', color: '#18181b', margin: '0 0 16px 0' };
const paragraph = { fontSize: '14px', color: '#3f3f46', lineHeight: '24px', margin: '16px 0' };
const detailsBox = { backgroundColor: '#dcfce7', padding: '16px', borderRadius: '8px', margin: '16px 0' };
const table = { width: '100%', borderCollapse: 'collapse' as const };
const labelCell = { padding: '8px 0', fontSize: '14px', color: '#166534', width: '40%' };
const valueCell = { padding: '8px 0', fontSize: '14px', color: '#166534', textAlign: 'right' as const };
const valueCellBold = { ...valueCell, fontWeight: '700', fontSize: '20px', color: '#15803d' };
const statusCell = { ...valueCell, color: '#22c55e', fontWeight: '600' };
const successText = { fontSize: '14px', color: '#166534', margin: '0' };
const infoText = { fontSize: '14px', color: '#0369a1', margin: '0' };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };

export default PaymentReleasedEmail;
