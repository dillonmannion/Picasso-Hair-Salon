# Discovery Questions for Security Enhancements

Please answer the following questions to help us understand your requirements for implementing security enhancements:

## 1. Will this feature have a user-facing interface?
*For example, will there be login screens, security settings pages, two-factor authentication interfaces, or security status indicators?*

**Answer: yes**

## 2. Does this feature need to store new data or modify existing data structures?
*For example, will you need to store authentication tokens, user sessions, security logs, permissions, or modify existing user data structures?*

**Answer: no** - All authorization will occur via Supabase and its auth, therefore the only on website auth changes that can occur is the removal of a users account within the system, no salon side user data should be stored other than the information Google can provide.

## 3. Will this feature integrate with any third-party APIs or services?
*For example, OAuth providers (Google, Facebook), email services for verification, SMS services for 2FA, or security monitoring services?*

**Answer: yes** - Google OAuth shall be the primary login auth provider for all users, only when truly needed will users login with other oauth providers, security monitoring can exist

## 4. Does this feature involve user authentication or authorization?
*This seems likely given it's a security enhancement - please provide details about authentication methods, role-based access control, session management, etc.*

**Answer: yes** - User roles for customer, staff, and owner should exist. The permissions for user will be the ability to interact with the functional flow of appointment booking and shampoo/hair product purchasing, and of course basic viewing of the website. Staff should be able to update their available times, submit vacation dates, change hair credentials, what their skills are, etc. Owners should be able to have near dev control over the entire process, adding hair stylists, hair cut options, discounts, etc.

## 5. Are there specific performance or scalability requirements?
*For example, should authentication be fast, should the system handle concurrent logins, are there rate limiting requirements?*

**Answer: yes** - Rate limiting should exist, the expected number of concurrent users may be up to 25 at one time. Authentication speeds should be speedy but I believe most of the speed will be limited by Supabase (unless there is known ways to speed up local auth post Supabase login), peak usage times do not matter.

## 6. Will this feature use any external libraries or frameworks that require documentation lookup?
*For example, authentication libraries (Lucia, SvelteKit Auth), validation libraries (Zod), encryption libraries, or security-specific packages?*

**Answer: yes** - Middleware should occur via SvelteKit via load time route protections, unless there are known best practices for middleware, the website should simply be secure from outside attacks and be fast for its verified users. The requirements state all known libraries (Zod for validation, Supabase for auth, etc.)