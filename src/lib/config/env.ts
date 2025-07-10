import { z } from 'zod';

export const EnvSchema = z.object({
  PUBLIC_SUPABASE_URL: z.string().url().describe('Supabase project URL'),
  PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).describe('Supabase anonymous key for client-side access'),
  SUPABASE_SERVICE_KEY: z.string().min(1).describe('Supabase service key for server-side operations'),
  DATABASE_URL: z.string().min(1).describe('PostgreSQL connection string'),
  NODE_ENV: z.enum(['development', 'production', 'test']).describe('Application environment'),
});

export type Env = z.infer<typeof EnvSchema>;

function formatZodError(error: z.ZodError): string {
  const fieldErrors = error.errors.map(err => {
    const path = err.path.join('.');
    return `${path}: ${err.message}`;
  }).join(', ');
  
  return `Environment validation failed: ${fieldErrors}`;
}

export function validateEnv(): Env {
  try {
    return EnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(formatZodError(error));
    }
    throw error;
  }
}

export const env = validateEnv();