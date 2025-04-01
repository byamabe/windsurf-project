# Project Structure Guidelines

## Current Structure

The current project uses a nested structure:

```
windsurf-project/
├── catechize/        # Project code
│   ├── components/
│   ├── pages/
│   └── types/
├── docs/             # Documentation
└── .husky/          # Build hooks
```

This structure was chosen initially but has some drawbacks:
- Confusion about file placement
- Complex relative paths
- Build script complexity
- IDE configuration challenges

## Recommended Structure for New Projects

For new projects, use a flat structure:

```
project-name/
├── components/
├── pages/
├── types/
├── docs/
└── .husky/
```

### Why Flat Structure?

1. **Standard Practice**
   - Follows Node.js/Nuxt conventions
   - Better tool compatibility
   - Clearer organization

2. **Technical Benefits**
   - Simpler relative paths
   - Build tools work without path adjustment
   - Better IDE integration
   - Easier deployment configuration

3. **Developer Experience**
   - Clear file locations
   - No confusion about config placement
   - Simpler import statements
   - Standard project layout

### When to Use Nested Structure?

Only use nested structure when:
1. Building a true monorepo with multiple related projects
2. Using proper monorepo tools (Turborepo, Nx)
3. Implementing workspace management (pnpm workspaces)
4. Sharing significant code between projects

### Project Template

For new projects:
1. Use [Create Nuxt App](https://nuxt.com/docs/getting-started/installation)
2. Keep all files in root directory
3. Follow standard Nuxt project structure
4. Use consistent documentation location in `/docs`

## Migration Considerations

If considering migrating from nested to flat structure:

### Required Changes
- Move all project files to root
- Update all configuration files
- Adjust all relative paths
- Update deployment configs
- Test thoroughly

### Risks
- Breaking deployment pipeline
- Disrupting build process
- Path resolution issues
- Loss of Git history
- Environment configuration issues

### Recommendation
- Keep existing projects in current structure
- Apply flat structure to new projects
- Document structure decisions
- Create project templates

## Build Process Best Practices

1. **Pre-Commit Verification**
   - ✅ Run `npm run build` manually before committing
   - ✅ Fix any errors immediately while context is fresh
   - ✅ Stage and commit only after successful build
   - ❌ Don't rely solely on pre-commit hook

2. **Pre-Commit Hook (Safety Net)**
   - Acts as a final verification
   - Prevents accidental broken builds
   - Not a replacement for manual testing
   - May interrupt commit flow if issues found

3. **Why Both?**
   - Manual build: Immediate feedback, maintain flow
   - Pre-commit hook: Catch anything missed
   - Better developer experience
   - Faster issue resolution

## Questions to Ask

When starting a new project:
1. Will this be a standalone project?
2. Do I need to share code with other projects?
3. What build tools will I use?
4. How will I handle deployment?

Based on answers:
- Standalone → Use flat structure
- Monorepo → Use proper monorepo tools
- Shared Code → Consider workspace management
