-- Migration: Add recurring task fields
-- Date: 2025-12-01
-- Description: Adds support for daily/weekly/monthly recurring tasks

-- Add new task type for monthly
-- Note: This ALTER TYPE command might fail if the type is already updated
-- Run manually if needed: ALTER TYPE tasktype ADD VALUE IF NOT EXISTS 'monthly' AFTER 'weekly';

-- Add recurring task columns
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE NOT NULL,
ADD COLUMN IF NOT EXISTS recurrence_time TIME,
ADD COLUMN IF NOT EXISTS recurrence_day_of_week INTEGER CHECK (recurrence_day_of_week >= 0 AND recurrence_day_of_week <= 6),
ADD COLUMN IF NOT EXISTS recurrence_day_of_month INTEGER CHECK (recurrence_day_of_month >= 1 AND recurrence_day_of_month <= 31),
ADD COLUMN IF NOT EXISTS last_reset_date TIMESTAMP;

-- Create index for faster queries on recurring tasks
CREATE INDEX IF NOT EXISTS idx_tasks_is_recurring ON tasks(is_recurring);
CREATE INDEX IF NOT EXISTS idx_tasks_last_reset_date ON tasks(last_reset_date);

-- Note: To add 'monthly' to TaskType enum, you may need to run this manually:
-- ALTER TYPE tasktype ADD VALUE IF NOT EXISTS 'monthly';
