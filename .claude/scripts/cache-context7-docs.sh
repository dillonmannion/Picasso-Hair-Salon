#!/bin/bash
# Extract Context7 documentation response and cache it
RESPONSE=$(jq -r '.tool_response' 2>/dev/null)
LIBRARY=$(jq -r '.tool_input.library_id // empty' 2>/dev/null)

if [ -n "$LIBRARY" ] && [ -n "$RESPONSE" ]; then
    # Create cache directory if it doesn't exist
    mkdir -p .workflow/current/plan/context7-cache
    
    # Save the documentation with timestamp
    TIMESTAMP=$(date -u +"%Y-%m-%d_%H-%M-%S")
    CACHE_FILE=".workflow/current/plan/context7-cache/${LIBRARY}_${TIMESTAMP}.json"
    
    echo "$RESPONSE" > "$CACHE_FILE"
    echo "Cached Context7 docs for $LIBRARY to $CACHE_FILE"
fi