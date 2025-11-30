/**
 * Utility functions for the application
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Merges Tailwind CSS classes with clsx
 * Useful for conditional class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

/**
 * Format a date to a short string (e.g., "Jan 1")
 */
export function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
}

/**
 * Get the start of the day for a given date
 */
export function startOfDay(date: Date): Date {
  const newDate = new Date(date)
  newDate.setHours(0, 0, 0, 0)
  return newDate
}
