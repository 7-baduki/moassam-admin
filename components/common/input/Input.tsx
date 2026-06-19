import { InputHTMLAttributes, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, id, type, className, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  const isPassword = type === 'password';
  const [isVisible, setIsVisible] = useState(false);
  const resolvedType = isPassword && isVisible ? 'text' : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={resolvedType}
          className={cn(
            'h-11 w-full rounded-lg border bg-gray-50 px-3 text-sm text-gray-900 transition-colors outline-none placeholder:text-gray-400 focus:border-primary-500',
            isPassword && 'pr-11',
            error ? 'border-danger-500' : 'border-gray-300',
            className,
          )}
          aria-invalid={!!error}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setIsVisible((prev) => !prev)}
            aria-label={isVisible ? '비밀번호 숨기기' : '비밀번호 표시'}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {isVisible ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-danger-700">{error}</p>}
    </div>
  );
}
