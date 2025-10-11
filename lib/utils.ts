import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { HealthStatus, Component, Metric } from '@prisma/client';
import { format, formatDistance, formatRelative } from 'date-fns';

/**
 * Tailwind CSS class merge utility
 * Combines clsx and tailwind-merge for optimal class handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate component health status based on metrics
 * Logic: Determines health based on how many metrics are below target
 * - GREEN: 90%+ of metrics meet target
 * - YELLOW: 70-90% of metrics meet target
 * - RED: <70% of metrics meet target
 *
 * @param metrics - Array of metrics for a component
 * @returns HealthStatus enum value
 */
export function calculateHealthStatus(metrics: Metric[]): HealthStatus {
  if (!metrics || metrics.length === 0) {
    return 'GRAY'; // No metrics = unknown status
  }

  // Count how many metrics meet their target
  const meetsTarget = metrics.filter((metric) => {
    if (!metric.current || !metric.target) {
      return false; // Can't determine if no values set
    }

    // Parse numeric values (handles both plain numbers and percentages)
    const currentValue = parseFloat(metric.current.replace(/[^0-9.-]/g, ''));
    const targetValue = parseFloat(metric.target.replace(/[^0-9.-]/g, ''));

    if (isNaN(currentValue) || isNaN(targetValue)) {
      return false; // Invalid numeric data
    }

    // Metric meets target if current >= target
    return currentValue >= targetValue;
  }).length;

  const totalMetrics = metrics.length;
  const percentage = meetsTarget / totalMetrics;

  if (percentage >= 0.9) return 'GREEN';
  if (percentage >= 0.7) return 'YELLOW';
  return 'RED';
}

/**
 * Calculate overall health score for dashboard
 * Converts component health statuses to a 0-100 score
 *
 * @param components - Array of components with health statuses
 * @returns Number between 0-100 representing overall health
 */
export function getOverallHealth(components: Component[]): number {
  if (!components || components.length === 0) {
    return 0;
  }

  const weights: Record<HealthStatus, number> = {
    GREEN: 100,
    YELLOW: 60,
    RED: 20,
    GRAY: 50,
    BLUE: 70
  };

  const sum = components.reduce((acc, component) => {
    return acc + weights[component.healthStatus];
  }, 0);

  return Math.round(sum / components.length);
}

/**
 * Format date for display
 * @param date - Date to format
 * @param formatStr - Optional format string (default: 'MMM d, yyyy')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, formatStr: string = 'MMM d, yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
}

/**
 * Format date as relative time (e.g., "2 hours ago")
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Format date relative to current date with context
 * @param date - Date to format
 * @returns Contextual relative date string
 */
export function formatRelativeDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatRelative(dateObj, new Date());
}

/**
 * Format datetime for display
 * @param date - Date to format
 * @returns Formatted datetime string
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'MMM d, yyyy h:mm a');
}

/**
 * Get health status color for UI
 * @param status - Health status
 * @returns Tailwind color class
 */
export function getHealthColor(status: HealthStatus): string {
  const colors: Record<HealthStatus, string> = {
    GREEN: 'text-green-600 bg-green-50 border-green-200',
    YELLOW: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    RED: 'text-red-600 bg-red-50 border-red-200',
    GRAY: 'text-gray-600 bg-gray-50 border-gray-200',
    BLUE: 'text-blue-600 bg-blue-50 border-blue-200'
  };
  return colors[status];
}

/**
 * Get health status badge color
 * @param status - Health status
 * @returns Tailwind badge color classes
 */
export function getHealthBadgeColor(status: HealthStatus): string {
  const colors: Record<HealthStatus, string> = {
    GREEN: 'bg-green-100 text-green-800 border-green-200',
    YELLOW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    RED: 'bg-red-100 text-red-800 border-red-200',
    GRAY: 'bg-gray-100 text-gray-800 border-gray-200',
    BLUE: 'bg-blue-100 text-blue-800 border-blue-200'
  };
  return colors[status];
}

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param length - Maximum length
 * @returns Truncated text with ellipsis if needed
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Get initials from name
 * @param name - Full name
 * @returns Initials (max 2 characters)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
