#!/bin/bash

# This script creates calendar events for documentation maintenance
# Requires: icalBuddy (brew install icalbuddy)

# Configuration
CALENDAR_NAME="Development"
YEAR=$(date +%Y)

# Monthly events (1st of each month)
for month in {1..12}; do
    # Format date for the first of each month
    date=$(date -j -f "%Y-%m-%d" "$YEAR-$month-01" "+%Y-%m-%d 09:00")
    
    # Create monthly maintenance event
    osascript <<EOF
    tell application "Calendar"
        tell calendar "$CALENDAR_NAME"
            make new event with properties {summary:"Documentation Maintenance", description:"1. Run archiving script
2. Verify archived content
3. Check file sizes
4. Review GitHub issues

Command to run:
./scripts/archive_progress.sh", start date:date "$date", end date:date "$date" + 30 * minutes, allday:false}
        end tell
    end tell
EOF
done

# Quarterly events (1st of Jan/Apr/Jul/Oct)
for month in 1 4 7 10; do
    date=$(date -j -f "%Y-%m-%d" "$YEAR-$month-01" "+%Y-%m-%d 10:00")
    
    osascript <<EOF
    tell application "Calendar"
        tell calendar "$CALENDAR_NAME"
            make new event with properties {summary:"Quarterly Documentation Review", description:"1. Deep documentation review
2. Clean up old archives
3. Update templates
4. Check all cross-references", start date:date "$date", end date:date "$date" + 1 * hours, allday:false}
        end tell
    end tell
EOF
done

# Annual event (January 1st)
date=$(date -j -f "%Y-%m-%d" "$YEAR-01-01" "+%Y-%m-%d 11:00")

osascript <<EOF
tell application "Calendar"
    tell calendar "$CALENDAR_NAME"
        make new event with properties {summary:"Annual Documentation Maintenance", description:"1. Review entire documentation structure
2. Update best practices
3. Clean up old archives
4. Plan improvements for next year", start date:date "$date", end date:date "$date" + 2 * hours, allday:false}
    end tell
end tell
EOF

echo "Calendar events created for documentation maintenance in $CALENDAR_NAME calendar"
