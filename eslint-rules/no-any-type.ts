import { ESLintUtils } from '@typescript-eslint/utils';

export const noAnyTypeRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/your-repo/eslint-rules/no-any-type'
)({
  name: 'no-any-type',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow the use of the any type',
    },
    messages: {
      avoidAny: 'Use of "any" type is forbidden. Use "unknown" or a specific type instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TSAnyKeyword(node) {
        context.report({
          node,
          messageId: 'avoidAny',
        });
      },
    };
  },
});
