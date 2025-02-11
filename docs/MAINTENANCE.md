# Documentation Maintenance Guide

## Monthly Archiving Process

### Overview
To keep our documentation manageable and efficient, we maintain a system of active and archived content. Each type of documentation has its own archiving rules:

1. **Progress Documentation**
   - Keep last 30 days in `DEVELOPMENT_PROGRESS.md`
   - Archive older entries by date
   - Maintain chronological order

2. **Task Documentation**
   - Archive completed items (marked with [x])
   - Keep active tasks in main files
   - Preserve task context and completion dates

### Automated Tools

1. **Archiving Script**
   ```bash
   ./scripts/archive_progress.sh
   ```
   This script handles:
   - `DEVELOPMENT_PROGRESS.md` (by date)
   - `TODO.md` (completed tasks)
   - `docs/todo/features.md` (completed features)
   - `docs/todo/technical.md` (completed technical tasks)
   - `docs/todo/bugs.md` (resolved bugs)

2. **GitHub Action**
   - Monitors file sizes automatically
   - Creates issues when files exceed 100KB
   - Runs monthly checks on the 1st
   - Triggers on documentation changes

### Archive Structure

```
docs/
├── archive/               # Archive root
│   ├── progress/         # Monthly progress archives
│   │   └── YYYY-MM-progress.md
│   ├── todo/            # Completed main tasks
│   │   └── YYYY-MM-todo.md
│   ├── features/        # Completed features
│   │   └── YYYY-MM-features.md
│   ├── technical/       # Completed technical tasks
│   │   └── YYYY-MM-technical.md
│   └── bugs/           # Resolved bugs
│       └── YYYY-MM-bugs.md
├── templates/           # Archive templates
│   ├── monthly_progress_archive.md
│   ├── monthly_todo_archive.md
│   ├── monthly_features_archive.md
│   ├── monthly_technical_archive.md
│   └── monthly_bugs_archive.md
└── todo/               # Active task tracking
    ├── features.md
    ├── technical.md
    └── bugs.md
```

### Archiving Rules

1. **Progress Entries**
   - Archive by date (older than 30 days)
   - Preserve all content and formatting
   - Maintain links and references

2. **Task Items**
   - Archive when marked as complete [x]
   - Keep task description and context
   - Preserve completion date if available

3. **Bug Reports**
   - Archive when marked as resolved [x]
   - Keep reproduction steps
   - Document resolution method

4. **Feature Requests**
   - Archive when implemented [x]
   - Maintain feature requirements
   - Link to relevant progress entries

5. **Technical Tasks**
   - Archive when completed [x]
   - Keep implementation details
   - Preserve technical decisions

### Best Practices

1. **Content Management**
   - Use consistent task marking ([x] for completed)
   - Include dates in progress entries
   - Maintain clear task descriptions
   - Cross-reference related items

2. **Archive Organization**
   - One directory per content type
   - Monthly archive files
   - Clear file naming (YYYY-MM-type.md)
   - Consistent internal structure

3. **Maintenance Schedule**
   - Monthly: Run archiving script
   - Quarterly: Deep clean and verify
   - Yearly: Review archive structure

### Troubleshooting

1. **Common Issues**
   - Missing links: Update references
   - Duplicate content: Remove from source
   - Broken formatting: Check markdown
   - Failed archiving: Check dates/marks

2. **Recovery Steps**
   - Archives are dated and reversible
   - Main files have 30-day history
   - Use git history if needed

### Calendar Integration

The following calendar events are recommended:

1. **Monthly Review** (1st of each month)
   - Run archiving script
   - Verify all file types
   - Check GitHub issues
   - Update cross-references

2. **Quarterly Check** (1st of Jan/Apr/Jul/Oct)
   - Deep documentation review
   - Verify archive organization
   - Update templates if needed
   - Check all file types

3. **Annual Maintenance** (January 1st)
   - Review entire structure
   - Update best practices
   - Clean up old archives
   - Optimize organization
