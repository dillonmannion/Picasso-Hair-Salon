import { z } from 'zod';

declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };
type Branded<T, B> = T & Brand<B>;

export type UserId = Branded<string, 'UserId'>;
export type ServiceId = Branded<string, 'ServiceId'>;
export type StaffId = Branded<string, 'StaffId'>;

export const createUserId = (id: string): UserId => {
  return id as UserId;
};

export const createServiceId = (id: string): ServiceId => {
  return id as ServiceId;
};

export const createStaffId = (id: string): StaffId => {
  return id as StaffId;
};

export const isUserId = (value: unknown): value is UserId => {
  return typeof value === 'string';
};

export const isServiceId = (value: unknown): value is ServiceId => {
  return typeof value === 'string';
};

export const isStaffId = (value: unknown): value is StaffId => {
  return typeof value === 'string';
};

export const UserIdSchema = z.string().transform((val): UserId => createUserId(val));

export const ServiceIdSchema = z.string().transform((val): ServiceId => createServiceId(val));

export const StaffIdSchema = z.string().transform((val): StaffId => createStaffId(val));