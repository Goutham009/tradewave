import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, Button, InfoBox } from './BaseEmail';

interface ReviewRejectedEmailProps {
  recipientName: string;
  reviewedUserName: string;
  reason: string;
  reviewId: string;
  appealLink: string;
  unsubscribeUrl?: string;
}

export const ReviewRejectedEmail: React.FC<ReviewRejectedEmailProps> = ({
  recipientName,
  reviewedUserName,
  reason,
  reviewId,
  appealLink,
  unsubscribeUrl,
}) => {
  return (
    <BaseEmail preview={`Review moderation notice`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>Review Not Approved</Text>
      <Text style={paragraph}>Hi {recipientName},</Text>
      <InfoBox variant="warning">
        <Text style={warningText}>
          Your review for {reviewedUserName} could not be published at this time.
        </Text>
      </InfoBox>
      <Section style={detailsBox}>
        <table style={table}>
          <tbody>
            <tr>
              <td style={labelCell}>Review For</td>
              <td style={valueCell}>{reviewedUserName}</td>
            </tr>
            <tr>
              <td style={labelCell}>Status</td>
              <td style={valueCell}>
                <span style={rejectedBadge}>Not Approved</span>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>
      <Text style={subheading}>Reason:</Text>
      <Section style={reasonBox}>
        <Text style={reasonText}>{reason}</Text>
      </Section>
      <Text style={paragraph}>
        We understand this may be disappointing. Our moderation team reviews all submissions 
        to ensure they meet our community guidelines. Common reasons for rejection include:
      </Text>
      <Text style={listItem}>• Inappropriate language or content</Text>
      <Text style={listItem}>• Irrelevant information unrelated to the transaction</Text>
      <Text style={listItem}>• Suspected fraudulent or incentivized review</Text>
      <Text style={listItem}>• Violation of our terms of service</Text>
      <Text style={paragraph}>
        If you believe this decision was made in error, you may appeal the decision within 14 days.
      </Text>
      <Section style={buttonContainer}>
        <Button href={appealLink}>Appeal Decision</Button>
      </Section>
    </BaseEmail>
  );
};

const heading = { fontSize: '24px', fontWeight: '700', color: '#dc2626', margin: '0 0 16px 0' };
const subheading = { fontSize: '16px', fontWeight: '600', color: '#18181b', margin: '24px 0 8px 0' };
const paragraph = { fontSize: '14px', color: '#3f3f46', lineHeight: '24px', margin: '16px 0' };
const listItem = { fontSize: '14px', color: '#3f3f46', margin: '4px 0' };
const detailsBox = { backgroundColor: '#fef2f2', padding: '16px', borderRadius: '8px', margin: '16px 0' };
const reasonBox = { backgroundColor: '#fef3c7', padding: '12px', borderRadius: '6px', margin: '8px 0' };
const table = { width: '100%', borderCollapse: 'collapse' as const };
const labelCell = { padding: '8px 0', fontSize: '14px', color: '#991b1b', width: '40%' };
const valueCell = { padding: '8px 0', fontSize: '14px', color: '#7f1d1d', textAlign: 'right' as const };
const warningText = { fontSize: '14px', color: '#92400e', margin: '0' };
const reasonText = { fontSize: '14px', color: '#78350f', margin: '0', fontStyle: 'italic' as const };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };
const rejectedBadge = { 
  backgroundColor: '#dc2626', 
  color: '#ffffff', 
  padding: '2px 8px', 
  borderRadius: '4px', 
  fontSize: '12px' 
};

export default ReviewRejectedEmail;
