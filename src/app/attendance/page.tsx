'use client';
import React, { useState, useMemo } from 'react';
import AppLayout from '@/components/app-layout';
import Header from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCollection, useFirebase } from '@/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { faIR } from 'date-fns/locale';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';


type Personnel = { id: string; firstName: string; lastName: string; };
type AttendanceStatus = 'present' | 'absent';
type Attendance = {
  id: string;
  personnelId: string;
  date: string;
  status: AttendanceStatus;
  entryTime?: string;
  exitTime?: string;
  isLate?: boolean;
};

const LATE_THRESHOLD = '09:00'; // 9:00 AM

export default function AttendancePage() {
  const [date, setDate] = useState<Date>(new Date());
  const { firestore } = useFirebase();
  const { toast } = useToast();

  const formattedDate = format(date, 'yyyy-MM-dd');

  const personnelQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'personnel') : null, 
  [firestore]);
  const { data: personnelList, isLoading: isLoadingPersonnel } = useCollection<Personnel>(personnelQuery);

  const attendanceQuery = useMemoFirebase(() => 
    firestore ? collection(firestore, 'attendances') : null, 
  [firestore]);
  const { data: allAttendances } = useCollection<Attendance>(attendanceQuery);

  const dailyAttendanceMap = useMemo(() => {
    const map = new Map<string, Attendance>();
    allAttendances
      ?.filter(a => a.date === formattedDate)
      .forEach(a => map.set(a.personnelId, a));
    return map;
  }, [allAttendances, formattedDate]);


  const handleAttendanceChange = async (
    personnelId: string,
    field: keyof Omit<Attendance, 'id' | 'date' | 'personnelId'>,
    value: string | boolean | AttendanceStatus
  ) => {
    if (!firestore) return;
  
    const id = `${formattedDate}_${personnelId}`;
    const docRef = doc(firestore, 'attendances', id);
  
    const existingRecord = dailyAttendanceMap.get(personnelId) || {};
  
    const updatedData: Partial<Omit<Attendance, 'id'>> = {
      date: formattedDate,
      personnelId,
      status: existingRecord?.status || 'absent',
      entryTime: existingRecord?.entryTime || '',
      exitTime: existingRecord?.exitTime || '',
      isLate: existingRecord?.isLate || false,
      ...existingRecord,
      [field]: value,
    };
  
    // Default to present if changing time, unless it's explicitly set to absent
    if ((field === 'entryTime' || field === 'exitTime') && value && updatedData.status !== 'absent') {
      updatedData.status = 'present';
    }

    // if status is changed to absent, clear time fields
    if (field === 'status' && value === 'absent') {
        updatedData.entryTime = '';
        updatedData.exitTime = '';
        updatedData.isLate = false;
    }

    // Check for lateness
    if (field === 'entryTime' && typeof value === 'string') {
      updatedData.isLate = value > LATE_THRESHOLD;
    }
  
    await setDoc(docRef, updatedData, { merge: true });

    toast({
      title: 'موفقیت‌آمیز',
      description: 'وضعیت حضور و غیاب به‌روزرسانی شد.',
    });
  };
  
  return (
    <AppLayout>
      <Header title="ثبت حضور و غیاب" />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>حضور و غیاب روزانه</CardTitle>
              <CardDescription>وضعیت حضور پرسنل را برای روز انتخاب شده مدیریت کنید.</CardDescription>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-right font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: faIR }) : <span>یک روز را انتخاب کنید</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(day) => day && setDate(day)}
                  initialFocus
                  locale={faIR}
                  dir="rtl"
                />
              </PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent>
            {isLoadingPersonnel ? (
              <p>در حال بارگذاری پرسنل...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>پرسنل</TableHead>
                            <TableHead>وضعیت</TableHead>
                            <TableHead>ساعت ورود</TableHead>
                            <TableHead>ساعت خروج</TableHead>
                            <TableHead>وضعیت تاخیر</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {personnelList?.map((p) => {
                            const attendance = dailyAttendanceMap.get(p.id);
                            const currentStatus = attendance?.status || 'absent';
                            return (
                                <TableRow key={p.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>{p.firstName?.charAt(0)}{p.lastName?.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{p.firstName} {p.lastName}</span>
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={currentStatus}
                                            onValueChange={(value: AttendanceStatus) => handleAttendanceChange(p.id, 'status', value)}
                                        >
                                            <SelectTrigger className="w-[110px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="present">حاضر</SelectItem>
                                                <SelectItem value="absent">غایب</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="time"
                                            className="w-[120px]"
                                            value={attendance?.entryTime || ''}
                                            onChange={(e) => handleAttendanceChange(p.id, 'entryTime', e.target.value)}
                                            disabled={currentStatus === 'absent'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="time"
                                            className="w-[120px]"
                                            value={attendance?.exitTime || ''}
                                            onChange={(e) => handleAttendanceChange(p.id, 'exitTime', e.target.value)}
                                            disabled={currentStatus === 'absent'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {currentStatus === 'present' && attendance?.entryTime && (
                                            <span className={cn(
                                                "font-medium",
                                                attendance?.isLate ? "text-destructive" : "text-green-600"
                                            )}>
                                                {attendance?.isLate ? 'تاخیر' : 'به موقع'}
                                            </span>
                                        )}
                                         {currentStatus !== 'present' && (
                                             <span>-</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
