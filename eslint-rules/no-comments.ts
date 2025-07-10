import { ESLintUtils } from '@typescript-eslint/utils';

export const noCommentsRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/your-repo/eslint-rules/no-comments'
)({
  name: 'no-comments',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow comments in code',
    },
    messages: {
      avoidComments: 'Code should be self-documenting. Comments indicate unclear code.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    return {
      Program() {
        const comments = sourceCode.getAllComments();

        comments.forEach((comment) => {
          context.report({
            loc: comment.loc!,
            messageId: 'avoidComments',
          });
        });
      },
    };
  },
});
