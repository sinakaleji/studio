import { SidebarTrigger } from '@/components/ui/sidebar';

type HeaderProps = {
  title: string;
};

export default function Header({ title }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
       <div className="md:hidden">
         <SidebarTrigger />
      </div>
      <h1 className="text-lg font-semibold font-headline md:text-2xl">{title}</h1>
    </header>
  );
}
