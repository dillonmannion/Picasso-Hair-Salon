#!/usr/bin/env python3
import json
import sys
import re

input_data = json.load(sys.stdin)
content = input_data['tool_input'].get('content', '')
file_path = input_data['tool_input'].get('file_path', '')

# Skip if not TypeScript
if not file_path.endswith('.ts'):
    sys.exit(0)

# Check for comments (excluding JSDoc for public APIs)
comment_pattern = r'^\s*//(?!\s*@)|^\s*/\*(?!\*)'
if re.search(comment_pattern, content, re.MULTILINE):
    print("Code should be self-documenting. Comments indicate unclear code.", file=sys.stderr)
    print("Refactor to use clear naming and structure instead.", file=sys.stderr)
    sys.exit(2)