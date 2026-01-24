import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, Button, InfoBox } from './BaseEmail';

interface DisputeResolvedEmailProps {
  partyName: string;
  resolution: string;
  fundDistribution: string;
  disputeId: string;
  orderId: string;
  disputeLink: string;
  unsubscribeUrl?: string;
}

export const DisputeResolvedEmail: React.FC<DisputeResolvedEmailProps> = ({
  partyName,
  resolution,
  fundDistribution,
  disputeId,
  orderId,
  disputeLink,
  unsubscribeUrl,
}) => {
  return (
    <BaseEmail preview={`Dispute resolved - ${disputeId}`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>Dispute Resolved ✅</Text>
      <Text style={paragraph}>Hi {partyName},</Text>
      <InfoBox variant="success">
        <Text style={successText}>
          <strong>The dispute has been resolved.</strong> Please review the resolution details below.
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
              <td style={labelCell}>Resolution</td>
              <td style={valueCell}>{resolution}</td>
            </tr>
            <tr>
              <td style={labelCell}>Fund Distribution</td>
              <td style={valueCellBold}>{fundDistribution}</td>
            </tr>
          </tbody>
        </table>
      </Section>
      <Text style={paragraph}>
        The funds will be distributed according to the resolution within 1-3 business days. If you have any questions about this decision, please contact our support team.
      </Text>
      <Section style={buttonContainer}>
        <Button href={disputeLink}>View Resolution Details</Button>
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
const valueCellBold = { ...valueCell, fontWeight: '700', color: '#22c55e' };
const successText = { fontSize: '14px', color: '#166534', margin: '0' };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };

export default DisputeResolvedEmail;
