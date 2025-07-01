import type { PageServerLoad } from './$types';

// OAuth login is handled client-side, so we just need to handle any error messages
export const load: PageServerLoad = async ({ url }) => {
  const error = url.searchParams.get('error');
  
  if (error) {
    let message = 'Authentication failed. Please try again.';
    
    switch (error) {
      case 'access_denied':
        message = 'Access was denied. Please try again.';
        break;
      case 'no_code':
        message = 'No authorization code received. Please try again.';
        break;
      case 'auth_failed':
        message = 'Authentication failed. Please try again.';
        break;
    }
    
    return {
      error: message
    };
  }
  
  return {};
};