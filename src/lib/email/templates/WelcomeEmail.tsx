import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, Button, InfoBox } from './BaseEmail';

interface WelcomeEmailProps {
  userName: string;
  loginUrl: string;
  unsubscribeUrl?: string;
}

export const WelcomeEmail: React.FC<WelcomeEmailProps> = ({
  userName,
  loginUrl,
  unsubscribeUrl,
}) => {
  return (
    <BaseEmail preview={`Welcome to Tradewave, ${userName}!`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>Welcome to Tradewave, {userName}! 🎉</Text>
      <Text style={paragraph}>
        Thank you for joining Tradewave, the B2B trade and logistics platform that connects buyers with verified suppliers worldwide.
      </Text>
      <InfoBox variant="info">
        <Text style={infoText}><strong>What you can do:</strong></Text>
        <Text style={listItem}>• Post requirements and receive competitive quotes</Text>
        <Text style={listItem}>• Connect with verified suppliers worldwide</Text>
        <Text style={listItem}>• Track transactions with blockchain transparency</Text>
        <Text style={listItem}>• Manage payments securely through escrow</Text>
      </InfoBox>
      <Section style={buttonContainer}>
        <Button href={loginUrl}>Go to Dashboard</Button>
      </Section>
      <Text style={paragraph}>
        If you have any questions, our support team is here to help at{' '}
        <a href="mailto:support@tradewave.com" style={link}>support@tradewave.com</a>
      </Text>
    </BaseEmail>
  );
};

const heading = { fontSize: '24px', fontWeight: '700', color: '#18181b', margin: '0 0 16px 0' };
const paragraph = { fontSize: '14px', color: '#3f3f46', lineHeight: '24px', margin: '16px 0' };
const infoText = { fontSize: '14px', color: '#3f3f46', margin: '0 0 8px 0' };
const listItem = { fontSize: '14px', color: '#3f3f46', margin: '4px 0' };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };
const link = { color: '#0ea5e9', textDecoration: 'underline' };

export default WelcomeEmail;
