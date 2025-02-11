# Development Setup Guide

## Local Development Server

### URL Configuration
When running the development server, always use `http://localhost.localtest.me:3000` instead of `localhost:3000`. This is crucial for:

1. **Authentication**:
   - Supabase authentication requires exact URL matching
   - Redirect URLs must match what's configured in Supabase
   - `localtest.me` provides a proper domain that resolves to 127.0.0.1

2. **Cookie Handling**:
   - Proper domain name helps with cookie management
   - Avoids cross-origin issues
   - Better simulates production environment

3. **Security**:
   - Consistent with security policies
   - Proper domain matching for auth callbacks
   - Better cookie handling

### Starting the Development Server
```bash
# Navigate to the project directory
cd catechize

# Start the development server with proper host configuration
NITRO_HOST=localhost.localtest.me npm run dev

# Access the application at
http://localhost.localtest.me:3000
```

**Important**: The `NITRO_HOST` environment variable is required for proper domain handling with localtest.me.

### Supabase Configuration
Ensure these URLs are configured in your Supabase project settings:
- Site URL: `http://localhost.localtest.me:3000`
- Redirect URLs: 
  - `http://localhost.localtest.me:3000/**`
  - `http://localhost.localtest.me:3000/auth/callback`
