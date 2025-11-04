import PageHeader from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building, UserCheck } from "lucide-react";
import Clock from "./_components/clock";
import PersianCalendar from "./_components/persian-calendar";
import { mockVillas, mockPersonnel } from "@/lib/data";
import { toPersianDigits } from "@/lib/utils";

export default function DashboardPage() {
  const stats = [
    { title: "تعداد کل ویلاها", value: toPersianDigits(mockVillas.length), icon: Building },
    { title: "تعداد پرسنل", value: toPersianDigits(mockPersonnel.length), icon: Users },
    { title: "ساکنین", value: toPersianDigits(mockVillas.length), icon: UserCheck },
  ];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader title="داشبورد" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
         <Clock />
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <Card>
            <CardHeader>
                <CardTitle>تقویم</CardTitle>
            </CardHeader>
            <CardContent>
                <PersianCalendar />
            </CardContent>
        </Card>
      </div>
    </main>
  );
}
