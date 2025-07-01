import { z } from 'zod';

export const UuidSchema = z.string().uuid({
  message: 'Invalid UUID format'
});

export const DateTimeSchema = z.string().datetime({
  message: 'Invalid datetime format'
});

export const ProfileSchema = z.object({
  id: UuidSchema,
  username: z.string().min(3, 'Username must be at least 3 characters').max(20, 'Username must be at most 20 characters').nullable(),
  full_name: z.string().max(100, 'Full name must be at most 100 characters').nullable(),
  avatar_url: z.string().url('Invalid avatar URL').nullable(),
  created_at: DateTimeSchema,
  updated_at: DateTimeSchema
}).strict();

export const OAuthCallbackParamsSchema = z.object({
  code: z.string({ required_error: 'Authorization code is required' }).min(1, 'Authorization code is required'),
  next: z.string().optional()
}).strict();

export const OAuthErrorParamsSchema = z.object({
  error: z.string().min(1, 'Error type is required'),
  error_code: z.string().optional(),
  error_description: z.string().optional()
}).strict();

export const ButtonVariantSchema = z.enum(['primary', 'secondary', 'danger']);
export const ButtonSizeSchema = z.enum(['small', 'medium', 'large']);

export const ButtonPropsSchema = z.object({
  variant: ButtonVariantSchema.default('primary'),
  size: ButtonSizeSchema.default('medium'),
  disabled: z.boolean().optional(),
  onclick: z.function().optional(),
  class: z.string().optional()
}).passthrough();

export const SupabaseErrorSchema = z.object({
  message: z.string(),
  status: z.number().optional(),
  code: z.string().optional()
}).strict();

export type Profile = z.infer<typeof ProfileSchema>;
export type OAuthCallbackParams = z.infer<typeof OAuthCallbackParamsSchema>;
export type OAuthErrorParams = z.infer<typeof OAuthErrorParamsSchema>;
export type ButtonProps = z.infer<typeof ButtonPropsSchema>;
export type SupabaseError = z.infer<typeof SupabaseErrorSchema>;