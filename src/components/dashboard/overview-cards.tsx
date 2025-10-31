'use client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Home, Users, Wallet, FileText, UserCog } from 'lucide-react';
import { useCollection, useFirebase } from '@/firebase';
import { collection, query, where, Timestamp } from 'firebase/firestore';
import { useMemoFirebase } from '@/firebase/provider';
import { useMemo } from 'react';

export default function OverviewCards() {
  const { firestore } = useFirebase();

  const villasQuery = useMemoFirebase(() => firestore ? collection(firestore, 'villas') : null, [firestore]);
  const { data: villas } = useCollection(villasQuery);

  const personnelQuery = useMemoFirebase(() => firestore ? collection(firestore, 'personnel') : null, [firestore]);
  const { data: personnel } = useCollection(personnelQuery);
  
  const documentsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'documents') : null, [firestore]);
  const { data: documents } = useCollection(documentsQuery);

  const stakeholdersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'stakeholders') : null, [firestore]);
  const { data: stakeholders } = useCollection(stakeholdersQuery);

  const overviewData = [
    {
      title: 'تعداد ویلاها',
      value: villas?.length.toLocaleString('fa-IR') ?? '۰',
      icon: Home,
    },
    {
      title: 'پرسنل',
      value: personnel?.length.toLocaleString('fa-IR') ?? '۰',
      icon: Users,
    },
    {
      title: 'مدارک',
      value: documents?.length.toLocaleString('fa-IR') ?? '۰',
      icon: FileText,
    },
     {
      title: 'ذی‌نفعان',
      value: stakeholders?.length.toLocaleString('fa-IR') ?? '۰',
      icon: UserCog,
    },
  ];

  return (
    <>
      {overviewData.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-headline">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
