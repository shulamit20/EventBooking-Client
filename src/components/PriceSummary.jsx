import { Card, Text, Group, Stack, Divider, Box, Skeleton } from '@mantine/core'
import { IconCurrencyShekel } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'framer-motion'

function Row({ label, value, strong }) {
  return (
    <Group justify="space-between" wrap="nowrap">
      <Text fz="sm" c={strong ? undefined : 'dimmed'} fw={strong ? 700 : 400}>{label}</Text>
      <Group gap={1}>
        <IconCurrencyShekel size={strong ? 15 : 13} />
        <Text fz={strong ? 'sm' : 'sm'} fw={strong ? 700 : 500}>{Number(value).toLocaleString()}</Text>
      </Group>
    </Group>
  )
}

export default function PriceSummary({ breakdown, loading }) {
  return (
    <Card
      style={{ position: 'sticky', top: 88, background: 'linear-gradient(180deg,#fff, #fbf5ff)' }}
    >
      <Text fw={800} fz="lg" mb="xs">סיכום מחיר</Text>

      {loading && !breakdown ? (
        <Stack gap="xs">
          <Skeleton h={14} /><Skeleton h={14} w="70%" /><Skeleton h={26} mt="sm" />
        </Stack>
      ) : !breakdown ? (
        <Text c="dimmed" fz="sm">בחרו אולם ומספר אורחים כדי לראות מחיר.</Text>
      ) : (
        <Stack gap={8}>
          <Row label="אולם (בסיס)" value={breakdown.venueBase} />
          {breakdown.cateringTotal > 0 && (
            <Row
              label={`קייטרינג · ${breakdown.cateringMenuName} (₪${breakdown.cateringPricePerGuest}/אורח × ${breakdown.guestCount})`}
              value={breakdown.cateringTotal}
            />
          )}
          {breakdown.serviceLines.map((l) => (
            <Row
              key={l.extraServiceId}
              label={`${l.name}${l.pricing === 'PerGuest' ? ` (₪${l.unitPrice}/אורח)` : l.quantity > 1 ? ` ×${l.quantity}` : ''}`}
              value={l.lineTotal}
            />
          ))}

          <Divider my={4} />

          <Group justify="space-between" align="center">
            <Text fw={800}>סה"כ</Text>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={breakdown.total}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <Group gap={2}>
                  <IconCurrencyShekel size={20} color="var(--mantine-color-grape-7)" />
                  <Text fw={900} fz={24} c="grape.7">{breakdown.total.toLocaleString()}</Text>
                </Group>
              </motion.div>
            </AnimatePresence>
          </Group>

          <Box mt={2}>
            <Text fz={10} c="dimmed">כל הסכומים מחושבים אוטומטית ומעודכנים בזמן אמת.</Text>
          </Box>
        </Stack>
      )}
    </Card>
  )
}
