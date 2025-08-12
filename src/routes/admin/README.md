# Admin Panel Documentation

This document explains the simplified authentication system and admin panel setup for Picasso Hair Salon.

## Overview

The admin panel provides a secure interface for managing salon operations including appointments, services, stylists, and gallery images. Access is controlled through a simplified email-based admin system.

## Authentication Architecture

### Simplified Google-Only OAuth

- **Public Browsing**: All pages are publicly accessible without authentication
- **Action-Based Authentication**: Login required only when users take actions (booking, profile updates, etc.)
- **Admin Privileges**: Specific emails get administrative access to management functions
- **Single Provider**: Google OAuth only - no email/password authentication

### Admin Access Control

Admin access is determined by email addresses configured in the system. Admin users have full CRUD access to all salon data through both the UI and database-level Row Level Security (RLS) policies.

## Adding Admin Emails

### Method 1: Environment Variable (Recommended)

1. **Add to environment configuration** (`.env.local` or deployment environment):

   ```env
   ADMIN_EMAILS=admin@picassosalon.com,owner@picassosalon.com,manager@picassosalon.com
   ```

2. **Multiple emails**: Separate with commas, spaces are automatically trimmed
3. **Case insensitive**: Emails are automatically converted to lowercase for comparison

### Method 2: Code Configuration (Fallback)

If no environment variable is set, the system uses default emails defined in `src/lib/config/admin.ts`:

```typescript
const DEFAULT_ADMIN_EMAILS = ['admin@picassosalon.com', 'owner@picassosalon.com'];
```

To modify defaults:

1. Open `src/lib/config/admin.ts`
2. Update the `DEFAULT_ADMIN_EMAILS` array
3. Redeploy the application

## Implementation Details

### Database Level Security (RLS Policies)

Admin access is enforced at the database level through Row Level Security policies that check the user's email from their JWT token:

```sql
-- Example: Admin full access to services
CREATE POLICY "Admin full access to services" ON services
  FOR ALL TO authenticated
  USING (
    (auth.jwt() ->> 'email') = ANY(ARRAY['admin@picassosalon.com', 'owner@picassosalon.com'])
  );
```

**Tables with admin policies:**

- `users` - User management
- `services` - Service catalog management
- `stylists` - Staff management
- `appointments` - Booking management
- `reviews` - Review moderation
- `gallery_images` - Portfolio management

### Application Level Security

**Server-side protection** (`src/routes/admin/+layout.server.ts`):

```typescript
export const load: LayoutServerLoad = async ({ locals }) => {
	// Require admin access for all admin routes
	if (!locals.adminStatus.isAdmin) {
		error(403, 'Admin access required');
	}
	// ...
};
```

**Admin status checking** (`src/lib/config/admin.ts`):

```typescript
export function isAdmin(email: string | null | undefined): boolean {
	if (!email) return false;
	return ADMIN_EMAILS.includes(email.toLowerCase());
}
```

### Authentication Flow

1. **User visits admin route** (`/admin/*`)
2. **Server checks admin status** in `+layout.server.ts`
3. **If not admin**: Returns 403 Forbidden error
4. **If admin**: Loads admin interface with full permissions
5. **Database queries**: Automatically filtered by RLS policies

## Admin Panel Features

### Dashboard (`/admin`)

- Overview statistics
- Recent appointments
- Quick action links
- System status indicators

### Appointments Management (`/admin/appointments`)

- View all customer appointments
- Update appointment status (pending → confirmed → completed)
- Customer information and service details
- Filter and search capabilities

### Services Management (`/admin/services`)

- Create, edit, and delete services
- Set pricing and duration
- Manage service categories
- Toggle active/inactive status

### Stylists Management (`/admin/stylists`)

- Add and manage staff members
- Set specialties and bio information
- Configure working schedules
- Upload stylist photos

### Gallery Management (`/admin/gallery`)

- Upload and organize portfolio images
- Set featured images for homepage
- Categorize work by service type
- Associate images with specific stylists

## File Structure

```
src/routes/admin/
├── README.md                 # This documentation
├── +layout.server.ts         # Admin access control
├── +layout.svelte           # Admin navigation and layout
├── +page.svelte             # Dashboard
├── appointments/
│   ├── +page.server.ts      # Appointment data loading
│   └── +page.svelte         # Appointment management UI
├── services/
│   ├── +page.server.ts      # Service data loading
│   └── +page.svelte         # Service management UI
├── stylists/
│   ├── +page.server.ts      # Stylist data loading
│   └── +page.svelte         # Stylist management UI
└── gallery/
    ├── +page.server.ts      # Gallery data loading
    └── +page.svelte         # Gallery management UI
```

## Security Features

### Row Level Security (RLS)

- **Database-level enforcement**: Cannot be bypassed through API
- **Email-based policies**: Uses JWT email claim for authorization
- **Automatic application**: No manual permission checks needed in application code

### Server-side Validation

- **Route protection**: Admin routes blocked at server level
- **Type safety**: Admin status included in TypeScript types
- **Error handling**: Proper 403 responses for unauthorized access

### Authentication Requirements

- **Google OAuth required**: Must have valid Google account
- **Email verification**: Email must match configured admin list
- **Session validation**: Active authentication session required

## Troubleshooting

### "Admin access required" Error

1. **Check email configuration**: Verify `ADMIN_EMAILS` environment variable
2. **Verify Google account email**: Ensure using correct Google account
3. **Case sensitivity**: All emails are compared in lowercase
4. **Whitespace**: Ensure no extra spaces in email configuration

### Cannot Access Admin Panel

1. **Authentication required**: Must be signed in with Google
2. **Admin email verification**: Email must be in admin list
3. **Session validity**: Try signing out and back in
4. **Environment variables**: Check deployment environment configuration

### Database Permission Errors

1. **RLS policies**: Ensure admin policies are applied to all tables
2. **Email format**: Verify JWT email claim format matches policies
3. **Database connection**: Check Supabase configuration

## Configuration Reference

### Environment Variables

```env
# Required: Supabase configuration
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Required: Admin emails (comma-separated)
ADMIN_EMAILS=admin@example.com,owner@example.com,manager@example.com
```

### Admin Status Object

```typescript
interface AdminStatus {
	isAdmin: boolean;
	email: string | null;
	canManageServices: boolean;
	canManageStylists: boolean;
	canManageAppointments: boolean;
	canManageGallery: boolean;
	canViewAllUsers: boolean;
}
```

## Development Notes

### Adding New Admin Features

1. **Create new route**: Add to `/admin/` directory
2. **Server protection**: Include admin check in `+layout.server.ts` (inherited)
3. **Database policies**: Add RLS policies for new tables if needed
4. **Navigation**: Update admin navigation in `+layout.svelte`

### Testing Admin Access

1. **Use admin email**: Sign in with an email from `ADMIN_EMAILS`
2. **Test unauthorized access**: Try with non-admin email (should see 403)
3. **Database operations**: Verify CRUD operations work correctly
4. **RLS verification**: Check that non-admin users cannot access admin data

### Deployment Checklist

- [ ] Set `ADMIN_EMAILS` environment variable
- [ ] Apply database schema with RLS policies
- [ ] Configure Google OAuth in Supabase
- [ ] Test admin access with configured emails
- [ ] Verify non-admin users cannot access admin features

This simplified system provides robust admin capabilities while maintaining security and ease of use.
