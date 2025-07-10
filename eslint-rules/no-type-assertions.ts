import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

export const noTypeAssertionsRule = ESLintUtils.RuleCreator(
  () => 'https://github.com/your-repo/eslint-rules/no-type-assertions'
)({
  name: 'no-type-assertions',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow type assertions (as Type and <Type>)',
    },
    messages: {
      avoidTypeAssertions:
        'Type assertions are forbidden. Use type guards, generics, or better type inference instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const isConstAssertion = (node: TSESTree.TSAsExpression): boolean => {
      return (
        node.typeAnnotation.type === 'TSTypeReference' &&
        node.typeAnnotation.typeName.type === 'Identifier' &&
        node.typeAnnotation.typeName.name === 'const'
      );
    };

    return {
      TSAsExpression(node) {
        if (isConstAssertion(node)) {
          return;
        }

        context.report({
          node,
          messageId: 'avoidTypeAssertions',
        });
      },
      TSTypeAssertion(node) {
        context.report({
          node,
          messageId: 'avoidTypeAssertions',
        });
      },
    };
  },
});
