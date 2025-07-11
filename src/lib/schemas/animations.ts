import { z } from 'zod';

export enum AnimationType {
  fade = 'fade',
  fly = 'fly',
  scale = 'scale'
}

export const AnimationConfigSchema = z.object({
  type: z.enum(['fade', 'fly', 'scale']),
  duration: z.number().min(0).optional(),
  delay: z.number().min(0).optional(),
  easing: z.string().optional()
});

export type AnimationConfig = z.infer<typeof AnimationConfigSchema>;