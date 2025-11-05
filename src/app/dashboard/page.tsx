
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Building, User, UserX, Home, Tag, Phone, Shield, ArrowLeft } from "lucide-react";
import Clock from "./_components/clock";
import PersianCalendar from "./_components/persian-calendar";
import GuardShiftCard from "./_components/guard-shift-card";
import { getVillas, getPersonnel } from "@/lib/data-manager";
import type { Villa, Personnel } from "@/lib/types";
import { toPersianDigits } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";


interface VillaStats {
  ownerOccupied: Villa[];
  rented: Villa[];
  vacant: Villa[];
  forSale: Villa[];
  total: number;
}

export default function DashboardPage() {
  const [villasCount, setVillasCount] = useState(0);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [villaStats, setVillaStats] = useState<VillaStats>({
      ownerOccupied: [],
      rented: [],
      vacant: [],
      forSale: [],
      total: 0
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const allVillas = getVillas();
    const allPersonnel = getPersonnel();
    const ownerOccupied = allVillas.filter(v => v.occupancyStatus === 'owner-occupied');
    const rented = allVillas.filter(v => v.occupancyStatus === 'rented');
    const vacant = allVillas.filter(v => v.occupancyStatus === 'vacant');
    const forSale = allVillas.filter(v => v.isForSale);

    setVillasCount(allVillas.length);
    setPersonnel(allPersonnel);
    setVillaStats({ ownerOccupied, rented, vacant, forSale, total: allVillas.length });
  }, []);

  const statsCards = [
    { title: "تعداد کل ویلاها", value: toPersianDigits(villasCount), icon: Building, data: [], tooltip: "تعداد کل ویلاهای ثبت شده" },
    { title: "مالک ساکن", value: toPersianDigits(villaStats.ownerOccupied.length), icon: User, data: villaStats.ownerOccupied, tooltip: "ویلاهای با مالک ساکن" },
    { title: "مستأجر", value: toPersianDigits(villaStats.rented.length), icon: Home, data: villaStats.rented, tooltip: "ویلاهای اجاره داده شده" },
    { title: "خالی", value: toPersianDigits(villaStats.vacant.length), icon: UserX, data: villaStats.vacant, tooltip: "ویلاهای خالی" },
    { title: "آماده فروش", value: toPersianDigits(villaStats.forSale.length), icon: Tag, data: villaStats.forSale, tooltip: "ویلاهای برای فروش" },
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

       <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle>پرسنل</CardTitle>
          </div>
          <CardDescription>لیست پرسنل فعال در مجموعه</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">شماره پرسنلی</TableHead>
                  <TableHead className="text-center">نام و نام خانوادگی</TableHead>
                  <TableHead className="text-center">نقش</TableHead>
                  <TableHead className="text-center">شماره تماس</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personnel.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium text-center">{toPersianDigits(person.personnelNumber)}</TableCell>
                    <TableCell className="font-medium text-center">{`${person.firstName} ${person.lastName}`}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{person.role}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {person.contact && (
                        <a href={`tel:${person.contact.replace(/-/g, '')}`} className="flex items-center justify-center gap-2 hover:underline">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <span>{toPersianDigits(person.contact)}</span>
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <GuardShiftCard />
      
       <Card>
            <CardHeader>
                <CardTitle>آمار ویلاها</CardTitle>
                <CardDescription>خلاصه وضعیت ویلاهای شهرک</CardDescription>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {statsCards.map((stat) => (
                        <Tooltip key={stat.title}>
                        <TooltipTrigger asChild>
                            <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                            </Card>
                        </TooltipTrigger>
                        <TooltipContent>
                            {stat.data.length > 0 ? (
                            <p>
                                شماره واحدها: {toPersianDigits(stat.data.map(v => v.villaNumber).join(', '))}
                            </p>
                            ) : (
                                <p>{stat.tooltip}</p>
                            )}
                        </TooltipContent>
                        </Tooltip>
                    ))}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>


      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 grid grid-cols-1 gap-4">
            <Clock />
        </div>
        <div className="lg:col-span-3">
            <Card>
                <CardHeader>
                    <CardTitle>تقویم</CardTitle>
                </CardHeader>
                <CardContent>
                    <PersianCalendar />
                </CardContent>
            </Card>
        </div>
      </div>
    </main>
  );
}
