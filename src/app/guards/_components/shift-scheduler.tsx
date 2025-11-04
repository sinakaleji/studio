
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { faIR } from 'date-fns-jalali/locale';


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import type { Personnel } from "@/lib/types";
import { cn, toPersianDigits } from "@/lib/utils";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, getYear, getDaysInMonth, addDays, startOfMonth } from "date-fns-jalali";


const formSchema = z.object({
  shiftType: z.enum(["12-hour", "8-hour"], { required_error: "نوع شیفت را انتخاب کنید." }),
  guardAvailability: z.array(z.string()).refine((value) => value.length > 0, {
    message: "حداقل یک نگهبان را انتخاب کنید.",
  }),
  startDate: z.date({ required_error: "تاریخ شروع الزامی است." }),
  constraints: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ShiftSchedulerProps {
  guards: Personnel[];
}

interface Schedule {
    [date: string]: string;
}

const shiftTimes = {
    "12-hour": ["شیفت روز (۷ الی ۱۹)", "شیفت شب (۱۹ الی ۷)"],
    "8-hour": ["شیفت صبح (۷ الی ۱۵)", "شیفت عصر (۱۵ الی ۲۳)", "شیفت شب (۲۳ الی ۷)"],
};

export default function ShiftScheduler({ guards }: ShiftSchedulerProps) {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentShiftType, setCurrentShiftType] = useState<"12-hour" | "8-hour">("12-hour");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guardAvailability: [],
      constraints: "",
      shiftType: "12-hour",
      startDate: new Date(),
    },
  });
  
  const watchedShiftType = form.watch("shiftType");

  const generateLocalSchedule = (data: FormValues): Schedule => {
    const { guardAvailability, shiftType, startDate } = data;
    const newSchedule: Schedule = {};
    const monthStartDate = startOfMonth(startDate);
    const daysInMonth = getDaysInMonth(monthStartDate);
    const numShifts = shiftType === "12-hour" ? 2 : 3;
    let guardIndex = 0;

    for (let i = 0; i < daysInMonth; i++) {
        const currentDate = addDays(monthStartDate, i);
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        
        const dailyGuards: string[] = [];
        for (let j = 0; j < numShifts; j++) {
            dailyGuards.push(guardAvailability[guardIndex % guardAvailability.length]);
            guardIndex++;
        }
        newSchedule[dateKey] = dailyGuards.join(', ');
    }
    return newSchedule;
  };

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setSchedule(null);
    setCurrentShiftType(data.shiftType);

    if (data.guardAvailability.length < 2 && data.shiftType === "12-hour") {
        toast({ variant: "destructive", title: "خطا", description: "برای شیفت ۱۲ ساعته حداقل ۲ نگهبان انتخاب کنید."});
        setIsLoading(false);
        return;
    }
    if (data.guardAvailability.length < 3 && data.shiftType === "8-hour") {
        toast({ variant: "destructive", title: "خطا", description: "برای شیفت ۸ ساعته حداقل ۳ نگهبان انتخاب کنید."});
        setIsLoading(false);
        return;
    }

    // Simulate async operation for better UX
    setTimeout(() => {
        try {
            const generatedSchedule = generateLocalSchedule(data);
            setSchedule(generatedSchedule);
            toast({
                title: "موفقیت آمیز",
                description: "برنامه شیفت با موفقیت ایجاد شد.",
            });

        } catch (error) {
            toast({
                variant: "destructive",
                title: "خطا",
                description: error instanceof Error ? error.message : "خطایی در ایجاد برنامه رخ داد.",
            });
        } finally {
            setIsLoading(false);
        }
    }, 500);
  }
  
  const handleGuardSelection = (guardName: string, checked: boolean) => {
    const currentSelection = form.getValues("guardAvailability") || [];
    let newSelection;
    if (checked) {
      newSelection = [...currentSelection, guardName];
    } else {
      newSelection = currentSelection.filter((name) => name !== guardName);
    }
    form.setValue("guardAvailability", newSelection, { shouldValidate: true });
  };


  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <Card className="lg:col-span-1 h-fit">
        <CardHeader>
          <CardTitle>تنظیمات شیفت</CardTitle>
          <CardDescription>پارامترهای مورد نظر برای ایجاد برنامه شیفت را مشخص کنید.</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="grid gap-6">
              <FormField
                control={form.control}
                name="shiftType"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>نوع شیفت</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4">
                        <FormItem className="flex items-center space-x-2 space-x-reverse">
                          <FormControl><RadioGroupItem value="12-hour" /></FormControl>
                          <FormLabel className="font-normal">۱۲ ساعته (۲ شیفت)</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-x-reverse">
                          <FormControl><RadioGroupItem value="8-hour" /></FormControl>
                          <FormLabel className="font-normal">۸ ساعته (۳ شیفت)</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                     <FormDescription>
                      {watchedShiftType === '12-hour' 
                        ? 'شیفت روز: ۷ الی ۱۹ - شیفت شب: ۱۹ الی ۷'
                        : 'شیفت صبح: ۷ الی ۱۵ - شیفت عصر: ۱۵ الی ۲۳ - شیفت شب: ۲۳ الی ۷'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guardAvailability"
                render={() => (
                  <FormItem>
                    <div className="mb-4"><FormLabel>نگهبانان در دسترس (به ترتیب انتخاب)</FormLabel></div>
                    {guards.map((guard) => {
                      const guardName = `${guard.firstName} ${guard.lastName}`.trim();
                      if (!guardName) return null;
                      return (
                      <FormItem key={guard.id} className="flex flex-row items-start space-x-3 space-y-0 space-x-reverse mb-2">
                        <FormControl>
                          <Checkbox
                            checked={form.watch('guardAvailability').includes(guardName)}
                            onCheckedChange={(checked) => {
                              handleGuardSelection(guardName, !!checked);
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{guardName}</FormLabel>
                      </FormItem>
                    )})}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>ماه مورد نظر</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full justify-start text-right font-normal", !field.value && "text-muted-foreground")}>
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {field.value ? format(field.value, 'MMMM yyyy', {locale: faIR}) : <span>یک ماه انتخاب کنید</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          locale={faIR}
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                          defaultMonth={field.value || new Date()}
                          captionLayout="dropdown-buttons"
                          fromYear={getYear(new Date()) - 5}
                          toYear={getYear(new Date()) + 5}
                          formatters={{
                            formatCaption: (date, options) => {
                                const year = toPersianDigits(format(date, 'yyyy', { locale: options?.locale }));
                                const month = format(date, 'LLLL', { locale: options?.locale });
                                return `${month} ${year}`;
                            },
                            formatDay: (day) => toPersianDigits(format(day, 'd')),
                            formatWeekday: (day) => format(day, 'E', { locale: faIR }).substring(0, 1),
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="constraints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>محدودیت‌ها (اختیاری)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="این فیلد در حال حاضر توسط سیستم استفاده نمی‌شود." {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                ایجاد برنامه شیفت
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>برنامه شیفت ماهانه</CardTitle>
          <CardDescription>برنامه ایجاد شده در اینجا نمایش داده می‌شود.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
          {!isLoading && !schedule && <div className="flex justify-center items-center h-64 text-muted-foreground">برنامه‌ای برای نمایش وجود ندارد.</div>}
          {schedule && (
            <div className="border rounded-lg max-h-[600px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">تاریخ</TableHead>
                    {shiftTimes[currentShiftType].map((shiftName, index) => (
                         <TableHead key={index} className="min-w-[150px]">{shiftName}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(schedule).map(([date, assignedGuardsStr]) => {
                     const assignedGuards = assignedGuardsStr.split(',').map(s => s.trim());
                     return (
                        <TableRow key={date}>
                          <TableCell>{toPersianDigits(format(new Date(date), 'yyyy/MM/dd'))} ({format(new Date(date), 'eeee', { locale: faIR })})</TableCell>
                           {assignedGuards.map((guard, index) => (
                               <TableCell key={index}>{guard}</TableCell>
                           ))}
                           {/* Render empty cells if fewer guards than shifts */}
                           {Array.from({ length: Math.max(0, shiftTimes[currentShiftType].length - assignedGuards.length) }).map((_, i) => (
                              <TableCell key={`empty-${i}`}></TableCell>
                           ))}
                        </TableRow>
                     )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    