'use client'

import { useActionState } from 'react'
import { login, signup } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Zap, Loader2 } from 'lucide-react'

function SubmitButton({ label, pending }: { label: string; pending: boolean }) {
  return (
    <Button type="submit" className="w-full h-11 text-base font-medium" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {label}
    </Button>
  )
}

export default function LoginPage() {
  const [loginState, loginAction, loginPending] = useActionState(login, null)
  const [signupState, signupAction, signupPending] = useActionState(signup, null)

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white p-12 flex-col justify-between">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center border border-white/20">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">TeklifPro</span>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
            Elektrik teklifleriniz için<br />
            <span className="text-blue-200">profesyonel platform.</span>
          </h1>
          <p className="text-lg text-blue-100/90 max-w-md">
            Müşterilerinize saniyeler içinde profesyonel teklifler hazırlayın, projelerinizi tek yerden yönetin.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-6">
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm text-blue-200">Aktif Firma</div>
            </div>
            <div>
              <div className="text-3xl font-bold">12K</div>
              <div className="text-sm text-blue-200">Teklif</div>
            </div>
            <div>
              <div className="text-3xl font-bold">%98</div>
              <div className="text-sm text-blue-200">Memnuniyet</div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-blue-200">
          © {new Date().getFullYear()} TeklifPro. Tüm hakları saklıdır.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <Card className="w-full max-w-md border-slate-200 shadow-xl shadow-blue-500/5">
          <CardHeader className="space-y-2 text-center">
            <div className="lg:hidden mx-auto mb-2 h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">Hoş geldiniz</CardTitle>
            <CardDescription>Hesabınıza giriş yapın veya yeni bir hesap oluşturun.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Giriş Yap</TabsTrigger>
                <TabsTrigger value="signup">Kayıt Ol</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form action={loginAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">E-posta</Label>
                    <Input id="login-email" name="email" type="email" placeholder="ornek@firma.com" required autoComplete="email" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Şifre</Label>
                      <a href="#" className="text-xs text-primary hover:underline">Şifremi unuttum</a>
                    </div>
                    <Input id="login-password" name="password" type="password" required autoComplete="current-password" className="h-11" />
                  </div>
                  {loginState?.error && (
                    <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                      {loginState.error}
                    </div>
                  )}
                  <SubmitButton label="Giriş Yap" pending={loginPending} />
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form action={signupAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-posta</Label>
                    <Input id="signup-email" name="email" type="email" placeholder="ornek@firma.com" required autoComplete="email" className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Şifre</Label>
                    <Input id="signup-password" name="password" type="password" required minLength={6} autoComplete="new-password" className="h-11" />
                    <p className="text-xs text-muted-foreground">En az 6 karakter</p>
                  </div>
                  {signupState?.error && (
                    <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                      {signupState.error}
                    </div>
                  )}
                  {signupState?.success && (
                    <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                      {signupState.success}
                    </div>
                  )}
                  <SubmitButton label="Kayıt Ol" pending={signupPending} />
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="justify-center text-xs text-muted-foreground">
            Devam ederek Kullanım Koşulları ve Gizlilik Politikasını kabul etmiş olursunuz.
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
