import type { FC, ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

const PageHeader: FC<PageHeaderProps> = ({ title, children }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h1 className="text-3xl font-headline font-bold text-foreground">{title}</h1>
      <div className="flex items-center gap-2 flex-wrap">{children}</div>
    </div>
  );
};

export default PageHeader;
