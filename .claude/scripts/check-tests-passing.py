#!/usr/bin/env python3
import subprocess
import json
import sys

# Run tests
result = subprocess.run(['pnpm', 'test'], capture_output=True)

if result.returncode != 0:
    output = {
        "decision": "block",
        "reason": "Tests are failing. Please fix them before stopping. Run 'pnpm test' to see failures."
    }
    print(json.dumps(output))
    sys.exit(0)