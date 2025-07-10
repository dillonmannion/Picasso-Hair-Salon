#!/usr/bin/env python3
import json
import sys
import subprocess
import platform

try:
    input_data = json.load(sys.stdin)
    message = input_data.get('message', '')
except:
    sys.exit(1)

# Check if this is a workflow-related notification
workflow_keywords = ['workflow', 'component', 'test', 'implementation', 'TDD']
is_workflow_related = any(keyword in message.lower() for keyword in workflow_keywords)

if is_workflow_related:
    system = platform.system()
    
    if system == 'Darwin':  # macOS
        subprocess.run([
            'osascript', '-e',
            f'display notification "{message}" with title "TDD Workflow" sound name "Glass"'
        ])
    elif system == 'Linux':
        subprocess.run(['notify-send', 'TDD Workflow', message])
    else:  # Windows or other
        print(f"[TDD Workflow] {message}")