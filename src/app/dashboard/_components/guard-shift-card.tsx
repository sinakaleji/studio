
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, ArrowLeft } from "lucide-react";
import { toPersianDigits } from "@/lib/utils";
import { format, addDays, parse } from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale";
import { Button } from "@/components/ui/button";

const SCHEDULE_STORAGE_KEY = 'guardShiftSchedule';
const SHIFT_NAMES_STORAGE_KEY = 'guardShiftNames';
const MAX_SHIFTS_TO_DISPLAY = 6;

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
  const [upcomingShifts, setUpcomingShifts] = useState<ShiftInfo[]>([]);
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
        const foundShifts: { date: Date, dateKey: string, guards: string[] }[] = [];

        // Sort schedule keys to ensure chronological order
        const sortedDateKeys = Object.keys(schedule).sort();

        // Find today's and future shifts
        for (const dateKey of sortedDateKeys) {
          try {
            const shiftDate = parse(dateKey, 'yyyy-MM-dd', new Date());
            if (shiftDate >= today || format(shiftDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
              foundShifts.push({ date: shiftDate, dateKey, guards: schedule[dateKey] });
            }
          } catch(e) {
            // ignore invalid dates in schedule
          }
        }
        
        const shiftsByDay: { [key: string]: ShiftInfo } = {};
        let shiftsCount = 0;

        for (const shift of foundShifts) {
          if (shiftsCount >= MAX_SHIFTS_TO_DISPLAY) break;

          const dateKey = format(shift.date, 'yyyy/MM/dd');
          
          if (!shiftsByDay[dateKey]) {
            shiftsByDay[dateKey] = {
              date: toPersianDigits(dateKey),
              dayName: format(shift.date, 'eeee', { locale: faIR }),
              assignments: [],
            };
          }

          shift.guards.forEach((guardName, index) => {
            if (shiftsCount < MAX_SHIFTS_TO_DISPLAY) {
              shiftsByDay[dateKey].assignments.push({
                shiftName: shiftNames[index] || `شیفت ${index + 1}`,
                guardName: guardName,
              });
              shiftsCount++;
            }
          });
        }
        
        setUpcomingShifts(Object.values(shiftsByDay));
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
        <CardDescription>نمایش ۶ شیفت آینده</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingShifts.length > 0 ? (
           <div className="space-y-4">
            {upcomingShifts.map((dayShifts, dayIndex) => (
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
