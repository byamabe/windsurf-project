# Bug Tracking

## Active Bugs

### High Priority
No high-priority bugs currently identified.

### Medium Priority
No medium-priority bugs currently identified.

### Low Priority
No low-priority bugs currently identified.

## Recently Fixed
1. **Admin Form Data Loading** (Fixed: March 17, 2025)
   - Issue: Episode and Podcast edit forms were blank when editing existing content
   - Root Cause: Incorrect prop names being passed to form components
   - Fix: Updated prop names from `:episode`/`:podcast` to `:initial-data` in:
     - `pages/admin/episodes/[episodeId].vue`
     - `pages/admin/podcasts/[id].vue`
   - Commits: 15e3f3b, c002c6b
   - Verified: Build passes successfully

## Bug Report Template

### Bug Description
- What is happening
- What should happen
- Steps to reproduce

### Technical Details
- Affected components
- Environment details
- Related code files

### Fix Status
- [ ] Investigated
- [ ] Fix identified
- [ ] Fix implemented
- [ ] Tested
- [ ] Deployed

## Archived Items
- [January 2025](archive/bugs/2025-01-bugs.md)
