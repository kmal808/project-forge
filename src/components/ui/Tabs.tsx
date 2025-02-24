import React from 'react';

interface TabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

const TabsContext = React.createContext<{
  value: string;
  onChange: (value: string) => void;
} | null>(null);

export function Tabs({ defaultValue, className = '', children }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, onChange: setValue }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className = '', children }: TabsListProps) {
  return (
    <div className={`rounded-lg border border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className = '', children }: TabsTriggerProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isActive = context.value === value;

  return (
    <button
      onClick={() => context.onChange(value)}
      className={`group relative flex h-12 items-center justify-center transition-colors
        ${isActive 
          ? 'bg-[var(--color-accent)] text-[var(--color-button-text)]' 
          : 'text-secondary hover:bg-secondary'
        }
        first:rounded-l-lg last:rounded-r-lg
        ${className}`
      }
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = '', children }: TabsContentProps) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  return <div className={className}>{children}</div>;
}