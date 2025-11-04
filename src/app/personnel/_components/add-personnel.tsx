
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
import type { Personnel, Document } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";
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
  const [documents, setDocuments] = useState<Document[]>([]);
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
      setDocuments(personnel.documents || []);
    } else {
      setFirstName("");
      setLastName("");
      setRole("");
      setContact("");
      setDocuments([]);
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
      documents,
    });
    onOpenChange(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newDocuments = [...documents];
          newDocuments[index].url = e.target?.result as string;
          setDocuments(newDocuments);
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

  const handleAddDocument = () => {
    setDocuments([...documents, { name: "", url: "" }]);
  };

  const handleRemoveDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    setDocuments(newDocuments);
  };
  
  const handleDocumentNameChange = (value: string, index: number) => {
      const newDocuments = [...documents];
      newDocuments[index].name = value;
      setDocuments(newDocuments);
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
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-2">
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
          
          <div className="space-y-4 pt-4">
             <div className="flex justify-between items-center">
                <Label>مدارک</Label>
                <Button variant="outline" size="sm" onClick={handleAddDocument}>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    افزودن مدرک
                </Button>
             </div>
             {documents.map((doc, index) => (
                <div key={index} className="space-y-2 p-3 border rounded-md">
                    <div className="flex items-center gap-2">
                        <Input 
                            placeholder="نام مدرک (مثال: کارت ملی)"
                            value={doc.name}
                            onChange={(e) => handleDocumentNameChange(e.target.value, index)}
                        />
                         <Button variant="destructive" size="icon" onClick={() => handleRemoveDocument(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <Input id={`document-${index}`} type="file" onChange={(e) => handleFileChange(e, index)} accept="image/*" />
                    {doc.url && (
                        <div className="mt-2">
                            <Image src={doc.url} alt={`پیش‌نمایش ${doc.name}`} width={60} height={60} className="rounded-md object-cover" />
                        </div>
                    )}
                </div>
             ))}
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
