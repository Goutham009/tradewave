import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, Button, InfoBox } from './BaseEmail';

interface PaymentConfirmedEmailProps {
  partyName: string;
  isBuyer: boolean;
  amount: string;
  currency: string;
  orderId: string;
  transactionLink: string;
  unsubscribeUrl?: string;
}

export const PaymentConfirmedEmail: React.FC<PaymentConfirmedEmailProps> = ({
  partyName,
  isBuyer,
  amount,
  currency,
  orderId,
  transactionLink,
  unsubscribeUrl,
}) => {
  return (
    <BaseEmail preview={`Payment confirmed - ${currency} ${amount}`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>Payment Confirmed 💰</Text>
      <Text style={paragraph}>Hi {partyName},</Text>
      <InfoBox variant="success">
        <Text style={successText}>
          <strong>Payment Received!</strong> {currency} {amount} has been received and secured in escrow.
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
              <td style={labelCell}>Amount</td>
              <td style={valueCellBold}>{currency} {amount}</td>
            </tr>
            <tr>
              <td style={labelCell}>Status</td>
              <td style={statusCell}>🔒 Held in Escrow</td>
            </tr>
          </tbody>
        </table>
      </Section>
      <Text style={paragraph}>
        {isBuyer
          ? 'Your payment is now securely held in escrow. The supplier has been notified and will proceed with your order. Funds will be released once you confirm delivery and quality.'
          : 'The buyer has completed payment. Please proceed with preparing and shipping the order. Funds will be released to you once the buyer confirms delivery and approves quality.'}
      </Text>
      <Text style={subheading}>Next Steps:</Text>
      {isBuyer ? (
        <>
          <Text style={listItem}>1. Supplier prepares your order</Text>
          <Text style={listItem}>2. You'll receive shipping notification</Text>
          <Text style={listItem}>3. Confirm delivery when received</Text>
          <Text style={listItem}>4. Approve quality to release funds</Text>
        </>
      ) : (
        <>
          <Text style={listItem}>1. Prepare the order for shipment</Text>
          <Text style={listItem}>2. Mark as shipped with tracking info</Text>
          <Text style={listItem}>3. Wait for buyer delivery confirmation</Text>
          <Text style={listItem}>4. Funds released after quality approval</Text>
        </>
      )}
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
const statusCell = { ...valueCell, color: '#0ea5e9', fontWeight: '600' };
const successText = { fontSize: '14px', color: '#166534', margin: '0' };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };

export default PaymentConfirmedEmail;
