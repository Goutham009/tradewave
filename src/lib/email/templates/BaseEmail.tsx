import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';
import * as React from 'react';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tradewave.io';

interface BaseEmailProps {
  preview: string;
  children: React.ReactNode;
  unsubscribeUrl?: string;
}

export const BaseEmail: React.FC<BaseEmailProps> = ({
  preview,
  children,
  unsubscribeUrl,
}) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src={`${baseUrl}/logo.png`}
              width="150"
              height="40"
              alt="Tradewave"
              style={logo}
            />
          </Section>
          <Section style={content}>{children}</Section>
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Tradewave. All rights reserved.
            </Text>
            <Text style={footerText}>
              B2B Trade & Logistics Platform
            </Text>
            {unsubscribeUrl && (
              <Link href={unsubscribeUrl} style={unsubscribeLink}>
                Unsubscribe from emails
              </Link>
            )}
            <Text style={footerLinks}>
              <Link href={`${baseUrl}/help`} style={footerLink}>Help Center</Link>
              {' • '}
              <Link href={`${baseUrl}/privacy`} style={footerLink}>Privacy Policy</Link>
              {' • '}
              <Link href={`${baseUrl}/terms`} style={footerLink}>Terms of Service</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export const Button: React.FC<{ href: string; children: React.ReactNode }> = ({
  href,
  children,
}) => (
  <Link href={href} style={button}>
    {children}
  </Link>
);

export const InfoBox: React.FC<{ children: React.ReactNode; variant?: 'info' | 'warning' | 'success' }> = ({
  children,
  variant = 'info',
}) => {
  const colors = {
    info: { bg: '#f0f9ff', border: '#0ea5e9' },
    warning: { bg: '#fef3c7', border: '#f59e0b' },
    success: { bg: '#dcfce7', border: '#22c55e' },
  };
  return (
    <Section style={{ ...infoBox, backgroundColor: colors[variant].bg, borderLeftColor: colors[variant].border }}>
      {children}
    </Section>
  );
};

const main = {
  backgroundColor: '#f4f4f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#0ea5e9',
  padding: '24px',
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
};

const logo = {
  margin: '0 auto',
};

const content = {
  backgroundColor: '#ffffff',
  padding: '32px',
};

const hr = {
  borderColor: '#e4e4e7',
  margin: '0',
};

const footer = {
  backgroundColor: '#f4f4f5',
  padding: '24px',
  textAlign: 'center' as const,
  borderRadius: '0 0 8px 8px',
};

const footerText = {
  color: '#71717a',
  fontSize: '12px',
  margin: '4px 0',
};

const footerLinks = {
  color: '#71717a',
  fontSize: '12px',
  margin: '16px 0 0 0',
};

const footerLink = {
  color: '#71717a',
  textDecoration: 'underline',
};

const unsubscribeLink = {
  color: '#71717a',
  fontSize: '12px',
  textDecoration: 'underline',
};

const button = {
  backgroundColor: '#0ea5e9',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '600',
  padding: '14px 28px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  margin: '16px 0',
};

const infoBox = {
  borderLeft: '4px solid',
  padding: '16px',
  margin: '16px 0',
  borderRadius: '0 8px 8px 0',
};

export default BaseEmail;
