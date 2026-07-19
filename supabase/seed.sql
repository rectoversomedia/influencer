-- Seed data for testing
-- Run this AFTER the migration

-- Note: Passwords are hashed versions of 'demo123'
-- In production, use proper user registration

-- Insert demo users (profiles only - they need to be created in Auth first)
-- The trigger will create profiles automatically when users sign up

-- For demo purposes, we can manually insert profiles for existing auth users
-- These are placeholder UUIDs that should match actual auth.users

-- Sample campaign data
INSERT INTO campaigns (id, name, description, brand_name, start_date, end_date, status, required_metrics, min_posts_required, budget, created_by)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'Summer Fashion Collection 2024', 'Promotional campaign for new summer fashion collection', 'FashionBrand ID', '2024-06-01', '2024-08-31', 'active', ARRAY['impressions', 'reach', 'views', 'likes', 'comments', 'shares'], 3, 50000000, 'b2222222-2222-2222-2222-222222222222'),
    ('c3333333-3333-3333-3333-333333333333', 'Tech Product Launch', 'Launch campaign for new smartphone', 'TechGadget Pro', '2024-07-01', '2024-09-30', 'active', ARRAY['impressions', 'reach', 'views', 'clicks', 'likes', 'comments'], 2, 100000000, 'd4444444-4444-4444-4444-444444444444'),
    ('e5555555-5555-5555-5555-555555555555', 'Healthy Lifestyle Campaign', 'Promoting healthy food products', 'GreenLife Foods', '2024-05-15', '2024-07-15', 'completed', ARRAY['impressions', 'reach', 'likes', 'comments', 'saves'], 4, 35000000, 'b2222222-2222-2222-2222-222222222222');
