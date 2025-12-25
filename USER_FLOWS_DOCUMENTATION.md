# COHSSA ISECO Electoral System - User Flows Documentation

## Overview

This document outlines the complete user flows for all user types in the ISECO Electoral System.

🌐 **Website**: [cohssahui.org](https://cohssahui.org)  
📧 **Email**: cohssahui.iseco@gmail.com

---

## 🗳️ VOTER FLOW

### Registration Process

1. **Navigate to** `/voter/register`
2. **Enter details**:
   - Matric number (must exist in students table)
   - Email address
3. **System validates** matric number against student list
4. **OTP sent** to email for verification
5. **Biometric Setup** (optional): Register fingerprint/Face ID
6. **Account created** with `verified: false` status
7. **Wait for admin verification**

### Login Process

1. **Navigate to** `/voter/login`
2. **Enter matric number**
3. **Choose authentication method**:
   - **Biometric**: Authenticate with device biometric
   - **Email OTP**: Receive OTP → verify code
4. **Rate limiting**: Max 5 OTP requests/hour, lockout after 5 failed attempts
5. **System checks**:
   - Account exists
   - Account is verified by admin
   - User has not already voted
6. **Redirect to** `/voter/dashboard`

### Voting Process

1. **View voter information** on dashboard
2. **Click "Start Voting"**
3. **For each position**:
   - View candidates with photos, department, and manifesto
   - Select one candidate
   - Click "Next" to proceed
4. **Review all selections** on final position
5. **Click "Submit Vote"**
6. **Confirmation** → votes recorded → voter marked as voted
7. **Redirect to home** page

**Key Features**:
- ✅ Cannot vote twice (enforced by database)
- ✅ Must select candidate for each position
- ✅ Anonymous voting
- ✅ Real-time validation

---

## 📋 ASPIRANT FLOW

### Registration & Login

1. **Navigate to** `/aspirant/login`
2. **Choose tab**:
   - **Login**: Enter email and password
   - **Register**: Create new account with email and password
3. **System creates** Supabase auth user
4. **Redirect to** `/aspirant/dashboard`

### Application Process

1. **From dashboard**, click "Start New Application"
2. **Navigate to** `/aspirant/apply` (multi-step wizard)

#### Step 1: Personal Information
- Full name
- Matric number (Format: XX/XXaaa000)
- Department (NSC, MLS, PUH, MED, ANA, PHS, BCH)
- Level (100L - 500L)
- Date of birth
- Gender
- Phone number
- Upload passport photo

#### Step 2: Position Selection
- Choose position from available list
- View position requirements and fee
- Enter "Why Running" statement (motivation)

#### Step 3: Academic Information
- Enter CGPA
- Upload academic transcript

#### Step 4: Leadership Experience
- Describe previous leadership roles
- Upload supporting documents

#### Step 5: Referee Information
- Add 2-3 referees
- Each referee needs: name, email, phone, organization, relationship

#### Step 6: Payment
- View position fee
- Upload payment proof screenshot

#### Step 7: Review & Submit
- Review all entered information
- Accept declaration and terms
- Click "Submit Application"

### Application Tracking

**Status Flow**:
1. `pending` → Application received, awaiting review
2. `under_review` → Application being reviewed by admin
3. `approved` → Application approved
4. `rejected` → Application rejected
5. Approved → Promoted to official candidate

**Dashboard Features**:
- ✅ Visual progress timeline
- ✅ Application details summary
- ✅ Admin notes display
- ✅ Payment verification status

---

## 👨‍💼 ADMIN FLOW

### Login Process

1. **Navigate to** `/admin/login`
2. **Enter credentials**:
   - Email address (must have admin role in user_roles table)
   - Password
3. **System validates**:
   - User exists in Supabase auth
   - User has 'admin' role in user_roles table
4. **Redirect to** `/admin/dashboard`

### Password Recovery

1. **Click "Forgot password?"** on login page
2. **Enter email address**
3. **Receive reset link** via email
4. **Click link** → Redirected to `/admin/reset-password`
5. **Set new password** (requirements: 8+ chars, uppercase, lowercase, number)
6. **Login with new credentials**

**Security Features**:
- ✅ Role-based access control using user_roles table
- ✅ Server-side role validation
- ✅ Zod schema validation
- ✅ Protected routes for all admin pages
- ✅ Password recovery via secure email

### Admin Dashboard Overview

**Statistics Displayed**:
- Total students in system
- Registered voters count
- Submitted applications count
- Active candidates count
- Voter turnout percentage

**Management Sections**:

#### 1. Student List (`/admin/students`)
- View all students in students table
- Add students: Matric Number, Name, Department, Level
- Import via CSV template
- Used for voter registration verification

#### 2. Voter Management (`/admin/voters`)
- View all registered voters
- Verify/unverify voters
- Check voting status

#### 3. Aspirant Review (`/admin/aspirants`)
- View all aspirant applications
- Filter by status
- Review application details
- Update application status
- Verify payment proofs
- Add admin notes
- Promote to candidate

#### 4. Candidate Management (`/admin/candidates`)
- View all official candidates
- Edit candidate information
- Upload/update manifestos
- Manage candidate photos
- Assign candidates to positions

#### 5. Position Management (`/admin/positions`)
- Create new positions
- Set eligibility criteria (department, level, gender, CGPA)
- Set application fees
- Configure display order
- Activate/deactivate positions

#### 6. Election Timeline (`/admin/timeline`)
- Set stage start/end times
- Configure stage visibility
- Activate stages for countdown display
- Manage election phases

#### 7. Live Control (`/admin/live-control`)
- Monitor real-time voting statistics
- View all positions and candidates in tabular format (side-by-side)
- Live vote count animations when new votes come in
- Voter turnout by position
- Control voting status (open/close)
- Publish results

#### 8. Content Management (`/admin/content`)
- Manage COHSSA executives
- Manage university leaders
- Manage electoral committee
- Manage college departments

#### 9. Resource Management (`/admin/resources`)
- Academic materials upload
- Textbook marketplace management
- Approve/reject listings

#### 10. Events Management (`/admin/events`)
- Create events and webinars
- Set dates and locations
- Publish/unpublish events

#### 11. Editorial Review (`/admin/editorial`)
- Review student submissions
- Approve/reject articles
- Manage publications

---

## 🔐 Security Implementation

### Authentication Methods

**Voters**:
- WebAuthn (Biometric)
- Email OTP with rate limiting
- Admin verification required

**Aspirants**:
- Email/Password (Supabase Auth)
- No role restriction

**Admins**:
- Email/Password (Supabase Auth)
- Must have 'admin' role in user_roles table
- Role checked on every route access
- Password recovery available

### Rate Limiting

**OTP Sending**:
- Maximum 5 requests per hour per email
- 15-minute lockout when exceeded

**OTP Verification**:
- Maximum 5 failed attempts
- 15-minute account lockout after failures
- Attempts cleared on successful verification

### Data Security

- ✅ Row Level Security (RLS) policies on all tables
- ✅ User roles stored in separate table (not on user profile)
- ✅ Anonymous voting
- ✅ No voter identity linked to votes
- ✅ Protected routes with role validation
- ✅ Server-side authentication checks
- ✅ Secure views with security_invoker

---

## ✅ Implemented Features

- [x] Password reset functionality for admins
- [x] Rate limiting on OTP functions
- [x] Live vote count animations
- [x] Textbook condition badges (Excellent, Good, Fair)
- [x] Image upload for textbook listings
- [x] Side-by-side tabular results in Live Control
- [x] Comprehensive audit logging
- [x] SEO optimization for all pages

---

## 📱 Responsive Design

All pages are fully responsive and work on:
- ✅ Desktop (1920px+)
- ✅ Laptop (1366px - 1920px)
- ✅ Tablet (768px - 1366px)
- ✅ Mobile (320px - 768px)

---

## 🧪 Testing Checklist

### Voter Flow
- [ ] Register with OTP authentication
- [ ] Login before admin verification (should fail)
- [ ] Login after admin verification
- [ ] Cast vote for all positions
- [ ] Attempt to vote twice (should fail)
- [ ] Test rate limiting on OTP requests

### Aspirant Flow
- [ ] Register new aspirant account
- [ ] Complete full application wizard
- [ ] Upload all required files
- [ ] Submit application
- [ ] View application status on dashboard
- [ ] Check status updates after admin actions

### Admin Flow
- [ ] Login with admin credentials
- [ ] Test password recovery flow
- [ ] View dashboard statistics
- [ ] Add students (Matric, Name, Dept, Level)
- [ ] Review aspirant application
- [ ] Promote aspirant to candidate
- [ ] Manage positions with eligibility
- [ ] Control election timeline
- [ ] Monitor live voting with animations
- [ ] Logout securely

---

## 🆘 Troubleshooting Guide

### Voter Issues

**"Matric number not found"**
- Student not in students table
- Contact admin to add student

**"Account not verified"**
- Waiting for admin approval
- Check with electoral committee

**"Already voted"**
- Vote already cast
- Cannot vote again (by design)

**"Too many OTP requests"**
- Rate limit exceeded
- Wait 15 minutes or 1 hour

### Aspirant Issues

**"Cannot submit application"**
- Check all required fields filled
- Verify declaration is accepted
- Check file uploads completed

**"Application not showing in dashboard"**
- Refresh page
- Check you're logged in
- Verify submission was successful

### Admin Issues

**"Access denied"**
- User doesn't have admin role
- Check user_roles table
- See SETUP_ADMIN.md for setup

**"Forgot password"**
- Use "Forgot password?" link
- Check email for reset link
- Link expires after use

**"Cannot see statistics"**
- Check database connection
- Verify RLS policies
- Check browser console for errors

---

## 📞 Support

For technical issues or questions:
- **Email**: cohssahui.iseco@gmail.com
- **Website**: [cohssahui.org](https://cohssahui.org)
- Check this documentation
- Review SETUP_ADMIN.md for admin setup
- Check browser console for errors
- Verify database connection in Cloud tab
