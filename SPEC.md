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

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth with RLS (Row Level Security)
- **Storage**: Supabase Storage for screenshots
- **OCR**: Tesseract.js for screenshot analysis
- **Deployment**: Vercel

---

## Features Summary

### Authentication System ✅
- [x] Email/Password login with Supabase Auth
- [x] Role-based routing after login
- [x] Session management with Supabase SSR
- [x] Middleware for route protection

### Superadmin Dashboard ✅
- [x] Dashboard overview with stats
- [x] Campaign management (create, view, edit)
- [x] Invite influencers to campaigns
- [x] View all reports across campaigns
- [x] User management

### Client Dashboard ✅
- [x] Dashboard overview with stats
- [x] View assigned campaigns
- [x] See all submitted reports
- [x] Approve/reject reports with feedback

### Influencer Portal ✅
- [x] View assigned campaigns
- [x] Submit reports with multiple posts
- [x] Upload screenshots per post
- [x] OCR auto-extraction of metrics
- [x] Manual metric entry fallback

### OCR System ✅
- [x] Screenshot upload and storage
- [x] Tesseract.js OCR processing
- [x] Pattern matching for social media metrics
- [x] Support for abbreviated numbers (1.2K, 10M)
- [x] Confidence scoring

---

## Database Schema

### Tables

1. **profiles** - User profiles (extends auth.users)
2. **campaigns** - Marketing campaigns
3. **campaign_invites** - Influencer invitations
4. **influencer_profiles** - Additional influencer info
5. **reports** - Performance reports
6. **report_posts** - Individual posts within reports

See `/supabase/migrations/001_initial_schema.sql` for full schema.

---

## Page Structure

### Public Routes
- `/` - Landing page with portal selection
- `/auth/login` - Login form
- `/auth/register` - Registration

### Superadmin Routes
- `/superadmin` - Dashboard overview
- `/superadmin/campaigns` - All campaigns
- `/superadmin/campaigns/new` - Create campaign
- `/superadmin/campaigns/[id]` - Campaign detail
- `/superadmin/campaigns/[id]/invite` - Invite influencers

### Client Routes
- `/client` - Dashboard overview
- `/client/campaigns` - Assigned campaigns
- `/client/reports` - All reports
- `/client/reports/[id]` - Report detail with review

### Influencer Routes
- `/influencer` - Dashboard
- `/influencer/campaigns` - Available campaigns
- `/influencer/reports` - My submissions
- `/influencer/reports/new` - Submit new report

---

## API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/register` - Register

### Campaigns
- `GET /api/campaigns` - List campaigns
- `POST /api/campaigns` - Create campaign
- `GET /api/campaigns/[id]` - Get campaign
- `POST /api/campaigns/[id]/invite` - Invite influencer

### Reports
- `GET /api/reports` - List reports
- `POST /api/reports` - Create report
- `POST /api/reports/posts` - Add post to report

### OCR
- `POST /api/ocr/process` - Process screenshot

### Upload
- `POST /api/upload` - Upload file to storage

---

## Setup Instructions

### 1. Environment Variables

Create `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Database Setup

Run the SQL migration in Supabase SQL Editor:
```
/supabase/migrations/001_initial_schema.sql
```

### 3. Install & Run

```bash
npm install
npm run dev
```

### 4. Build for Production

```bash
npm run build
npm start
```

---

## Demo Accounts

Create users in Supabase Auth with these roles:
- **Superadmin**: Full system access
- **Client**: Campaign-scoped access
- **Influencer**: Report submission access

---

## Color Palette

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
```

---

## Development Status

✅ Core authentication
✅ Dashboard pages for all roles
✅ Campaign management
✅ Report submission with OCR
✅ Database schema with RLS
✅ API routes

🚧 Analytics charts (planned)
🚧 Export functionality (planned)
🚧 Real-time notifications (planned)
🚧 Mobile app (future)

---

## License

Private - Rectoverso Media
