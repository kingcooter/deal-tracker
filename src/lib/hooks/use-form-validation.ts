"use client";

import * as React from "react";

type ValidationRule<T> = {
  validate: (value: T) => boolean;
  message: string;
};

type FieldValidation<T> = {
  required?: boolean | string;
  minLength?: { value: number; message?: string };
  maxLength?: { value: number; message?: string };
  pattern?: { value: RegExp; message?: string };
  custom?: ValidationRule<T>[];
};

type FormValidation<T extends Record<string, unknown>> = {
  [K in keyof T]?: FieldValidation<T[K]>;
};

type FormErrors<T extends Record<string, unknown>> = {
  [K in keyof T]?: string;
};

interface UseFormValidationReturn<T extends Record<string, unknown>> {
  errors: FormErrors<T>;
  validate: (data: T) => boolean;
  validateField: (field: keyof T, value: T[keyof T]) => string | undefined;
  clearError: (field: keyof T) => void;
  clearErrors: () => void;
  setError: (field: keyof T, message: string) => void;
  isValid: boolean;
}

/**
 * Hook for form validation with customizable rules
 *
 * @example
 * const { errors, validate, validateField } = useFormValidation<DealForm>({
 *   name: { required: "Deal name is required" },
 *   email: {
 *     pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" }
 *   }
 * });
 */
export function useFormValidation<T extends Record<string, unknown>>(
  rules: FormValidation<T>
): UseFormValidationReturn<T> {
  const [errors, setErrors] = React.useState<FormErrors<T>>({});

  const validateField = React.useCallback(
    (field: keyof T, value: T[keyof T]): string | undefined => {
      const fieldRules = rules[field];
      if (!fieldRules) return undefined;

      const stringValue = typeof value === "string" ? value : String(value ?? "");

      // Required check
      if (fieldRules.required) {
        const isEmpty = value === undefined || value === null || stringValue.trim() === "";
        if (isEmpty) {
          return typeof fieldRules.required === "string"
            ? fieldRules.required
            : `${String(field)} is required`;
        }
      }

      // Skip other validations if value is empty and not required
      if (!stringValue) return undefined;

      // Min length check
      if (fieldRules.minLength && stringValue.length < fieldRules.minLength.value) {
        return (
          fieldRules.minLength.message ||
          `${String(field)} must be at least ${fieldRules.minLength.value} characters`
        );
      }

      // Max length check
      if (fieldRules.maxLength && stringValue.length > fieldRules.maxLength.value) {
        return (
          fieldRules.maxLength.message ||
          `${String(field)} must be at most ${fieldRules.maxLength.value} characters`
        );
      }

      // Pattern check
      if (fieldRules.pattern && !fieldRules.pattern.value.test(stringValue)) {
        return fieldRules.pattern.message || `${String(field)} is invalid`;
      }

      // Custom validations
      if (fieldRules.custom) {
        for (const rule of fieldRules.custom) {
          if (!rule.validate(value)) {
            return rule.message;
          }
        }
      }

      return undefined;
    },
    [rules]
  );

  const validate = React.useCallback(
    (data: T): boolean => {
      const newErrors: FormErrors<T> = {};
      let isValid = true;

      for (const field of Object.keys(rules) as Array<keyof T>) {
        const error = validateField(field, data[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }

      setErrors(newErrors);
      return isValid;
    },
    [rules, validateField]
  );

  const clearError = React.useCallback((field: keyof T) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearErrors = React.useCallback(() => {
    setErrors({});
  }, []);

  const setError = React.useCallback((field: keyof T, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    errors,
    validate,
    validateField,
    clearError,
    clearErrors,
    setError,
    isValid,
  };
}

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/,
  zip: /^\d{5}(-\d{4})?$/,
  url: /^https?:\/\/.+/,
};
