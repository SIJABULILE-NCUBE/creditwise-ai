import React, { useState, useId, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { parseMoney, formatMoneyWithoutPrefix } from '../lib/money';

export interface MoneyFieldProps {
  label: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

export const MoneyField: React.FC<MoneyFieldProps> = ({
  label,
  value: controlledValue,
  defaultValue,
  onChange,
  onBlur,
  error,
  helperText,
  placeholder = '0.00',
  id: customId,
  disabled = false,
}) => {
  const generatedId = useId();
  const inputId = customId || generatedId;

  const initialVal = controlledValue !== undefined ? String(controlledValue) : defaultValue !== undefined ? String(defaultValue) : '';
  const [displayValue, setDisplayValue] = useState(initialVal);

  useEffect(() => {
    if (controlledValue !== undefined) {
      setDisplayValue(String(controlledValue));
    }
  }, [controlledValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value);
    onChange?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const parsed = parseMoney(displayValue);
    if (parsed !== null) {
      const formatted = formatMoneyWithoutPrefix(parsed);
      setDisplayValue(formatted);
      e.target.value = formatted;
      onChange?.(e as unknown as React.ChangeEvent<HTMLInputElement>);
    }
    onBlur?.(e);
  };

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block mb-1.5 text-sm font-medium text-mainText"
      >
        {label}
      </label>

      <div className="relative flex items-center">
        <div className="pointer-events-none absolute left-3 flex items-center justify-center font-mono font-medium text-secondaryText">
          R
        </div>

        <input
          id={inputId}
          type="text"
          inputMode="decimal"
          disabled={disabled}
          placeholder={placeholder}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full h-12 pl-8 pr-3.5 bg-white font-mono text-mainText rounded-input border transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 ${
            error
              ? 'border-appError pr-10'
              : 'border-inputBorder hover:border-secondaryText focus:border-primary'
          } ${disabled ? 'opacity-40 cursor-not-allowed bg-pageBackground' : ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        />

        {error && (
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
