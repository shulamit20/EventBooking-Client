import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Grid, Card, Title, Text, Group, Stack, Select, TextInput, NumberInput, Textarea,
  Button, Badge, Chip, Divider, Box, Loader, Center, Alert, ThemeIcon,
} from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { motion, AnimatePresence } from 'framer-motion'
import {
  IconCalendar, IconUsers, IconToolsKitchen2, IconMoodSad, IconCheck, IconSparkles,
} from '@tabler/icons-react'
import { PageTransition } from '../components/Motion.jsx'
import PriceSummary from '../components/PriceSummary.jsx'
import StatusBadge from '../components/StatusBadge.jsx'
import { api, ApiError } from '../api.js'

export default function BookPage() {
  const { slotId } = useParams()
  const navigate = useNavigate()

  const [slot, setSlot] = useState(null)
  const [eventTypes, setEventTypes] = useState([])
  const [menus, setMenus] = useState([])
  const [services, setServices] = useState([])
  const [loadError, setLoadError] = useState(null)

  const [eventTypeId, setEventTypeId] = useState('')
  const [hostName, setHostName] = useState('')
  const [guestCount, setGuestCount] = useState(100)
  const [notes, setNotes] = useState('')
  const [cateringMenuId, setCateringMenuId] = useState('')
  const [pickedServiceIds, setPickedServiceIds] = useState([])

  const [breakdown, setBreakdown] = useState(null)
  const [pricing, setPricing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [conflict, setConflict] = useState(false)

  useEffect(() => {
    Promise.all([
      api.slots.get(slotId),
      api.lookups.eventTypes(),
      api.cateringMenus.list(),
      api.extraServices.list(),
    ])
      .then(([s, et, m, sv]) => {
        setSlot(s); setEventTypes(et); setMenus(m); setServices(sv)
        if (et.length) setEventTypeId(String(et[0].id))
      })
      .catch((err) => setLoadError(err.message))
  }, [slotId])

  // which service categories are relevant for the chosen event type
  const relevantCategoryIds = useMemo(() => {
    const et = eventTypes.find((t) => String(t.id) === String(eventTypeId))
    return et ? new Set(et.serviceCategoryIds) : null
  }, [eventTypes, eventTypeId])

  const visibleServices = useMemo(
    () =>
      services.filter(
        (s) => s.isActive && (!relevantCategoryIds || relevantCategoryIds.has(s.serviceCategoryId)),
      ),
    [services, relevantCategoryIds],
  )

  // drop picked services that are no longer visible when the event type changes
  useEffect(() => {
    setPickedServiceIds((ids) => ids.filter((id) => visibleServices.some((s) => String(s.id) === id)))
  }, [visibleServices])

  const selection = useMemo(
    () => ({
      hallSlotId: Number(slotId),
      guestCount: Number(guestCount) || 1,
      cateringMenuId: cateringMenuId ? Number(cateringMenuId) : null,
      extraServices: pickedServiceIds.map((id) => ({ extraServiceId: Number(id), quantity: 1 })),
    }),
    [slotId, guestCount, cateringMenuId, pickedServiceIds],
  )

  const [debouncedSelection] = useDebouncedValue(selection, 350)

  useEffect(() => {
    setPricing(true)
    api.pricing
      .estimate(debouncedSelection)
      .then(setBreakdown)
      .catch(() => {})
      .finally(() => setPricing(false))
  }, [debouncedSelection])

  async function confirm() {
    setError(null)
    setConflict(false)
    setSubmitting(true)
    try {
      const booking = await api.bookings.create({
        hallSlotId: Number(slotId),
        eventTypeId: Number(eventTypeId),
        cateringMenuId: cateringMenuId ? Number(cateringMenuId) : null,
        hostName,
        guestCount: Number(guestCount),
        notes: notes || null,
        extraServices: pickedServiceIds.map((id) => ({ extraServiceId: Number(id), quantity: 1 })),
      })
      notifications.show({ color: 'teal', title: 'ההזמנה נקלטה! 🎉', message: `הזמנה #${booking.id}`, autoClose: 3000 })
      navigate('/my-bookings')
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setConflict(true)
      else if (err instanceof ApiError && err.status === 401) navigate('/login')
      else setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loadError) return <PageTransition><Alert color="red" variant="light">{loadError}</Alert></PageTransition>
  if (!slot) return <PageTransition><Center py={80}><Loader color="grape" /></Center></PageTransition>

  if (conflict) {
    return (
      <PageTransition>
        <Box maw={520} mx="auto">
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}>
            <Card ta="center" style={{ borderColor: 'var(--mantine-color-red-3)', background: '#fff5f5' }}>
              <ThemeIcon size={64} radius="xl" color="red" variant="light" mx="auto" mb="md">
                <IconMoodSad size={34} />
              </ThemeIcon>
              <Title order={3} c="red.7">התאריך נתפס</Title>
              <Text mt="xs" c="dimmed">
                מישהו אחר הזמין את האולם הזה ממש עכשיו (השרת החזיר 409). נסו אולם או תאריך אחר.
              </Text>
              <Button component={Link} to="/slots" mt="lg" color="grape" radius="xl">
                חזרה לרשימת האולמות
              </Button>
            </Card>
          </motion.div>
        </Box>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <Group gap={8} mb="xs">
        <IconSparkles size={22} color="var(--mantine-color-grape-6)" />
        <Title order={2}>בניית הזמנה</Title>
      </Group>
      <Group c="dimmed" fz="sm" mb="lg" gap={14}>
        <Text fw={600} c="grape.7">{slot.hallName} · {slot.venueName}</Text>
        <Group gap={4}><IconCalendar size={15} />{new Date(slot.date).toLocaleDateString('he-IL')}</Group>
        <StatusBadge status={slot.status} />
      </Group>

      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="lg">
            {/* event details */}
            <Card>
              <Text fw={700} mb="sm">פרטי האירוע</Text>
              <Stack gap="sm">
                <Select
                  label="סוג אירוע"
                  data={eventTypes.map((t) => ({ value: String(t.id), label: t.name }))}
                  value={eventTypeId}
                  onChange={(v) => setEventTypeId(v ?? '')}
                  allowDeselect={false}
                />
                <TextInput
                  label="שם בעל/ת השמחה"
                  value={hostName}
                  onChange={(e) => setHostName(e.currentTarget.value)}
                  required
                  maxLength={200}
                />
                <NumberInput
                  label="מספר אורחים"
                  value={guestCount}
                  onChange={setGuestCount}
                  min={1}
                  max={5000}
                  leftSection={<IconUsers size={16} />}
                  required
                />
                <Textarea
                  label="הערות (אופציונלי)"
                  value={notes}
                  onChange={(e) => setNotes(e.currentTarget.value)}
                  autosize
                  minRows={2}
                  maxLength={2000}
                />
              </Stack>
            </Card>

            {/* catering */}
            <Card>
              <Group gap={8} mb="sm">
                <IconToolsKitchen2 size={18} color="var(--mantine-color-grape-6)" />
                <Text fw={700}>קייטרינג</Text>
                <Text fz="xs" c="dimmed">מחיר לאורח</Text>
              </Group>
              <Stack gap="xs">
                <MenuOption
                  active={cateringMenuId === ''}
                  onClick={() => setCateringMenuId('')}
                  title="בלי קייטרינג"
                />
                {menus.map((m) => (
                  <MenuOption
                    key={m.id}
                    active={cateringMenuId === String(m.id)}
                    onClick={() => setCateringMenuId(String(m.id))}
                    title={m.name}
                    price={`₪${m.pricePerGuest}/אורח`}
                    tags={[
                      m.isVegan && 'טבעוני',
                      m.isVegetarian && !m.isVegan && 'צמחוני',
                      m.includesDrinks && 'כולל שתייה',
                    ].filter(Boolean)}
                  />
                ))}
              </Stack>
            </Card>

            {/* extra services */}
            <Card>
              <Text fw={700} mb={4}>שירותים נוספים</Text>
              <Text fz="xs" c="dimmed" mb="sm">
                מוצגים רק שירותים שרלוונטיים לסוג האירוע שבחרת.
              </Text>
              {visibleServices.length === 0 ? (
                <Text fz="sm" c="dimmed">אין שירותים זמינים לסוג האירוע הזה.</Text>
              ) : (
                <Chip.Group multiple value={pickedServiceIds} onChange={setPickedServiceIds}>
                  <Group gap="xs">
                    {visibleServices.map((s) => (
                      <Chip key={s.id} value={String(s.id)} color="grape" variant="outline" size="md">
                        {s.name} · ₪{s.price.toLocaleString()}
                        {s.pricing === 'PerGuest' ? '/אורח' : ''}
                      </Chip>
                    ))}
                  </Group>
                </Chip.Group>
              )}
            </Card>
          </Stack>
        </Grid.Col>

        {/* price + confirm */}
        <Grid.Col span={{ base: 12, md: 5 }}>
          <PriceSummary breakdown={breakdown} loading={pricing} />

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Alert color="red" variant="light" mt="md">{error}</Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            mt="md"
            fullWidth
            size="md"
            loading={submitting}
            disabled={!hostName || !eventTypeId}
            onClick={confirm}
            variant="gradient"
            gradient={{ from: 'grape', to: 'pink', deg: 135 }}
            leftSection={<IconCheck size={18} />}
          >
            אישור הזמנה
          </Button>
          <Text fz="xs" c="dimmed" ta="center" mt={6}>
            ההזמנה תיכנס כ"ממתין לאישור" עד שהמנהל יאשר.
          </Text>
        </Grid.Col>
      </Grid>
    </PageTransition>
  )
}

function MenuOption({ active, onClick, title, price, tags = [] }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      style={{
        textAlign: 'right',
        width: '100%',
        border: `1.5px solid ${active ? 'var(--mantine-color-grape-5)' : 'var(--mantine-color-gray-3)'}`,
        background: active ? 'var(--mantine-color-grape-0)' : 'white',
        borderRadius: 12,
        padding: '10px 14px',
        cursor: 'pointer',
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Box>
          <Text fw={600} fz="sm">{title}</Text>
          {tags.length > 0 && (
            <Group gap={4} mt={4}>
              {tags.map((t) => (
                <Badge key={t} size="xs" variant="light" color="teal">{t}</Badge>
              ))}
            </Group>
          )}
        </Box>
        {price && <Text fz="sm" fw={700} c="grape.7">{price}</Text>}
      </Group>
    </motion.button>
  )
}
