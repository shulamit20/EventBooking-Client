import { useEffect, useState } from 'react'
import {
  Title, Text, Table, Group, Badge, Button, SegmentedControl, Center, Loader, Alert,
  Pagination, Box, Stack, Card, SimpleGrid,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { motion } from 'framer-motion'
import { IconCheck, IconX, IconClockHour4, IconCurrencyShekel } from '@tabler/icons-react'
import { PageTransition } from '../components/Motion.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { api } from '../api.js'

const PAGE_SIZE = 15

export default function ManagerPage() {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busyId, setBusyId] = useState(null)

  function load() {
    setLoading(true)
    setError(null)
    api.bookings
      .all(page, PAGE_SIZE, status || undefined)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }
  useEffect(load, [page, status])
  useEffect(() => { setPage(1) }, [status])

  async function setBookingStatus(id, next) {
    setBusyId(id)
    try {
      await api.bookings.setStatus(id, next)
      notifications.show({ color: next === 'Confirmed' ? 'teal' : 'gray', message: `הזמנה #${id} → ${next}` })
      load()
    } catch (err) {
      notifications.show({ color: 'red', message: err.message })
    } finally {
      setBusyId(null)
    }
  }

  const totalPages = data?.totalPages || 1
  const counts = data
    ? data.items.reduce((acc, b) => ({ ...acc, [b.status]: (acc[b.status] ?? 0) + 1 }), {})
    : {}

  return (
    <PageTransition>
      <Title order={2} mb="xs">ניהול הזמנות</Title>
      <Text c="dimmed" fz="sm" mb="lg">אישור, דחייה ומעקב אחרי כל ההזמנות במערכת.</Text>

      {data && (
        <SimpleGrid cols={{ base: 3 }} spacing="sm" mb="lg">
          {[
            { k: 'Pending', label: 'ממתינות', color: 'gold', icon: IconClockHour4 },
            { k: 'Confirmed', label: 'מאושרות', color: 'teal', icon: IconCheck },
            { k: 'Cancelled', label: 'בוטלו', color: 'gray', icon: IconX },
          ].map((c) => (
            <motion.div key={c.k} whileHover={{ y: -3 }}>
              <Card p="sm">
                <Group gap={8}>
                  <c.icon size={18} color={`var(--mantine-color-${c.color}-6)`} />
                  <Text fz="sm" c="dimmed">{c.label}</Text>
                </Group>
                <Text fw={800} fz={22}>{counts[c.k] ?? 0}<Text span fz="xs" c="dimmed"> בעמוד</Text></Text>
              </Card>
            </motion.div>
          ))}
        </SimpleGrid>
      )}

      <SegmentedControl
        value={status}
        onChange={setStatus}
        color="grape"
        mb="md"
        data={[
          { label: 'הכל', value: '' },
          { label: 'ממתינות', value: 'Pending' },
          { label: 'מאושרות', value: 'Confirmed' },
          { label: 'בוטלו', value: 'Cancelled' },
        ]}
      />

      {error && <Alert color="red" variant="light" mb="md">{error}</Alert>}

      {loading ? (
        <Center py={50}><Loader color="grape" /></Center>
      ) : data.items.length === 0 ? (
        <Center py={50}><Text c="dimmed">אין הזמנות</Text></Center>
      ) : (
        <Card p={0} style={{ overflow: 'hidden' }}>
          <Table.ScrollContainer minWidth={640}>
            <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>אולם / אירוע</Table.Th>
                  <Table.Th>תאריך</Table.Th>
                  <Table.Th>אורחים</Table.Th>
                  <Table.Th>סכום</Table.Th>
                  <Table.Th>סטטוס</Table.Th>
                  <Table.Th>פעולות</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.items.map((b) => (
                  <Table.Tr key={b.id}>
                    <Table.Td>{b.id}</Table.Td>
                    <Table.Td>
                      <Text fw={600} fz="sm">{b.hallName}</Text>
                      <Text fz="xs" c="dimmed">{b.eventTypeName} · {b.hostName}</Text>
                    </Table.Td>
                    <Table.Td fz="sm">{new Date(b.date).toLocaleDateString('he-IL')}</Table.Td>
                    <Table.Td fz="sm">{b.guestCount}</Table.Td>
                    <Table.Td>
                      <Group gap={1}>
                        <IconCurrencyShekel size={13} />
                        <Text fz="sm" fw={600}>{b.totalPrice.toLocaleString()}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td><StatusBadge status={b.status} /></Table.Td>
                    <Table.Td>
                      {b.status === 'Pending' ? (
                        <Group gap={6} wrap="nowrap">
                          <Button
                            size="xs" color="teal" loading={busyId === b.id}
                            leftSection={<IconCheck size={14} />}
                            onClick={() => setBookingStatus(b.id, 'Confirmed')}
                          >
                            אישור
                          </Button>
                          <Button
                            size="xs" color="red" variant="light" loading={busyId === b.id}
                            leftSection={<IconX size={14} />}
                            onClick={() => setBookingStatus(b.id, 'Cancelled')}
                          >
                            דחייה
                          </Button>
                        </Group>
                      ) : b.status === 'Confirmed' ? (
                        <Button
                          size="xs" color="red" variant="subtle" loading={busyId === b.id}
                          onClick={() => setBookingStatus(b.id, 'Cancelled')}
                        >
                          ביטול
                        </Button>
                      ) : (
                        <Text fz="xs" c="dimmed">—</Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>
      )}

      {totalPages > 1 && (
        <Center mt="lg">
          <Pagination total={totalPages} value={page} onChange={setPage} color="grape" radius="xl" />
        </Center>
      )}
    </PageTransition>
  )
}
