import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

type Props = {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  breadcrumb?: string
}

export function PageHeader({ title, description, actionLabel, breadcrumb }: Omit<Props, 'icon'>) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        {breadcrumb && <p className="text-sm text-muted-foreground mb-1">{breadcrumb}</p>}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-1 text-muted-foreground">{description}</p>
      </div>
      {actionLabel && (
        <Button className="h-10 shadow-sm shadow-primary/20">{actionLabel}</Button>
      )}
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, actionLabel }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-white/60 py-20 px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel && (
        <Button className="mt-6 shadow-sm shadow-primary/20">{actionLabel}</Button>
      )}
      <p className="mt-6 text-xs text-muted-foreground">Bu bölüm çok yakında kullanıma açılacaktır.</p>
    </div>
  )
}
