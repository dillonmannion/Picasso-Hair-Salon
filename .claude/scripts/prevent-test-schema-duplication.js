#!/usr/bin/env node
import * as fs from 'node:fs';
const input = JSON.parse(fs.readFileSync(0, 'utf-8'));
const content = input.tool_input.content || '';
const filePath = input.tool_input.file_path || '';

// Only check test files
if (!filePath.includes('.test.ts') && !filePath.includes('.spec.ts')) {
  process.exit(0);
}

// Check for schema definitions in test files
const schemaPattern = /const\s+\w+Schema\s*=\s*z\./;
if (schemaPattern.test(content)) {
  console.error('Test files must import schemas from the shared schema location');
  console.error('Do not redefine schemas in test files - this violates single source of truth');
  console.error('Import from @your-org/schemas or the appropriate schema module');
  process.exit(2);
}

// Check for type definitions in test files
const typePattern = /type\s+\w+\s*=\s*{[^}]+}/;
if (typePattern.test(content) && !content.includes('Partial<')) {
  console.error('Test files should not define new types');
  console.error(
    'Import types from production code or use Partial<ExistingType> for test overrides'
  );
  process.exit(2);
}
