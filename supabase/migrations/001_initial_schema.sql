-- Rectoverso Influencer Marketing Platform - Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'influencer' CHECK (role IN ('superadmin', 'client', 'influencer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  brand_name TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'archived')),
  required_metrics TEXT[] DEFAULT ARRAY['impressions', 'reach', 'likes', 'comments'],
  min_posts_required INTEGER DEFAULT 1,
  budget DECIMAL(12, 2),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign invites
CREATE TABLE IF NOT EXISTS campaign_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  invite_token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'revision_requested')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  feedback TEXT,
  total_impressions BIGINT DEFAULT 0,
  total_reach BIGINT DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  total_clicks BIGINT DEFAULT 0,
  total_likes BIGINT DEFAULT 0,
  total_comments BIGINT DEFAULT 0,
  total_shares BIGINT DEFAULT 0,
  total_saves BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report posts table
CREATE TABLE IF NOT EXISTS report_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  post_number INTEGER NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin', 'threads')),
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
  ocr_confidence DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Influencer profiles table
CREATE TABLE IF NOT EXISTS influencer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  platforms JSONB DEFAULT '[]'::JSONB,
  niche TEXT,
  average_engagement_rate DECIMAL(5, 2),
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_campaigns_client_id ON campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_invites_campaign_id ON campaign_invites(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_invites_influencer_id ON campaign_invites(influencer_id);
CREATE INDEX IF NOT EXISTS idx_reports_campaign_id ON reports(campaign_id);
CREATE INDEX IF NOT EXISTS idx_reports_influencer_id ON reports(influencer_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_report_posts_report_id ON report_posts(report_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Superadmins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Superadmins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- Campaigns policies
CREATE POLICY "Everyone can view campaigns"
  ON campaigns FOR SELECT
  USING (true);

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

-- Campaign invites policies
CREATE POLICY "Everyone can view invites for their campaigns"
  ON campaign_invites FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE created_by = auth.uid() OR client_id = auth.uid()
    )
    OR influencer_id = auth.uid()
  );

CREATE POLICY "Superadmins and campaign owners can create invites"
  ON campaign_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns
      WHERE id = campaign_id AND (created_by = auth.uid() OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'
      ))
    )
  );

-- Reports policies
CREATE POLICY "Influencers can view their own reports"
  ON reports FOR SELECT
  USING (influencer_id = auth.uid());

CREATE POLICY "Campaign owners can view reports"
  ON reports FOR SELECT
  USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE created_by = auth.uid() OR client_id = auth.uid()
    )
  );

CREATE POLICY "Superadmins can view all reports"
  ON reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Influencers can create reports"
  ON reports FOR INSERT
  WITH CHECK (influencer_id = auth.uid());

CREATE POLICY "Influencers can update their own reports"
  ON reports FOR UPDATE
  USING (influencer_id = auth.uid());

CREATE POLICY "Clients can update report status"
  ON reports FOR UPDATE
  USING (
    campaign_id IN (
      SELECT id FROM campaigns
      WHERE client_id = auth.uid()
    )
  );

-- Report posts policies
CREATE POLICY "Users can view posts of their reports"
  ON report_posts FOR SELECT
  USING (
    report_id IN (
      SELECT id FROM reports
      WHERE influencer_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM campaigns c
        JOIN reports r ON r.campaign_id = c.id
        WHERE r.id = report_posts.report_id
        AND (c.created_by = auth.uid() OR c.client_id = auth.uid())
      )
    )
  );

CREATE POLICY "Influencers can create posts"
  ON report_posts FOR INSERT
  WITH CHECK (
    report_id IN (
      SELECT id FROM reports WHERE influencer_id = auth.uid()
    )
  );

CREATE POLICY "Influencers can update their own posts"
  ON report_posts FOR UPDATE
  USING (
    report_id IN (
      SELECT id FROM reports WHERE influencer_id = auth.uid()
    )
  );

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public)
VALUES ('screenshots', 'screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload their own screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'screenshots' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'screenshots');

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'influencer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create demo users function
CREATE OR REPLACE FUNCTION create_demo_users()
RETURNS void AS $$
DECLARE
  admin_id UUID;
  client_id UUID;
  influencer_id UUID;
BEGIN
  -- Create superadmin
  INSERT INTO auth.users (email, encrypted_password, raw_user_meta_data)
  VALUES (
    'admin@rectoverso.com',
    crypt('demo123', gen_salt('bf')),
    '{"full_name": "Admin User", "role": "superadmin"}'::JSONB
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO admin_id;

  -- Create client
  INSERT INTO auth.users (email, encrypted_password, raw_user_meta_data)
  VALUES (
    'client@rectoverso.com',
    crypt('demo123', gen_salt('bf')),
    '{"full_name": "Client User", "role": "client"}'::JSONB
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO client_id;

  -- Create influencer
  INSERT INTO auth.users (email, encrypted_password, raw_user_meta_data)
  VALUES (
    'influencer@rectoverso.com',
    crypt('demo123', gen_salt('bf')),
    '{"full_name": "Influencer User", "role": "influencer"}'::JSONB
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO influencer_id;

  -- Update profiles with correct IDs
  UPDATE profiles SET id = admin_id WHERE email = 'admin@rectoverso.com';
  UPDATE profiles SET id = client_id WHERE email = 'client@rectoverso.com';
  UPDATE profiles SET id = influencer_id WHERE email = 'influencer@rectoverso.com';
END;
$$ LANGUAGE plpgsql;

-- Grant execute on function
GRANT EXECUTE ON FUNCTION create_demo_users() TO authenticated;

COMMENT ON TABLE profiles IS 'User profiles extending Supabase Auth';
COMMENT ON TABLE campaigns IS 'Marketing campaigns managed by the platform';
COMMENT ON TABLE campaign_invites IS 'Invitations sent to influencers for campaigns';
COMMENT ON TABLE reports IS 'Performance reports submitted by influencers';
COMMENT ON TABLE report_posts IS 'Individual post data within reports';
