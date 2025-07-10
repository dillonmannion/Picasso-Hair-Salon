#!/bin/bash
FILE_PATH=$(jq -r '.tool_input.file_path' 2>/dev/null)

# Only run tests for TypeScript files in src/
if [[ "$FILE_PATH" == */src/*.ts ]] && [[ "$FILE_PATH" != *.test.ts ]]; then
    TEST_FILE=${FILE_PATH/\/src\//\/tests\/}
    TEST_FILE=${TEST_FILE%.ts}.test.ts
    
    if [ -f "$TEST_FILE" ]; then
        echo "Running tests for $TEST_FILE..."
        pnpm test "$TEST_FILE" 2>&1
    fi
fi