# Type System Guide

A comprehensive guide to maintaining type safety across the Catechize application.

## Overview

The type system is designed to ensure type safety between different layers of the application:
- Database layer (Supabase)
- Backend API layer
- Frontend components
- Form handling

## Table of Contents

- [Architecture](#architecture)
- [Core Principles](#core-principles)
- [Common Patterns](#common-patterns)
- [Anti-patterns](#anti-patterns-to-avoid)
- [Evolution Guide](#type-system-evolution)
- [Troubleshooting](#troubleshooting)

## Architecture

```
project_root/
├── docs/
│   └── TYPE_SYSTEM.md
├── types/
│   ├── database.ts    # Database schema types (source of truth)
│   ├── supabase.ts    # Supabase-specific types
│   └── index.ts       # Frontend-normalized types
└── components/
    └── */*.vue        # Component-specific form types
```

## Core Principles

### 1. Database Types as Source of Truth

All database schemas are defined in `types/database.ts`:

```typescript
// types/database.ts
export interface DatabaseEpisode {
  id: string
  created_at: string
  title: string
  // ... other fields
}
```

**Why?**
- Ensures single source of truth
- Matches database column names exactly
- Makes schema changes explicit

### 2. Type Conversion Between Layers

Always use conversion utilities when moving data between layers:

```typescript
// types/index.ts
export function toFrontendEpisode(db: DatabaseEpisode): Episode {
  return {
    id: db.id,
    createdAt: db.created_at,
    // ... convert other fields
  }
}
```

**Benefits:**
- Type-safe data transformation
- Consistent casing conventions
- Clear data flow

### 3. Form-Specific Types

Each form should have its own interface:

```typescript
// components/EpisodeForm.vue
export interface EpisodeFormData {
  // Required fields
  title: string
  podcastId: string
  
  // Nullable fields
  description: string | null
  audioUrl: string | null
}
```

**Why Form-Specific Types?**
- Handle partial data during form input
- Make nullable fields explicit
- Keep form state isolated

### 4. Local Build Verification

Always verify types locally:

```bash
# Before committing:
cd catechize && npm run build

# Pre-commit hook (automatic):
.husky/pre-commit
```

**Benefits:**
- Catches type errors early
- Prevents failed deployments
- Saves CI/CD resources

### 5. Documentation

Document type decisions clearly:

```typescript
// Using string for duration to match database schema
// and ensure consistent type across all interfaces
interface Episode {
  duration?: string // Optional to support legacy episodes
}
```

## Common Patterns

### Handling Nullable Fields

```typescript
// In database types
interface DatabaseEpisode {
  description: string | null
}

// In form types
interface EpisodeFormData {
  description: string | null  // Explicitly nullable
}

// In component setup
const formData = ref<EpisodeFormData>({
  description: props.initialData?.description ?? null
})
```

### Type Safety with API Responses

```typescript
// Convert database types to frontend types
const episode = toFrontendEpisode(await fetchEpisode())

// Convert frontend types to database format
await saveEpisode(toDatabaseEpisode(formData))
```

## Anti-patterns to Avoid

❌ **Don't** create duplicate interfaces
```typescript
// Bad: Multiple interfaces for the same data
interface Episode { /* ... */ }
interface EpisodeData { /* ... */ }
interface EpisodeType { /* ... */ }
```

✅ **Do** use clear naming and extend when needed
```typescript
// Good: Clear separation of concerns
interface DatabaseEpisode { /* ... */ }
interface Episode { /* ... */ }
interface EpisodeFormData { /* ... */ }
```

## Type System Evolution

When adding new features:

1. Start with database types:
   ```typescript
   // 1. Add to database.ts
   interface DatabaseEpisode {
     new_field: string
   }
   ```

2. Update conversion utilities:
   ```typescript
   // 2. Update in index.ts
   function toFrontendEpisode(db: DatabaseEpisode): Episode {
     newField: db.new_field
   }
   ```

3. Update form types as needed:
   ```typescript
   // 3. Update form interface
   interface EpisodeFormData {
     newField: string | null
   }
   ```

4. Verify and document:
   ```bash
   # 4. Run build and update docs
   npm run build
   ```

## Troubleshooting

### Common Issues

1. **Type Mismatch in Build**
   - Problem: Local build passes but CI fails
   - Solution: Run clean build locally: `rm -rf .nuxt && npm run build`

2. **Nullable Field Errors**
   - Problem: Unexpected null values
   - Solution: Make nullability explicit in interfaces

3. **Case Conversion Issues**
   - Problem: Mixed snake_case and camelCase
   - Solution: Use conversion utilities consistently

### Getting Help

- Check [TypeScript documentation](https://www.typescriptlang.org/docs/)
- Review [Nuxt TypeScript guide](https://nuxt.com/docs/guide/concepts/typescript)
- Ask in #dev-typescript Slack channel

## Contributing

When making type system changes:

1. Follow the principles in this guide
2. Add tests for new type conversions
3. Update this documentation
4. Get review from TypeScript team lead

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Nuxt TypeScript Guide](https://nuxt.com/docs/guide/concepts/typescript)
- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/typescript-support)

## License

This documentation is part of the Catechize project.
See the LICENSE file in the root directory for details.
