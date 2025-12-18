# ISECO - Independent Students Electoral Committee Platform

## Overview

ISECO is a comprehensive digital election platform for the College of Health Sciences Students Association (COHSSA) at Al-Hikmah University, Ilorin, Nigeria. The platform manages the complete election lifecycle from voter registration to result publication.

## Table of Contents

1. [Features](#features)
2. [User Flows](#user-flows)
3. [Admin Guide](#admin-guide)
4. [Technical Architecture](#technical-architecture)
5. [Database Schema](#database-schema)
6. [Security](#security)
7. [Deployment](#deployment)

---

## Features

### Public Features
- **Homepage**: Election countdown, active stage information, quick access to actions
- **Candidates Page**: View all candidates with their manifestos
- **Electoral Committee**: Meet the organizing team
- **Rules & Constitution**: Election guidelines and COHSSA constitution
- **Results Page**: Live election results with charts
- **Editorial**: Student publications and submissions
- **Student Portal**: Academic resources, marketplace, events

### Voter Features
- **Registration**: Matric verification → Email verification → Biometric setup (optional)
- **Login**: Biometric-first authentication with OTP fallback
- **Voting**: Step-by-step voting for all positions
- **Dashboard**: View voting status and profile

### Aspirant Features
- **Application**: Multi-step wizard for candidate application
- **Dashboard**: Track application status
- **Manifesto Editor**: Rich text manifesto creation

### Admin Features
- **Dashboard**: Overview statistics and charts
- **Student Management**: Import/manage student list
- **Voter Management**: Verify/manage voters
- **Aspirant Review**: Review applications, promote to candidates
- **Candidate Management**: Manage active candidates
- **Position Management**: Create/edit election positions
- **Timeline Management**: Control election stages
- **Live Control**: Monitor voting, pause/resume, publish results
- **Content Management**: Manage organizational info (leaders, executives, etc.)
- **Resource Management**: Academic materials and textbook marketplace
- **Events Management**: Create and publish events
- **Editorial Review**: Approve student publications
- **Activity Dashboard**: Monitor system activity

---

## User Flows

### Voter Registration Flow
```
1. Enter Matric Number → Verified against student list
2. Enter Email Address → OTP sent for verification
3. Biometric Setup (optional) → WebAuthn credential registration
4. OTP Verification → Account creation
5. Admin Verification → Account activated
```

### Voter Login Flow
```
1. Enter Matric Number → Verified against voter records
2. Choose Authentication:
   - Primary: Biometric (WebAuthn)
   - Fallback: Email OTP
3. Successful Auth → Voter Dashboard
```

### Voting Flow
```
1. Login → Voter Dashboard
2. Start Voting → Position 1
3. Select Candidate → Next Position
4. ... repeat for all positions
5. Review Selections → Submit Vote
6. Confirmation → Vote recorded
```

### Aspirant Application Flow
```
1. Login/Register as aspirant
2. Personal Information → Academic Details
3. Choose Position → Leadership History
4. Manifesto Writing → Referee Information
5. Payment Proof Upload → Review & Submit
6. Admin Review → Approval/Rejection
7. Approved → Promoted to Candidate
```

---

## Admin Guide

### Getting Started
1. Navigate to `/admin/login`
2. Login with admin credentials
3. Access admin dashboard

### Managing Election Timeline
1. Go to **Timeline Management**
2. Create stages: Aspirant Application, Voter Registration, Voting, Results
3. Set start/end dates and times
4. Activate stages as needed

### Reviewing Applications
1. Go to **Aspirant Review**
2. Click "Review" on pending applications
3. Verify all submitted information
4. Approve or reject with comments
5. Approved aspirants can be promoted to candidates

### Managing Voting
1. Go to **Live Control**
2. Monitor voter turnout in real-time
3. Use "Pause Voting" for emergencies
4. Publish results when voting ends

---

## Technical Architecture

### Frontend Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **React Router** - Navigation
- **React Query** - Data fetching
- **Recharts** - Charts and graphs

### Backend (Supabase)
- **PostgreSQL** - Database
- **Row Level Security** - Data access control
- **Edge Functions** - Serverless functions
- **Storage** - File uploads
- **Auth** - User authentication

### Key Libraries
- **@simplewebauthn/browser** - Biometric authentication
- **driver.js** - Interactive tours
- **zod** - Schema validation
- **sonner** - Toast notifications
- **date-fns** - Date manipulation

---

## Database Schema

### Core Tables

#### `students`
Master list of eligible students for verification.
- matric_number (unique)
- name, department, level, faculty
- email, phone

#### `voters`
Registered voters.
- user_id (links to auth.users)
- matric_number, name, department, level
- email, phone, verified, has_voted
- webauthn_credential (JSON)

#### `positions`
Election positions.
- title, position_name, description
- eligible_departments, eligible_levels, eligible_gender
- min_cgpa, fee, max_candidates
- is_active, display_order

#### `aspirants`
Candidate applications.
- user_id, matric_number, name
- department, level, cgpa, gender
- position_id, manifesto
- status (pending/approved/rejected)
- application_data (JSON)

#### `candidates`
Approved candidates for voting.
- position_id, application_id
- name, matric, department
- manifesto, photo_url
- is_active

#### `votes`
Cast votes (anonymous).
- voter_id, position_id, aspirant_id
- created_at

#### `election_timeline`
Election stages.
- stage_name, title, description
- start_date/time, end_date/time
- is_active, is_publicly_visible

### Supporting Tables
- `cohssa_executives` - Executive council members
- `cohssa_senate` - Senate council members
- `cohssa_alumni` - Past executives
- `electoral_committee` - Committee members
- `university_leaders` - University leadership
- `college_departments` - Academic departments
- `editorial_content` - Student publications
- `resources` - Academic materials and textbooks
- `events` - Events and webinars
- `user_roles` - Role assignments

---

## Security

### Row Level Security (RLS)
All tables have RLS enabled with policies:
- **Public read**: Limited to approved/published content
- **User access**: Users can only view/edit their own data
- **Admin access**: Full CRUD via `has_role()` function

### Authentication
- **Supabase Auth** - Email-based authentication
- **WebAuthn** - Biometric authentication (optional)
- **OTP Verification** - Email codes via Edge Function

### Role Management
```sql
-- Roles stored separately (not in profiles)
CREATE TYPE app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TABLE user_roles (user_id, role);

-- Function to check roles
CREATE FUNCTION has_role(_user_id uuid, _role app_role)
```

### Vote Integrity
- Votes table has restricted policies
- No UPDATE/DELETE on votes
- Voter can only vote once (has_voted flag)
- Anonymous vote recording

---

## Deployment

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### Build & Deploy
```bash
npm install
npm run build
# Deploy to hosting provider
```

### Lovable Deployment
1. Click "Publish" button
2. Click "Update" to deploy changes
3. Configure custom domain (optional)

---

## Support

For technical support, contact the Electoral Committee via the Support page or email support@iseco.edu.ng.

---

*ISECO - Ensuring Free, Fair, and Transparent Elections*
