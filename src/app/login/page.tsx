import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-center">ورود به پنل مدیریت</CardTitle>
          <CardDescription className="text-center">
            لطفا ایمیل و رمز عبور خود را وارد کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                type="email"
                placeholder="sinakaleji@gmail.com"
                required
                defaultValue="sinakaleji@gmail.com"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">رمز عبور</Label>
              </div>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
            <Link href="/dashboard">
              <Button type="submit" className="w-full">
                ورود
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
