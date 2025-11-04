"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarContent, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import SidebarNav from './sidebar-nav';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar side="right" className="border-l">
        <SidebarContent>
          <SidebarHeader>
            <h2 className="text-2xl font-headline font-bold text-center">شهرک روشن</h2>
          </SidebarHeader>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
          <Link href="/login" className="w-full">
            <Button variant="ghost" className="w-full justify-start">
              <LogOut className="ml-2 h-4 w-4" />
              خروج
            </Button>
          </Link>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex items-center p-2 border-b">
           <SidebarTrigger className="md:hidden" />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
