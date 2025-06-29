# Supabase Documentation

## Overview

**Supabase** is an open-source Firebase alternative that provides a complete backend as a service. It offers:

- **PostgreSQL Database**: Full Postgres database with no restrictions
- **Authentication**: User management with various providers
- **Real-time Subscriptions**: Listen to database changes
- **Storage**: Store and serve files
- **Edge Functions**: Run server-side TypeScript/JavaScript
- **Vector Embeddings**: AI/ML support with pgvector

**Current version in project**: @supabase/supabase-js 2.50.0, @supabase/ssr 0.6.1

## Why Use Supabase?

- **Open Source**: Built on open-source technologies
- **PostgreSQL**: Full power of Postgres with extensions
- **Real-time**: Built-in websocket support
- **Row Level Security**: Fine-grained access control
- **Auto-generated APIs**: Instant REST and GraphQL APIs
- **Type Safety**: Auto-generated TypeScript types
- **Scalable**: Handles everything from prototypes to production

## Installation & Setup

### 1. Install Dependencies

```bash
# Core Supabase client
npm install @supabase/supabase-js

# For SSR frameworks (SvelteKit, Next.js, etc.)
npm install @supabase/ssr

# For auth UI components
npm install @supabase/auth-ui-react @supabase/auth-ui-shared
```

### 2. Initialize Client

```javascript
// For client-side usage
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 3. SSR Setup (SvelteKit Example)

```javascript
// src/hooks.server.js
import { createServerClient } from '@supabase/ssr';

export const handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(
		process.env.PUBLIC_SUPABASE_URL,
		process.env.PUBLIC_SUPABASE_ANON_KEY,
		{
			cookies: {
				getAll() {
					return event.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) =>
						event.cookies.set(name, value, options)
					);
				}
			}
		}
	);

	event.locals.safeGetSession = async () => {
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			return { session: null, user: null };
		}

		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		return { session, user };
	};

	return resolve(event);
};
```

## Core Concepts

### 1. Database Queries

#### Basic Queries

```javascript
// Select data
const { data, error } = await supabase.from('users').select('*');

// Select specific columns
const { data, error } = await supabase.from('users').select('id, name, email');

// Filter data
const { data, error } = await supabase
	.from('posts')
	.select('*')
	.eq('published', true)
	.order('created_at', { ascending: false })
	.limit(10);
```

#### Joins and Relationships

```javascript
// One-to-many relationship
const { data, error } = await supabase.from('users').select(`
    id,
    name,
    posts (
      id,
      title,
      content
    )
  `);

// Many-to-many relationship
const { data, error } = await supabase.from('posts').select(`
    id,
    title,
    tags (
      id,
      name
    )
  `);
```

#### Insert, Update, Delete

```javascript
// Insert
const { data, error } = await supabase
	.from('posts')
	.insert([{ title: 'Hello World', content: 'My first post' }])
	.select();

// Update
const { data, error } = await supabase
	.from('posts')
	.update({ published: true })
	.eq('id', 1)
	.select();

// Delete
const { error } = await supabase.from('posts').delete().eq('id', 1);

// Upsert
const { data, error } = await supabase
	.from('users')
	.upsert({
		id: 1,
		name: 'Updated Name'
	})
	.select();
```

### 2. Authentication

#### Sign Up / Sign In

```javascript
// Sign up with email
const { data, error } = await supabase.auth.signUp({
	email: 'user@example.com',
	password: 'password123',
	options: {
		data: {
			full_name: 'John Doe'
		}
	}
});

// Sign in with email
const { data, error } = await supabase.auth.signInWithPassword({
	email: 'user@example.com',
	password: 'password123'
});

// Sign in with OAuth
const { data, error } = await supabase.auth.signInWithOAuth({
	provider: 'google',
	options: {
		redirectTo: 'http://localhost:3000/auth/callback'
	}
});
```

#### Session Management

```javascript
// Get current user
const {
	data: { user }
} = await supabase.auth.getUser();

// Get session
const {
	data: { session }
} = await supabase.auth.getSession();

// Listen to auth changes
const {
	data: { subscription }
} = supabase.auth.onAuthStateChange((event, session) => {
	console.log(event, session);

	if (event === 'SIGNED_IN') {
		console.log('User signed in:', session.user);
	}

	if (event === 'SIGNED_OUT') {
		console.log('User signed out');
	}
});

// Sign out
const { error } = await supabase.auth.signOut();
```

#### Password Recovery

```javascript
// Send password reset email
const { data, error } = await supabase.auth.resetPasswordForEmail('user@example.com', {
	redirectTo: 'http://localhost:3000/update-password'
});

// Update password
const { data, error } = await supabase.auth.updateUser({
	password: 'new-password'
});
```

### 3. Real-time Subscriptions

#### Database Changes

```javascript
// Subscribe to INSERT events
const channel = supabase
	.channel('public:posts')
	.on(
		'postgres_changes',
		{
			event: 'INSERT',
			schema: 'public',
			table: 'posts'
		},
		(payload) => {
			console.log('New post:', payload.new);
		}
	)
	.subscribe();

// Subscribe to UPDATE events with filter
const channel = supabase
	.channel('public:posts:user_id=eq.1')
	.on(
		'postgres_changes',
		{
			event: 'UPDATE',
			schema: 'public',
			table: 'posts',
			filter: 'user_id=eq.1'
		},
		(payload) => {
			console.log('Updated post:', payload.new);
			console.log('Previous:', payload.old);
		}
	)
	.subscribe();

// Subscribe to all changes
const channel = supabase
	.channel('public:posts')
	.on(
		'postgres_changes',
		{
			event: '*',
			schema: 'public',
			table: 'posts'
		},
		(payload) => {
			console.log('Change:', payload);
		}
	)
	.subscribe();

