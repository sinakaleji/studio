"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock as ClockIcon } from "lucide-react";
import { toPersianDigits } from "@/lib/utils";

export default function Clock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    // Set initial time on client mount
    if (time === null) {
      setTime(new Date());
    }
    return () => clearInterval(timer);
  }, [time]);

  const formattedTime = time
    ? toPersianDigits(time.toLocaleTimeString("fa-IR", { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    : "در حال بارگذاری...";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">ساعت</CardTitle>
        <ClockIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" dir="ltr">
          {formattedTime}
        </div>
      </CardContent>
    </Card>
  );
}
