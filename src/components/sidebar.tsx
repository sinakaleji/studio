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
import { Building2, LayoutGrid, Home, Users, CircleDollarSign, FileText, UserCircle, LogOut, Settings, Loader, Briefcase, UserCog, Clock, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { useUser, useFirebase } from '@/firebase';
import { useEffect, useMemo, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';


const allMenuItems = [
  { href: '/dashboard', label: 'داشبورد', icon: LayoutGrid, roles: ['super_admin', 'admin', 'financial_expert'] },
  { href: '/villas', label: 'مدیریت ویلاها', icon: Home, roles: ['super_admin', 'admin'] },
  { href: '/stakeholders', label: 'مدیریت ذی‌نفعان', icon: UserCog, roles: ['super_admin', 'admin'] },
  { href: '/personnel', label: 'مدیریت پرسنل', icon: Users, roles: ['super_admin', 'admin'] },
  { href: '/attendance', label: 'حضور و غیاب', icon: Clock, roles: ['super_admin', 'admin'] },
  { href: '/finance', label: 'مدیریت مالی', icon: CircleDollarSign, roles: ['super_admin', 'admin', 'financial_expert'] },
  { href: '/payroll', label: 'حقوق و دستمزد', icon: Briefcase, roles: ['super_admin', 'admin', 'financial_expert'] },
  { href: '/documents', label: 'مدیریت مدارک', icon: FileText, roles: ['super_admin', 'admin'] },
  { href: '/users', label: 'مدیریت کاربران', icon: ShieldCheck, roles: ['super_admin'] },
  { href: '/settings', label: 'تنظیمات', icon: Settings, roles: ['super_admin', 'admin'] },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (user && firestore) {
        setIsLoadingRole(true);
        const userDocRef = doc(firestore, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserRole(userDocSnap.data().role);
        } else {
          setUserRole(null); // No role assigned
        }
        setIsLoadingRole(false);
      } else if (!isUserLoading) {
        setUserRole(null);
        setIsLoadingRole(false);
      }
    };

    fetchUserRole();
  }, [user, firestore, isUserLoading]);

  const menuItems = useMemo(() => {
    if (!userRole) return [];
    return allMenuItems.filter(item => item.roles.includes(userRole));
  }, [userRole]);

  const handleSignOut = () => {
    if (auth) {
        auth.signOut();
    }
  }

  const isLoading = isUserLoading || isLoadingRole;

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
                  as="a"
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label }}
                >
                  <item.icon />
                  <span>{item.label}</span>
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
                      {isLoading ? (
                          <Loader className="animate-spin" />
                      ) : user ? (
                          <>
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                            <AvatarFallback>{(user.displayName || user.email || 'U').charAt(0)}</AvatarFallback>
                          </>
                      ) : (
                          <AvatarFallback>?</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex flex-col items-start truncate group-data-[collapsible=icon]:hidden">
                      {isLoading ? (
                          <span className='text-xs'>در حال بارگذاری...</span>
                      ) : user ? (
                          <>
                            <span className="font-medium">{user.displayName || user.email}</span>
                            <span className="text-xs text-muted-foreground">{userRole ? `نقش: ${getRoleDisplayName(userRole as any)}` : 'بدون نقش'}</span>
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

const getRoleDisplayName = (role: string) => {
    switch (role) {
        case 'super_admin': return 'سوپر ادمین';
        case 'admin': return 'ادمین';
        case 'financial_expert': return 'کارشناس مالی';
        default: return 'بدون نقش';
    }
}
