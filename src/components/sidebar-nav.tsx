"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Users, Shield, Building, UserSquare } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutDashboard },
  { href: '/personnel', label: 'مدیریت پرسنل', icon: Users },
  { href: '/villas', label: 'مدیریت ویلاها', icon: Building },
  { href: '/board', label: 'هیئت مدیره', icon: UserSquare },
  { href: '/guards', label: 'شیفت نگهبانان', icon: Shield },
];

const VillaIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 22h20" />
        <path d="M12 2l8 8H4l8-8z" />
        <path d="M6 10v12" />
        <path d="M18 10v12" />
        <path d="M10 16h4" />
    </svg>
);
navItems[2].icon = VillaIcon;


export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col p-4 space-y-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-primary/20 text-primary-foreground font-semibold'
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
