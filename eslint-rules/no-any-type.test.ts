import { RuleTester } from 'eslint';
import { noAnyTypeRule } from './no-any-type';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
});

describe('no-any-type rule', () => {
  ruleTester.run('no-any-type', noAnyTypeRule, {
    valid: [
      'let x: string = "hello"',
      'let y: unknown = getData()',
      'function process<T>(data: T): T { return data; }',
    ],
    invalid: [
      {
        code: 'let x: any = "hello"',
        errors: [
          { message: 'Use of "any" type is forbidden. Use "unknown" or a specific type instead.' },
        ],
      },
      {
        code: 'function process(data: any): any { return data; }',
        errors: [
          { message: 'Use of "any" type is forbidden. Use "unknown" or a specific type instead.' },
          { message: 'Use of "any" type is forbidden. Use "unknown" or a specific type instead.' },
        ],
      },
    ],
  });
});
