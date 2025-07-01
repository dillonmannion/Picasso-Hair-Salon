import type { Rule } from 'eslint';
import { TSESTree } from '@typescript-eslint/types';

export const noCommentsRule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow comments in code',
      recommended: true
    },
    messages: {
      avoidComments: 'Code should be self-documenting. Comments indicate unclear code.'
    },
    schema: []
  },
  create(context) {
    const sourceCode = context.getSourceCode();
    
    return {
      Program() {
        const comments = sourceCode.getAllComments();
        
        comments.forEach(comment => {
          context.report({
            node: comment as unknown as TSESTree.Node,
            messageId: 'avoidComments'
          });
        });
      }
    };
  }
};