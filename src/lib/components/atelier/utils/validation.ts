export type ValidationRule = {
	test: (value: any) => boolean;
	message: string;
};

export type ValidationResult = {
	valid: boolean;
	errors: string[];
};

export const validators = {
	required: (message = 'This field is required'): ValidationRule => ({
		test: (value) => value !== null && value !== undefined && value !== '',
		message
	}),

	minLength: (length: number, message?: string): ValidationRule => ({
		test: (value) => !value || String(value).length >= length,
		message: message ?? `Must be at least ${length} characters`
	}),

	maxLength: (length: number, message?: string): ValidationRule => ({
		test: (value) => !value || String(value).length <= length,
		message: message ?? `Must be no more than ${length} characters`
	}),

	email: (message = 'Invalid email address'): ValidationRule => ({
		test: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)),
		message
	}),

	phone: (message = 'Invalid phone number'): ValidationRule => ({
		test: (value) => !value || /^[\d\s\-+()]+$/.test(String(value)),
		message
	}),

	pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
		test: (value) => !value || regex.test(String(value)),
		message
	}),

	min: (min: number, message?: string): ValidationRule => ({
		test: (value) => !value || Number(value) >= min,
		message: message ?? `Must be at least ${min}`
	}),

	max: (max: number, message?: string): ValidationRule => ({
		test: (value) => !value || Number(value) <= max,
		message: message ?? `Must be no more than ${max}`
	}),

	custom: (fn: (value: any) => boolean, message: string): ValidationRule => ({
		test: fn,
		message
	})
};

export function validate(value: any, rules: ValidationRule[]): ValidationResult {
	const errors: string[] = [];

	for (const rule of rules) {
		if (!rule.test(value)) {
			errors.push(rule.message);
		}
	}

	return {
		valid: errors.length === 0,
		errors
	};
}

export function createValidator(rules: ValidationRule[]) {
	return (value: any) => validate(value, rules);
}

export function validateForm<T extends Record<string, any>>(
	values: T,
	schema: Record<keyof T, ValidationRule[]>
): Record<keyof T, ValidationResult> {
	const results = {} as Record<keyof T, ValidationResult>;

	for (const field in schema) {
		results[field] = validate(values[field], schema[field]);
	}

	return results;
}

export function isFormValid<T extends Record<string, any>>(
	results: Record<keyof T, ValidationResult>
): boolean {
	return Object.values(results).every((result) => result.valid);
}
