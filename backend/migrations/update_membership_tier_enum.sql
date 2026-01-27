-- Migration to update MembershipTier enum values
-- This updates the enum from basic/premium to lite/pro

-- First, add the new values to the enum
ALTER TYPE enum_orders_plan_tier ADD VALUE IF NOT EXISTS 'lite';
ALTER TYPE enum_orders_plan_tier ADD VALUE IF NOT EXISTS 'pro';

-- Update existing records
UPDATE orders SET plan_tier = 'lite' WHERE plan_tier = 'basic';
UPDATE orders SET plan_tier = 'pro' WHERE plan_tier = 'premium';

-- Update users table if it exists
UPDATE users SET membership_tier = 'lite' WHERE membership_tier = 'basic';
UPDATE users SET membership_tier = 'pro' WHERE membership_tier = 'premium';

-- Note: PostgreSQL doesn't allow removing enum values directly
-- The old 'basic' and 'premium' values will remain in the enum but won't be used
