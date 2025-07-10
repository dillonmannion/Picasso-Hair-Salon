#!/bin/bash
FILE_PATH=$(jq -r '.tool_input.file_path')

if [[ "$FILE_PATH" == *.ts ]] || [[ "$FILE_PATH" == *.svelte ]]; then
    # Format with prettier using project config
    pnpm prettier --write "$FILE_PATH" 2>/dev/null
    
    # Run ESLint fix
    pnpm eslint --fix "$FILE_PATH" 2>/dev/null
fi