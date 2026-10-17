const pad = (n: number) => String(n).padStart(2, '0')

export const toInputValue = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`

export const formatDateTime = (d: Date) =>
  d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })