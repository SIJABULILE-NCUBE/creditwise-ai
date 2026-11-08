import React, { useState, useId } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helperText?: string;
  error?: string;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  helperText,
  error,
  type = 'text',
  className = '',
  id: customId,
  ...props
}) => {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const isPassword = type === 'password';
  const [showPassword, setShowPassword] = useState(false);

  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block mb-1.5 text-sm font-medium text-mainText"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type={effectiveType}
          className={`w-full h-12 px-3.5 bg-white text-mainText rounded-input border transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 ${
            error
              ? 'border-appError text-mainText pr-10'
              : 'border-inputBorder hover:border-secondaryText focus:border-primary'
          } ${isPassword ? 'pr-11' : ''} ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-secondaryText hover:text-mainText focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}

        {error && !isPassword && (
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-appError">
            <AlertCircle className="h-5 w-5" />
          </div>
        )}
      </div>

      {error ? (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 flex items-center gap-1 text-sm text-appError"
          role="alert"
        >
          {isPassword && <AlertCircle className="h-4 w-4 shrink-0" />}
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p id={`${inputId}-helper`} className="mt-1.5 text-sm text-secondaryText">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
