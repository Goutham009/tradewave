import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, Button, InfoBox } from './BaseEmail';

interface ReviewApprovedEmailProps {
  recipientName: string;
  reviewedUserName: string;
  rating: number;
  reviewId: string;
  reviewLink: string;
  unsubscribeUrl?: string;
}

export const ReviewApprovedEmail: React.FC<ReviewApprovedEmailProps> = ({
  recipientName,
  reviewedUserName,
  rating,
  reviewId,
  reviewLink,
  unsubscribeUrl,
}) => {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  
  return (
    <BaseEmail preview={`Your review has been approved`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>Review Approved ✅</Text>
      <Text style={paragraph}>Hi {recipientName},</Text>
      <InfoBox variant="success">
        <Text style={successText}>
          Great news! Your review for {reviewedUserName} has been approved and is now visible on the platform.
        </Text>
      </InfoBox>
      <Section style={detailsBox}>
        <table style={table}>
          <tbody>
            <tr>
              <td style={labelCell}>Your Rating</td>
              <td style={valueCell}>
                <span style={starsStyle}>{stars}</span> ({rating}/5)
              </td>
            </tr>
            <tr>
              <td style={labelCell}>Reviewed</td>
              <td style={valueCell}>{reviewedUserName}</td>
            </tr>
            <tr>
              <td style={labelCell}>Status</td>
              <td style={valueCell}>
                <span style={approvedBadge}>Published</span>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>
      <Text style={paragraph}>
        Thank you for sharing your experience! Your review helps other users make informed decisions 
        and contributes to building trust on our platform.
      </Text>
      <Section style={buttonContainer}>
        <Button href={reviewLink}>View Your Review</Button>
      </Section>
    </BaseEmail>
  );
};

const heading = { fontSize: '24px', fontWeight: '700', color: '#16a34a', margin: '0 0 16px 0' };
const paragraph = { fontSize: '14px', color: '#3f3f46', lineHeight: '24px', margin: '16px 0' };
const detailsBox = { backgroundColor: '#dcfce7', padding: '16px', borderRadius: '8px', margin: '16px 0' };
const table = { width: '100%', borderCollapse: 'collapse' as const };
const labelCell = { padding: '8px 0', fontSize: '14px', color: '#166534', width: '40%' };
const valueCell = { padding: '8px 0', fontSize: '14px', color: '#14532d', textAlign: 'right' as const };
const successText = { fontSize: '14px', color: '#166534', margin: '0' };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };
const starsStyle = { color: '#eab308', fontSize: '16px' };
const approvedBadge = { 
  backgroundColor: '#16a34a', 
  color: '#ffffff', 
  padding: '2px 8px', 
  borderRadius: '4px', 
  fontSize: '12px' 
};

export default ReviewApprovedEmail;
