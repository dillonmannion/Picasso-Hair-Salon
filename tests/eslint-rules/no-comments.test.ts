import { RuleTester } from '@typescript-eslint/rule-tester';
import { noCommentsRule } from '../../eslint-rules/no-comments';

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

ruleTester.run('no-comments', noCommentsRule, {
  valid: [
    'const x = 5;',
    'function doSomething() { return 42; }',
    'export const calculateTotal = (items: Item[]): number => items.reduce((sum, item) => sum + item.price, 0);',
  ],
  invalid: [
    {
      code: '// This is a comment\nconst x = 5;',
      errors: [
        {
          messageId: 'avoidComments',
        },
      ],
    },
    {
      code: 'const x = 5; // inline comment',
      errors: [
        {
          messageId: 'avoidComments',
        },
      ],
    },
    {
      code: '/* Block comment */\nconst y = 10;',
      errors: [
        {
          messageId: 'avoidComments',
        },
      ],
    },
    {
      code: '/**\n * JSDoc comment\n */\nfunction test() {}',
      errors: [
        {
          messageId: 'avoidComments',
        },
      ],
    },
  ],
});
