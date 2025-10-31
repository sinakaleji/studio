'use client';
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function CalendarWidget() {
  const [time, setTime] = React.useState<string>('');

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('fa-IR'));
    }, 1000);
    setTime(new Date().toLocaleTimeString('fa-IR'));
    return () => clearInterval(timer);
  }, []);

  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const todayString = today.toLocaleDateString('fa-IR', options);


  return (
    <Card>
      <CardContent className="p-2 md:p-4">
        <div className="flex flex-col items-center justify-center gap-4 h-full">
          <div className="text-center">
             <p className="text-4xl font-bold font-mono tracking-widest text-primary">{time}</p>
             <p className="text-sm text-muted-foreground">{todayString}</p>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <p className="text-muted-foreground text-center">
              در حال حاضر ویجت تقویم به دلیل مشکل فنی غیرفعال است.
              <br />
              به زودی آن را با یک تقویم بهتر جایگزین خواهیم کرد.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
