
"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/page-header";
import { getPersonnel } from "@/lib/data-manager";
import type { Personnel } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function GuardsPage() {
  const [guards, setGuards] = useState<Personnel[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const allPersonnel = getPersonnel();
    setGuards(allPersonnel.filter(p => p.role === 'نگهبان'));
  }, []);

  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader title="لیست نگهبانان" />
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام و نام خانوادگی</TableHead>
              <TableHead>نقش</TableHead>
              <TableHead>شماره تماس</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guards.map((person) => (
              <TableRow key={person.id}>
                <TableCell className="font-medium">{`${person.firstName} ${person.lastName}`}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{person.role}</Badge>
                </TableCell>
                <TableCell>{person.contact}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
