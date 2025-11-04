import PageHeader from "@/components/page-header";
import { mockVillas } from "@/lib/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toPersianDigits } from "@/lib/utils";
import SchematicMap from "./_components/schematic-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddVilla from "./_components/add-villa";

export default function VillasPage() {
  const villas = mockVillas;

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <PageHeader title="مدیریت ویلاها و ساکنین">
        <AddVilla />
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>نقشه شماتیک شهرک</CardTitle>
        </CardHeader>
        <CardContent>
          <SchematicMap villas={villas} />
        </CardContent>
      </Card>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>شماره ویلا</TableHead>
              <TableHead>مالک</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>مستاجر</TableHead>
              <TableHead>تماس مستاجر</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {villas.map((villa) => (
              <TableRow key={villa.id}>
                <TableCell className="font-medium">{toPersianDigits(villa.villaNumber)}</TableCell>
                <TableCell>{villa.ownerName}</TableCell>
                <TableCell>
                  {villa.isRented ? (
                    <Badge variant="destructive">اجاره</Badge>
                  ) : (
                    <Badge variant="secondary">مالک ساکن</Badge>
                  )}
                </TableCell>
                <TableCell>{villa.tenantName || "-"}</TableCell>
                <TableCell>{villa.tenantContact || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
