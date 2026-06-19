import { InputHTMLAttributes, useId } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, id, className, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          'h-11 rounded-lg border bg-gray-50 px-3 text-sm text-gray-900 transition-colors outline-none placeholder:text-gray-400 focus:border-primary-500',
          error ? 'border-danger-500' : 'border-gray-300',
          className,
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="text-xs text-danger-700">{error}</p>}
    </div>
  );
}
