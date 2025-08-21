import type { RiskLevel } from "../types";

interface RiskBadgeProps {
  level: RiskLevel;
}

export default function RiskBadge({ level }: RiskBadgeProps) {
  const config = {
    low: {
      className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200",
      label: "Low Risk"
    },
    medium: {
      className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200",
      label: "Medium Risk"
    },
    high: {
      className: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200",
      label: "High Risk"
    }
  };

  const { className, label } = config[level];

  return (
    <span className={className}>
      {label}
    </span>
  );
}
