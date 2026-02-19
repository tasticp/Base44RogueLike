import React from 'react';
import clsx from 'clsx';

export const Progress = React.forwardRef(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const safeMax = max > 0 ? max : 0;
    const rawPercentage = safeMax > 0 ? (value / safeMax) * 100 : 0;
    const clampedPercentage = Math.max(0, Math.min(rawPercentage, 100));

    return (
      <div
        ref={ref}
        className={clsx('w-full bg-gray-700 rounded-full overflow-hidden h-2', className)}
        role="progressbar"
        aria-valuenow={Math.round(clampedPercentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        {...props}
      >
        <div
          className="bg-red-600 h-full transition-all duration-300"
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';
