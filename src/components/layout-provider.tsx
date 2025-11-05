
"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger, SidebarContent, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';
import SidebarNav from './sidebar-nav';
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';
import Link from 'next/link';
import type { AppSettings } from '@/lib/types';
import { getSettings, setupAutoBackup } from '@/lib/settings';

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [settings, setSettings] = useState<AppSettings>({ communityName: "نیلارز", developerName: "سینا رایانه" });

  useEffect(() => {
    setSettings(getSettings());
    
    // Setup auto-backup
    const cleanupAutoBackup = setupAutoBackup();
    return () => {
      cleanupAutoBackup(); // Cleanup interval on component unmount
    };
  }, []);


  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <Sidebar side="right" className="border-l">
        <SidebarContent>
          <SidebarHeader>
            <h2 className="text-2xl font-headline font-bold text-center">{settings.communityName}</h2>
          </SidebarHeader>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
            <div className="text-center text-xs text-muted-foreground mb-2">
                © {new Date().getFullYear()} Developed by {settings.developerName}
            </div>
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
