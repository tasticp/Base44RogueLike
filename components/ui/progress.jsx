import React from 'react';
import clsx from 'clsx';

export const Progress = React.forwardRef(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = (value / max) * 100;

    return (
      <div
        ref={ref}
        className={clsx('w-full bg-gray-700 rounded-full overflow-hidden h-2', className)}
        {...props}
      >
        <div
          className="bg-red-600 h-full transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';
