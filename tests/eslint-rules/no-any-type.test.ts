import { RuleTester } from '@typescript-eslint/rule-tester';
import { noAnyTypeRule } from '../../eslint-rules/no-any-type';

RuleTester.setDefaultConfig({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: {}
    }
  }
});

const ruleTester = new RuleTester();

describe('no-any-type rule', () => {
  ruleTester.run('no-any-type', noAnyTypeRule, {
    valid: [
      'let x: string = "hello"',
      'let y: unknown = getData()',
      'function process<T>(data: T): T { return data; }',
      'type Result = { success: boolean; data: unknown }',
      'const items: string[] = []'
    ],
    invalid: [
      {
        code: 'let x: any = "hello"',
        errors: [{ 
          messageId: 'avoidAny',
          type: 'TSAnyKeyword'
        }]
      },
      {
        code: 'function process(data: any): any { return data; }',
        errors: [
          { 
            messageId: 'avoidAny',
            type: 'TSAnyKeyword' 
          },
          { 
            messageId: 'avoidAny',
            type: 'TSAnyKeyword' 
          }
        ]
      },
      {
        code: 'const items: any[] = []',
        errors: [{ 
          messageId: 'avoidAny',
          type: 'TSAnyKeyword'
        }]
      },
      {
        code: 'interface Config { value: any; }',
        errors: [{ 
          messageId: 'avoidAny',
          type: 'TSAnyKeyword'
        }]
      },
      {
        code: 'type Handler = (event: any) => void',
        errors: [{ 
          messageId: 'avoidAny',
          type: 'TSAnyKeyword'
        }]
      }
    ]
  });
});