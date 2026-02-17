import React from 'react';
import clsx from 'clsx';

export const Input = React.forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={clsx(
      'w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors',
      className
    )}
    {...props}
  />
));

Input.displayName = 'Input';
