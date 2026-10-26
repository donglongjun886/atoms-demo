export const theme = {
  app: 'mx-auto w-full max-w-[520px] rounded-xl border bg-background shadow-sm',
  header: 'flex items-center justify-between border-b px-5 py-4',
  title: 'text-base font-semibold',
  badge: 'rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground',
  body: 'space-y-4 p-5',
  input:
    'h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/40',
  primaryButton:
    'inline-flex h-9 shrink-0 items-center gap-1 rounded-md bg-emerald-600 px-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50',
  filterButton: 'rounded-full px-3 py-1 text-xs font-medium transition-colors',
  filterButtonActive: 'bg-emerald-600 text-white',
  filterButtonIdle: 'bg-muted text-muted-foreground hover:text-foreground',
  taskRow: 'group flex items-center gap-3 rounded-lg border px-3 py-2.5',
  checkbox: 'h-4 w-4 accent-emerald-600',
  taskTitle: 'flex-1 break-words text-sm',
  taskTitleDone: 'flex-1 break-words text-sm text-muted-foreground line-through',
  deleteButton:
    'rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100',
  empty: 'rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground',
}
