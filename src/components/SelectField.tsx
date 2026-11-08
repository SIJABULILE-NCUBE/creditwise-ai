import React, { useId } from 'react';

export interface SelectFieldProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const SelectField: React.FC<SelectFieldProps> = ({ label, placeholder, options, value, onChange, error }) => {
  const id = useId();
  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-mainText">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        className={`h-12 w-full rounded-input border bg-surface px-3 text-mainText focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-1 ${error ? 'border-appError' : 'border-inputBorder'}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-appError">
          {error}
        </p>
      )}
    </div>
  );
};
