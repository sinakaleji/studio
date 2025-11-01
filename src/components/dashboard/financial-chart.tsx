'use client';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { useCollection, useFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { useMemo } from 'react';
import { format } from 'date-fns-jalali';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';

type Transaction = {
  id: string;
  type: 'income' | 'expense';
  date: Timestamp;
  amount: number;
  description: string;
};

const chartConfig = {
  income: {
    label: "درآمد",
    color: "hsl(var(--chart-2))",
  },
  expense: {
    label: "هزینه",
    color: "hsl(var(--chart-5))",
  },
} satisfies ChartConfig

export default function FinancialChart() {
  const { firestore } = useFirebase();
  const oneMonthAgo = useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  }, []);

  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
        collection(firestore, 'financial_transactions'),
        where('date', '>=', Timestamp.fromDate(oneMonthAgo))
    );
  }, [oneMonthAgo]);

  const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

  const chartData = useMemo(() => {
    if (!transactions) return [];

    const monthlyData: { [key: string]: { date: string; income: number; expense: number } } = {};

    transactions.forEach(t => {
      const dateKey = format(t.date.toDate(), 'yyyy-MM-dd');
      if (!monthlyData[dateKey]) {
        monthlyData[dateKey] = { date: format(t.date.toDate(), 'MM/dd', { useAdditionalDayOfYearTokens: false }), income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        monthlyData[dateKey].income += t.amount;
      } else {
        monthlyData[dateKey].expense += t.amount;
      }
    });

    return Object.values(monthlyData).sort((a,b) => a.date.localeCompare(b.date));
  }, [transactions]);
  
  if(isLoading) return <Card><CardHeader><CardTitle>جریان مالی</CardTitle></CardHeader><CardContent><p>در حال بارگذاری نمودار...</p></CardContent></Card>

  return (
    <Card>
      <CardHeader>
        <CardTitle>جریان مالی</CardTitle>
        <CardDescription>نمودار درآمد و هزینه در ۳۰ روز گذشته</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-60">
            <p className="text-muted-foreground">داده‌ای برای نمایش در ۳۰ روز گذشته وجود ندارد.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-60 w-full">
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis 
                      tickFormatter={(value) => `${(value / 1000000).toLocaleString('fa-IR')}م`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                        cursor={false}
                        content={<ChartTooltipContent
                            formatter={(value, name) => (
                                <div className="flex flex-col gap-1">
                                    <span className='font-bold'>{`${(name === 'income' ? 'درآمد' : 'هزینه')}`}</span>
                                    <span>{`${Number(value).toLocaleString('fa-IR')} تومان`}</span>
                                </div>
                            )}
                        />} 
                    />
                    <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                    <Bar dataKey="expense" fill="var(--color-expense)" radius={4} />
                </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
