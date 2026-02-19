import React from 'react';
import clsx from 'clsx';

export const Select = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full">
    <select
      ref={ref}
      className={clsx(
        'w-full px-3 py-2 pr-8 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-colors appearance-none cursor-pointer',
        className
      )}
      {...props}
    />
    <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
      ▾
    </span>
  </div>
));

Select.displayName = 'Select';
