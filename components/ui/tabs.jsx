import React, { useState } from 'react';
import clsx from 'clsx';

export const Tabs = ({ defaultValue, children, className, ...props }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className={clsx('w-full', className)} {...props}>
      {React.Children.map(children, (child) => {
        if (!child) return null;
        return React.cloneElement(child, { activeTab, setActiveTab });
      })}
    </div>
  );
};

export const TabsList = ({ className, children, ...props }) => (
  <div
    className={clsx('flex border-b border-gray-700 gap-2', className)}
    role="tablist"
    {...props}
  >
    {children}
  </div>
);

export const TabsTrigger = ({ value, activeTab, setActiveTab, className, children, ...props }) => (
  <button
    role="tab"
    onClick={() => setActiveTab(value)}
    className={clsx(
      'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
      activeTab === value
        ? 'border-red-600 text-red-600'
        : 'border-transparent text-gray-400 hover:text-white'
    )}
    {...props}
  >
    {children}
  </button>
);

export const TabsContent = ({ value, activeTab, className, children, ...props }) => (
  <div
    role="tabpanel"
    className={clsx('mt-4', activeTab !== value && 'hidden', className)}
    {...props}
  >
    {children}
  </div>
);
