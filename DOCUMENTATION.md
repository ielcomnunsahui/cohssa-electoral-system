# COHSSA Elections - ISECO Platform Documentation

## Overview

ISECO (Independent Students Electoral Committee) is a comprehensive digital election platform for the College of Health Sciences Students Association (COHSSA) at Al-Hikmah University, Ilorin, Nigeria. The platform manages the complete election lifecycle from voter registration to result publication.

🌐 **Website**: [cohssahui.org](https://cohssahui.org)  
📧 **Email**: cohssahui.iseco@gmail.com

## Table of Contents

1. [Features](#features)
2. [User Flows](#user-flows)
3. [Admin Guide](#admin-guide)
4. [Technical Architecture](#technical-architecture)
5. [Database Schema](#database-schema)
6. [Security](#security)
7. [Timeline & Countdown](#timeline--countdown)
8. [Deployment](#deployment)

---

## Features

### Public Features
- **Homepage**: Election countdown, active stage information, quick access to actions
- **Candidates Page**: View all candidates with their manifestos
- **Electoral Committee**: Meet the organizing team
- **Rules & Constitution**: Election guidelines and COHSSA constitution
- **Results Page**: Live election results with charts
- **Editorial**: Student publications and submissions
- **Student Portal**: Academic resources, textbook marketplace, events

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
- **Student Management**: Import/manage student list (Matric, Name, Dept, Level)
- **Voter Management**: Verify/manage voters
- **Aspirant Review**: Review applications, promote to candidates
- **Candidate Management**: Manage active candidates
- **Position Management**: Create/edit election positions with eligibility criteria
- **Timeline Management**: Control election stages with countdown display
- **Live Control**: Monitor voting with live vote animations, pause/resume, publish results
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
   - Fallback: Email OTP (rate limited: 5 requests/hour)
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

### Admin Password Recovery Flow
```
1. Navigate to /admin/login
2. Click "Forgot password?"
3. Enter email address
4. Receive reset link via email
5. Click link → Set new password
6. Login with new credentials
```

---

## Admin Guide

### Getting Started
1. Navigate to `/admin/login`
2. Login with admin credentials
3. Access admin dashboard

### Password Recovery
1. Click "Forgot password?" on login page
2. Enter your admin email
3. Check email for reset link
4. Set new password (min 8 chars, uppercase, lowercase, number)

### Managing Election Timeline
1. Go to **Timeline Management**
2. Create stages: Aspirant Application, Voter Registration, Voting, Results
3. Set start/end dates and times
4. Activate stages as needed
5. The homepage countdown automatically displays active/next stage

### Timeline Stage Update
When updating timeline stages:
- **Start Time**: When the stage begins (used for countdown "Begins In")
- **End Time**: When the stage ends (used for countdown "Ends In")
- **Is Active**: Toggle to activate/deactivate the stage
- **Is Publicly Visible**: Toggle to show/hide from public

### Reviewing Applications
1. Go to **Aspirant Review**
2. Click "Review" on pending applications
3. Verify all submitted information
4. Approve or reject with comments
5. Approved aspirants can be promoted to candidates

### Managing Voting
1. Go to **Live Control**
2. Monitor voter turnout in real-time (with live vote animations)
3. View all positions and candidates in tabular format
4. Use "Pause Voting" for emergencies
5. Publish results when voting ends

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
- **React Helmet Async** - SEO management

### Backend (Supabase/Lovable Cloud)
- **PostgreSQL** - Database
- **Row Level Security** - Data access control
- **Edge Functions** - Serverless functions (send-otp, verify-otp, audit-log)
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
- matric_number (unique) - Format: XX/XXaaa000
- name, department, level

#### `voters`
Registered voters.
- user_id (links to auth.users)
- matric_number, name, department, level
- email, verified, has_voted
- webauthn_credential (JSON)

#### `positions`
Election positions with eligibility criteria.
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
Election stages for countdown display.
- stage_name, title, description
- start_time, end_time (timestamps with timezone)
- is_active, is_publicly_visible

#### `rate_limits`
OTP rate limiting.
- identifier, action_type
- attempt_count, locked_until

### Departments
- **NSC** - Nursing Sciences
- **MLS** - Medical Laboratory Sciences
- **PUH** - Community Medicine and Public Health
- **MED** - Medicine and Surgery
- **ANA** - Human Anatomy
- **PHS** - Human Physiology
- **BCH** - Medical Biochemistry

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
- **Password Recovery** - Secure email reset flow

### Rate Limiting
- **OTP Requests**: Max 5 per hour per email
- **OTP Verification**: Max 5 failed attempts, 15-minute lockout
- Implemented in Edge Functions

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

## Timeline & Countdown

### How Countdown Works
The homepage displays a countdown based on election timeline:

1. **Active Stage**: If a stage is currently active, shows "Stage Name Ends In" with countdown to end_time
2. **Next Stage**: If no active stage, shows "Stage Name Begins In" with countdown to start_time
3. **No Stage**: If no upcoming stages, countdown is hidden

### Setting Up Timeline
1. Go to Admin → Timeline Management
2. Create stages with:
   - **Stage Name**: e.g., "Voter Registration", "Voting"
   - **Start Time**: When stage begins
   - **End Time**: When stage ends
   - **Is Active**: Check to activate
   - **Is Publicly Visible**: Check to show on homepage

---

## Deployment

### Build & Deploy
```bash
npm install
npm run build
# Deploy to hosting provider
```

### Lovable Deployment
1. Click "Publish" button
2. Click "Update" to deploy frontend changes
3. Backend (Edge Functions, DB) deploys automatically
4. Configure custom domain: cohssahui.org

---

## Support

For technical support, contact the Electoral Committee:
- **Email**: cohssahui.iseco@gmail.com
- **Website**: [cohssahui.org](https://cohssahui.org)
- Visit the Support page in the application

---

*ISECO - Ensuring Free, Fair, and Transparent Elections*
