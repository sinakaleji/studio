
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
import type { Personnel } from "@/lib/types";
import { useEffect, useState } from "react";

interface AddPersonnelProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Personnel, 'id'> & { id?: string }) => void;
  personnel: Personnel | null;
}

export default function AddPersonnel({ isOpen, onOpenChange, onSave, personnel }: AddPersonnelProps) {
  const [name, setName] = useState("");
  const [role, setRole] = useState<Personnel['role'] | ''>('');
  const [contact, setContact] = useState("");

  useEffect(() => {
    if (personnel) {
      setName(personnel.name);
      setRole(personnel.role);
      setContact(personnel.contact);
    } else {
      setName("");
      setRole("");
      setContact("");
    }
  }, [personnel, isOpen]);

  const handleSubmit = () => {
    if (!name || !role) {
      // Add user feedback
      return;
    }
    onSave({
      id: personnel?.id,
      name,
      role: role as Personnel['role'],
      contact,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{personnel ? "ویرایش پرسنل" : "افزودن پرسنل جدید"}</DialogTitle>
          <DialogDescription>
            اطلاعات پرسنل جدید را در اینجا وارد کنید.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              نام
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              نقش
            </Label>
            <Select value={role} onValueChange={(value) => setRole(value as Personnel['role'])}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="نقش را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="guard">نگهبان</SelectItem>
                <SelectItem value="services">خدمات</SelectItem>
                <SelectItem value="gardener">باغبان</SelectItem>
                <SelectItem value="manager">مدیر</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact" className="text-right">
              شماره تماس
            </Label>
            <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} className="col-span-3" />
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
