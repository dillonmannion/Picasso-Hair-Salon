export type CSPOptions = {
  isDevelopment?: boolean;
};

const SUPABASE_DOMAINS = ['https://*.supabase.co', 'https://*.supabase.com'];
const SUPABASE_WEBSOCKET = 'wss://*.supabase.co';

const CSP_VALUES = {
  SELF: "'self'",
  UNSAFE_INLINE: "'unsafe-inline'",
  NONE: "'none'",
  DATA: 'data:',
  BLOB: 'blob:'
} as const;

export const generateCSP = (options: CSPOptions = {}): string => {
  const { isDevelopment = true } = options;
  
  const directives: Record<string, string[]> = {
    'default-src': [CSP_VALUES.SELF, ...SUPABASE_DOMAINS],
    'script-src': [
      CSP_VALUES.SELF,
      ...(isDevelopment ? [CSP_VALUES.UNSAFE_INLINE] : []),
      ...SUPABASE_DOMAINS
    ],
    'style-src': [
      CSP_VALUES.SELF,
      ...(isDevelopment ? [CSP_VALUES.UNSAFE_INLINE] : []),
      ...SUPABASE_DOMAINS
    ],
    'img-src': [CSP_VALUES.SELF, CSP_VALUES.DATA, CSP_VALUES.BLOB, ...SUPABASE_DOMAINS],
    'connect-src': [CSP_VALUES.SELF, ...SUPABASE_DOMAINS, SUPABASE_WEBSOCKET],
    'font-src': [CSP_VALUES.SELF, CSP_VALUES.DATA],
    'frame-ancestors': [CSP_VALUES.NONE],
    'base-uri': [CSP_VALUES.SELF],
    'form-action': [CSP_VALUES.SELF]
  };
  
  return Object.entries(directives)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

export const applyCSPHeaders = (
  response: Response, 
  options: CSPOptions = {}
): Response => {
  const csp = generateCSP(options);
  
  try {
    response.headers.set('Content-Security-Policy', csp);
    return response;
  } catch {
    const newHeaders = new Headers(response.headers);
    newHeaders.set('Content-Security-Policy', csp);
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }
};