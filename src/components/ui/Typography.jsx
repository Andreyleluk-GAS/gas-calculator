import React from 'react';

/**
 * Typography — GasCalculator UI Kit
 *
 * Exports individual heading/text primitives AND a unified <Text> component.
 *
 * Usage examples:
 *   <H1>Page Title</H1>
 *   <H2 className="text-primary">Section</H2>
 *   <Text variant="body-lg" color="muted">Description...</Text>
 *   <Label>Form label</Label>
 *   <Overline>Category</Overline>
 */

/* ── Heading components ─────────────────────────────────────────── */

export const H1 = ({ children, className = '', gradient = false, ...rest }) => (
  <h1
    className={[
      'text-h1 font-bold text-graphite tracking-tight',
      gradient ? 'bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent' : '',
      className,
    ].join(' ')}
    {...rest}
  >
    {children}
  </h1>
);

export const H2 = ({ children, className = '', ...rest }) => (
  <h2
    className={`text-h2 font-bold text-graphite tracking-tight ${className}`}
    {...rest}
  >
    {children}
  </h2>
);

export const H3 = ({ children, className = '', ...rest }) => (
  <h3
    className={`text-h3 font-semibold text-graphite tracking-tight ${className}`}
    {...rest}
  >
    {children}
  </h3>
);

export const H4 = ({ children, className = '', ...rest }) => (
  <h4
    className={`text-h4 font-semibold text-graphite ${className}`}
    {...rest}
  >
    {children}
  </h4>
);

/* ── Text / Paragraph ───────────────────────────────────────────── */

const TEXT_VARIANTS = {
  'display':  'text-display-lg font-extrabold tracking-tight text-graphite',
  'body-lg':  'text-body-lg font-regular text-graphite',
  'body':     'text-body font-regular text-graphite',
  'body-sm':  'text-body-sm font-regular text-graphite',
  'caption':  'text-caption font-regular',
  'label':    'text-label font-medium',
  'overline': 'text-overline font-semibold uppercase tracking-widest',
};

const TEXT_COLORS = {
  default: 'text-graphite',
  primary:  'text-primary',
  secondary:'text-secondary',
  muted:    'text-utility-muted',
  danger:   'text-danger',
  white:    'text-white',
  inherit:  '',
};

/**
 * @param {'display'|'body-lg'|'body'|'body-sm'|'caption'|'label'|'overline'} variant
 * @param {'default'|'primary'|'secondary'|'muted'|'danger'|'white'|'inherit'} color
 * @param {'p'|'span'|'div'|'li'} as
 */
export const Text = ({
  children,
  variant = 'body',
  color = 'default',
  as: Tag = 'p',
  className = '',
  ...rest
}) => (
  <Tag
    className={[
      TEXT_VARIANTS[variant] ?? TEXT_VARIANTS.body,
      TEXT_COLORS[color] ?? TEXT_COLORS.default,
      className,
    ].join(' ')}
    {...rest}
  >
    {children}
  </Tag>
);

/* ── Label ──────────────────────────────────────────────────────── */

export const Label = ({ children, htmlFor, required = false, className = '', ...rest }) => (
  <label
    htmlFor={htmlFor}
    className={`text-label font-medium text-graphite-500 ${className}`}
    {...rest}
  >
    {children}
    {required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
  </label>
);

/* ── Overline ────────────────────────────────────────────────────── */

export const Overline = ({ children, color = 'primary', className = '', ...rest }) => (
  <span
    className={[
      'text-overline font-semibold uppercase tracking-widest',
      TEXT_COLORS[color] ?? TEXT_COLORS.primary,
      className,
    ].join(' ')}
    {...rest}
  >
    {children}
  </span>
);

/* ── Code / Mono ─────────────────────────────────────────────────── */

export const Code = ({ children, inline = true, className = '', ...rest }) => {
  const Tag = inline ? 'code' : 'pre';
  return (
    <Tag
      className={[
        'font-mono text-body-sm',
        inline
          ? 'bg-surface-100 text-primary px-1.5 py-0.5 rounded border border-surface-200'
          : 'bg-graphite text-white p-4 rounded-lg overflow-x-auto',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </Tag>
  );
};

/* ── Default export: convenience object ─────────────────────────── */
const Typography = { H1, H2, H3, H4, Text, Label, Overline, Code };
export default Typography;
