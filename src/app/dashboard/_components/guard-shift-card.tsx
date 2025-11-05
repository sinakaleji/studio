
"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, ArrowLeft } from "lucide-react";
import { toPersianDigits, cn } from "@/lib/utils";
import { format, parse, startOfToday, setHours, setMinutes, isPast, addDays, isBefore } from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale";
import { Button } from "@/components/ui/button";

const SCHEDULE_STORAGE_KEY = 'guardShiftSchedule';
const SHIFT_NAMES_STORAGE_KEY = 'guardShiftNames';
const FORM_VALUES_STORAGE_KEY = 'guardShiftFormValues';
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
    isFinished: boolean;
  }[];
}

interface FormValues {
    '12-hour-shifts': { name: string, start: string, end: string }[];
    '8-hour-shifts': { name: string, start: string, end: string }[];
    shiftType: '12-hour' | '8-hour';
}

export default function GuardShiftCard() {
  const [upcomingShifts, setUpcomingShifts] = useState<ShiftInfo[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const savedSchedule = localStorage.getItem(SCHEDULE_STORAGE_KEY);
      const savedShiftNames = localStorage.getItem(SHIFT_NAMES_STORAGE_KEY);
      const savedFormValues = localStorage.getItem(FORM_VALUES_STORAGE_KEY);

      if (savedSchedule && savedShiftNames && savedFormValues) {
        const schedule: Schedule = JSON.parse(savedSchedule);
        const shiftNames: string[] = JSON.parse(savedShiftNames);
        const formValues: FormValues = JSON.parse(savedFormValues);
        const today = startOfToday();
        const foundShifts: { date: Date; dateKey: string; guards: string[] }[] = [];

        const sortedDateKeys = Object.keys(schedule).sort();

        for (const dateKey of sortedDateKeys) {
          try {
            const shiftDate = parse(dateKey, 'yyyy-MM-dd', new Date());
            if (!isNaN(shiftDate.getTime()) && !isBefore(shiftDate, today)) {
              foundShifts.push({ date: shiftDate, dateKey, guards: schedule[dateKey] });
            }
          } catch (e) {
            // ignore invalid dates in schedule
          }
        }
        
        const shiftsByDay: { [key: string]: ShiftInfo } = {};
        let shiftsCount = 0;

        const getShiftEndTime = (shiftIndex: number, date: Date): Date => {
            const shiftTimes = formValues[`${formValues.shiftType}-shifts`];
            const shiftInfo = shiftTimes[shiftIndex];
            if (!shiftInfo || !shiftInfo.end) return new Date();
            
            const [endHour, endMinute] = shiftInfo.end.split(':').map(Number);
            const [startHour] = shiftInfo.start.split(':').map(Number);

            let endDate = setHours(setMinutes(date, endMinute), endHour);
            if (endHour < startHour) {
                endDate = addDays(endDate, 1);
            }
            return endDate;
        };

        for (const shift of foundShifts) {
            if (shiftsCount >= MAX_SHIFTS_TO_DISPLAY) break;

            const dateKey = format(shift.date, 'yyyy/MM/dd');
            
            const dayAssignments = shift.guards.map((guardName, index) => {
                const shiftEndTime = getShiftEndTime(index, shift.date);
                const isFinished = isPast(shiftEndTime);
                return {
                    shiftName: shiftNames[index] || `شیفت ${index + 1}`,
                    guardName: guardName,
                    isFinished,
                };
            });

            // If all shifts for the day are finished, skip this day
            if (dayAssignments.every(a => a.isFinished)) {
                continue;
            }

            if (!shiftsByDay[dateKey]) {
                shiftsByDay[dateKey] = {
                    date: toPersianDigits(dateKey),
                    dayName: format(shift.date, 'eeee', { locale: faIR }),
                    assignments: [],
                };
            }
            
            dayAssignments.forEach(assignment => {
                if (shiftsCount < MAX_SHIFTS_TO_DISPLAY) {
                    shiftsByDay[dateKey].assignments.push(assignment);
                    shiftsCount++;
                }
            });

            // If a day has no assignments to show, remove it
            if(shiftsByDay[dateKey].assignments.length === 0){
                delete shiftsByDay[dateKey];
            }
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
        <CardDescription>نمایش شیفت‌های آینده</CardDescription>
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
                                        <TableCell className={cn("text-center", assignment.isFinished && "line-through text-muted-foreground")}>{assignment.shiftName}</TableCell>
                                        <TableCell className={cn("text-center font-medium", assignment.isFinished && "line-through text-muted-foreground")}>{assignment.guardName}</TableCell>
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

    