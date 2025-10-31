'use client';
import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { faIR } from 'date-fns/locale';

export default function CalendarWidget() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [time, setTime] = React.useState<string>('');

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('fa-IR'));
    }, 1000);
    // Set initial time
    setTime(new Date().toLocaleTimeString('fa-IR'));
    return () => clearInterval(timer);
  }, []);

  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const todayString = today.toLocaleDateString('fa-IR', options);

  return (
    <Card>
      <CardContent className="p-2 md:p-4">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <p className="text-4xl font-bold font-mono tracking-widest text-primary">{time}</p>
            <p className="text-sm text-muted-foreground">{todayString}</p>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
            locale={faIR}
            classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-y-0",
                caption_label: "font-headline",
                head_cell: "font-headline",
                cell: "font-body",
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
