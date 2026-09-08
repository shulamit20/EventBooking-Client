import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Title, Text, Group, SimpleGrid, Card, Badge, Button, Select, SegmentedControl,
  Pagination, Center, Loader, Alert, Stack, Box, Divider,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { motion } from 'framer-motion'
import {
  IconCalendar, IconCurrencyShekel, IconSun, IconSunset, IconMoon, IconArrowLeft, IconMoodEmpty,
} from '@tabler/icons-react'
import { PageTransition, stagger, popIn, MotionDiv } from '../components/Motion.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { useAuth } from '../auth.jsx'
import { api } from '../api.js'

const PAGE_SIZE = 9
const shiftIcon = { Morning: IconSun, Noon: IconSunset, Evening: IconMoon }
const shiftLabel = { Morning: 'בוקר', Noon: 'צהריים', Evening: 'ערב' }

export default function SlotsPage() {
  const { user } = useAuth()

  const [page, setPage] = useState(1)
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('date')
  const [range, setRange] = useState([null, null])

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const [from, to] = range
    api.slots
      .list({
        page,
        pageSize: PAGE_SIZE,
        status: status || undefined,
        sortBy: sort,
        desc: sort === 'price-desc',
        fromDate: from ? from.toISOString() : undefined,
        toDate: to ? to.toISOString() : undefined,
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [page, status, sort, range])

  // reset to page 1 when a filter changes
  useEffect(() => { setPage(1) }, [status, sort, range])

  const totalPages = data?.totalPages || 1

  return (
    <PageTransition>
      <Group justify="space-between" align="flex-end" mb="lg" wrap="wrap">
        <Box>
          <Title order={2}>אולמות זמינים</Title>
          <Text c="dimmed" fz="sm">
            {data ? `${data.totalCount} תוצאות · עמוד ${data.page} מתוך ${totalPages}` : 'טוען...'}
          </Text>
        </Box>
      </Group>

      {/* filters */}
      <Card mb="lg" p="md">
        <Group gap="md" wrap="wrap" align="flex-end">
          <DatePickerInput
            type="range"
            label="טווח תאריכים"
            placeholder="בחר תאריכים"
            value={range}
            onChange={setRange}
            valueFormat="DD/MM/YYYY"
            clearable
            leftSection={<IconCalendar size={16} />}
            w={230}
          />
          <Select
            label="מיון"
            value={sort}
            onChange={setSort}
            data={[
              { value: 'date', label: 'לפי תאריך' },
              { value: 'price', label: 'מחיר: מהזול ליקר' },
              { value: 'price-desc', label: 'מחיר: מהיקר לזול' },
            ]}
            w={200}
          />
          <Box>
            <Text fz="sm" fw={500} mb={4}>סטטוס</Text>
            <SegmentedControl
              value={status}
              onChange={setStatus}
              color="grape"
              data={[
                { label: 'הכל', value: '' },
                { label: 'פנוי', value: 'Available' },
                { label: 'תפוס', value: 'Booked' },
              ]}
            />
          </Box>
        </Group>
      </Card>

      {error && <Alert color="red" variant="light" mb="md">{error}</Alert>}

      {loading ? (
        <Center py={60}><Loader color="grape" /></Center>
      ) : data.items.length === 0 ? (
        <Center py={60}>
          <Stack align="center" gap={6}>
            <IconMoodEmpty size={40} color="var(--mantine-color-gray-5)" />
            <Text c="dimmed">אין אולמות שמתאימים לסינון</Text>
          </Stack>
        </Center>
      ) : (
        <MotionDiv variants={stagger} initial="hidden" animate="show">
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            {data.items.map((s) => {
              const ShiftIcon = shiftIcon[s.shift] ?? IconCalendar
              const canBook = s.status === 'Available' && user?.role === 'Customer'
              return (
                <MotionDiv key={s.id} variants={popIn} whileHover={{ y: -6 }} transition={{ duration: 0.2 }}>
                  <Card h="100%">
                    <Group justify="space-between" mb="xs">
                      <Badge variant="dot" color="grape">{s.venueName}</Badge>
                      <StatusBadge status={s.status} />
                    </Group>

                    <Title order={4}>{s.hallName}</Title>

                    <Group gap={14} mt="sm" c="dimmed" fz="sm">
                      <Group gap={4}><IconCalendar size={15} />{new Date(s.date).toLocaleDateString('he-IL')}</Group>
                      <Group gap={4}><ShiftIcon size={15} />{shiftLabel[s.shift] ?? s.shift}</Group>
                    </Group>

                    <Divider my="sm" />

                    <Group justify="space-between" align="center">
                      <Group gap={2}>
                        <IconCurrencyShekel size={18} color="var(--mantine-color-grape-6)" />
                        <Text fw={800} fz="lg">{s.basePrice.toLocaleString()}</Text>
                        <Text fz="xs" c="dimmed">בסיס</Text>
                      </Group>

                      {canBook ? (
                        <Button
                          component={Link}
                          to={`/book/${s.id}`}
                          size="sm"
                          variant="gradient"
                          gradient={{ from: 'grape', to: 'pink', deg: 135 }}
                          rightSection={<IconArrowLeft size={16} />}
                        >
                          הזמנה
                        </Button>
                      ) : s.status === 'Available' && !user ? (
                        <Button component={Link} to="/login" size="sm" variant="light" color="grape">
                          התחברי להזמנה
                        </Button>
                      ) : null}
                    </Group>
                  </Card>
                </MotionDiv>
              )
            })}
          </SimpleGrid>
        </MotionDiv>
      )}

      {totalPages > 1 && (
        <Center mt="xl">
          <Pagination total={totalPages} value={page} onChange={setPage} color="grape" radius="xl" />
        </Center>
      )}
    </PageTransition>
  )
}
