
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
import { getSettings } from "@/lib/settings";
import type { Personnel } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import Image from "next/image";

interface AddPersonnelProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (data: Omit<Personnel, 'id'> & { id?: string }) => void;
  personnel: Personnel | null;
}

export default function AddPersonnel({ isOpen, onOpenChange, onSave, personnel }: AddPersonnelProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<Personnel['role'] | ''>('');
  const [contact, setContact] = useState("");
  const [documentUrl, setDocumentUrl] = useState<string | undefined>(undefined);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const settings = getSettings();
    setAvailableRoles(settings.personnelRoles);

    if (personnel) {
      setFirstName(personnel.firstName || "");
      setLastName(personnel.lastName || "");
      setRole(personnel.role || "");
      setContact(personnel.contact || "");
      setDocumentUrl(personnel.documentUrl || undefined);
    } else {
      setFirstName("");
      setLastName("");
      setRole("");
      setContact("");
      setDocumentUrl(undefined);
    }
  }, [personnel, isOpen]);

  const handleSubmit = () => {
    if (!firstName || !lastName || !role) {
      // Add user feedback
      return;
    }
    onSave({
      id: personnel?.id,
      firstName,
      lastName,
      role: role as Personnel['role'],
      contact,
      documentUrl,
    });
    onOpenChange(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setDocumentUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast({
            variant: "destructive",
            title: "خطا در آپلود فایل",
            description: "لطفا یک فایل تصویری معتبر انتخاب کنید.",
        });
      }
    }
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
            <Label htmlFor="role" className="text-right">
              نقش
            </Label>
            <Select value={role} onValueChange={(value) => setRole(value as Personnel['role'])}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="نقش را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {availableRoles.map(role => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contact" className="text-right">
              شماره تماس
            </Label>
            <Input id="contact" value={contact} onChange={(e) => setContact(e.target.value)} className="col-span-3" />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="document" className="text-right">
              آپلود مدرک
            </Label>
            <Input id="document" type="file" onChange={handleFileChange} className="col-span-3" accept="image/*" />
          </div>
          {documentUrl && (
             <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">پیش‌نمایش</Label>
                <div className="col-span-3">
                    <Image src={documentUrl} alt="پیش‌نمایش مدرک" width={80} height={80} className="rounded-md object-cover" />
                </div>
             </div>
          )}
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>ذخیره</Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>انصراف</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
