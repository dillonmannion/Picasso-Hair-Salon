#!/usr/bin/env node
import * as fs from 'node:fs';
const input = JSON.parse(fs.readFileSync(0, 'utf-8'));
const content = input.tool_input.content || '';

// Check for type definitions without corresponding schemas
if (content.includes('type ') && !content.includes('z.infer')) {
  const typeMatch = content.match(/type\s+(\w+)\s*=/);
  if (typeMatch && !content.includes(`${typeMatch[1]}Schema`)) {
    console.error(
      `Schema-first violation: Type '${typeMatch[1]}' should be derived from a Zod schema`
    );
    console.error('Define a schema first, then use z.infer to derive the type');
    process.exit(2);
  }
}
