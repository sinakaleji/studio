import PageHeader from "@/components/page-header";
import { mockBoardMembers } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import AddBoardMember from "./_components/add-board-member";

export default function BoardPage() {
  const boardMembers = mockBoardMembers;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader title="اعضای هیئت مدیره">
        <AddBoardMember />
      </PageHeader>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام و نام خانوادگی</TableHead>
              <TableHead>سمت</TableHead>
              <TableHead>شماره تماس</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boardMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.name}</TableCell>
                <TableCell>
                  <Badge>{member.title}</Badge>
                </TableCell>
                <TableCell>{member.contact}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