// Unsubscribe
channel.unsubscribe();
```

#### Broadcast

```javascript
// Send broadcast message
const channel = supabase.channel('room-1');

channel.subscribe((status) => {
	if (status === 'SUBSCRIBED') {
		channel.send({
			type: 'broadcast',
			event: 'message',
			payload: { text: 'Hello World' }
		});
	}
});

// Listen to broadcast messages
channel.on('broadcast', { event: 'message' }, (payload) => {
	console.log('Received:', payload);
});
```

#### Presence

```javascript
// Track presence
const channel = supabase.channel('room-1');

channel
	.on('presence', { event: 'sync' }, () => {
		const state = channel.presenceState();
		console.log('Online users:', state);
	})
	.on('presence', { event: 'join' }, ({ key, newPresences }) => {
		console.log('User joined:', key, newPresences);
	})
	.on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
		console.log('User left:', key, leftPresences);
	})
	.subscribe(async (status) => {
		if (status === 'SUBSCRIBED') {
			await channel.track({
				user_id: user.id,
				online_at: new Date().toISOString()
			});
		}
	});
```

### 4. Storage

#### Upload Files

```javascript
// Upload file
const { data, error } = await supabase.storage.from('avatars').upload('public/avatar1.png', file, {
	cacheControl: '3600',
	upsert: false
});

// Upload with progress tracking
const { data, error } = await supabase.storage.from('avatars').upload('public/avatar1.png', file, {
	onProgress: (progress) => {
		console.log('Upload progress:', progress);
	}
});
```

#### Download Files

```javascript
// Get public URL
const { data } = supabase.storage.from('avatars').getPublicUrl('public/avatar1.png');

// Download file
const { data, error } = await supabase.storage.from('avatars').download('public/avatar1.png');

// Create signed URL
const { data, error } = await supabase.storage
	.from('avatars')
	.createSignedUrl('private/avatar1.png', 60); // 60 seconds
```

#### Manage Files

```javascript
// List files
const { data, error } = await supabase.storage.from('avatars').list('public', {
	limit: 100,
	offset: 0,
	sortBy: { column: 'name', order: 'asc' }
});

// Move file
const { data, error } = await supabase.storage
	.from('avatars')
	.move('public/avatar1.png', 'private/avatar1.png');

// Delete files
const { data, error } = await supabase.storage.from('avatars').remove(['public/avatar1.png']);
```

## Advanced Features

### Row Level Security (RLS)

```sql
-- Enable RLS on a table
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own posts
CREATE POLICY "Users can view own posts" ON posts
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own posts
CREATE POLICY "Users can insert own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own posts
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Public read access
CREATE POLICY "Public posts are viewable by everyone" ON posts
  FOR SELECT USING (published = true);
```

### Edge Functions

```typescript
// supabase/functions/hello-world/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
	try {
		const supabase = createClient(
			Deno.env.get('SUPABASE_URL') ?? '',
			Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
		);

		const { data, error } = await supabase.from('users').select('*');

		return new Response(JSON.stringify({ data }), {
			headers: { 'Content-Type': 'application/json' }
		});
	} catch (error) {
		return new Response(JSON.stringify({ error: error.message }), {
			status: 500,
			headers: { 'Content-Type': 'application/json' }
		});
	}
});
```

### Database Functions

```sql
-- Create a function
CREATE OR REPLACE FUNCTION get_user_posts(user_id UUID)
RETURNS TABLE (
  id UUID,
  title TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.title, p.created_at
  FROM posts p
  WHERE p.user_id = $1
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Call from JavaScript
const { data, error } = await supabase
  .rpc('get_user_posts', { user_id: userId })
```

## Best Practices

### 1. Security

- Always use Row Level Security (RLS)
- Never expose service role key on client
- Validate data on the server side
- Use proper authentication checks

### 2. Performance

- Use indexes for frequently queried columns
- Limit query results with `.limit()`
- Use `.select()` to specify only needed columns
- Consider using database views for complex queries

### 3. Error Handling

```javascript
try {
	const { data, error } = await supabase.from('users').select('*');

	if (error) throw error;

	// Handle data
} catch (error) {
	console.error('Error:', error.message);
	// Handle error appropriately
}
```

### 4. Type Safety

```typescript
// Generate types from your database
// Run: supabase gen types typescript --local > database.types.ts

import { Database } from './database.types';

const supabase = createClient<Database>(url, key);

// Now you have full type safety
const { data } = await supabase.from('users').select('id, name, email');
```

## Troubleshooting

### Common Issues

1. **Authentication errors**

   - Check redirect URLs in Supabase dashboard
   - Verify email confirmations are enabled/disabled
   - Check OAuth provider settings

2. **RLS blocking queries**

   - Test queries with service role key first
   - Check policy definitions
   - Use `EXPLAIN` to debug policies

3. **Real-time not working**

   - Enable replication for tables
   - Check WebSocket connections
   - Verify RLS policies allow subscriptions

4. **Storage issues**
   - Check bucket policies
   - Verify file size limits
   - Ensure proper CORS configuration

## Quick Reference

### Environment Variables

```bash
PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # Server only!
```

### Common Patterns

```javascript
// Pagination
const { data, error } = await supabase.from('posts').select('*').range(0, 9); // Items 0-9

// Full-text search
const { data, error } = await supabase.from('posts').select().textSearch('title', 'hello world');

// Count without data
const { count, error } = await supabase.from('posts').select('*', { count: 'exact', head: true });

// Bulk operations
const { data, error } = await supabase
	.from('posts')
	.insert([{ title: 'Post 1' }, { title: 'Post 2' }, { title: 'Post 3' }]);
```
