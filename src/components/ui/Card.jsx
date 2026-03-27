import React from 'react';

/**
 * Card — GasCalculator UI Kit
 *
 * @param {'flat'|'elevated'|'outlined'|'glass'} variant
 * @param {'sm'|'md'|'lg'|'none'} padding
 * @param {boolean} hoverable    – adds lift effect on hover
 * @param {boolean} clickable    – adds pointer cursor + active scale
 * @param {string} className     – extra classes
 */
const Card = ({
  children,
  variant = 'elevated',
  padding = 'md',
  hoverable = false,
  clickable = false,
  className = '',
  onClick,
  ...rest
}) => {
  const paddings = {
    none: '',
    sm:   'p-4',
    md:   'p-6',
    lg:   'p-8',
  };

  const variants = {
    flat: 'bg-surface border border-surface-200 shadow-xs',
    elevated: 'bg-surface border border-surface-200/60 shadow-md',
    outlined: 'bg-surface border-2 border-surface-200',
    glass: 'glass shadow-md',
  };

  const interactive = [
    hoverable || clickable
      ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg'
      : '',
    clickable ? 'cursor-pointer active:scale-[0.99] active:shadow-md' : '',
  ].join(' ');

  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={clickable ? (e) => e.key === 'Enter' && onClick?.(e) : undefined}
      className={[
        'rounded-xl overflow-hidden',
        variants[variant] ?? variants.elevated,
        paddings[padding] ?? paddings.md,
        interactive,
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
};

/* ── Subcomponents ── */

Card.Header = function CardHeader({ children, className = '', divider = false }) {
  return (
    <div className={`${divider ? 'border-b border-surface-200 pb-4 mb-4' : 'mb-4'} ${className}`}>
      {children}
    </div>
  );
};
Card.Header.displayName = 'Card.Header';

Card.Title = function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-h4 font-semibold text-graphite leading-tight ${className}`}>
      {children}
    </h3>
  );
};
Card.Title.displayName = 'Card.Title';

Card.Description = function CardDescription({ children, className = '' }) {
  return (
    <p className={`text-body-sm text-utility-muted mt-1 ${className}`}>
      {children}
    </p>
  );
};
Card.Description.displayName = 'Card.Description';

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`${className}`}>{children}</div>;
};
Card.Body.displayName = 'Card.Body';

Card.Footer = function CardFooter({ children, className = '', align = 'right' }) {
  const alignClass = { left: 'justify-start', center: 'justify-center', right: 'justify-end', between: 'justify-between' }[align];
  return (
    <div className={`flex items-center gap-3 mt-4 pt-4 border-t border-surface-200 ${alignClass} ${className}`}>
      {children}
    </div>
  );
};
Card.Footer.displayName = 'Card.Footer';

export default Card;
