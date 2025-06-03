import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string | ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <div className={`mb-8 pb-4 border-b border-border ${className}`}>
      <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">{title}</h1>
      {subtitle && (
        typeof subtitle === 'string' 
          ? <p className="text-lg text-muted-foreground">{subtitle}</p>
          : <div className="text-lg text-muted-foreground">{subtitle}</div>
      )}
    </div>
  );
}
