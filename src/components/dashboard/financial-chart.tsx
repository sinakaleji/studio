'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useCollection, useFirebase } from "@/firebase";
import { collection, query, where, Timestamp, orderBy } from "firebase/firestore";
import { useMemoFirebase } from "@/firebase/provider";
import { format } from "date-fns-jalali";
import { useMemo } from "react";

type Transaction = {
    id: string;
    type: 'income' | 'expense';
    amount: number;
    date: Timestamp;
};

// Function to get the start of the day for a given date
function getStartOfDay(date: Date): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
}

export default function FinancialChart() {
    const { firestore } = useFirebase();

    const oneMonthAgoTimestamp = useMemo(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 1);
        return Timestamp.fromDate(getStartOfDay(date));
    }, []);

    const transactionsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(
            collection(firestore, 'financial_transactions'),
            where('date', '>=', oneMonthAgoTimestamp),
            orderBy('date', 'asc')
        );
    }, [firestore, oneMonthAgoTimestamp]);

    const { data: transactions, isLoading } = useCollection<Transaction>(transactionsQuery);

    const chartData = useMemo(() => {
        if (!transactions) return [];

        const aggregatedData: { [key: string]: { name: string, income: number, expense: number } } = {};

        transactions.forEach(tx => {
            if (!tx.date) return;
            const date = tx.date.toDate();
            const dayKey = format(date, 'yyyy-MM-dd');
            // Use a locale that is stable on the server and client, like 'en' for formatting structure
            const dayLabel = format(date, 'MMM d');


            if (!aggregatedData[dayKey]) {
                aggregatedData[dayKey] = { name: dayLabel, income: 0, expense: 0 };
            }

            if (tx.type === 'income') {
                aggregatedData[dayKey].income += tx.amount;
            } else {
                aggregatedData[dayKey].expense += tx.amount;
            }
        });
        
        return Object.values(aggregatedData);
    }, [transactions]);


    return (
        <Card>
            <CardHeader>
                <CardTitle>نمودار مالی ماه اخیر</CardTitle>
                <CardDescription>مقایسه درآمد و هزینه‌ها</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                {isLoading ? (
                    <div className="h-[250px] flex items-center justify-center">
                        <p>در حال بارگذاری نمودار...</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={chartData}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                reversed={true}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${(value as number) / 1000000}م`}
                                orientation="right"
                            />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--muted))' }}
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--background))',
                                    borderColor: 'hsl(var(--border))',
                                    direction: 'rtl',
                                    fontFamily: 'Vazirmatn, sans-serif'
                                }}
                                formatter={(value, name) => [
                                    `${(value as number).toLocaleString('fa-IR')} تومان`,
                                     name === 'income' ? 'درآمد' : 'هزینه'
                                ]}
                                labelStyle={{ fontWeight: 'bold' }}
                            />
                            <Bar dataKey="income" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="درآمد" />
                            <Bar dataKey="expense" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} name="هزینه" />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
