import React from 'react';
import clsx from 'clsx';
import { X } from 'lucide-react';

export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg border border-gray-800 max-w-md w-full mx-4">
        {React.Children.map(children, (child) => {
          if (!child) return null;
          return React.cloneElement(child, { onOpenChange });
        })}
      </div>
    </div>
  );
};

export const DialogTrigger = React.forwardRef(({ ...props }, ref) => (
  <button ref={ref} {...props} />
));
DialogTrigger.displayName = 'DialogTrigger';

export const DialogContent = ({ className, children, onOpenChange, ...props }) => (
  <div className={clsx('relative p-6', className)} {...props}>
    <button
      onClick={() => onOpenChange?.(false)}
      className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
    >
      <X className="w-5 h-5" />
    </button>
    {children}
  </div>
);

export const DialogHeader = ({ className, ...props }) => (
  <div className={clsx('mb-4', className)} {...props} />
);

export const DialogTitle = ({ className, ...props }) => (
  <h2 className={clsx('text-lg font-semibold text-white', className)} {...props} />
);

export const DialogDescription = ({ className, ...props }) => (
  <p className={clsx('text-sm text-gray-400', className)} {...props} />
);

export const DialogFooter = ({ className, ...props }) => (
  <div className={clsx('mt-6 flex gap-2 justify-end', className)} {...props} />
);
