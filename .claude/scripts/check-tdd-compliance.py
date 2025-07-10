#!/usr/bin/env python3
import json
import sys
import os

input_data = json.load(sys.stdin)
file_path = input_data['tool_input'].get('file_path', '')
tool_name = input_data.get('tool_name', '')

# Skip if not writing to src files
if '/src/' not in file_path or file_path.endswith('.test.ts'):
    sys.exit(0)

# Check if we're in a workflow
workflow_state_path = '.workflow/state.yaml'
if os.path.exists(workflow_state_path):
    # Allow writes during workflow implementation phase
    try:
        with open(workflow_state_path, 'r') as f:
            if 'phase: "implementation"' in f.read():
                # Still check for test existence but don't block during workflow
                test_path = file_path.replace('/src/', '/tests/').replace('.ts', '.test.ts')
                if not os.path.exists(test_path):
                    print(f"Warning: No test found at {test_path}", file=sys.stderr)
                sys.exit(0)
    except:
        pass

# Outside of workflow, enforce strict TDD
test_path = file_path.replace('/src/', '/tests/').replace('.ts', '.test.ts')
if not os.path.exists(test_path):
    print(f"TDD Violation: Cannot write implementation without failing test at {test_path}", file=sys.stderr)
    print("Run /workflow-init to start a new feature or create the test first", file=sys.stderr)
    sys.exit(2)