'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { faIR } from 'date-fns/locale';
import { format } from 'date-fns-jalali';

export default function CalendarWidget() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', calendar: 'persian' };
  const todayString = today.toLocaleDateString('fa-IR', options);


  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{todayString}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex items-center justify-center">
        <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
            locale={faIR}
            dir="rtl"
            footer={
                <p className="text-center text-sm pt-2 text-muted-foreground">
                    امروز: {format(new Date(), 'PPP', { locale: faIR })}
                </p>
            }
        />
      </CardContent>
    </Card>
  );
}
