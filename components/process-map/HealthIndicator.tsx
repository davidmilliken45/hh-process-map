import { HealthStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface HealthIndicatorProps {
  status: HealthStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const healthConfig = {
  GREEN: {
    color: "bg-green-500",
    textColor: "text-green-700",
    label: "Performing Well",
  },
  YELLOW: {
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    label: "Needs Attention",
  },
  RED: {
    color: "bg-red-500",
    textColor: "text-red-700",
    label: "Critical",
  },
  GRAY: {
    color: "bg-gray-400",
    textColor: "text-gray-600",
    label: "Not Set",
  },
  BLUE: {
    color: "bg-blue-500",
    textColor: "text-blue-700",
    label: "In Progress",
  },
};

const sizeConfig = {
  sm: "h-2 w-2",
  md: "h-3 w-3",
  lg: "h-4 w-4",
};

export default function HealthIndicator({
  status,
  size = "md",
  showLabel = false,
}: HealthIndicatorProps) {
  const config = healthConfig[status];
  const sizeClass = sizeConfig[size];

  if (showLabel) {
    return (
      <div className="flex items-center gap-2">
        <div className={cn("rounded-full", config.color, sizeClass)} />
        <span className={cn("text-sm font-medium", config.textColor)}>
          {config.label}
        </span>
      </div>
    );
  }

  return <div className={cn("rounded-full", config.color, sizeClass)} />;
}
