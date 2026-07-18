# Influencer Report Management System - Rectoverso

## Overview

A comprehensive influencer marketing reporting platform that enables three distinct user roles to manage campaigns, submit performance reports with automated screenshot metrics extraction, and view powerful analytics dashboards.

---

## System Architecture

### User Roles

| Role | Access Level | Capabilities |
|------|-------------|--------------|
| **Superadmin** | Full System | Manage all campaigns, clients, influencers, system settings |
| **Client** | Campaign-Scoped | View dashboard, approve reports, download analytics for their campaigns |
| **Influencer** | Assignment-Scoped | Submit reports with metrics, upload screenshots, track status |

### Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with RLS (Row Level Security)
- **Storage**: Supabase Storage for screenshots
- **Deployment**: Vercel

---

## Database Schema

### Tables

#### 1. `profiles`
```sql
id: uuid PRIMARY KEY (references auth.users)
email: text UNIQUE
full_name: text
phone: text
avatar_url: text
role: enum('superadmin', 'client', 'influencer')
created_at: timestamp
updated_at: timestamp
```

#### 2. `campaigns`
```sql
id: uuid PRIMARY KEY
name: text
description: text
brand_name: text
start_date: date
end_date: date
status: enum('draft', 'active', 'completed', 'archived')
required_metrics: text[] -- ['impressions', 'reach', 'views', 'clicks', 'likes', 'comments', 'shares', 'saves']
min_posts_required: integer DEFAULT 1
budget: decimal
created_by: uuid REFERENCES profiles
client_id: uuid REFERENCES profiles (for client ownership)
created_at: timestamp
updated_at: timestamp
```

#### 3. `campaign_invites`
```sql
id: uuid PRIMARY KEY
campaign_id: uuid REFERENCES campaigns
influencer_id: uuid REFERENCES profiles
invite_token: text UNIQUE
status: enum('pending', 'accepted', 'declined')
expires_at: timestamp
created_at: timestamp
```

#### 4. `influencer_profiles`
```sql
id: uuid PRIMARY KEY
user_id: uuid REFERENCES profiles
platforms: jsonb -- [{platform: 'instagram', username: 'xxx', followers: 10000}]
niche: text
average_engagement_rate: decimal
is_available: boolean DEFAULT true
```

#### 5. `reports`
```sql
id: uuid PRIMARY KEY
campaign_id: uuid REFERENCES campaigns
influencer_id: uuid REFERENCES profiles
status: enum('draft', 'submitted', 'under_review', 'approved', 'revision_requested')
submitted_at: timestamp
reviewed_by: uuid REFERENCES profiles
reviewed_at: timestamp
feedback: text
total_impressions: bigint
total_reach: bigint
total_views: bigint
total_clicks: bigint
total_likes: bigint
total_comments: bigint
total_shares: bigint
total_saves: bigint
created_at: timestamp
updated_at: timestamp
```

#### 6. `report_posts`
```sql
id: uuid PRIMARY KEY
report_id: uuid REFERENCES reports
post_number: integer
platform: enum('instagram', 'tiktok', 'youtube', 'twitter', 'facebook', 'linkedin', 'threads')
post_url: text
caption: text
impressions: bigint
reach: bigint
views: bigint
clicks: bigint
likes: bigint
comments: bigint
shares: bigint
saves: bigint
screenshot_url: text
screenshot_public_url: text
ocr_data: jsonb -- raw OCR extracted data
ocr_confidence: decimal
created_at: timestamp
```

---

## Features Specification

### Authentication System

- [x] Email/Password login with Supabase Auth
- [x] Role-based routing after login
- [x] Session management with Supabase SSR
- [x] Password reset functionality
- [x] Email verification

### Superadmin Dashboard

#### Campaign Management
- [x] Create new campaign with all settings
- [x] Select required metrics for campaign
- [x] Set minimum posts required
- [x] Invite influencers via email
- [x] Generate unique invite links
- [x] Track invited influencer status
- [x] View all campaign performance
- [x] Archive/complete campaigns
- [x] Duplicate campaigns

#### User Management
- [x] View all users (clients, influencers)
- [x] Create client accounts
- [x] Manage influencer profiles
- [x] View system-wide analytics

#### Analytics
- [x] System-wide metrics overview
- [x] Top performing campaigns
- [x] Influencer leaderboard
- [x] Export data to CSV/PDF

### Client Dashboard

#### Campaign View
- [x] View assigned campaigns
- [x] See all submitted reports
- [x] Approve/reject reports with feedback
- [x] Download campaign reports

#### Analytics Dashboard
- [x] Campaign performance metrics
- [x] Per-influencer breakdown
- [x] Platform distribution
- [x] Metrics comparison charts
- [x] Date range filtering
- [x] Export reports

### Influencer Portal

#### Report Submission
- [x] View assigned campaigns
- [x] Submit report for campaign
- [x] Add multiple posts (dynamic based on campaign requirement)
- [x] For each post:
  - Select platform
  - Enter post URL
  - Upload screenshot
  - (Optional) Enter metrics manually
- [x] Auto-calculate totals
- [x] Save as draft
- [x] Submit report
- [x] View submission status
- [x] Receive feedback on revisions

#### OCR Processing (Screenshot Analysis)
- [x] Upload screenshot
- [x] Backend OCR processing
- [x] Extract numbers from screenshot
- [x] Display extracted metrics
- [x] Allow manual correction
- [x] Confidence scoring

### OCR System

#### Supported Platforms
- Instagram (post insights)
- TikTok (video analytics)
- YouTube (analytics)
- Twitter/X (metrics)
- Facebook (insights)

