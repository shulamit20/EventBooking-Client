import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Title, Text, Button, Group, Stack, SimpleGrid, Card, ThemeIcon, Box, Badge,
} from '@mantine/core'
import { motion } from 'framer-motion'
import {
  IconMapPin, IconToolsKitchen2, IconMusic, IconConfetti, IconArrowLeft, IconCalendarEvent,
} from '@tabler/icons-react'
import { PageTransition, stagger, popIn, MotionDiv } from '../components/Motion.jsx'
import { api } from '../api.js'
import { theme } from '../theme.js'

const dots = Array.from({ length: 14 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${(i * 53) % 100}%`,
  color: ['#ffd43b', '#f783ac', '#b197fc', '#63e6be'][i % 4],
  delay: `${(i % 7) * 0.6}s`,
}))

const steps = [
  { icon: IconMapPin, title: 'בוחרים אולם', text: 'תאריך, משמרת ומספר אורחים' },
  { icon: IconToolsKitchen2, title: 'מוסיפים קייטרינג', text: 'תפריט בשרי / חלבי / טבעוני — מחיר לאורח' },
  { icon: IconMusic, title: 'בוחרים שירותים', text: 'תקליטן, פרחים, צילום ועוד' },
  { icon: IconConfetti, title: 'מזמינים', text: 'המחיר מחושב אוטומטית, אישור מיידי' },
]

export default function LandingPage() {
  const [eventTypes, setEventTypes] = useState([])

  useEffect(() => {
    api.lookups.eventTypes().then(setEventTypes).catch(() => {})
  }, [])

  return (
    <PageTransition>
      {/* hero */}
      <Box
        style={{
          position: 'relative',
          borderRadius: 28,
          overflow: 'hidden',
          background: theme.other.heroGradient,
          color: 'white',
          padding: '56px 40px',
        }}
      >
        <div className="hero-glow">
          {dots.map((d, i) => (
            <span key={i} style={{ left: d.left, top: d.top, background: d.color, animationDelay: d.delay }} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ position: 'relative', maxWidth: 620 }}
        >
          <Badge color="gold" variant="filled" c="dark" mb="md">פלטפורמת תכנון אירועים</Badge>
          <Title order={1} fz={{ base: 34, sm: 46 }} lh={1.1}>
            כל האירוע שלכם —<br />במקום אחד.
          </Title>
          <Text mt="md" fz="lg" opacity={0.92}>
            אולם, קייטרינג, עיצוב שולחן, תקליטן ועוד — בוחרים, רואים מחיר חי, ומזמינים.
          </Text>
          <Group mt="xl">
            <Button
              component={Link}
              to="/slots"
              size="md"
              color="gold"
              c="dark"
              rightSection={<IconArrowLeft size={18} />}
            >
              לצפייה באולמות
            </Button>
            <Button component={Link} to="/login" size="md" variant="white" c="grape.7">
              כניסה
            </Button>
          </Group>
        </motion.div>
      </Box>

      {/* steps */}
      <Title order={2} mt={48} mb="lg" ta="center">איך זה עובד</Title>
      <MotionDiv variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg">
          {steps.map((s, i) => (
            <MotionDiv key={s.title} variants={popIn}>
              <Card h="100%" ta="center">
                <ThemeIcon
                  size={54}
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: 'grape', to: 'pink', deg: 135 }}
                  mx="auto"
                  mb="sm"
                >
                  <s.icon size={28} />
                </ThemeIcon>
                <Text fw={700}>{i + 1}. {s.title}</Text>
                <Text fz="sm" c="dimmed" mt={4}>{s.text}</Text>
              </Card>
            </MotionDiv>
          ))}
        </SimpleGrid>
      </MotionDiv>

      {/* event types */}
      {eventTypes.length > 0 && (
        <Stack mt={48} align="center">
          <Group gap={8}>
            <IconCalendarEvent size={22} color="var(--mantine-color-grape-6)" />
            <Title order={3}>מתאים לכל אירוע</Title>
          </Group>
          <Group justify="center" gap={10}>
            {eventTypes.map((t) => (
              <Badge key={t.id} size="lg" variant="light" color="grape" radius="xl">
                {t.name}
              </Badge>
            ))}
          </Group>
        </Stack>
      )}
    </PageTransition>
  )
}
