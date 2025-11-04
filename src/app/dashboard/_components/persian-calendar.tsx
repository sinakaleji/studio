
"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toPersianDigits } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addMonths, subMonths, getDaysInMonth, getDay, getDate, getYear, getMonth } from "date-fns-jalali";

const persianWeekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

export default function PersianCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const changeMonth = (offset: number) => {
    if (offset > 0) {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  if (!isClient) {
    return (
        <Card className="p-4">
            <div className="text-center text-muted-foreground">در حال بارگذاری تقویم...</div>
        </Card>
    );
  }

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = (getDay(new Date(getYear(currentDate), getMonth(currentDate), 1)) + 1) % 7;
  
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const today = new Date();
  const isCurrentMonth = getYear(currentDate) === getYear(today) && getMonth(currentDate) === getMonth(today);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
        <div className="text-lg font-bold font-headline">
          {format(currentDate, 'MMMM yyyy')}
        </div>
        <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {persianWeekDays.map(day => (
          <div key={day} className="font-semibold text-muted-foreground">{day}</div>
        ))}
        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
        {days.map(day => {
            const isToday = isCurrentMonth && day === getDate(today);
            return (
              <div
                key={day}
                className={`flex items-center justify-center h-10 w-10 rounded-full cursor-pointer hover:bg-accent/50 ${
                  isToday ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                {toPersianDigits(day)}
              </div>
            )
        })}
      </div>
    </Card>
  );
}
