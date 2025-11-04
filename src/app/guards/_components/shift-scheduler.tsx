
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
import { format, getDaysInMonth, addDays, getYear, getMonth, startOfMonth } from "date-fns-jalali";


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
    [date: string]: string[];
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

  function generateSchedule(data: FormValues) {
    const { startDate, shiftType, guardAvailability } = data;
    const monthStartDate = startOfMonth(startDate);
    const daysInMonth = getDaysInMonth(monthStartDate);
    const shiftsPerDay = shiftType === '12-hour' ? 2 : 3;
    const newSchedule: Schedule = {};
    
    let guardIndex = 0;

    for (let i = 0; i < daysInMonth; i++) {
        const currentDate = addDays(monthStartDate, i);
        const dateString = format(currentDate, "yyyy-MM-dd");
        newSchedule[dateString] = [];

        for (let j = 0; j < shiftsPerDay; j++) {
            if (guardAvailability.length === 0) {
              newSchedule[dateString].push("نگهبان انتخاب نشده");
              continue;
            }
            newSchedule[dateString].push(guardAvailability[guardIndex]);
            guardIndex = (guardIndex + 1) % guardAvailability.length;
        }
    }
    return newSchedule;
  }

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setSchedule(null);
    setCurrentShiftType(data.shiftType);

    // Simulate AI generation with a timeout
    setTimeout(() => {
        try {
            if (data.guardAvailability.length === 0) {
                toast({
                    variant: "destructive",
                    title: "خطا",
                    description: "لطفا حداقل یک نگهبان برای برنامه ریزی انتخاب کنید.",
                });
                setIsLoading(false);
                return;
            }
            const generatedSchedule = generateSchedule(data);
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
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-4"><FormLabel>نگهبانان در دسترس (به ترتیب انتخاب)</FormLabel></div>
                    {guards.map((guard) => {
                      const guardName = `${guard.firstName} ${guard.lastName}`.trim();
                      if (!guardName) return null;
                      return (
                      <FormItem key={guard.id} className="flex flex-row items-start space-x-3 space-y-0 space-x-reverse mb-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(guardName)}
                            onCheckedChange={(checked) => {
                              const currentSelection = field.value || [];
                              return checked
                                ? field.onChange([...currentSelection, guardName])
                                : field.onChange(currentSelection.filter((value) => value !== guardName));
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
                            formatDay: (day, options) => toPersianDigits(format(day, 'd', { locale: options?.locale })),
                            formatWeekday: (day, options) => format(day, 'E', { locale: options?.locale }).substring(0, 1),
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
                      <Textarea placeholder="مثال: فرهنگ در روزهای جمعه نمی‌تواند شیفت باشد." {...field} />
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
                  {Object.entries(schedule).map(([date, assignedGuards]) => (
                    <TableRow key={date}>
                      <TableCell>{toPersianDigits(format(new Date(date), 'yyyy/MM/dd'))} ({format(new Date(date), 'eeee', { locale: faIR })})</TableCell>
                       {assignedGuards.map((guard, index) => (
                           <TableCell key={index}>{guard}</TableCell>
                       ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
