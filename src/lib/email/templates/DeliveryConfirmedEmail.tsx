import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, Button, InfoBox } from './BaseEmail';

interface DeliveryConfirmedEmailProps {
  sellerName: string;
  buyerName: string;
  orderId: string;
  transactionLink: string;
  unsubscribeUrl?: string;
}

export const DeliveryConfirmedEmail: React.FC<DeliveryConfirmedEmailProps> = ({
  sellerName,
  buyerName,
  orderId,
  transactionLink,
  unsubscribeUrl,
}) => {
  return (
    <BaseEmail preview={`Delivery confirmed - ${orderId}`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>Delivery Confirmed ✅</Text>
      <Text style={paragraph}>Hi {sellerName},</Text>
      <InfoBox variant="success">
        <Text style={successText}>
          <strong>Good news!</strong> {buyerName} has confirmed receiving the delivery for order {orderId}.
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
              <td style={labelCell}>Buyer</td>
              <td style={valueCell}>{buyerName}</td>
            </tr>
            <tr>
              <td style={labelCell}>Status</td>
              <td style={statusCell}>Delivered ✓</td>
            </tr>
          </tbody>
        </table>
      </Section>
      <Text style={paragraph}>
        The buyer is now reviewing the quality of the delivered goods. Once they approve the quality, the funds will be released to your account.
      </Text>
      <Text style={subheading}>What&rsquo;s Next:</Text>
      <Text style={listItem}>1. Buyer inspects the goods</Text>
      <Text style={listItem}>2. Buyer approves quality (or raises dispute)</Text>
      <Text style={listItem}>3. Funds released to your account</Text>
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
const statusCell = { ...valueCell, color: '#22c55e', fontWeight: '600' };
const successText = { fontSize: '14px', color: '#166534', margin: '0' };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };

export default DeliveryConfirmedEmail;
