
"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building, UserCheck } from "lucide-react";
import Clock from "./_components/clock";
import PersianCalendar from "./_components/persian-calendar";
import { getVillas, getPersonnel } from "@/lib/data-manager";
import { toPersianDigits } from "@/lib/utils";

export default function DashboardPage() {
  const [villasCount, setVillasCount] = useState(0);
  const [personnelCount, setPersonnelCount] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setVillasCount(getVillas().length);
    setPersonnelCount(getPersonnel().length);
  }, []);

  const stats = [
    { title: "تعداد کل ویلاها", value: toPersianDigits(villasCount), icon: Building },
    { title: "تعداد پرسنل", value: toPersianDigits(personnelCount), icon: Users },
    { title: "ساکنین", value: toPersianDigits(villasCount), icon: UserCheck },
  ];

  if (!isClient) {
    // You can render a loading skeleton here
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <PageHeader title="داشبورد" />
            <div className="text-center">درحال بارگذاری...</div>
        </main>
    )
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader title="داشبورد" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
         <Clock />
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <Card>
            <CardHeader>
                <CardTitle>تقویم</CardTitle>
            </CardHeader>
            <CardContent>
                <PersianCalendar />
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
