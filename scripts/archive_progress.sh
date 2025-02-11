#!/bin/bash

# Configuration
DOCS_DIR="docs"
ARCHIVE_DIR="$DOCS_DIR/archive"
TEMPLATE_DIR="$DOCS_DIR/templates"
TODO_DIR="$DOCS_DIR/todo"

# Get previous month and year
PREV_MONTH=$(date -v-1m "+%m")
PREV_YEAR=$(date -v-1m "+%Y")
MONTH_NAME=$(date -v-1m "+%B")

# Create archive directories
mkdir -p "$ARCHIVE_DIR"
mkdir -p "$ARCHIVE_DIR/todo"

# Function to archive a file
archive_file() {
    local source_file=$1
    local file_type=$2
    local archive_template="$TEMPLATE_DIR/monthly_${file_type}_archive.md"
    local archive_file="$ARCHIVE_DIR/${file_type}/$PREV_YEAR-$PREV_MONTH-${file_type}.md"
    
    echo "Processing $source_file..."
    
    # Create archive file from template if it exists
    if [ -f "$archive_template" ]; then
        cp "$archive_template" "$archive_file"
        sed -i '' "s/\[MONTH\]/$MONTH_NAME/g" "$archive_file"
        sed -i '' "s/\[YEAR\]/$PREV_YEAR/g" "$archive_file"
        sed -i '' "s/\[DATE\]/$(date '+%Y-%m-%d')/g" "$archive_file"
        sed -i '' "s/\[START_DATE\]/$PREV_YEAR-$PREV_MONTH-01/g" "$archive_file"
        sed -i '' "s/\[END_DATE\]/$PREV_YEAR-$PREV_MONTH-31/g" "$archive_file"
    else
        # Create basic header if template doesn't exist
        echo "# $file_type Archive - $MONTH_NAME $PREV_YEAR" > "$archive_file"
        echo "" >> "$archive_file"
        echo "This file contains archived $file_type entries from $MONTH_NAME $PREV_YEAR." >> "$archive_file"
    fi
    
    # Extract and archive completed/resolved items
    if [ "$file_type" = "todo" ] || [ "$file_type" = "bugs" ] || [ "$file_type" = "features" ] || [ "$file_type" = "technical" ]; then
        # For task files, archive completed items
        sed -n '/- \[x\]/p' "$source_file" >> "$archive_file"
        # Remove completed items from source
        sed -i '' '/- \[x\]/d' "$source_file"
    else
        # For progress file, archive by date
        sed -n "/### .* ($PREV_YEAR-$PREV_MONTH-/,/^### .* ($PREV_YEAR-$(printf %02d $((10#$PREV_MONTH + 1)))-\|$)/p" "$source_file" >> "$archive_file"
        sed -i '' "/### .* ($PREV_YEAR-$PREV_MONTH-/,/^### .* ($PREV_YEAR-$(printf %02d $((10#$PREV_MONTH + 1)))-\|$)/d" "$source_file"
    fi
    
    # Add archive section if not present
    if ! grep -q "^## Archived Items" "$source_file"; then
        echo -e "\n## Archived Items" >> "$source_file"
    fi
    
    # Add link to new archive
    local relative_path="archive/${file_type}/$PREV_YEAR-$PREV_MONTH-${file_type}.md"
    if ! grep -q "$MONTH_NAME $PREV_YEAR" "$source_file"; then
        echo "- [$MONTH_NAME $PREV_YEAR]($relative_path)" >> "$source_file"
    fi
    
    echo "Archived $file_type items to: $archive_file"
}

# Archive main progress file
archive_file "DEVELOPMENT_PROGRESS.md" "progress"

# Archive task files
archive_file "$TODO_DIR/features.md" "features"
archive_file "$TODO_DIR/technical.md" "technical"
archive_file "$TODO_DIR/bugs.md" "bugs"
archive_file "TODO.md" "todo"

echo "Archiving complete for $MONTH_NAME $PREV_YEAR. Please verify all changes."
