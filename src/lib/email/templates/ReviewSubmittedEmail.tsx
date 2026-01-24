import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, Button, InfoBox } from './BaseEmail';

interface ReviewSubmittedEmailProps {
  recipientName: string;
  reviewerName: string;
  rating: number;
  transactionId: string;
  reviewId: string;
  reviewLink: string;
  unsubscribeUrl?: string;
}

export const ReviewSubmittedEmail: React.FC<ReviewSubmittedEmailProps> = ({
  recipientName,
  reviewerName,
  rating,
  transactionId,
  reviewId,
  reviewLink,
  unsubscribeUrl,
}) => {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  
  return (
    <BaseEmail preview={`New ${rating}-star review from ${reviewerName}`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>New Review Submitted ⭐</Text>
      <Text style={paragraph}>Hi {recipientName},</Text>
      <InfoBox variant="info">
        <Text style={infoText}>
          {reviewerName} has submitted a review for your recent transaction.
        </Text>
      </InfoBox>
      <Section style={detailsBox}>
        <table style={table}>
          <tbody>
            <tr>
              <td style={labelCell}>Rating</td>
              <td style={valueCell}>
                <span style={starsStyle}>{stars}</span> ({rating}/5)
              </td>
            </tr>
            <tr>
              <td style={labelCell}>Reviewer</td>
              <td style={valueCell}>{reviewerName}</td>
            </tr>
            <tr>
              <td style={labelCell}>Transaction</td>
              <td style={valueCell}>{transactionId.slice(0, 8)}...</td>
            </tr>
          </tbody>
        </table>
      </Section>
      <Text style={paragraph}>
        Your review will be visible on your profile after it has been approved by our moderation team. 
        This typically takes 1-2 business days.
      </Text>
      <Text style={subheading}>What Happens Next:</Text>
      <Text style={listItem}>1. Our team reviews the submission</Text>
      <Text style={listItem}>2. Once approved, it appears on your profile</Text>
      <Text style={listItem}>3. Your rating stats will be updated</Text>
      <Section style={buttonContainer}>
        <Button href={reviewLink}>View Review</Button>
      </Section>
    </BaseEmail>
  );
};

const heading = { fontSize: '24px', fontWeight: '700', color: '#eab308', margin: '0 0 16px 0' };
const subheading = { fontSize: '16px', fontWeight: '600', color: '#18181b', margin: '24px 0 8px 0' };
const paragraph = { fontSize: '14px', color: '#3f3f46', lineHeight: '24px', margin: '16px 0' };
const listItem = { fontSize: '14px', color: '#3f3f46', margin: '4px 0' };
const detailsBox = { backgroundColor: '#fef9c3', padding: '16px', borderRadius: '8px', margin: '16px 0' };
const table = { width: '100%', borderCollapse: 'collapse' as const };
const labelCell = { padding: '8px 0', fontSize: '14px', color: '#854d0e', width: '40%' };
const valueCell = { padding: '8px 0', fontSize: '14px', color: '#713f12', textAlign: 'right' as const };
const infoText = { fontSize: '14px', color: '#1e40af', margin: '0' };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };
const starsStyle = { color: '#eab308', fontSize: '16px' };

export default ReviewSubmittedEmail;
