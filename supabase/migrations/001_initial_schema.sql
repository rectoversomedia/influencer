-- =============================================
-- RECTOVERSO INFLUENCER REPORT SYSTEM
-- Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('superadmin', 'client', 'influencer');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'completed', 'archived');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'revision_requested');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE social_platform AS ENUM ('instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin', 'threads');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- PROFILES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role user_role NOT NULL DEFAULT 'influencer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- CAMPAIGNS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    brand_name TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status campaign_status NOT NULL DEFAULT 'draft',
    required_metrics TEXT[] DEFAULT ARRAY['impressions', 'reach', 'views', 'likes', 'comments'],
    min_posts_required INTEGER DEFAULT 1,
    budget DECIMAL(15,2),
    created_by UUID REFERENCES profiles(id),
    client_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REPORTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    campaign_name TEXT,
    influencer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    influencer_name TEXT,
    influencer_email TEXT,
    influencer_phone TEXT,
    status report_status NOT NULL DEFAULT 'submitted',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    feedback TEXT,
    total_impressions BIGINT DEFAULT 0,
    total_reach BIGINT DEFAULT 0,
    total_views BIGINT DEFAULT 0,
    total_clicks BIGINT DEFAULT 0,
    total_likes BIGINT DEFAULT 0,
    total_comments BIGINT DEFAULT 0,
    total_shares BIGINT DEFAULT 0,
    total_saves BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- REPORT POSTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS report_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    post_number INTEGER NOT NULL,
    platform social_platform NOT NULL DEFAULT 'instagram',
    post_url TEXT,
    caption TEXT,
    impressions BIGINT DEFAULT 0,
    reach BIGINT DEFAULT 0,
    views BIGINT DEFAULT 0,
    clicks BIGINT DEFAULT 0,
    likes BIGINT DEFAULT 0,
    comments BIGINT DEFAULT 0,
    shares BIGINT DEFAULT 0,
    saves BIGINT DEFAULT 0,
    screenshot_url TEXT,
    screenshot_public_url TEXT,
    ocr_data JSONB,
    ocr_confidence DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_reports_campaign ON reports(campaign_id);
CREATE INDEX IF NOT EXISTS idx_reports_influencer ON reports(influencer_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_report_posts_report ON report_posts(report_id);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON campaigns;
CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'influencer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_posts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Profiles viewable by all" ON profiles;
CREATE POLICY "Profiles viewable by all" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Reports policies
DROP POLICY IF EXISTS "Reports viewable by all" ON reports;
CREATE POLICY "Reports viewable by all" ON reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert reports" ON reports;
CREATE POLICY "Anyone can insert reports" ON reports FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Reports updatable by reviewers" ON reports;
CREATE POLICY "Reports updatable by reviewers" ON reports FOR UPDATE USING (true);

-- Report posts policies
DROP POLICY IF EXISTS "Posts viewable by all" ON report_posts;
CREATE POLICY "Posts viewable by all" ON report_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Posts insertable by all" ON report_posts;
CREATE POLICY "Posts insertable by all" ON report_posts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Posts updatable by all" ON report_posts;
CREATE POLICY "Posts updatable by all" ON report_posts FOR UPDATE USING (true);

-- Campaigns policies
DROP POLICY IF EXISTS "Campaigns viewable by all" ON campaigns;
CREATE POLICY "Campaigns viewable by all" ON campaigns FOR SELECT USING (true);

DROP POLICY IF EXISTS "Campaigns insertable by all" ON campaigns;
CREATE POLICY "Campaigns insertable by all" ON campaigns FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Campaigns updatable by all" ON campaigns;
CREATE POLICY "Campaigns updatable by all" ON campaigns FOR UPDATE USING (true);

-- =============================================
-- STORAGE BUCKET
-- =============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Screenshots viewable by all" ON storage.objects;
CREATE POLICY "Screenshots viewable by all" ON storage.objects
    FOR SELECT USING (bucket_id = 'screenshots');

DROP POLICY IF EXISTS "Screenshots uploadable by all" ON storage.objects;
CREATE POLICY "Screenshots uploadable by all" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'screenshots');

DROP POLICY IF EXISTS "Screenshots deletable by all" ON storage.objects;
CREATE POLICY "Screenshots deletable by all" ON storage.objects
    FOR DELETE USING (bucket_id = 'screenshots');

-- =============================================
-- SEED DATA - Demo Campaigns
-- =============================================
INSERT INTO campaigns (id, name, brand_name, start_date, end_date, status, required_metrics, min_posts_required, description)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'FIFGO Download & Rating', 'FIFGO', '2024-01-01', '2026-12-31', 'active', ARRAY['impressions', 'reach', 'views', 'likes', 'comments', 'shares', 'saves'], 1, 'Campaign untuk download dan rating aplikasi FIFGO'),
    ('22222222-2222-2222-2222-222222222222', 'Summer Campaign 2024', 'Various', '2024-06-01', '2024-08-31', 'active', ARRAY['impressions', 'reach', 'views', 'likes', 'comments'], 2, 'Campaign summer untuk berbagai brand'),
    ('33333333-3333-3333-3333-333333333333', 'Tech Product Launch', 'TechBrand', '2024-07-01', '2024-09-30', 'active', ARRAY['impressions', 'reach', 'views', 'likes', 'comments', 'shares'], 3, 'Product launch untuk produk teknologi baru')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- COMPLETED!
-- =============================================
