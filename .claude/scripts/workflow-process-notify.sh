#!/bin/bash
FILE_PATH=$(jq -r '.tool_input.file_path')

# Check if this is a workflow file update
if [[ "$FILE_PATH" == *"implementation-plan.md"* ]]; then
    # Count completed components
    COMPLETED=$(grep -c '"complete"' "$FILE_PATH" 2>/dev/null || echo 0)
    TOTAL=$(grep -c '"pending"\|"complete"' "$FILE_PATH" 2>/dev/null || echo 0)
    
    # Cross-platform notification
    if command -v osascript &> /dev/null; then
        # macOS
        osascript -e "display notification \"Progress: $COMPLETED/$TOTAL components\" with title \"TDD Workflow\""
    elif command -v notify-send &> /dev/null; then
        # Linux
        notify-send "TDD Workflow" "Progress: $COMPLETED/$TOTAL components"
    else
        # Fallback to console
        echo "TDD Workflow Progress: $COMPLETED/$TOTAL components"
    fi
fi