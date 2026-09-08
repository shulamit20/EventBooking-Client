import { Badge } from '@mantine/core'
import { statusColor } from '../theme.js'

const label = {
  Available: 'פנוי',
  Booked: 'תפוס',
  Blocked: 'חסום',
  Pending: 'ממתין לאישור',
  Confirmed: 'מאושר',
  Cancelled: 'בוטל',
}

export default function StatusBadge({ status, size = 'sm' }) {
  return (
    <Badge color={statusColor[status] ?? 'gray'} size={size} variant="light">
      {label[status] ?? status}
    </Badge>
  )
}
