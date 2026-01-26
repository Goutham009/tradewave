'use client';

import { AlertTriangle, CheckCircle, AlertCircle, Ban } from 'lucide-react';

interface RiskIndicatorProps {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  score?: number;
  flagCount?: number;
  isBlacklisted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

const RISK_CONFIG = {
  LOW: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    icon: CheckCircle,
    label: 'Low Risk',
    description: 'Good payment history and behavior'
  },
  MEDIUM: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    icon: AlertCircle,
    label: 'Medium Risk',
    description: 'Some concerns - proceed with caution'
  },
  HIGH: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    icon: AlertTriangle,
    label: 'High Risk',
    description: 'Significant concerns - review carefully'
  }
};

const SIZE_CONFIG = {
  sm: { badge: 'px-2 py-0.5 text-xs', icon: 'w-3 h-3' },
  md: { badge: 'px-2.5 py-1 text-sm', icon: 'w-4 h-4' },
  lg: { badge: 'px-3 py-1.5 text-base', icon: 'w-5 h-5' }
};

export function RiskIndicator({
  riskLevel,
  score,
  flagCount = 0,
  isBlacklisted = false,
  size = 'md',
  showTooltip = true
}: RiskIndicatorProps) {
  if (isBlacklisted) {
    return (
      <div className="relative group">
        <span className={`inline-flex items-center gap-1 rounded-full bg-black text-white ${SIZE_CONFIG[size].badge}`}>
          <Ban className={SIZE_CONFIG[size].icon} />
          Blacklisted
        </span>
        {showTooltip && (
          <div className="absolute z-10 hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap">
            This buyer is blacklisted and cannot transact
          </div>
        )}
      </div>
    );
  }

  const config = RISK_CONFIG[riskLevel] || RISK_CONFIG.MEDIUM;
  const Icon = config.icon;
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div className="relative group">
      <span className={`inline-flex items-center gap-1 rounded-full ${config.bgColor} ${config.color} ${sizeConfig.badge}`}>
        <Icon className={sizeConfig.icon} />
        {config.label}
        {flagCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
            {flagCount}
          </span>
        )}
      </span>
      {showTooltip && (
        <div className="absolute z-10 hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap">
          <div className="font-medium">{config.label}</div>
          {score !== undefined && <div>Score: {score}/100</div>}
          <div className="text-gray-300">{config.description}</div>
          {flagCount > 0 && <div className="text-red-300">{flagCount} active flag(s)</div>}
        </div>
      )}
    </div>
  );
}

export default RiskIndicator;
