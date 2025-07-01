import { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/types';

export const noTypeAssertionsRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow type assertions (as Type and <Type>)',
      recommended: true
    },
    messages: {
      avoidTypeAssertions: 'Type assertions are forbidden. Use type guards, generics, or better type inference instead.'
    },
    schema: []
  },
  create(context) {
    const isConstAssertion = (node: TSESTree.TSAsExpression): boolean => {
      return node.typeAnnotation.type === 'TSTypeReference' && 
             node.typeAnnotation.typeName.type === 'Identifier' &&
             node.typeAnnotation.typeName.name === 'const';
    };

    return {
      TSAsExpression(node: TSESTree.TSAsExpression) {
        if (isConstAssertion(node)) {
          return;
        }
        
        context.report({
          node,
          messageId: 'avoidTypeAssertions'
        });
      },
      TSTypeAssertion(node: TSESTree.TSTypeAssertion) {
        context.report({
          node,
          messageId: 'avoidTypeAssertions'
        });
      }
    };
  }
};