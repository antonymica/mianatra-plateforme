import type { ReactNode } from 'react';

type FormFieldProps = {
  children: ReactNode;
  label: string;
  htmlFor: string;
  helper?: string;
  required?: boolean;
};

export function FormField({ children, helper, htmlFor, label, required = false }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-bold text-base-content" htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </label>
      </div>
      {children}
      {helper && <p className="text-xs leading-5 text-base-content/55">{helper}</p>}
    </div>
  );
}
