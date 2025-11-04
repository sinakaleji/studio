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

export default function AddBoardMember() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="ml-2 h-4 w-4" />
          افزودن عضو
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>افزودن عضو جدید هیئت مدیره</DialogTitle>
          <DialogDescription>
            اطلاعات عضو جدید را در اینجا وارد کنید.
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
            <Label htmlFor="title" className="text-right">
              سمت
            </Label>
            <Select>
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
