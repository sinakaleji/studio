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
import { Building2, LayoutGrid, Home, Users, CircleDollarSign, FileText, UserCircle, LogOut, Settings, Loader, Briefcase, UserCog } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { useUser, useFirebase } from '@/firebase';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { useEffect } from 'react';

const menuItems = [
  { href: '/', label: 'داشبورد', icon: LayoutGrid },
  { href: '/villas', label: 'مدیریت ویلاها', icon: Home },
  { href: '/stakeholders', label: 'مدیریت ذی‌نفعان', icon: UserCog },
  { href: '/personnel', label: 'مدیریت پرسنل', icon: Users },
  { href: '/finance', label: 'مدیریت مالی', icon: CircleDollarSign },
  { href: '/payroll', label: 'حقوق و دستمزد', icon: Briefcase },
  { href: '/documents', label: 'مدیریت مدارک', icon: FileText },
  { href: '/settings', label: 'تنظیمات', icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { auth } = useFirebase();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!user && !isUserLoading && auth) {
      initiateAnonymousSignIn(auth);
    }
  }, [user, isUserLoading, auth]);

  const handleSignOut = () => {
    if (auth) {
        auth.signOut();
    }
  }

  return (
    <Sidebar side="right" collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <div className="flex w-full items-center gap-2 p-2 text-lg font-semibold text-sidebar-foreground">
          <Building2 className="size-6 shrink-0 text-primary" />
          <span className="truncate group-data-[collapsible=icon]:hidden">Sina Manager</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
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
                      {isUserLoading ? (
                          <Loader className="animate-spin" />
                      ) : user ? (
                          <>
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                            <AvatarFallback>{user.isAnonymous ? 'AN' : (user.displayName || user.email || 'U').charAt(0)}</AvatarFallback>
                          </>
                      ) : (
                          <AvatarFallback>?</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col items-start truncate group-data-[collapsible=icon]:hidden">
                      {isUserLoading ? (
                          <span className='text-xs'>در حال بارگذاری...</span>
                      ) : user ? (
                          <>
                            <span className="font-medium">{user.isAnonymous ? 'کاربر مهمان' : (user.displayName || 'کاربر')}</span>
                            <span className="text-xs text-muted-foreground">{user.isAnonymous ? '' : user.email}</span>
                          </>
                      ): (
                          <span className="font-medium">وارد نشده</span>
                      )}
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56" sideOffset={10}>
                <DropdownMenuLabel>حساب کاربری</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                    <UserCircle className="ml-2 h-4 w-4" />
                    <span>پروفایل</span>
                </DropdownMenuItem>
                 <Link href="/settings" passHref>
                    <DropdownMenuItem>
                        <Settings className="ml-2 h-4 w-4" />
                        <span>تنظیمات</span>
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} disabled={!user}>
                    <LogOut className="ml-2 h-4 w-4" />
                    <span>خروج</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
