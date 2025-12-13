# ISECO Electoral System - User Flows Documentation

## Overview

This document outlines the complete user flows for all three user types in the ISECO Electoral System.

---

## 🗳️ VOTER FLOW

### Registration Process

1. **Navigate to** `/voter/register`
2. **Choose authentication method**:
   - **Biometric (WebAuthn)**: Fingerprint/Face ID
   - **Email OTP**: One-time password via email
3. **Enter details**:
   - Matric number (must exist in student_list table)
   - Email address
4. **System validates** matric number against student list
5. **Account created** with `verified: false` status
6. **Wait for admin verification**

### Login Process

1. **Navigate to** `/voter/login`
2. **Choose authentication method**:
   - **Biometric**: Enter matric → authenticate with device biometric
   - **Email OTP**: Enter email → receive OTP → verify code
3. **System checks**:
   - Account exists
   - Account is verified by admin
   - User has not already voted
4. **Redirect to** `/voter/dashboard`

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
- ✅ Anonymous voting (uses issuance_token)
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
- Matric number
- Department
- Level
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
1. `submitted` → Application received, awaiting payment verification
2. `payment_verified` → Payment confirmed by admin
3. `under_review` → Application being reviewed by admin
4. `screening_scheduled` → Screening interview scheduled
5. `screening_completed` → Interview done, awaiting decision
6. `qualified` → Passed screening
7. `disqualified` → Did not pass screening
8. `candidate` → Promoted to official candidate

**Dashboard Features**:
- ✅ Visual progress timeline
- ✅ Application details summary
- ✅ Admin notes display
- ✅ Screening date notification
- ✅ Payment verification status

---

## 👨‍💼 ADMIN FLOW

### Login Process (SECURE)

1. **Navigate to** `/admin/login`
2. **Enter credentials**:
   - Email address (must have admin role in user_roles table)
   - Password
3. **System validates**:
   - User exists in Supabase auth
   - User has 'admin' role in user_roles table
4. **Redirect to** `/admin/dashboard`

**Security Features**:
- ✅ Role-based access control using user_roles table
- ✅ Server-side role validation
- ✅ Automatic logout if role removed
- ✅ Protected routes for all admin pages

### Admin Dashboard Overview

**Statistics Displayed**:
- Total students in system
- Registered voters count
- Submitted applications count
- Active candidates count
- Voter turnout percentage

**Management Sections**:

#### 1. Student List (`/admin/students`)
- View all students in student_list table
- Used for voter registration verification
- Import/export student data

#### 2. Aspirant Review (`/admin/aspirants`)
- View all aspirant applications
- Filter by status
- Review application details
- Update application status
- Verify payment proofs
- Schedule screening interviews
- Add admin notes
- Promote to candidate

#### 3. Candidate Management (`/admin/candidates`)
- View all official candidates
- Edit candidate information
- Upload/update manifestos
- Manage candidate photos
- Assign candidates to positions

#### 4. Position Management (`/admin/positions`)
- Create new positions
- Set eligibility criteria (level, CGPA)
- Set application fees
- Configure display order
- Activate/deactivate positions

#### 5. Election Timeline (`/admin/timeline`)
- Set registration start/end dates
- Set application period
- Configure screening dates
- Set voting start/end times
- Manage election phases

#### 6. Live Control (`/admin/live-control`)
- Monitor real-time voting statistics
- View voter turnout by position
- Generate election reports
- Export voting data
- Control voting status (open/close)

---

## 🔐 Security Implementation

### Authentication Methods

**Voters**:
- WebAuthn (Biometric)
- Email OTP
- Admin verification required

**Aspirants**:
- Email/Password (Supabase Auth)
- No role restriction

**Admins**:
- Email/Password (Supabase Auth)
- Must have 'admin' role in user_roles table
- Role checked on every route access

### Data Security

- ✅ Row Level Security (RLS) policies on all tables
- ✅ User roles stored in separate table (not on user profile)
- ✅ Anonymous voting using issuance tokens
- ✅ No voter identity linked to votes
- ✅ Protected routes with role validation
- ✅ Server-side authentication checks

---

## 🐛 Known Issues & Limitations

### Current Limitations

1. **No password reset flow** - Users cannot reset forgotten passwords
2. **No email notifications** - No automated emails for status updates
3. **Limited file validation** - Uploaded files not thoroughly validated
4. **No bulk operations** - Admins cannot perform bulk actions
5. **Missing audit logs** - No tracking of admin actions

### Future Enhancements

- [ ] Add password reset functionality
- [ ] Implement email notification system
- [ ] Add file type and size validation
- [ ] Create bulk action tools for admins
- [ ] Add comprehensive audit logging
- [ ] Implement candidate manifesto page
- [ ] Add live results page for public viewing
- [ ] Create voting analytics dashboard

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
- [ ] Register with biometric authentication
- [ ] Register with OTP authentication
- [ ] Login before admin verification (should fail)
- [ ] Login after admin verification
- [ ] Cast vote for all positions
- [ ] Attempt to vote twice (should fail)

### Aspirant Flow
- [ ] Register new aspirant account
- [ ] Complete full application wizard
- [ ] Upload all required files
- [ ] Submit application
- [ ] View application status on dashboard
- [ ] Check status updates after admin actions

### Admin Flow
- [ ] Login with admin credentials
- [ ] View dashboard statistics
- [ ] Review aspirant application
- [ ] Verify payment
- [ ] Schedule screening
- [ ] Promote aspirant to candidate
- [ ] Manage positions
- [ ] Control election timeline
- [ ] Monitor live voting
- [ ] Logout securely

---

## 🆘 Troubleshooting Guide

### Voter Issues

**"Matric number not found"**
- Student not in student_list table
- Contact admin to add student

**"Account not verified"**
- Waiting for admin approval
- Check with admin office

**"Already voted"**
- Vote already cast
- Cannot vote again (by design)

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

**"Cannot see statistics"**
- Check database connection
- Verify RLS policies
- Check browser console for errors

---

## 📞 Support

For technical issues or questions:
1. Check this documentation
2. Review SETUP_ADMIN.md for admin setup
3. Check browser console for errors
4. Verify database connection in Cloud tab
