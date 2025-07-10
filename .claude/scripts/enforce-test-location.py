#!/usr/bin/env python3
import json
import sys

input_data = json.load(sys.stdin)
file_path = input_data['tool_input'].get('file_path', '')

# Ensure test files go in tests/ directory
if '.test.ts' in file_path or '.spec.ts' in file_path:
    if not file_path.startswith('tests/'):
        print("Test files must be placed in the tests/ directory", file=sys.stderr)
        print(f"Move this to: tests/{file_path.replace('src/', '')}", file=sys.stderr)
        sys.exit(2)