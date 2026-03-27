import React from 'react';

/**
 * Button — GasCalculator UI Kit
 *
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'|'icon'} size
 * @param {boolean} loading
 * @param {boolean} disabled
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 * @param {'button'|'submit'|'reset'} type
 * @param {string} className  – extra Tailwind classes
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  type = 'button',
  className = '',
  onClick,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  /* ── Base classes ── */
  const base = [
    'inline-flex items-center justify-center gap-2',
    'font-semibold leading-none select-none',
    'border transition-all rounded-lg',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'active:scale-[0.97]',
    'duration-200',
  ].join(' ');

  /* ── Size classes ── */
  const sizes = {
    sm:   'h-8 px-3 text-sm gap-1.5 rounded',
    md:   'h-10 px-5 text-sm',
    lg:   'h-12 px-6 text-base',
    xl:   'h-14 px-8 text-base',
    icon: 'h-10 w-10 p-0',
  };

  /* ── Variant classes ── */
  const variants = {
    primary: [
      'bg-primary text-white border-primary',
      'hover:bg-primary-600 hover:border-primary-600 hover:shadow-md',
      'focus-visible:ring-primary',
      isDisabled ? 'opacity-50 cursor-not-allowed shadow-none' : 'cursor-pointer',
    ].join(' '),

    secondary: [
      'bg-secondary text-graphite border-secondary',
      'hover:bg-secondary-600 hover:border-secondary-600 hover:shadow-md',
      'focus-visible:ring-secondary',
      isDisabled ? 'opacity-50 cursor-not-allowed shadow-none' : 'cursor-pointer',
    ].join(' '),

    outline: [
      'bg-transparent text-primary border-primary',
      'hover:bg-primary-50 hover:shadow-sm',
      'focus-visible:ring-primary',
      isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ].join(' '),

    ghost: [
      'bg-transparent text-graphite border-transparent',
      'hover:bg-surface-100 hover:border-surface-200',
      'focus-visible:ring-primary',
      isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ].join(' '),

    danger: [
      'bg-danger text-white border-danger',
      'hover:bg-danger-dark hover:border-danger-dark hover:shadow-md',
      'focus-visible:ring-danger',
      isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    ].join(' '),
  };

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={`${base} ${sizes[size] ?? sizes.md} ${variants[variant]} ${className}`}
      {...rest}
    >
      {/* Loading spinner */}
      {loading && (
        <svg
          className="animate-spin -ml-0.5 h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}

      {/* Left icon (hidden during loading) */}
      {!loading && leftIcon && (
        <span className="shrink-0 h-4 w-4 flex items-center justify-center" aria-hidden="true">
          {leftIcon}
        </span>
      )}

      {/* Label */}
      {children && <span>{children}</span>}

      {/* Right icon */}
      {rightIcon && !loading && (
        <span className="shrink-0 h-4 w-4 flex items-center justify-center" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
};

export default Button;
