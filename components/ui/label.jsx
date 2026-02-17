import React from 'react';
import clsx from 'clsx';

export const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={clsx('block text-sm font-medium text-gray-300 mb-1', className)}
    {...props}
  />
));

Label.displayName = 'Label';
