import { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/types';

export const noAnyTypeRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow the use of the any type',
      recommended: true
    },
    messages: {
      avoidAny: 'Use of "any" type is forbidden. Use "unknown" or a specific type instead.'
    },
    schema: []
  },
  create(context) {
    return {
      TSAnyKeyword(node: TSESTree.TSAnyKeyword) {
        context.report({
          node,
          messageId: 'avoidAny'
        });
      }
    };
  }
};