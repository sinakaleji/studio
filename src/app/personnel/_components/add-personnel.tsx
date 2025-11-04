"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";

export default function AddPersonnel() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="ml-2 h-4 w-4" />
          افزودن پرسنل
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>افزودن پرسنل جدید</DialogTitle>
          <DialogDescription>
            اطلاعات پرسنل جدید را در اینجا وارد کنید.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              نام
            </Label>
            <Input id="name" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              نقش
            </Label>
            <Select>
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
            <Input id="contact" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">ذخیره</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
