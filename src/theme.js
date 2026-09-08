import { createTheme } from '@mantine/core'

// A warm, festive palette for an event-planning app: grape / pink / gold.
export const theme = createTheme({
  primaryColor: 'grape',
  primaryShade: { light: 6, dark: 5 },
  fontFamily: 'Assistant, Heebo, system-ui, sans-serif',
  headings: {
    fontFamily: 'Heebo, Assistant, system-ui, sans-serif',
    fontWeight: '800',
  },
  defaultRadius: 'lg',
  colors: {
    // a hand-tuned gold accent (Mantine ships "yellow" but this reads warmer)
    gold: [
      '#fff8e1', '#ffedb3', '#ffe082', '#ffd54f', '#ffca28',
      '#ffc107', '#f5b400', '#e6a600', '#cc9200', '#a67500',
    ],
  },
  components: {
    Card: {
      defaultProps: { shadow: 'sm', withBorder: true, padding: 'lg' },
    },
    Button: {
      defaultProps: { radius: 'xl' },
    },
    Badge: {
      defaultProps: { radius: 'sm', variant: 'light' },
    },
  },
  other: {
    heroGradient: 'linear-gradient(135deg, #7048e8 0%, #e64980 55%, #ffc107 120%)',
  },
})

// status -> Mantine color, used for booking / slot badges
export const statusColor = {
  Available: 'teal',
  Booked: 'red',
  Blocked: 'gray',
  Pending: 'gold',
  Confirmed: 'teal',
  Cancelled: 'gray',
}
