import PageHeader from "@/components/page-header";
import { mockPersonnel } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AddPersonnel from "./_components/add-personnel";

export default function PersonnelPage() {
  const personnel = mockPersonnel;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader title="مدیریت پرسنل">
        <AddPersonnel />
      </PageHeader>
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
            {personnel.map((person) => (
              <TableRow key={person.id}>
                <TableCell className="font-medium">{person.name}</TableCell>
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
