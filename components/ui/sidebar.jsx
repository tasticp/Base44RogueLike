import React, { useState, createContext, useContext } from 'react';
import clsx from 'clsx';
import { Menu, X } from 'lucide-react';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [open, setOpen] = useState(true);
  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);

export const Sidebar = ({ children, className, ...props }) => {
  const { open } = useSidebar();
  return (
    <aside
      className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 md:relative md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
};

export const SidebarTrigger = ({ className, ...props }) => {
  const { open, setOpen } = useSidebar();
  return (
    <button
      onClick={() => setOpen(!open)}
      className={clsx('text-white hover:text-gray-300 transition-colors', className)}
      {...props}
    >
      {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  );
};

export const SidebarHeader = ({ className, ...props }) => (
  <div className={clsx('px-4 py-4 border-b border-gray-800', className)} {...props} />
);

export const SidebarContent = ({ className, ...props }) => (
  <div className={clsx('overflow-y-auto flex-1 px-2 py-4', className)} {...props} />
);

export const SidebarFooter = ({ className, ...props }) => (
  <div className={clsx('border-t border-gray-800 px-4 py-4', className)} {...props} />
);

export const SidebarGroup = ({ className, ...props }) => (
  <div className={clsx('mb-6', className)} {...props} />
);

export const SidebarGroupLabel = ({ className, ...props }) => (
  <div
    className={clsx('px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider', className)}
    {...props}
  />
);

export const SidebarGroupContent = ({ className, ...props }) => (
  <div className={clsx('space-y-1', className)} {...props} />
);

export const SidebarMenu = ({ className, ...props }) => (
  <div className={clsx('space-y-1', className)} {...props} />
);

export const SidebarMenuItem = ({ className, ...props }) => (
  <div className={clsx('', className)} {...props} />
);

export const SidebarMenuButton = React.forwardRef(
  ({ className, asChild, children, ...props }, ref) => {
    const Component = asChild ? React.Fragment : 'button';

    return (
      <Component
        ref={!asChild ? ref : undefined}
        className={clsx(
          'w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors',
          className
        )}
        {...(asChild ? {} : props)}
        {...(asChild ? props : {})}
      >
        {asChild ? <>{children}</> : children}
      </Component>
    );
  }
);

SidebarMenuButton.displayName = 'SidebarMenuButton';
