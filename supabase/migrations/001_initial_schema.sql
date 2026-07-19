-- Influencer Report Management System - Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('superadmin', 'client', 'influencer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'completed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM ('draft', 'submitted', 'under_review', 'approved', 'revision_requested');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE social_platform AS ENUM ('instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin', 'threads');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Profiles table (extends auth.users)
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

-- Campaigns table
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
    created_by UUID NOT NULL REFERENCES profiles(id),
    client_id UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign invites table
CREATE TABLE IF NOT EXISTS campaign_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    influencer_id UUID REFERENCES profiles(id),
    invite_email TEXT,
    invite_token TEXT UNIQUE NOT NULL DEFAULT uuid_generate_v4()::text,
    status invite_status NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Influencer profiles table (additional info for influencers)
CREATE TABLE IF NOT EXISTS influencer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
    platforms JSONB DEFAULT '[]'::jsonb,
    niche TEXT,
    average_engagement_rate DECIMAL(5,2),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    influencer_id UUID NOT NULL REFERENCES profiles(id),
    status report_status NOT NULL DEFAULT 'draft',
    submitted_at TIMESTAMPTZ,
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

-- Report posts table
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

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_client ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_creator ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_reports_campaign ON reports(campaign_id);
CREATE INDEX IF NOT EXISTS idx_reports_influencer ON reports(influencer_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_report_posts_report ON report_posts(report_id);
CREATE INDEX IF NOT EXISTS idx_invites_token ON campaign_invites(invite_token);
CREATE INDEX IF NOT EXISTS idx_invites_campaign ON campaign_invites(campaign_id);

-- Functions

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE OR REPLACE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_campaigns_updated_at
    BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_influencer_profiles_updated_at
    BEFORE UPDATE ON influencer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'influencer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_posts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Superadmins can update any profile"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

-- Campaigns policies
CREATE POLICY "Superadmins can view all campaigns"
    ON campaigns FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "Clients can view their own campaigns"
    ON campaigns FOR SELECT
    USING (client_id = auth.uid());

CREATE POLICY "Influencers can view campaigns they're invited to"
    ON campaigns FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM campaign_invites
            WHERE campaign_id = campaigns.id
            AND influencer_id = auth.uid()
            AND status = 'accepted'
        )
    );

CREATE POLICY "Superadmins can create campaigns"
    ON campaigns FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "Superadmins can update campaigns"
    ON campaigns FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "Superadmins can delete campaigns"
    ON campaigns FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

-- Reports policies
CREATE POLICY "Superadmins can view all reports"
    ON reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "Clients can view reports for their campaigns"
    ON reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE id = reports.campaign_id AND client_id = auth.uid()
        )
    );

CREATE POLICY "Influencers can view their own reports"
    ON reports FOR SELECT
    USING (influencer_id = auth.uid());

CREATE POLICY "Influencers can create reports"
    ON reports FOR INSERT
    WITH CHECK (influencer_id = auth.uid());

CREATE POLICY "Influencers can update their own draft reports"
    ON reports FOR UPDATE
    USING (
        influencer_id = auth.uid()
        AND status = 'draft'
    );

CREATE POLICY "Clients can update report status (approve/reject)"
    ON reports FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE id = reports.campaign_id AND client_id = auth.uid()
        )
    );

-- Report posts policies
CREATE POLICY "Users can view report posts"
    ON report_posts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM reports
            WHERE id = report_posts.report_id
            AND (
                influencer_id = auth.uid()
                OR EXISTS (SELECT 1 FROM campaigns WHERE id = reports.campaign_id AND client_id = auth.uid())
                OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
            )
        )
    );

CREATE POLICY "Influencers can create report posts"
    ON report_posts FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM reports
            WHERE id = report_posts.report_id AND influencer_id = auth.uid()
        )
    );

CREATE POLICY "Influencers can update their own report posts"
    ON report_posts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM reports
            WHERE id = report_posts.report_id AND influencer_id = auth.uid()
        )
    );

-- Invites policies
CREATE POLICY "Superadmins can manage invites"
    ON campaign_invites FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM campaigns
            WHERE id = campaign_invites.campaign_id
            AND created_by = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'superadmin'
        )
    );

CREATE POLICY "Influencers can view their invites"
    ON campaign_invites FOR SELECT
    USING (influencer_id = auth.uid());

CREATE POLICY "Anyone can view invites by token (for accepting)"
    ON campaign_invites FOR SELECT
    USING (true);

CREATE POLICY "Influencers can update their invites (accept/decline)"
    ON campaign_invites FOR UPDATE
    USING (influencer_id = auth.uid());

-- Influencer profiles policies
CREATE POLICY "Everyone can view influencer profiles"
    ON influencer_profiles FOR SELECT
    USING (true);

CREATE POLICY "Influencers can update their own profile"
    ON influencer_profiles FOR ALL
    USING (user_id = auth.uid());

-- Storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can upload screenshots"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'screenshots');

CREATE POLICY "Anyone can view screenshots"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'screenshots');

CREATE POLICY "Users can delete their own screenshots"
    ON storage.objects FOR DELETE
    USING (bucket_id = 'screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Helper view for campaign analytics
CREATE OR REPLACE VIEW campaign_analytics AS
SELECT
    c.id as campaign_id,
    c.name as campaign_name,
    c.status,
    COUNT(DISTINCT r.id) as total_reports,
    COUNT(DISTINCT CASE WHEN r.status = 'approved' THEN r.id END) as approved_reports,
    COUNT(DISTINCT CASE WHEN r.status IN ('submitted', 'under_review') THEN r.id END) as pending_reports,
    COALESCE(SUM(r.total_impressions), 0) as total_impressions,
    COALESCE(SUM(r.total_reach), 0) as total_reach,
    COALESCE(SUM(r.total_views), 0) as total_views,
    COALESCE(SUM(r.total_likes + r.total_comments + r.total_shares + r.total_saves), 0) as total_engagement
FROM campaigns c
LEFT JOIN reports r ON c.id = r.campaign_id
GROUP BY c.id, c.name, c.status;

-- Helper view for influencer leaderboard
CREATE OR REPLACE VIEW influencer_leaderboard AS
SELECT
    p.id as influencer_id,
    p.full_name,
    p.avatar_url,
    COUNT(DISTINCT r.id) as report_count,
    COALESCE(SUM(r.total_impressions), 0) as total_impressions,
    COALESCE(SUM(r.total_reach), 0) as total_reach,
    COALESCE(SUM(r.total_views), 0) as total_views,
    COALESCE(SUM(r.total_likes + r.total_comments + r.total_shares + r.total_saves), 0) as total_engagement
FROM profiles p
LEFT JOIN reports r ON p.id = r.influencer_id
WHERE p.role = 'influencer'
GROUP BY p.id, p.full_name, p.avatar_url
ORDER BY total_impressions DESC;
