
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { faIR } from 'date-fns-jalali/locale';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import type { Personnel } from "@/lib/types";
import { cn, toPersianDigits } from "@/lib/utils";
import { CalendarIcon, Loader2, GripVertical, X } from "lucide-react";
import { format, getYear, getDaysInMonth, addDays, startOfMonth } from "date-fns-jalali";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const shiftConfigSchema = z.object({
  name: z.string().min(1),
  start: z.string().min(1),
  end: z.string().min(1),
});

const formSchema = z.object({
  shiftType: z.enum(["12-hour", "8-hour"], { required_error: "نوع شیفت را انتخاب کنید." }),
  selectedGuards: z.array(z.object({ id: z.string(), name: z.string() })).min(1, "حداقل یک نگهبان را انتخاب کنید."),
  startDate: z.date({ required_error: "تاریخ شروع الزامی است." }),
  constraints: z.string().optional(),
  "12-hour-shifts": z.array(shiftConfigSchema).length(2),
  "8-hour-shifts": z.array(shiftConfigSchema).length(3),
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
  const [currentShiftNames, setCurrentShiftNames] = useState<string[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shiftType: "12-hour",
      selectedGuards: [],
      startDate: new Date(),
      constraints: "",
      "12-hour-shifts": [
        { name: "شیفت روز", start: "07:00", end: "19:00" },
        { name: "شیفت شب", start: "19:00", end: "07:00" },
      ],
      "8-hour-shifts": [
        { name: "شیفت صبح", start: "07:00", end: "15:00" },
        { name: "شیفت عصر", start: "15:00", end: "23:00" },
        { name: "شیفت شب", start: "23:00", end: "07:00" },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "selectedGuards",
  });
  
  const watchedShiftType = form.watch("shiftType");

  const handleGuardSelect = (guard: Personnel) => {
    const isSelected = fields.some(g => g.id === guard.id);
    if (!isSelected) {
        append({ id: guard.id, name: `${guard.firstName} ${guard.lastName}`.trim() });
    }
  };

  const handleGuardRemove = (index: number) => {
    remove(index);
  };
  
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    move(result.source.index, result.destination.index);
  };

  const generateLocalSchedule = (data: FormValues): Schedule => {
    const { selectedGuards, shiftType, startDate } = data;
    const shifts = data[`${shiftType}-shifts`];
    const newSchedule: Schedule = {};
    const monthStartDate = startOfMonth(startDate);
    const daysInMonth = getDaysInMonth(monthStartDate);
    const numShifts = shifts.length;
    let guardIndex = 0;

    for (let i = 0; i < daysInMonth; i++) {
        const currentDate = addDays(monthStartDate, i);
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        
        const dailyGuards: string[] = [];
        for (let j = 0; j < numShifts; j++) {
            dailyGuards.push(selectedGuards[guardIndex % selectedGuards.length].name);
            guardIndex++;
        }
        newSchedule[dateKey] = dailyGuards;
    }
    return newSchedule;
  };

  async function onSubmit(data: FormValues) {
    setIsLoading(true);
    setSchedule(null);

    const shifts = data[`${data.shiftType}-shifts`];
    const shiftNames = shifts.map(s => `${s.name} (${toPersianDigits(s.start)} - ${toPersianDigits(s.end)})`);
    setCurrentShiftNames(shiftNames);

    const minGuards = data.shiftType === "12-hour" ? 2 : 3;
     if (data.selectedGuards.length < minGuards) {
        toast({ variant: "destructive", title: "خطا", description: `برای شیفت ${toPersianDigits(data.shiftType === '12-hour' ? 12 : 8)} ساعته حداقل ${toPersianDigits(minGuards)} نگهبان انتخاب کنید.`});
        setIsLoading(false);
        return;
    }

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
              
              {watchedShiftType === '12-hour' && (
                <div className="grid gap-2 p-2 border rounded-md">
                  <FormLabel>زمانبندی شیفت ۱۲ ساعته</FormLabel>
                  {form.watch('12-hour-shifts').map((_, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 items-center">
                      <FormField name={`12-hour-shifts.${index}.name`} render={({ field }) => <Input {...field} placeholder="نام شیفت" />} />
                      <FormField name={`12-hour-shifts.${index}.start`} render={({ field }) => <Input {...field} type="time" placeholder="شروع" />} />
                      <FormField name={`12-hour-shifts.${index}.end`} render={({ field }) => <Input {...field} type="time" placeholder="پایان" />} />
                    </div>
                  ))}
                </div>
              )}
               {watchedShiftType === '8-hour' && (
                <div className="grid gap-2 p-2 border rounded-md">
                   <FormLabel>زمانبندی شیفت ۸ ساعته</FormLabel>
                  {form.watch('8-hour-shifts').map((_, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 items-center">
                      <FormField name={`8-hour-shifts.${index}.name`} render={({ field }) => <Input {...field} placeholder="نام شیفت" />} />
                      <FormField name={`8-hour-shifts.${index}.start`} render={({ field }) => <Input {...field} type="time" placeholder="شروع" />} />
                      <FormField name={`8-hour-shifts.${index}.end`} render={({ field }) => <Input {...field} type="time" placeholder="پایان" />} />
                    </div>
                  ))}
                </div>
              )}
              
               <div className="space-y-2">
                <FormLabel>نگهبانان (به ترتیب شیفت)</FormLabel>
                <div className="p-2 border rounded-md min-h-[5rem]">
                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="selectedGuards">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                          {fields.map((guard, index) => (
                            <Draggable key={guard.id} draggableId={guard.id} index={index}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="flex items-center justify-between p-2 mb-1 bg-accent/50 rounded-md">
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="h-5 w-5 text-muted-foreground"/>
                                    <span>{guard.name}</span>
                                  </div>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleGuardRemove(index)}><X className="h-4 w-4"/></Button>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
                <FormField
                    name="selectedGuards"
                    render={() => (<FormMessage />)}
                />

                <div className="flex flex-wrap gap-2">
                    {guards.map(guard => {
                        const guardName = `${guard.firstName} ${guard.lastName}`.trim();
                        if (!guardName) return null;
                        const isSelected = fields.some(g => g.id === guard.id);
                        return (
                            <Button key={guard.id} type="button" variant={isSelected ? "secondary" : "outline"} size="sm" onClick={() => handleGuardSelect(guard)} disabled={isSelected}>
                                {guardName}
                            </Button>
                        )
                    })}
                </div>
              </div>


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
                    {currentShiftNames.map((shiftName, index) => (
                         <TableHead key={index} className="min-w-[150px]">{shiftName}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(schedule).map(([date, assignedGuards]) => {
                     return (
                        <TableRow key={date}>
                          <TableCell>{toPersianDigits(format(new Date(date), 'yyyy/MM/dd'))} ({format(new Date(date), 'eeee', { locale: faIR })})</TableCell>
                           {assignedGuards.map((guard, index) => (
                               <TableCell key={index}>{guard}</TableCell>
                           ))}
                           {/* Render empty cells if fewer guards than shifts */}
                           {Array.from({ length: Math.max(0, currentShiftNames.length - assignedGuards.length) }).map((_, i) => (
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
