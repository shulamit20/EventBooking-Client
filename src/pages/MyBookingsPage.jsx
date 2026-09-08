import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Title, Text, SimpleGrid, Card, Group, Badge, Button, Center, Loader, Stack, Box,
  Divider, Alert, Modal,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { motion } from 'framer-motion'
import {
  IconCalendar, IconUsers, IconCurrencyShekel, IconCake, IconTrash, IconMoodEmpty,
} from '@tabler/icons-react'
import { PageTransition, stagger, popIn, MotionDiv } from '../components/Motion.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { api } from '../api.js'

export default function MyBookingsPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [toCancel, setToCancel] = useState(null)
  const [opened, { open, close }] = useDisclosure(false)

  function load() {
    setError(null)
    api.bookings.mine(1, 50).then(setData).catch((err) => setError(err.message))
  }
  useEffect(load, [])

  async function doCancel() {
    try {
      await api.bookings.cancel(toCancel.id)
      notifications.show({ color: 'gray', message: 'ההזמנה בוטלה' })
      close()
      load()
    } catch (err) {
      notifications.show({ color: 'red', message: err.message })
    }
  }

  if (error) return <PageTransition><Alert color="red" variant="light">{error}</Alert></PageTransition>
  if (!data) return <PageTransition><Center py={80}><Loader color="grape" /></Center></PageTransition>

  return (
    <PageTransition>
      <Title order={2} mb="lg">ההזמנות שלי</Title>

      {data.items.length === 0 ? (
        <Center py={60}>
          <Stack align="center" gap={8}>
            <IconMoodEmpty size={42} color="var(--mantine-color-gray-5)" />
            <Text c="dimmed">עדיין אין הזמנות</Text>
            <Button component={Link} to="/slots" variant="light" color="grape" radius="xl">
              לצפייה באולמות
            </Button>
          </Stack>
        </Center>
      ) : (
        <MotionDiv variants={stagger} initial="hidden" animate="show">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
            {data.items.map((b) => (
              <MotionDiv key={b.id} variants={popIn}>
                <Card h="100%">
                  <Group justify="space-between" mb={4}>
                    <Badge variant="light" color="grape">#{b.id} · {b.eventTypeName}</Badge>
                    <StatusBadge status={b.status} />
                  </Group>
                  <Title order={4}>{b.hallName}</Title>
                  <Text fz="sm" c="dimmed">{b.venueName}</Text>

                  <Group gap={14} mt="sm" c="dimmed" fz="sm">
                    <Group gap={4}><IconCalendar size={15} />{new Date(b.date).toLocaleDateString('he-IL')}</Group>
                    <Group gap={4}><IconUsers size={15} />{b.guestCount}</Group>
                    <Text>{b.hostName}</Text>
                  </Group>

                  {b.cateringMenuName && (
                    <Group gap={4} mt={6} fz="sm" c="dimmed">
                      <IconCake size={15} />{b.cateringMenuName}
                    </Group>
                  )}

                  {b.extraServices.length > 0 && (
                    <Group gap={4} mt={6}>
                      {b.extraServices.map((s) => (
                        <Badge key={s.extraServiceId} size="xs" variant="outline" color="grape">
                          {s.name}
                        </Badge>
                      ))}
                    </Group>
                  )}

                  <Divider my="sm" />

                  <Group justify="space-between">
                    <Group gap={2}>
                      <IconCurrencyShekel size={18} color="var(--mantine-color-grape-6)" />
                      <Text fw={800} fz="lg">{b.totalPrice.toLocaleString()}</Text>
                    </Group>
                    {b.status !== 'Cancelled' && (
                      <Button
                        size="xs"
                        color="red"
                        variant="subtle"
                        leftSection={<IconTrash size={14} />}
                        onClick={() => { setToCancel(b); open() }}
                      >
                        ביטול
                      </Button>
                    )}
                  </Group>
                </Card>
              </MotionDiv>
            ))}
          </SimpleGrid>
        </MotionDiv>
      )}

      <Modal opened={opened} onClose={close} title="ביטול הזמנה" centered radius="lg">
        <Text fz="sm">
          לבטל את הזמנה #{toCancel?.id} ל{toCancel?.hallName}? הפעולה תשחרר את התאריך.
        </Text>
        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={close}>חזרה</Button>
          <Button color="red" onClick={doCancel}>כן, בטל</Button>
        </Group>
      </Modal>
    </PageTransition>
  )
}
