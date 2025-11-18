'use client';

import * as React from 'react';
import classNames from 'classnames';

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'end';
}

export function DropdownMenu({ trigger, children, align = 'end' }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={classNames(
            'absolute z-50 mt-2 w-56 rounded-md border border-border bg-popover p-1 shadow-md',
            {
              'right-0': align === 'end',
              'left-0': align === 'start',
            }
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm',
        'outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-border" />;
}

