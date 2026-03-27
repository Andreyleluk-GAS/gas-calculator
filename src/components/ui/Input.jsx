import React, { useState, forwardRef } from 'react';

/**
 * Input — GasCalculator UI Kit
 *
 * @param {'text'|'email'|'password'|'number'|'tel'|'search'} type
 * @param {'sm'|'md'|'lg'} size
 * @param {string} label        – floating / above-field label
 * @param {string} placeholder
 * @param {string} hint         – helper text below
 * @param {string} error        – error message (also triggers error state)
 * @param {React.ReactNode} leftIcon
 * @param {React.ReactNode} rightIcon
 * @param {boolean} disabled
 * @param {string} className    – wrapper extra classes
 */
const Input = forwardRef(({
  type = 'text',
  size = 'md',
  label,
  placeholder = ' ',
  hint,
  error,
  leftIcon,
  rightIcon,
  disabled = false,
  id,
  className = '',
  inputClassName = '',
  ...rest
}, ref) => {
  const [focused, setFocused] = useState(false);
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

  const hasError = Boolean(error);

  /* ── Size maps ── */
  const sizes = {
    sm: { wrapper: 'h-9',  text: 'text-sm',  px: 'px-3',    labelTop: 'text-xs' },
    md: { wrapper: 'h-11', text: 'text-sm',  px: 'px-4',    labelTop: 'text-xs' },
    lg: { wrapper: 'h-13', text: 'text-base',px: 'px-4',    labelTop: 'text-xs' },
  };
  const sz = sizes[size] ?? sizes.md;

  /* ── Border color states ── */
  const borderClass = hasError
    ? 'border-danger focus:border-danger focus:ring-danger/20'
    : focused
      ? 'border-primary ring-2 ring-primary/15'
      : 'border-surface-300 hover:border-primary/50';

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Label above field */}
      {label && (
        <label
          htmlFor={inputId}
          className={`${sz.labelTop} font-medium transition-colors duration-200 ${
            hasError
              ? 'text-danger'
              : focused
                ? 'text-primary'
                : 'text-graphite-500'
          } ${disabled ? 'opacity-50' : ''}`}
        >
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative flex items-center">
        {/* Left icon */}
        {leftIcon && (
          <span
            className={`absolute left-3 h-4 w-4 flex items-center justify-center pointer-events-none transition-colors duration-200 ${
              hasError ? 'text-danger' : focused ? 'text-primary' : 'text-utility-muted'
            }`}
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={[
            'w-full bg-surface border rounded-lg outline-none',
            'transition-all duration-200',
            'text-graphite placeholder:text-utility-muted',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-100',
            sz.wrapper, sz.text, sz.px,
            leftIcon  ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            borderClass,
            inputClassName,
          ].join(' ')}
          {...rest}
        />

        {/* Right icon */}
        {rightIcon && (
          <span
            className={`absolute right-3 h-4 w-4 flex items-center justify-center pointer-events-none transition-colors duration-200 ${
              hasError ? 'text-danger' : focused ? 'text-primary' : 'text-utility-muted'
            }`}
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        )}
      </div>

      {/* Hint / Error message */}
      {(hint || error) && (
        <p
          className={`text-xs transition-colors duration-200 ${
            hasError ? 'text-danger' : 'text-utility-muted'
          }`}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
