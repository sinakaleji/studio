"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, ArrowLeft } from "lucide-react";
import { toPersianDigits } from "@/lib/utils";
import { format } from "date-fns-jalali";
import { Button } from "@/components/ui/button";

const SCHEDULE_STORAGE_KEY = 'guardShiftSchedule';
const SHIFT_NAMES_STORAGE_KEY = 'guardShiftNames';

interface Schedule {
  [date: string]: string[];
}

interface ShiftInfo {
  date: string;
  dayName: string;
  assignments: {
    shiftName: string;
    guardName: string;
  }[];
}

export default function GuardShiftCard() {
  const [shifts, setShifts] = useState<ShiftInfo[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const savedSchedule = localStorage.getItem(SCHEDULE_STORAGE_KEY);
      const savedShiftNames = localStorage.getItem(SHIFT_NAMES_STORAGE_KEY);

      if (savedSchedule && savedShiftNames) {
        const schedule: Schedule = JSON.parse(savedSchedule);
        const shiftNames: string[] = JSON.parse(savedShiftNames);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const todayKey = format(today, 'yyyy-MM-dd');
        const tomorrowKey = format(tomorrow, 'yyyy-MM-dd');

        const relevantShifts: ShiftInfo[] = [];

        if (schedule[todayKey]) {
          relevantShifts.push({
            date: toPersianDigits(format(today, 'yyyy/MM/dd')),
            dayName: format(today, 'eeee', { locale: { code: 'fa' } }),
            assignments: schedule[todayKey].map((guardName, index) => ({
              shiftName: shiftNames[index] || `شیفت ${index + 1}`,
              guardName: guardName,
            })),
          });
        }
        
        if (schedule[tomorrowKey]) {
           relevantShifts.push({
            date: toPersianDigits(format(tomorrow, 'yyyy/MM/dd')),
            dayName: format(tomorrow, 'eeee', { locale: { code: 'fa' } }),
            assignments: schedule[tomorrowKey].map((guardName, index) => ({
              shiftName: shiftNames[index] || `شیفت ${index + 1}`,
              guardName: guardName,
            })),
          });
        }
        
        setShifts(relevantShifts);
      }
    }
  }, []);

  if (!isClient) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>شیفت نگهبانان</CardTitle>
                <CardDescription>درحال بارگذاری برنامه شیفت...</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground">...</div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>شیفت نگهبانان</CardTitle>
          </div>
           <Button asChild variant="ghost" size="sm">
              <Link href="/guards">
                مشاهده همه
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Link>
            </Button>
        </div>
        <CardDescription>نمایش برنامه شیفت امروز و فردا</CardDescription>
      </CardHeader>
      <CardContent>
        {shifts.length > 0 ? (
           <div className="space-y-4">
            {shifts.map((dayShifts, dayIndex) => (
                <div key={dayIndex}>
                    <h4 className="font-semibold mb-2">{`${dayShifts.dayName} - ${dayShifts.date}`}</h4>
                    <div className="border rounded-lg overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-center">شیفت</TableHead>
                                    <TableHead className="text-center">نگهبان</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {dayShifts.assignments.map((assignment, assignmentIndex) => (
                                    <TableRow key={assignmentIndex}>
                                        <TableCell className="text-center">{assignment.shiftName}</TableCell>
                                        <TableCell className="text-center font-medium">{assignment.guardName}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            ))}
           </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <p>برنامه شیفتی یافت نشد.</p>
            <Button asChild variant="link">
              <Link href="/guards">
                ایجاد برنامه شیفت
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
