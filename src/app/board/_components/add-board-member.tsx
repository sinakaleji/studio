
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BoardMember } from "@/lib/types";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface AddBoardMemberProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<BoardMember, 'id'> & { id?: string }) => void;
  member: BoardMember | null;
}

export default function AddBoardMember({ isOpen, onOpenChange, onSave, member }: AddBoardMemberProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [title, setTitle] = useState<BoardMember['title'] | ''>('');
  const [contact, setContact] = useState("");
  const { toast } = useToast();


  useEffect(() => {
    if (member) {
      setFirstName(member.firstName || "");
      setLastName(member.lastName || "");
      setTitle(member.title || "");
      setContact(member.contact || "");
    } else {
      setFirstName("");
      setLastName("");
      setTitle("");
      setContact("");
    }
  }, [member, isOpen]);

  const validatePhoneNumber = (phone: string) => {
    if (!phone) return true; // Optional field
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = () => {
    if (!firstName || !lastName) {
      toast({ variant: "destructive", title: "خطا", description: "نام و نام خانوادگی عضو الزامی است." });
      return;
    }
    if (!title) {
      toast({ variant: "destructive", title: "خطا", description: "لطفا سمت عضو را انتخاب کنید." });
      return;
    }
    if (!validatePhoneNumber(contact)) {
      toast({ variant: "destructive", title: "خطا", description: "شماره تماس معتبر نیست. (مثال: 09123456789)" });
      return;
    }

    onSave({
      id: member?.id,
      firstName,
      lastName,
      title: title as BoardMember['title'],
      contact,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{member ? "ویرایش عضو هیئت مدیره" : "افزودن عضو جدید هیئت مدیره"}</DialogTitle>
          <DialogDescription>
            اطلاعات عضو جدید را در اینجا وارد کنید.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              نام
            </Label>
            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              نام خانوادگی
            </Label>
            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              سمت
            </Label>
            <Select value={title} onValueChange={(value) => setTitle(value as BoardMember['title'])}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="سمت را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="president">رئیس هیئت مدیره</SelectItem>
                <SelectItem value="vice-president">نایب رئیس</SelectItem>
                <SelectItem value="member">عضو هیئت مدیره</SelectItem>
                <SelectItem value="inspector">بازرس</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact" className="text-right">
              شماره تماس
            </Label>
            <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} className="col-span-3" placeholder="مثال: 09123456789" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>ذخیره</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>انصراف</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
