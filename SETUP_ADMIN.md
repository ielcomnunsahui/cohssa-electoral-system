# Admin Setup Guide

## Creating an Admin Account

The admin system now uses **secure Supabase authentication** with role-based access control. Follow these steps to create an admin account:

### Method 1: Using Supabase Dashboard (Recommended)

1. **Go to Cloud tab** → Database → SQL Editor
2. **Run this SQL script** (replace with your email and password):

```sql
-- 1. Create admin user in auth.users
-- Note: You'll need to sign up first through the admin login page, then run this:

-- 2. Add admin role to existing user
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@example.com'),
  'admin'
);
```

### Method 2: Sign Up + Manual Role Assignment

1. **Go to** `/admin/login`
2. **Enter your email and password**
3. **Go to Supabase Dashboard** → Database → Table Editor → user_roles
4. **Click "Insert Row"**:
   - user_id: Select your user ID from auth.users
   - role: `admin`
   - Click Save

### Method 3: Using Edge Function (Advanced)

Create an edge function to handle admin registration with proper security checks.

## Security Features

✅ **Role-Based Access Control**: Uses `user_roles` table
✅ **Server-Side Validation**: Checks admin role on every request  
✅ **Session Management**: Uses Supabase auth tokens (not sessionStorage)
✅ **Protected Routes**: All admin pages require authentication

## Testing the Admin System

1. Create an admin user using Method 1 or 2
2. Go to `/admin/login`
3. Enter your credentials
4. You should be redirected to `/admin/dashboard`

## Troubleshooting

**"Access denied. Admin privileges required."**
- Your user doesn't have the admin role in user_roles table
- Verify the role was added correctly in the database

**Redirected to login page immediately**
- Your session expired
- Check browser console for errors
- Verify Supabase connection is working
