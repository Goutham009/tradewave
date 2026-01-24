import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, Button, InfoBox } from './BaseEmail';

interface DeliveryReadyEmailProps {
  buyerName: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery: string;
  transactionLink: string;
  orderId: string;
  unsubscribeUrl?: string;
}

export const DeliveryReadyEmail: React.FC<DeliveryReadyEmailProps> = ({
  buyerName,
  trackingNumber,
  carrier,
  estimatedDelivery,
  transactionLink,
  orderId,
  unsubscribeUrl,
}) => {
  return (
    <BaseEmail preview={`Your order has shipped - ${orderId}`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>Your Order Has Shipped! 🚚</Text>
      <Text style={paragraph}>Hi {buyerName},</Text>
      <Text style={paragraph}>
        Great news! Your order has been shipped and is on its way to you.
      </Text>
      <Section style={detailsBox}>
        <table style={table}>
          <tbody>
            <tr>
              <td style={labelCell}>Order ID</td>
              <td style={valueCell}>{orderId}</td>
            </tr>
            {carrier && (
              <tr>
                <td style={labelCell}>Carrier</td>
                <td style={valueCell}>{carrier}</td>
              </tr>
            )}
            {trackingNumber && (
              <tr>
                <td style={labelCell}>Tracking Number</td>
                <td style={valueCellBold}>{trackingNumber}</td>
              </tr>
            )}
            <tr>
              <td style={labelCell}>Estimated Delivery</td>
              <td style={valueCell}>{estimatedDelivery}</td>
            </tr>
          </tbody>
        </table>
      </Section>
      <InfoBox variant="info">
        <Text style={infoText}>
          📦 Track your shipment and confirm delivery once you receive the goods. Remember to inspect the quality before approval.
        </Text>
      </InfoBox>
      <Section style={buttonContainer}>
        <Button href={transactionLink}>Track Shipment</Button>
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
const valueCellBold = { ...valueCell, fontWeight: '700', color: '#0ea5e9' };
const infoText = { fontSize: '14px', color: '#0369a1', margin: '0' };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };

export default DeliveryReadyEmail;
