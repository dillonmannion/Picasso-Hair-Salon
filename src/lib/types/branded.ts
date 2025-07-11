import { z } from 'zod';

declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };
type Branded<T, B> = T & Brand<B>;

export type UserId = Branded<string, 'UserId'>;
export type ServiceId = Branded<string, 'ServiceId'>;
export type StaffId = Branded<string, 'StaffId'>;
export type AppointmentId = Branded<string, 'AppointmentId'>;
export type CustomerId = Branded<string, 'CustomerId'>;
export type BarberId = Branded<string, 'BarberId'>;
export type ProfileId = Branded<string, 'ProfileId'>;

export const createUserId = (id: string): UserId => {
  return id as UserId;
};

export const createServiceId = (id: string): ServiceId => {
  return id as ServiceId;
};

export const createStaffId = (id: string): StaffId => {
  return id as StaffId;
};

export const createAppointmentId = (id: string): AppointmentId => {
  return id as AppointmentId;
};

export const createCustomerId = (id: string): CustomerId => {
  return id as CustomerId;
};

export const createBarberId = (id: string): BarberId => {
  return id as BarberId;
};

export const createProfileId = (id: string): ProfileId => {
  return id as ProfileId;
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

export const isAppointmentId = (value: unknown): value is AppointmentId => {
  return typeof value === 'string';
};

export const isCustomerId = (value: unknown): value is CustomerId => {
  return typeof value === 'string';
};

export const isBarberId = (value: unknown): value is BarberId => {
  return typeof value === 'string';
};

export const isProfileId = (value: unknown): value is ProfileId => {
  return typeof value === 'string';
};

export const UserIdSchema = z.string().transform((val): UserId => createUserId(val));

export const ServiceIdSchema = z.string().transform((val): ServiceId => createServiceId(val));

export const StaffIdSchema = z.string().transform((val): StaffId => createStaffId(val));

export const AppointmentIdSchema = z
  .string()
  .transform((val): AppointmentId => createAppointmentId(val));

export const CustomerIdSchema = z.string().transform((val): CustomerId => createCustomerId(val));

export const BarberIdSchema = z.string().transform((val): BarberId => createBarberId(val));

export const ProfileIdSchema = z.string().transform((val): ProfileId => createProfileId(val));
