import React from 'react';
import clsx from 'clsx';

export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={clsx(
      'w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors resize-none',
      className
    )}
    {...props}
  />
));

Textarea.displayName = 'Textarea';
