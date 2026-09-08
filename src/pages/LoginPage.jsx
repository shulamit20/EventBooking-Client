import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card, SegmentedControl, TextInput, PasswordInput, Button, Stack, Title, Text, Alert, Box, Code,
} from '@mantine/core'
import { motion } from 'framer-motion'
import { IconAlertTriangle, IconSparkles } from '@tabler/icons-react'
import { notifications } from '@mantine/notifications'
import { PageTransition } from '../components/Motion.jsx'
import { useAuth } from '../auth.jsx'
import { theme } from '../theme.js'

export default function LoginPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password, displayName)
      notifications.show({ color: 'teal', message: 'ברוך הבא! 🎉', autoClose: 2000 })
      navigate('/slots')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <PageTransition>
      <Box maw={440} mx="auto">
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
          <Card>
            <Stack align="center" gap={4} mb="md">
              <Box
                style={{
                  width: 56, height: 56, borderRadius: 18, display: 'grid', placeItems: 'center',
                  background: theme.other.heroGradient, color: 'white',
                }}
              >
                <IconSparkles size={28} />
              </Box>
              <Title order={3}>{mode === 'login' ? 'כניסה לחשבון' : 'יצירת חשבון'}</Title>
            </Stack>

            <SegmentedControl
              fullWidth
              value={mode}
              onChange={setMode}
              color="grape"
              data={[{ label: 'כניסה', value: 'login' }, { label: 'הרשמה', value: 'register' }]}
              mb="md"
            />

            <form onSubmit={submit}>
              <Stack gap="sm">
                {mode === 'register' && (
                  <TextInput
                    label="שם לתצוגה"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.currentTarget.value)}
                    required
                    maxLength={200}
                  />
                )}
                <TextInput
                  label="אימייל"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  required
                />
                <PasswordInput
                  label="סיסמה"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  required
                  minLength={6}
                />

                {error && (
                  <Alert color="red" icon={<IconAlertTriangle size={16} />} variant="light">
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  loading={busy}
                  variant="gradient"
                  gradient={{ from: 'grape', to: 'pink', deg: 135 }}
                  fullWidth
                  mt={4}
                >
                  {mode === 'login' ? 'כניסה' : 'הרשמה'}
                </Button>
              </Stack>
            </form>

            <Text fz="xs" c="dimmed" ta="center" mt="md" lh={1.7}>
              משתמשי דמו — סיסמה <Code>Passw0rd!</Code><br />
              <Code>client@eventbooking.local</Code> · <Code>manager@eventbooking.local</Code>
            </Text>
          </Card>
        </motion.div>
      </Box>
    </PageTransition>
  )
}
