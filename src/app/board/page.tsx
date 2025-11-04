
"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/page-header";
import { getBoardMembers, saveBoardMembers } from "@/lib/data-manager";
import type { BoardMember } from "@/lib/types";
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
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function BoardPage() {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [editingMember, setEditingMember] = useState<BoardMember | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setBoardMembers(getBoardMembers());
  }, []);

  const handleSave = (memberData: Omit<BoardMember, 'id'> & { id?: string }) => {
    let updatedMembers;
    if (memberData.id) {
      updatedMembers = boardMembers.map((m) =>
        m.id === memberData.id ? { ...m, ...memberData } : m
      );
    } else {
      const newMember: BoardMember = {
        ...memberData,
        id: `b${Date.now()}`,
      };
      updatedMembers = [...boardMembers, newMember];
    }
    saveBoardMembers(updatedMembers);
    setBoardMembers(updatedMembers);
    setEditingMember(null);
    setIsAddMemberOpen(false);
  };

  const handleDelete = (memberId: string) => {
    const updatedMembers = boardMembers.filter((m) => m.id !== memberId);
    saveBoardMembers(updatedMembers);
    setBoardMembers(updatedMembers);
  };
  
  const handleEdit = (member: BoardMember) => {
    setEditingMember(member);
    setIsAddMemberOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingMember(null);
    setIsAddMemberOpen(true);
  };

  if (!isClient) {
    return null; // Or a loading spinner
  }

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <AddBoardMember 
        isOpen={isAddMemberOpen}
        onOpenChange={setIsAddMemberOpen}
        onSave={handleSave}
        member={editingMember}
      />
      <PageHeader title="اعضای هیئت مدیره">
        <Button onClick={handleAddNew}>افزودن عضو</Button>
      </PageHeader>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام و نام خانوادگی</TableHead>
              <TableHead>سمت</TableHead>
              <TableHead>شماره تماس</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {boardMembers.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{`${member.firstName} ${member.lastName}`}</TableCell>
                <TableCell>
                  <Badge>{member.title}</Badge>
                </TableCell>
                <TableCell>{member.contact}</TableCell>
                 <TableCell className="flex gap-2">
                   <Button variant="outline" size="icon" onClick={() => handleEdit(member)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>آیا از حذف مطمئن هستید؟</AlertDialogTitle>
                        <AlertDialogDescription>
                          این عمل قابل بازگشت نیست. این عضو برای همیشه حذف خواهد شد.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>انصراف</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(member.id)}>
                          حذف
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
