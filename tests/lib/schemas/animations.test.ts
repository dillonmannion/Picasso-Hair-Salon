import { describe, it, expect } from 'vitest';
import {
  AnimationType,
  AnimationConfigSchema,
  type AnimationConfig
} from '../../../src/lib/schemas/animations';

describe('Animation System Schema', () => {
  describe('AnimationType enum', () => {
    it('should include fade animation type', () => {
      expect(AnimationType.fade).toBe('fade');
    });

    it('should include fly animation type', () => {
      expect(AnimationType.fly).toBe('fly');
    });

    it('should include scale animation type', () => {
      expect(AnimationType.scale).toBe('scale');
    });
  });

  describe('AnimationConfigSchema', () => {
    it('should accept valid animation configuration', () => {
      const validConfig = {
        type: 'fade',
        duration: 300,
        delay: 100,
        easing: 'ease-in-out'
      };

      const result = AnimationConfigSchema.parse(validConfig);
      
      expect(result).toEqual(validConfig);
    });

    it('should accept configuration with only required fields', () => {
      const minimalConfig = {
        type: 'fly'
      };

      const result = AnimationConfigSchema.parse(minimalConfig);
      
      expect(result.type).toBe('fly');
      expect(result.duration).toBeUndefined();
      expect(result.delay).toBeUndefined();
      expect(result.easing).toBeUndefined();
    });

    it('should reject invalid animation type', () => {
      const invalidConfig = {
        type: 'invalid-type',
        duration: 300
      };

      expect(() => AnimationConfigSchema.parse(invalidConfig)).toThrow();
    });

    it('should reject negative duration', () => {
      const invalidConfig = {
        type: 'fade',
        duration: -100
      };

      expect(() => AnimationConfigSchema.parse(invalidConfig)).toThrow();
    });

    it('should reject negative delay', () => {
      const invalidConfig = {
        type: 'scale',
        delay: -50
      };

      expect(() => AnimationConfigSchema.parse(invalidConfig)).toThrow();
    });

    it('should accept zero duration', () => {
      const config = {
        type: 'fade',
        duration: 0
      };

      const result = AnimationConfigSchema.parse(config);
      expect(result.duration).toBe(0);
    });

    it('should accept zero delay', () => {
      const config = {
        type: 'fly',
        delay: 0
      };

      const result = AnimationConfigSchema.parse(config);
      expect(result.delay).toBe(0);
    });

    it('should accept all valid animation types', () => {
      const types = ['fade', 'fly', 'scale'];
      
      types.forEach(type => {
        const config = { type };
        const result = AnimationConfigSchema.parse(config);
        expect(result.type).toBe(type);
      });
    });
  });

  describe('AnimationConfig type', () => {
    it('should be inferred from AnimationConfigSchema', () => {
      const config: AnimationConfig = {
        type: 'fade',
        duration: 500,
        delay: 0,
        easing: 'ease-out'
      };

      const result = AnimationConfigSchema.parse(config);
      expect(result).toEqual(config);
    });

    it('should accept partial configuration', () => {
      const config: AnimationConfig = {
        type: 'scale'
      };

      const result = AnimationConfigSchema.parse(config);
      expect(result.type).toBe('scale');
    });
  });
});