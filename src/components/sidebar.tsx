'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { Building2, LayoutGrid, Home, Users, CircleDollarSign, FileText, UserCircle, LogOut, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { user } from '@/lib/data';
import { Button } from './ui/button';

const menuItems = [
  { href: '/', label: 'داشبورد', icon: LayoutGrid },
  { href: '/villas', label: 'مدیریت ویلاها', icon: Home },
  { href: '/personnel', label: 'مدیریت پرسنل', icon: Users },
  { href: '/finance', label: 'مدیریت مالی', icon: CircleDollarSign },
  { href: '/documents', label: 'مدیریت مدارک', icon: FileText },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar side="right" collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex w-full items-center gap-2 p-2 text-lg font-semibold font-headline text-sidebar-foreground">
          <Building2 className="size-6 shrink-0 text-primary" />
          <span className="truncate group-data-[collapsible=icon]:hidden">Sina Manager</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                  asChild
                >
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="h-14 w-full justify-start gap-2 p-2 hover:bg-sidebar-accent">
                    <Avatar className="size-8">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start truncate group-data-[collapsible=icon]:hidden">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56" sideOffset={10}>
                <DropdownMenuLabel>حساب کاربری</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <UserCircle className="ml-2 h-4 w-4" />
                    <span>پروفایل</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Settings className="ml-2 h-4 w-4" />
                    <span>تنظیمات</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <LogOut className="ml-2 h-4 w-4" />
                    <span>خروج</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
