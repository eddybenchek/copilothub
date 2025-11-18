import * as React from 'react';
import classNames from 'classnames';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={classNames(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        {
          'border-transparent bg-primary text-primary-foreground': variant === 'default',
          'border-transparent bg-secondary text-secondary-foreground': variant === 'secondary',
          'text-foreground': variant === 'outline',
          'border-transparent bg-green-600 text-white': variant === 'success',
          'border-transparent bg-yellow-600 text-white': variant === 'warning',
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };

