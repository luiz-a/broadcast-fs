import type { ReactNode } from 'react'
import { Paper, Typography } from '@mui/material'

type Props = { icon: ReactNode; title: string; description: string; action?: ReactNode }

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <Paper className="flex flex-col items-center gap-2 border-dashed px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-indigo-50 text-indigo-600">
        {icon}
      </div>
      <Typography className="font-semibold">{title}</Typography>
      <Typography variant="body2" color="text.secondary" className="max-w-xs">
        {description}
      </Typography>
      {action && <div className="mt-2">{action}</div>}
    </Paper>
  )
}