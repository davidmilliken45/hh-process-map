"use client";

import { Component, Metric, User } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import HealthIndicator from "./HealthIndicator";
import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";

interface ComponentCardProps {
  component: Component & {
    owner: User;
    metrics: Metric[];
    _count?: {
      todos: number;
      issues: number;
      ideas: number;
    };
  };
  onClick?: () => void;
}

export default function ComponentCard({ component, onClick }: ComponentCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with health indicator and title */}
          <div className="flex items-start gap-2">
            <HealthIndicator status={component.healthStatus} size="lg" />
            <h3 className="font-bold text-sm flex-1 leading-tight">
              {component.title}
            </h3>
          </div>

          {/* Owner and Tool */}
          <div className="space-y-1 text-xs text-gray-600">
            <div>
              <span className="font-medium">Owner:</span> {component.owner.name}
            </div>
            {component.tool && (
              <div>
                <span className="font-medium">Tool:</span> {component.tool}
              </div>
            )}
          </div>

          {/* Metrics */}
          {component.metrics.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-700">Metrics:</div>
              <div className="space-y-1">
                {component.metrics.slice(0, 2).map((metric) => (
                  <div key={metric.id} className="text-xs text-gray-600">
                    <span className="font-mono">
                      {metric.name}: {metric.current || "N/A"}
                      {metric.target && ` (target ${metric.target})`}
                    </span>
                  </div>
                ))}
                {component.metrics.length > 2 && (
                  <div className="text-xs text-gray-500 italic">
                    +{component.metrics.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Counts */}
          {component._count && (
            <div className="flex items-center gap-3 text-xs pt-2 border-t">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-blue-600" />
                <span className="font-medium">{component._count.todos}</span>
              </div>
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-red-600" />
                <span className="font-medium">{component._count.issues}</span>
              </div>
              <div className="flex items-center gap-1">
                <Lightbulb className="h-3 w-3 text-purple-600" />
                <span className="font-medium">{component._count.ideas}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
