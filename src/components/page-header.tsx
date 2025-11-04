import type { FC, ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

const PageHeader: FC<PageHeaderProps> = ({ title, children }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-headline font-bold text-foreground">{title}</h1>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
};

export default PageHeader;
