'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(_prevState: any, formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    return { error: 'Lütfen e-posta ve şifre giriniz.' }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Giriş başarısız. E-posta veya şifre hatalı.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(_prevState: any, formData: FormData) {
  const supabase = await createClient()
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    return { error: 'Lütfen e-posta ve şifre giriniz.' }
  }
  if (password.length < 6) {
    return { error: 'Şifre en az 6 karakter olmalıdır.' }
  }

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: 'Kayıt başarısız. ' + error.message }
  }

  return { success: 'Hesabınız oluşturuldu. E-postanızı doğruladıktan sonra giriş yapabilirsiniz.' }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
