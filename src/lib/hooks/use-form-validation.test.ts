import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFormValidation, validationPatterns } from './use-form-validation';

type TestForm = {
  name: string;
  email: string;
  age: number;
};

describe('useFormValidation', () => {
  it('should initialize with no errors', () => {
    const { result } = renderHook(() =>
      useFormValidation<TestForm>({
        name: { required: true },
      })
    );

    expect(result.current.errors).toEqual({});
    expect(result.current.isValid).toBe(true);
  });

  it('should validate required fields', () => {
    const { result } = renderHook(() =>
      useFormValidation<TestForm>({
        name: { required: 'Name is required' },
      })
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate({ name: '', email: '', age: 0 });
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.name).toBe('Name is required');
  });

  it('should pass validation for valid data', () => {
    const { result } = renderHook(() =>
      useFormValidation<TestForm>({
        name: { required: true },
      })
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate({ name: 'John', email: '', age: 0 });
    });

    expect(isValid!).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it('should validate minLength', () => {
    const { result } = renderHook(() =>
      useFormValidation<TestForm>({
        name: { minLength: { value: 3, message: 'Min 3 chars' } },
      })
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate({ name: 'Jo', email: '', age: 0 });
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.name).toBe('Min 3 chars');
  });

  it('should validate maxLength', () => {
    const { result } = renderHook(() =>
      useFormValidation<TestForm>({
        name: { maxLength: { value: 5, message: 'Max 5 chars' } },
      })
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate({ name: 'Jonathan', email: '', age: 0 });
    });

    expect(isValid!).toBe(false);
    expect(result.current.errors.name).toBe('Max 5 chars');
  });

  it('should validate pattern', () => {
    const { result } = renderHook(() =>
      useFormValidation<TestForm>({
        email: {
          pattern: { value: validationPatterns.email, message: 'Invalid email' },
        },
      })
    );

    act(() => {
      result.current.validate({ name: '', email: 'invalid', age: 0 });
    });

    expect(result.current.errors.email).toBe('Invalid email');

    act(() => {
      result.current.validate({ name: '', email: 'test@example.com', age: 0 });
    });

    expect(result.current.errors.email).toBeUndefined();
  });

  it('should validate single field', () => {
    const { result } = renderHook(() =>
      useFormValidation<TestForm>({
        name: { required: 'Required' },
        email: { pattern: { value: validationPatterns.email, message: 'Invalid' } },
      })
    );

    const nameError = result.current.validateField('name', '');
    expect(nameError).toBe('Required');

    const emailError = result.current.validateField('email', 'bad');
    expect(emailError).toBe('Invalid');

    const validEmail = result.current.validateField('email', 'test@test.com');
    expect(validEmail).toBeUndefined();
  });

  it('should clear individual errors', () => {
    const { result } = renderHook(() =>
      useFormValidation<TestForm>({
        name: { required: true },
        email: { required: true },
      })
    );

    act(() => {
      result.current.validate({ name: '', email: '', age: 0 });
    });

    expect(result.current.errors.name).toBeDefined();
    expect(result.current.errors.email).toBeDefined();

    act(() => {
      result.current.clearError('name');
    });

    expect(result.current.errors.name).toBeUndefined();
    expect(result.current.errors.email).toBeDefined();
  });

  it('should clear all errors', () => {
    const { result } = renderHook(() =>
      useFormValidation<TestForm>({
        name: { required: true },
        email: { required: true },
      })
    );

    act(() => {
      result.current.validate({ name: '', email: '', age: 0 });
    });

    expect(Object.keys(result.current.errors).length).toBe(2);

    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.errors).toEqual({});
  });

  it('should set custom errors', () => {
    const { result } = renderHook(() =>
      useFormValidation<TestForm>({})
    );

    act(() => {
      result.current.setError('name', 'Custom error');
    });

    expect(result.current.errors.name).toBe('Custom error');
  });

  it('should skip non-required validation for empty values', () => {
    const { result } = renderHook(() =>
      useFormValidation<TestForm>({
        email: { pattern: { value: validationPatterns.email, message: 'Invalid' } },
      })
    );

    let isValid: boolean;
    act(() => {
      isValid = result.current.validate({ name: '', email: '', age: 0 });
    });

    // Empty email should pass since it's not required
    expect(isValid!).toBe(true);
    expect(result.current.errors.email).toBeUndefined();
  });
});

describe('validationPatterns', () => {
  it('should validate emails correctly', () => {
    expect(validationPatterns.email.test('test@example.com')).toBe(true);
    expect(validationPatterns.email.test('user.name@domain.co')).toBe(true);
    expect(validationPatterns.email.test('invalid')).toBe(false);
    expect(validationPatterns.email.test('no@domain')).toBe(false);
  });

  it('should validate phone numbers', () => {
    expect(validationPatterns.phone.test('555-123-4567')).toBe(true);
    expect(validationPatterns.phone.test('(555) 123-4567')).toBe(true);
    expect(validationPatterns.phone.test('+1 555 123 4567')).toBe(true);
    expect(validationPatterns.phone.test('abc')).toBe(false);
  });

  it('should validate zip codes', () => {
    expect(validationPatterns.zip.test('12345')).toBe(true);
    expect(validationPatterns.zip.test('12345-6789')).toBe(true);
    expect(validationPatterns.zip.test('1234')).toBe(false);
    expect(validationPatterns.zip.test('abcde')).toBe(false);
  });
});
