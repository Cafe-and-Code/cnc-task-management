import React, { useState, useEffect } from 'react';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'radio';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
  validation?: (value: any) => string | null;
  mobileOptimized?: boolean;
  inputMode?: 'text' | 'numeric' | 'decimal' | 'tel' | 'email' | 'url' | 'search';
  autoComplete?: string;
}

interface MobileFormProps {
  fields: FormField[];
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  className?: string;
  layout?: 'stacked' | 'grouped' | 'stepped';
  showValidationErrors?: boolean;
}

export const MobileForm: React.FC<MobileFormProps> = ({
  fields,
  initialValues = {},
  onSubmit,
  onCancel,
  submitText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
  className = '',
  layout = 'stacked',
  showValidationErrors = true,
}) => {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      return field.validation(value);
    }

    return null;
  };

  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const error = validateField(field, values[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    return newErrors;
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    const field = fields.find(f => f.name === fieldName);
    if (field) {
      const error = validateField(field, values[fieldName]);
      if (error) {
        setErrors(prev => ({ ...prev, [fieldName]: error }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validateForm();
    setErrors(newErrors);
    setTouched(fields.reduce((acc, field) => ({ ...acc, [field.name]: true }), {}));

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const renderField = (field: FormField) => {
    const error = touched[field.name] ? errors[field.name] : '';
    const hasError = !!error;

    const baseInputProps = {
      id: field.name,
      value: values[field.name] || '',
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
      ) => handleFieldChange(field.name, e.target.value),
      onBlur: () => handleFieldBlur(field.name),
      required: field.required,
      className: `
        w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
        ${hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600'}
        ${isMobile && field.mobileOptimized ? 'text-lg' : 'text-sm'}
        ${field.type === 'textarea' ? 'min-h-[100px] resize-none' : ''}
        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
        placeholder-gray-400 dark:placeholder-gray-500
      `,
      placeholder: field.placeholder,
      autoComplete: field.autoComplete,
    };

    const inputProps: any = { ...baseInputProps };

    // Add mobile-specific attributes
    if (field.inputMode) {
      inputProps.inputMode = field.inputMode;
    }

    // Add numeric field attributes
    if (field.type === 'number') {
      inputProps.type = 'number';
      inputProps.inputMode = 'numeric';
      inputProps.pattern = '[0-9]*';
    } else if (field.type === 'tel') {
      inputProps.type = 'tel';
      inputProps.inputMode = 'tel';
    } else if (field.type === 'email') {
      inputProps.type = 'email';
      inputProps.inputMode = 'email';
    }

    switch (field.type) {
      case 'textarea':
        return <textarea {...inputProps} />;

      case 'select':
        return (
          <select {...inputProps}>
            <option value="">{field.placeholder || `Select ${field.label}`}</option>
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={field.name}
              checked={!!values[field.name]}
              onChange={e => handleFieldChange(field.name, e.target.checked)}
              onBlur={() => handleFieldBlur(field.name)}
              className="h-5 w-5 text-brand-primary focus:ring-brand-primary border-gray-300 rounded"
            />
            <label
              htmlFor={field.name}
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              {field.label}
            </label>
          </div>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-3">
                <input
                  type="radio"
                  id={`${field.name}-${option.value}`}
                  name={field.name}
                  value={option.value}
                  checked={values[field.name] === option.value}
                  onChange={e => handleFieldChange(field.name, e.target.value)}
                  onBlur={() => handleFieldBlur(field.name)}
                  className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300"
                />
                <label
                  htmlFor={`${field.name}-${option.value}`}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return <input {...inputProps} />;
    }
  };

  const renderFieldGroup = (field: FormField) => {
    if (field.type === 'checkbox' || field.type === 'radio') {
      return (
        <div key={field.name} className={layout === 'grouped' ? 'mb-6' : 'mb-4'}>
          {renderField(field)}
          {showValidationErrors && errors[field.name] && touched[field.name] && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors[field.name]}</p>
          )}
        </div>
      );
    }

    return (
      <div key={field.name} className={layout === 'grouped' ? 'mb-6' : 'mb-4'}>
        {field.type !== 'checkbox' && field.type !== 'radio' && (
          <label
            htmlFor={field.name}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        {renderField(field)}
        {showValidationErrors && errors[field.name] && touched[field.name] && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors[field.name]}</p>
        )}
      </div>
    );
  };

  if (isMobile) {
    return (
      <div className={`fixed inset-0 bg-white dark:bg-gray-800 z-50 ${className}`}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {layout === 'stepped' ? 'Complete Form' : 'Form'}
            </h2>
            {onCancel && (
              <button
                onClick={onCancel}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Mobile Form Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(renderFieldGroup)}
            </form>
          </div>

          {/* Mobile Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex space-x-3">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting || loading}
                  className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {cancelText}
                </button>
              )}
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting || loading}
                className="flex-1 px-4 py-3 text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {isSubmitting || loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  submitText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {fields.map(renderFieldGroup)}

      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting || loading}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {cancelText}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="px-6 py-2 text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {isSubmitting || loading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            submitText
          )}
        </button>
      </div>
    </form>
  );
};

// Mobile-friendly input component
export const MobileInput: React.FC<{
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'number';
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  inputMode?: 'text' | 'numeric' | 'tel' | 'email';
  autoComplete?: string;
}> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  error,
  className = '',
  inputMode,
  autoComplete,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const inputProps: any = {
    type,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    placeholder,
    required,
    className: `
      w-full px-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent
      ${error ? 'border-red-500 focus:ring-red-500' : isFocused ? 'border-brand-primary' : 'border-gray-300 dark:border-gray-600'}
      bg-white dark:bg-gray-700 text-gray-900 dark:text-white
      placeholder-gray-400 dark:placeholder-gray-500
      ${className}
    `,
    inputMode,
    autoComplete,
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input {...inputProps} />
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};
