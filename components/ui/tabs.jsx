import React, { useState, createContext, useContext } from 'react';
import clsx from 'clsx';

const TabsContext = createContext(null);

export const Tabs = ({ defaultValue, children, className, ...props }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={clsx('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
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

export const TabsTrigger = ({ value, className, children, ...props }) => {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('TabsTrigger must be used within Tabs');
  }

  const { activeTab, setActiveTab } = context;

  return (
    <button
      role="tab"
      type="button"
      onClick={() => setActiveTab(value)}
      className={clsx(
        'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
        activeTab === value
          ? 'border-red-600 text-red-600'
          : 'border-transparent text-gray-400 hover:text-white',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, className, children, ...props }) => {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error('TabsContent must be used within Tabs');
  }

  const { activeTab } = context;

  return (
    <div
      role="tabpanel"
      className={clsx('mt-4', activeTab !== value && 'hidden', className)}
      {...props}
    >
      {children}
    </div>
  );
};
