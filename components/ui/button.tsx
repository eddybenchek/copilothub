import * as React from 'react';
import classNames from 'classnames';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        className={classNames(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          {
            // Variants
            'bg-primary text-primary-foreground hover:bg-primary/90': variant === 'primary',
            'border border-border bg-transparent hover:bg-accent hover:text-accent-foreground':
              variant === 'outline',
            'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
            'bg-destructive text-destructive-foreground hover:bg-destructive/90':
              variant === 'destructive',
            // Sizes
            'h-9 px-3 text-sm': size === 'sm',
            'h-10 px-4 py-2': size === 'md',
            'h-11 px-8 text-lg': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