#### OCR Process
1. Upload screenshot to Supabase Storage
2. Trigger OCR via API route
3. Use Tesseract.js for client-side OCR OR
4. Send to external OCR service (Google Vision, AWS Textract)
5. Parse extracted text for metrics
6. Calculate confidence score
7. Store raw OCR data for verification

#### Metrics Extraction
- Pattern matching for numbers near metric labels
- Contextual understanding of social media UI
- Support for abbreviated numbers (1.2K, 10M)
- Fallback to manual entry

---

## Page Structure

### Public Routes
- `/` - Landing/Login page
- `/auth/login` - Login form
- `/auth/register` - Registration (invite-only for influencer)
- `/auth/reset-password` - Password reset

### Superadmin Routes
- `/superadmin` - Dashboard overview
- `/superadmin/campaigns` - All campaigns list
- `/superadmin/campaigns/new` - Create campaign
- `/superadmin/campaigns/[id]` - Campaign detail
- `/superadmin/campaigns/[id]/edit` - Edit campaign
- `/superadmin/campaigns/[id]/invite` - Invite influencers
- `/superadmin/clients` - Manage clients
- `/superadmin/influencers` - Manage influencers
- `/superadmin/analytics` - System analytics
- `/superadmin/settings` - System settings

### Client Routes
- `/client` - Dashboard overview
- `/client/campaigns` - Assigned campaigns
- `/client/campaigns/[id]` - Campaign detail
- `/client/reports` - All reports
- `/client/reports/[id]` - Report detail with review
- `/client/analytics` - Campaign analytics
- `/client/export` - Export data

### Influencer Routes
- `/influencer` - My campaigns
- `/influencer/campaigns` - Available campaigns
- `/influencer/campaigns/[id]` - Campaign details
- `/influencer/reports/new/[campaignId]` - Create report
- `/influencer/reports/[id]` - View/edit report
- `/influencer/reports` - My submissions

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/reset-password` - Reset password

### Campaigns
- `GET /api/campaigns` - List campaigns (filtered by role)
- `POST /api/campaigns` - Create campaign (superadmin)
- `GET /api/campaigns/[id]` - Get campaign details
- `PUT /api/campaigns/[id]` - Update campaign
- `DELETE /api/campaigns/[id]` - Delete campaign

### Invites
- `POST /api/campaigns/[id]/invite` - Send invite
- `GET /api/invites/[token]` - Validate invite
- `POST /api/invites/[token]/accept` - Accept invite

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports` - Create report
- `GET /api/reports/[id]` - Get report details
- `PUT /api/reports/[id]` - Update report
- `POST /api/reports/[id]/submit` - Submit report
- `POST /api/reports/[id]/approve` - Approve report (client)
- `POST /api/reports/[id]/request-revision` - Request revision

### OCR
- `POST /api/ocr/process` - Process screenshot
- `GET /api/ocr/result/[id]` - Get OCR result

### Analytics
- `GET /api/analytics/overview` - System overview
- `GET /api/analytics/campaign/[id]` - Campaign analytics
- `GET /api/analytics/export/[id]` - Export data

---

## UI/UX Design

### Color Palette
```
Primary:      #6366F1 (Indigo)
Secondary:    #8B5CF6 (Purple)
Accent:       #EC4899 (Pink)
Success:      #10B981 (Emerald)
Warning:      #F59E0B (Amber)
Error:        #EF4444 (Red)
Background:   #F8FAFC (Slate 50)
Surface:      #FFFFFF (White)
Text Primary: #0F172A (Slate 900)
Text Secondary: #64748B (Slate 500)
Border:       #E2E8F0 (Slate 200)
```

### Typography
- Headings: Inter (Google Fonts)
- Body: Inter
- Monospace: JetBrains Mono (for metrics/numbers)

### Components

#### Navigation
- Sidebar navigation for dashboards
- Top bar with user menu
- Breadcrumb navigation
- Role-based menu items

#### Cards
- Campaign cards with progress
- Report cards with status badges
- Metric cards with trend indicators

#### Forms
- Multi-step forms for report submission
- Dynamic field generation
- File upload with preview
- Validation feedback

#### Tables
- Sortable columns
- Pagination
- Bulk actions
- Export options

#### Charts
- Line charts for trends
- Bar charts for comparisons
- Pie charts for distributions
- Number cards with sparklines

---

## Security

### Row Level Security (RLS)

```sql
-- Profiles: Users can read their own, superadmin reads all
-- Campaigns: Based on role (superadmin all, client their own, influencer assigned)
-- Reports: Based on campaign access
-- Storage: Signed URLs with expiry
```

### API Security
- Rate limiting
- Input sanitization
- CSRF protection
- Secure file upload validation

---

## Performance Optimizations

- Server-side rendering for dashboards
- Incremental static regeneration for campaign pages
- Image optimization with next/image
- Lazy loading for charts
- Optimistic UI updates

---

## Future Enhancements (v2)

- [ ] Real-time notifications
- [ ] Mobile app (React Native)
- [ ] Automated report generation (PDF)
- [ ] AI-powered insights
- [ ] Integration with social media APIs
- [ ] Payment tracking for influencers
- [ ] White-label option for agencies

---

## Deployment

### Vercel
- Environment variables setup
- Automatic deployments from GitHub
- Preview deployments for PRs

### Supabase
- Database migrations
- Storage buckets configuration
- Edge functions for OCR

---

## Development Timeline

1. **Phase 1**: Core Setup + Auth (Complete)
2. **Phase 2**: Database + API (Complete)
3. **Phase 3**: Superadmin Dashboard (Complete)
4. **Phase 4**: Client Dashboard (Complete)
5. **Phase 5**: Influencer Portal (Complete)
6. **Phase 6**: OCR Integration (Complete)
7. **Phase 7**: Polish + Deploy (Complete)
