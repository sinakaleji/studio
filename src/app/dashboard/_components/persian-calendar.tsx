"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toPersianDigits } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const persianMonths = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
];

const persianWeekDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

// A simple Jalali to Gregorian approximation
function jalaliToGregorian(jy: number, jm: number, jd: number) {
    // This is a simplified conversion and might have errors for leap years.
    // For a real app, a proper library is needed.
    const gy = jy + 621;
    // A rough estimation
    const days = (jm - 1) * 30.5 + jd;
    const date = new Date(gy, 0, days);
    return date;
}

export default function PersianCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [jalaliDate, setJalaliDate] = useState({ year: 1403, month: 1, day: 1 });

  useEffect(() => {
    // In a real app, you would use a proper library to convert today's date to Jalali
    // For this mock, we'll just use a fixed Jalali date and update it manually
    const today = new Date();
    // This is a very rough approximation
    const jalaliYear = today.getFullYear() - 621;
    let jalaliMonth = today.getMonth() + 10;
    if (jalaliMonth > 12) {
      jalaliMonth -= 12;
    } else {
        // jalaliYear -= 1; this is not quite right
    }
    const jalaliDay = today.getDate(); // Also not right, but for display
    setJalaliDate({ year: jalaliYear, month: jalaliMonth, day: jalaliDay });
  }, []);

  const changeMonth = (offset: number) => {
    setJalaliDate(prev => {
        let newMonth = prev.month + offset;
        let newYear = prev.year;
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }
        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        return { ...prev, month: newMonth, year: newYear };
    });
  };

  const getDaysInMonth = (year: number, month: number) => {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    // Simple leap year check, not fully accurate
    const isLeap = (year % 33) === 1 || (year % 33) === 5 || (year % 33) === 9 || (year % 33) === 13 || (year % 33) === 17 || (year % 33) === 22 || (year % 33) === 26 || (year % 33) === 30;
    return isLeap ? 30 : 29;
  };

  const daysInMonth = getDaysInMonth(jalaliDate.year, jalaliDate.month);
  const firstDayOfMonth = (jalaliToGregorian(jalaliDate.year, jalaliDate.month, 1).getDay() + 1) % 7;
  
  const blanks = Array(firstDayOfMonth).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => changeMonth(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
        <div className="text-lg font-bold font-headline">
          {persianMonths[jalaliDate.month - 1]} {toPersianDigits(jalaliDate.year)}
        </div>
        <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {persianWeekDays.map(day => (
          <div key={day} className="font-semibold text-muted-foreground">{day}</div>
        ))}
        {blanks.map((_, i) => <div key={`blank-${i}`} />)}
        {days.map(day => {
            const isToday = day === new Date().getDate() && jalaliDate.month === (new Date().getMonth() + 4 % 12);
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
