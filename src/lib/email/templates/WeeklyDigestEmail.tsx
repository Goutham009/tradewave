import { Text, Section, Hr } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, Button } from './BaseEmail';

interface WeeklyDigestEmailProps {
  userName: string;
  weekStats: {
    newRequirements: number;
    quotesReceived: number;
    quotesAccepted: number;
    transactionsCompleted: number;
    totalVolume: string;
    pendingActions: number;
  };
  digestLink: string;
  unsubscribeUrl?: string;
}

export const WeeklyDigestEmail: React.FC<WeeklyDigestEmailProps> = ({
  userName,
  weekStats,
  digestLink,
  unsubscribeUrl,
}) => {
  return (
    <BaseEmail preview={`Your weekly Tradewave summary`} unsubscribeUrl={unsubscribeUrl}>
      <Text style={heading}>Your Weekly Digest 📊</Text>
      <Text style={paragraph}>Hi {userName},</Text>
      <Text style={paragraph}>
        Here&rsquo;s your weekly summary from Tradewave. Stay on top of your trading activity!
      </Text>
      
      <Section style={statsGrid}>
        <table style={table}>
          <tbody>
            <tr>
              <td style={statCard}>
                <Text style={statNumber}>{weekStats.newRequirements}</Text>
                <Text style={statLabel}>New Requirements</Text>
              </td>
              <td style={statCard}>
                <Text style={statNumber}>{weekStats.quotesReceived}</Text>
                <Text style={statLabel}>Quotes Received</Text>
              </td>
            </tr>
            <tr>
              <td style={statCard}>
                <Text style={statNumber}>{weekStats.quotesAccepted}</Text>
                <Text style={statLabel}>Quotes Accepted</Text>
              </td>
              <td style={statCard}>
                <Text style={statNumber}>{weekStats.transactionsCompleted}</Text>
                <Text style={statLabel}>Transactions</Text>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section style={volumeBox}>
        <Text style={volumeLabel}>Total Volume This Week</Text>
        <Text style={volumeAmount}>{weekStats.totalVolume}</Text>
      </Section>

      {weekStats.pendingActions > 0 && (
        <>
          <Hr style={hr} />
          <Section style={actionBox}>
            <Text style={actionText}>
              ⚡ You have <strong>{weekStats.pendingActions}</strong> pending actions requiring your attention
            </Text>
          </Section>
        </>
      )}

      <Section style={buttonContainer}>
        <Button href={digestLink}>View Full Dashboard</Button>
      </Section>
    </BaseEmail>
  );
};

const heading = { fontSize: '24px', fontWeight: '700', color: '#18181b', margin: '0 0 16px 0' };
const paragraph = { fontSize: '14px', color: '#3f3f46', lineHeight: '24px', margin: '16px 0' };
const statsGrid = { margin: '24px 0' };
const table = { width: '100%', borderCollapse: 'collapse' as const };
const statCard = { backgroundColor: '#f4f4f5', padding: '16px', textAlign: 'center' as const, borderRadius: '8px', width: '50%' };
const statNumber = { fontSize: '28px', fontWeight: '700', color: '#0ea5e9', margin: '0' };
const statLabel = { fontSize: '12px', color: '#71717a', margin: '4px 0 0 0' };
const volumeBox = { backgroundColor: '#dcfce7', padding: '20px', borderRadius: '8px', textAlign: 'center' as const, margin: '16px 0' };
const volumeLabel = { fontSize: '14px', color: '#166534', margin: '0' };
const volumeAmount = { fontSize: '32px', fontWeight: '700', color: '#15803d', margin: '8px 0 0 0' };
const hr = { borderColor: '#e4e4e7', margin: '24px 0' };
const actionBox = { backgroundColor: '#fef3c7', padding: '16px', borderRadius: '8px', margin: '16px 0' };
const actionText = { fontSize: '14px', color: '#92400e', margin: '0' };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };

export default WeeklyDigestEmail;
