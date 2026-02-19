import React from 'react';
import clsx from 'clsx';

export const Select = React.forwardRef(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={clsx(
      'w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors appearance-none cursor-pointer',
      className
    )}
    {...props}
  />
));

Select.displayName = 'Select';
