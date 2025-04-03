# Development Best Practices

A collection of best practices and lessons learned from our projects. Use this as a reference when starting new projects or making architectural decisions.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Type Safety](#type-safety)
3. [Build Process](#build-process)
4. [Documentation](#documentation)
5. [Git Workflow](#git-workflow)
6. [Testing](#testing)
7. [Security](#security)
8. [Performance](#performance)
9. [Maintaining This Guide](#maintaining-this-guide)
10. [Headless UI Dropdown Menus with Client-Side Navigation](#headless-ui-dropdown-menus-with-client-side-navigation)

## Project Structure

### Directory Layout
✅ Use flat structure for single projects
```
project-name/
├── components/
├── pages/
├── types/
├── docs/
└── .husky/
```

❌ Avoid nested structure unless building true monorepo
```
project-root/
└── project-name/
    └── src/
```

### Configuration Files
- Keep at root level
- Use TypeScript for config when possible
- Document non-obvious configuration

[More details](./PROJECT_STRUCTURE.md)

## Type Safety

### Database Types
```typescript
// types/database.ts
export interface DatabaseEpisode {
  id: string;
  title: string;
  duration: string;  // Store as string for compatibility
  created_at: string;
  // ...
}

// Consistent usage in queries
const { data: episodes } = await supabase
  .from('episodes')
  .select<DatabaseEpisode>('*')
```

### Type Conversion
```typescript
// types/index.ts
export interface Episode {
  id: string;
  title: string;
  duration?: string;
  createdAt: string;  // Converted to camelCase
}

// utils/conversion.ts
export function convertDatabaseEpisode(db: DatabaseEpisode): Episode {
  return {
    id: db.id,
    title: db.title,
    duration: db.duration,
    createdAt: db.created_at
  };
}
```

### Form Types
```typescript
// components/EpisodeForm.vue
export interface EpisodeFormData {
  title: string;
  duration?: string;  // Optional but type-safe
  // ...
}

const formData = ref<EpisodeFormData>({
  title: props.initialData?.title ?? '',
  duration: props.initialData?.duration
});
```

[More details](./TYPE_SYSTEM.md)

## Build Process

### Pre-Commit Verification
1. ✅ Run builds manually first
2. ✅ Fix errors immediately
3. ✅ Commit only after success
4. ❌ Don't rely only on hooks

### Git Hooks
- Implement pre-commit hooks
- Run builds automatically
- Show clear error messages
- Allow emergency bypass

### CI/CD
- Match local build process
- Fast feedback loop
- Clear error reporting
- Automated deployments

## Documentation

### Required Documentation
1. README.md
   - Project overview
   - Setup instructions
   - Key features
   - Tech stack
   - Contributing guide

2. TYPE_SYSTEM.md
   - Type architecture
   - Conventions
   - Examples
   - Common pitfalls

3. API Documentation
   - Endpoint descriptions
   - Request/response formats
   - Authentication
   - Error handling

### Documentation Style
- Clear and concise
- Code examples
- Visual diagrams
- Regular updates

## Git Workflow

### Commits
- Descriptive messages
- Conventional commits format
- Reference issues
- Single responsibility

### Branches
- Feature branches
- Clean history
- Regular rebasing
- Protected main branch

### Reviews
- Required reviews
- Automated checks
- Clear feedback
- Quick turnaround

## Testing

### Unit Tests
- Component testing
- Type testing
- Utility function testing
- High coverage

### Integration Tests
- API endpoints
- Database operations
- Authentication flows
- Error scenarios

### E2E Tests
- Critical user paths
- Cross-browser testing
- Mobile responsiveness
- Performance metrics

## Security

### Admin Route Authorization

We implement a role-based permission system for admin routes:

1. **Required Middleware**
```typescript
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']  // Both required
})
```

2. **Permission Levels**
```typescript
// Available Permissions
- create:any_content  // Content management
- read:any_content    // Content viewing
- update:any_content  // Content editing
- delete:any_content  // Content deletion
- manage:users        // User management
- manage:roles        // System administration
```

3. **Route Permission Mapping**
```typescript
const routeToPermissionMap = {
  '/admin': 'manage:roles',              // Admin dashboard
  '/admin/podcasts': 'create:any_content',   // Content management
  '/admin/episodes': 'create:any_content',
  '/admin/users': 'manage:users',        // User management
  '/admin/test/*': 'manage:roles'        // Test pages (highest privilege)
}
```

4. **Best Practices**
- All admin pages must use both `auth` and `admin` middleware
- Test pages should be under `/admin/test/` with `manage:roles` permission
- Content management pages should use `create:any_content`
- User management pages should use `manage:users`
- System administration should use `manage:roles`

### Edge-Level Security

We implement multiple layers of security at the edge level to protect against common attacks:

1. **Rate Limiting**
```typescript
// netlify/edge-functions/security.ts
const RATE_LIMIT = 60;  // requests per minute
const BLOCK_DURATION = 300;  // 5 minutes block for violations
```

2. **Request Filtering**
```toml
# netlify.toml
[[redirects]]
  from = "/index.php*"
  to = "/404.html"
  status = 404
  force = true

[[redirects]]
  from = "/Special:*"
  to = "/404.html"
  status = 404
  force = true
```

3. **Security Headers**
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Content-Security-Policy = "default-src 'self'..."
```

### Implementation Details

1. **Bot Protection**
   - Pattern-based detection
   - Rate limiting per IP
   - Automatic blocking of suspicious IPs
   - MediaWiki/WordPress probe blocking

2. **Spam Prevention**
   - Keyword filtering
   - URL pattern matching
   - Request rate analysis
   - Automated blocking

3. **Headers and Policies**
   - Frame protection (clickjacking prevention)
   - XSS protection
   - Content type enforcement
   - Strict referrer policy
   - Limited permissions

### Maintenance

1. **Regular Updates**
   - Monitor attack patterns in logs
   - Update bot patterns and keywords
   - Adjust rate limits if needed
   - Review blocked IPs

2. **Monitoring**
   - Check Netlify function logs
   - Review rate limit triggers
   - Monitor for false positives
   - Track blocked request patterns

### Best Practices

1. **Development**
   - Test rate limits in staging
   - Verify legitimate paths aren't blocked
   - Monitor performance impact
   - Document security changes

2. **Deployment**
   - Deploy security changes gradually
   - Monitor for unintended blocks
   - Have rollback plan ready
   - Test all redirects

3. **Maintenance**
   - Keep spam keywords current
   - Update bot patterns regularly
   - Review rate limit thresholds
   - Document new attack patterns

### Edge-Level Security Rules
Currently implemented in `netlify.toml`:
```toml
[[redirects]]
  from = "/*.php"
  to = "/404.html"
  status = 404
  force = true

[[redirects]]
  from = "/index.php"
  to = "/404.html"
  status = 404
  force = true
```

### Edge Function Error Handling

When implementing edge functions, especially those handling security or rate limiting:

1. **Always wrap KV operations in try-catch blocks**
   ```typescript
   try {
     const value = await context.env.get(key);
     await context.env.set(key, newValue);
   } catch (kvError) {
     console.error('KV operation failed:', kvError);
     // Fallback behavior (e.g., allow request but don't track it)
   }
   ```

2. **Implement global error handling**
   ```typescript
   export default async (request: Request, context: Context) => {
     try {
       // Edge function logic
     } catch (error) {
       console.error('Edge function error:', error);
       // Fallback behavior (e.g., allow request with reduced security)
       return context.next();
     }
   };
   ```

3. **Graceful Degradation**
   - On KV errors: Allow requests but don't track rate limits
   - On general errors: Log the error and allow requests through
   - Never block legitimate traffic due to infrastructure issues

4. **Error Visibility**
   - Log all errors with sufficient context for debugging
   - Consider adding error tracking metrics
   - Monitor error rates to detect infrastructure issues

5. **Testing**
   - Test error scenarios by simulating KV failures
   - Verify fallback behaviors work as expected
   - Ensure errors are properly logged

### API Security
```typescript
// server/api/episodes/[id].get.ts
export default defineEventHandler(async (event) => {
  // Validate user session
  const user = await requireAuth(event);
  
  // Validate and sanitize params
  const id = getRouterParam(event, 'id');
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'Episode ID is required'
    });
  }

  // Use type-safe database queries
  const { data, error } = await supabase
    .from('episodes')
    .select<DatabaseEpisode>('*')
    .eq('id', id)
    .single();
});
```

### Data Protection
- Input validation
- Output sanitization
- Encryption at rest
- Secure transmission

### Environment
- Secure env variables
- Secret management
- Access control
- Audit logging

## Performance

### Frontend Optimization
Currently implemented:
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // Image optimization
  image: {
    provider: 'ipx',
    presets: {
      thumbnail: {
        modifiers: {
          width: 200,
          height: 200,
          format: 'webp'
        }
      }
    }
  },

  // Bundle optimization
  nitro: {
    minify: true,
    compressPublicAssets: true
  }
});

// components/LazyImage.vue
<template>
  <NuxtImg
    :src="props.src"
    :preset="props.preset"
    loading="lazy"
    decoding="async"
  />
</template>
```

### Database Optimization
Currently using:
```sql
-- Indexes for common queries
CREATE INDEX idx_episodes_podcast_id ON episodes(podcast_id);
CREATE INDEX idx_episodes_published_at ON episodes(published_at);

-- Efficient joins
SELECT e.*, p.title as podcast_title
FROM episodes e
JOIN podcasts p ON e.podcast_id = p.id
WHERE e.status = 'published'
LIMIT 10;
```

### Monitoring
- Error tracking
- Performance metrics
- User analytics
- Resource usage

## Maintaining This Guide

### Adding New Practices

When adding new best practices:

1. **Compatibility Check**
   - Review existing practices
   - Check for conflicts
   - Ensure harmony with current patterns
   - Consider impact on existing projects

2. **Validation Process**
   - Test in real projects
   - Gather feedback
   - Document trade-offs
   - Measure effectiveness

3. **Documentation Updates**
   - Clear rationale
   - Real examples
   - Migration guides if needed
   - Version history

### Resolving Conflicts

When new practices conflict with existing ones:

1. **Analysis**
   - Document the conflict
   - List pros and cons
   - Consider context
   - Evaluate trade-offs

2. **Resolution**
   - Choose based on evidence
   - Update or deprecate old practice
   - Explain the decision
   - Provide migration path

3. **Communication**
   - Clear changelog
   - Highlight major changes
   - Update related docs
   - Notify team

### Version Control

Keep track of changes:

1. **Change Log**
   - Date of change
   - Rationale
   - Impact assessment
   - Migration notes

2. **Practice Status**
   - Current
   - Deprecated
   - Experimental
   - Context-dependent

3. **Historical Context**
   - Why practice was added
   - What problem it solved
   - How it evolved
   - Lessons learned

### Regular Review

Schedule periodic reviews:

1. **Quarterly Assessment**
   - Review all practices
   - Check relevance
   - Update examples
   - Remove outdated info

2. **Project Retrospectives**
   - Capture new lessons
   - Validate practices
   - Identify gaps
   - Suggest improvements

3. **Technology Updates**
   - Monitor tech changes
   - Assess impact
   - Update accordingly
   - Keep examples current

Remember: This is a living document that should evolve with our understanding and experience while maintaining consistency and clarity.

## Using This Guide

### New Projects
1. Clone this guide
2. Review all sections
3. Implement relevant practices
4. Customize as needed

### Existing Projects
1. Audit current practices
2. Identify gaps
3. Plan improvements
4. Implement gradually

### Regular Updates
- Document new lessons
- Update outdated practices
- Share team feedback
- Track effectiveness

## Contributing

To add new best practices:
1. Document the problem
2. Explain the solution
3. Provide examples
4. Update relevant sections

Keep this guide living and evolving with new experiences and lessons learned.

## Headless UI Dropdown Menus with Client-Side Navigation

When implementing dropdown menus that require client-side navigation (e.g., in the admin interface), follow these guidelines:

1. Use Headless UI's `Menu`, `MenuButton`, `MenuItems`, and `MenuItem` components for proper accessibility and behavior
2. Wrap clickable items in `MenuItem` components to get automatic menu closing behavior
3. Use `button` elements inside `MenuItem` for navigation items
4. Use `navigateTo()` for client-side navigation to prevent page refreshes

Example:
```vue
<Menu as="div" class="relative">
  <MenuButton>Dropdown Button</MenuButton>
  <MenuItems>
    <MenuItem v-slot="{ active }">
      <button 
        class="block w-full text-left hover:bg-gray-100" 
        @click="() => navigateTo('/path')"
      >
        Menu Item
      </button>
    </MenuItem>
  </MenuItems>
</Menu>
```

This pattern ensures:
- Menus close automatically when items are clicked
- Navigation happens client-side without page refreshes
- Proper accessibility is maintained
- Consistent styling and hover effects
