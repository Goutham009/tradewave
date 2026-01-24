import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, Button, InfoBox } from './BaseEmail';

interface DisputeOpenedEmailProps {
  recipientName: string;
  initiatorName: string;
  reason: string;
  orderId: string;
  disputeId: string;
  disputeLink: string;
  isInitiator: boolean;
  unsubscribeUrl?: string;
}

export const DisputeOpenedEmail: React.FC<DisputeOpenedEmailProps> = ({
  recipientName,
  initiatorName,
  reason,
  orderId,
  disputeId,
  disputeLink,
  isInitiator,
  unsubscribeUrl,
}) => {
  return (
    <BaseEmail preview={`Dispute opened for order ${orderId}`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>Dispute Opened ⚠️</Text>
      <Text style={paragraph}>Hi {recipientName},</Text>
      <InfoBox variant="warning">
        <Text style={warningText}>
          {isInitiator
            ? 'Your dispute has been filed and is being reviewed by our team.'
            : `A dispute has been filed by ${initiatorName} for order ${orderId}.`}
        </Text>
      </InfoBox>
      <Section style={detailsBox}>
        <table style={table}>
          <tbody>
            <tr>
              <td style={labelCell}>Dispute ID</td>
              <td style={valueCell}>{disputeId}</td>
            </tr>
            <tr>
              <td style={labelCell}>Order ID</td>
              <td style={valueCell}>{orderId}</td>
            </tr>
            <tr>
              <td style={labelCell}>Filed By</td>
              <td style={valueCell}>{initiatorName}</td>
            </tr>
            <tr>
              <td style={labelCell}>Reason</td>
              <td style={valueCell}>{reason}</td>
            </tr>
          </tbody>
        </table>
      </Section>
      <Text style={paragraph}>
        {isInitiator
          ? 'Our dispute resolution team will review your case and may reach out for additional information. We aim to resolve disputes within 5-7 business days.'
          : 'Please review the dispute details and provide any relevant information or evidence. Our team will work with both parties to reach a fair resolution.'}
      </Text>
      <Text style={subheading}>What Happens Next:</Text>
      <Text style={listItem}>1. Our team reviews the dispute details</Text>
      <Text style={listItem}>2. Both parties may be contacted for evidence</Text>
      <Text style={listItem}>3. A resolution will be proposed</Text>
      <Text style={listItem}>4. Funds will be distributed accordingly</Text>
      <Section style={buttonContainer}>
        <Button href={disputeLink}>View Dispute</Button>
      </Section>
    </BaseEmail>
  );
};

const heading = { fontSize: '24px', fontWeight: '700', color: '#dc2626', margin: '0 0 16px 0' };
const subheading = { fontSize: '16px', fontWeight: '600', color: '#18181b', margin: '24px 0 8px 0' };
const paragraph = { fontSize: '14px', color: '#3f3f46', lineHeight: '24px', margin: '16px 0' };
const listItem = { fontSize: '14px', color: '#3f3f46', margin: '4px 0' };
const detailsBox = { backgroundColor: '#fef3c7', padding: '16px', borderRadius: '8px', margin: '16px 0' };
const table = { width: '100%', borderCollapse: 'collapse' as const };
const labelCell = { padding: '8px 0', fontSize: '14px', color: '#92400e', width: '40%' };
const valueCell = { padding: '8px 0', fontSize: '14px', color: '#78350f', textAlign: 'right' as const };
const warningText = { fontSize: '14px', color: '#92400e', margin: '0' };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };

export default DisputeOpenedEmail;
