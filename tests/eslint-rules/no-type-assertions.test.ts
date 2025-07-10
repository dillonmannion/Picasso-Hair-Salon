import { RuleTester } from '@typescript-eslint/rule-tester';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';
import { noTypeAssertionsRule } from '../../eslint-rules/no-type-assertions';

RuleTester.setDefaultConfig({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: {},
    },
  },
});

const ruleTester = new RuleTester();

ruleTester.run('no-type-assertions', noTypeAssertionsRule, {
    valid: [
      'const x: string = "hello"',
      'const y = getData() as const',
      'function isString(value: unknown): value is string { return typeof value === "string"; }',
      'const arr = [1, 2, 3] satisfies number[]',
    ],
    invalid: [
      {
        code: 'const x = "hello" as string',
        errors: [
          {
            messageId: 'avoidTypeAssertions',
            type: AST_NODE_TYPES.TSAsExpression,
          },
        ],
      },
      {
        code: 'const y = <string>"hello"',
        errors: [
          {
            messageId: 'avoidTypeAssertions',
            type: AST_NODE_TYPES.TSTypeAssertion,
          },
        ],
      },
      {
        code: 'const data = getData() as UserData',
        errors: [
          {
            messageId: 'avoidTypeAssertions',
            type: AST_NODE_TYPES.TSAsExpression,
          },
        ],
      },
      {
        code: 'const element = <HTMLElement>document.getElementById("test")',
        errors: [
          {
            messageId: 'avoidTypeAssertions',
            type: AST_NODE_TYPES.TSTypeAssertion,
          },
        ],
      },
    ],
  });
