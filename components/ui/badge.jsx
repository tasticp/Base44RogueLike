import React from 'react';
import clsx from 'clsx';

export const Badge = React.forwardRef(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-gray-700 text-white',
    primary: 'bg-red-600 text-white',
    secondary: 'bg-yellow-600 text-white',
    success: 'bg-green-600 text-white',
    destructive: 'bg-red-600 text-white',
    outline: 'border border-gray-600 text-gray-300',
  };

  return (
    <div
      ref={ref}
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});

Badge.displayName = 'Badge';
