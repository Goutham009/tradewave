import { Text, Section } from '@react-email/components';
import * as React from 'react';
import { BaseEmail, Button, InfoBox } from './BaseEmail';

interface AdminAlertEmailProps {
  alertType: string;
  details: Record<string, string>;
  actionLink: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export const AdminAlertEmail: React.FC<AdminAlertEmailProps> = ({
  alertType,
  details,
  actionLink,
  priority,
}) => {
  const priorityColors = {
    low: { bg: '#f0f9ff', text: '#0369a1', label: 'Low' },
    medium: { bg: '#fef9c3', text: '#a16207', label: 'Medium' },
    high: { bg: '#fee2e2', text: '#dc2626', label: 'High' },
    critical: { bg: '#fecaca', text: '#b91c1c', label: 'Critical' },
  };
  const color = priorityColors[priority];

  return (
    <BaseEmail preview={`[${color.label}] Admin Alert: ${alertType}`}>
      <Text style={heading}>🚨 Admin Alert</Text>
      <Section style={{ ...priorityBadge, backgroundColor: color.bg }}>
        <Text style={{ ...priorityText, color: color.text }}>
          Priority: {color.label.toUpperCase()}
        </Text>
      </Section>
      <InfoBox variant={priority === 'critical' || priority === 'high' ? 'warning' : 'info'}>
        <Text style={alertTypeText}>{alertType}</Text>
      </InfoBox>
      <Section style={detailsBox}>
        <table style={table}>
          <tbody>
            {Object.entries(details).map(([key, value]) => (
              <tr key={key}>
                <td style={labelCell}>{key}</td>
                <td style={valueCell}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
      <Text style={paragraph}>
        This alert requires your attention. Please review and take appropriate action.
      </Text>
      <Section style={buttonContainer}>
        <Button href={actionLink}>Take Action</Button>
      </Section>
    </BaseEmail>
  );
};

const heading = { fontSize: '24px', fontWeight: '700', color: '#18181b', margin: '0 0 16px 0' };
const paragraph = { fontSize: '14px', color: '#3f3f46', lineHeight: '24px', margin: '16px 0' };
const priorityBadge = { padding: '8px 16px', borderRadius: '8px', marginBottom: '16px', display: 'inline-block' };
const priorityText = { fontSize: '12px', fontWeight: '700', margin: '0', textTransform: 'uppercase' as const };
const alertTypeText = { fontSize: '16px', fontWeight: '600', color: '#18181b', margin: '0' };
const detailsBox = { backgroundColor: '#f4f4f5', padding: '16px', borderRadius: '8px', margin: '16px 0' };
const table = { width: '100%', borderCollapse: 'collapse' as const };
const labelCell = { padding: '8px 0', fontSize: '14px', color: '#71717a', width: '40%' };
const valueCell = { padding: '8px 0', fontSize: '14px', color: '#18181b', textAlign: 'right' as const };
const buttonContainer = { textAlign: 'center' as const, margin: '24px 0' };

export default AdminAlertEmail;
