
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { format } from "date-fns-jalali";
import { getDaysInMonth, addDays } from "date-fns";


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


export default function ShiftScheduler({ guards }: ShiftSchedulerProps) {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guardAvailability: [],
      constraints: "",
    },
  });

  function generateSchedule(data: FormValues) {
    const { startDate, shiftType, guardAvailability } = data;
    const daysInMonth = getDaysInMonth(startDate);
    const shiftsPerDay = shiftType === '12-hour' ? 2 : 3;
    const newSchedule: Schedule = {};
    
    let guardIndex = 0;

    for (let i = 0; i < daysInMonth; i++) {
        const currentDate = addDays(startDate, i);
        const dateString = format(currentDate, "yyyy-MM-dd");
        newSchedule[dateString] = [];

        for (let j = 0; j < shiftsPerDay; j++) {
            newSchedule[dateString].push(guardAvailability[guardIndex]);
            guardIndex = (guardIndex + 1) % guardAvailability.length;
        }
    }
    return newSchedule;
  }

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setSchedule(null);
    
    // Simulate generation delay
    setTimeout(() => {
        try {
            if (data.guardAvailability.length === 0) {
                throw new Error("لطفا حداقل یک نگهبان برای برنامه ریزی انتخاب کنید.");
            }
            const newSchedule = generateSchedule(data);
            setSchedule(newSchedule);
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="guardAvailability"
                render={() => (
                  <FormItem>
                    <div className="mb-4"><FormLabel>نگهبانان در دسترس</FormLabel></div>
                    {guards.map((guard) => {
                      const guardName = `${guard.firstName} ${guard.lastName}`.trim();
                      return (
                      <FormField
                        key={guard.id}
                        control={form.control}
                        name="guardAvailability"
                        render={({ field }) => (
                          <FormItem key={guard.id} className="flex flex-row items-start space-x-3 space-y-0 space-x-reverse mb-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(guardName)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, guardName])
                                    : field.onChange(field.value?.filter((value) => value !== guardName));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{guardName}</FormLabel>
                          </FormItem>
                        )}
                      />
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
                    <FormLabel>تاریخ شروع ماه</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("w-full justify-start text-right font-normal", !field.value && "text-muted-foreground")}>
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {field.value ? format(field.value, 'yyyy/MM/dd') : <span>یک تاریخ انتخاب کنید</span>}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
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
                      <Textarea placeholder="این بخش در حال حاضر برای برنامه ریزی استفاده نمی شود" {...field} disabled />
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
                    <TableHead>تاریخ</TableHead>
                    <TableHead>شیفت‌ها</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(schedule).map(([date, assignedGuards]) => (
                    <TableRow key={date}>
                      <TableCell>{toPersianDigits(format(new Date(date), 'yyyy/MM/dd'))}</TableCell>
                      <TableCell>{assignedGuards.join(" - ")}</TableCell>
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
