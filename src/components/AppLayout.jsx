import { AppShell, Group, Button, Text, Menu, Avatar, Badge, Container, ActionIcon } from '@mantine/core'
import { Link, useNavigate } from 'react-router-dom'
import {
  IconSparkles, IconCalendarHeart, IconLogout, IconLayoutDashboard, IconUserCircle,
} from '@tabler/icons-react'
import { useAuth } from '../auth.jsx'

const roleLabel = { Customer: 'לקוח/ה', Manager: 'מנהל/ת', Admin: 'אדמין' }

export default function AppLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <AppShell header={{ height: 68 }} padding={0}>
      <AppShell.Header
        style={{
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(112,72,232,0.12)',
        }}
      >
        <Container size="lg" h="100%">
          <Group h="100%" justify="space-between" wrap="nowrap">
            <Group gap={8} component={Link} to="/" style={{ textDecoration: 'none' }}>
              <ActionIcon
                variant="gradient"
                gradient={{ from: 'grape', to: 'pink', deg: 135 }}
                size={38}
                radius="xl"
              >
                <IconSparkles size={22} />
              </ActionIcon>
              <Text fw={800} fz="lg" c="grape.7">EventBooking</Text>
            </Group>

            <Group gap={6} wrap="nowrap">
              <Button component={Link} to="/slots" variant="subtle" color="grape" radius="xl">
                אולמות
              </Button>

              {user?.role === 'Customer' && (
                <Button component={Link} to="/my-bookings" variant="subtle" color="grape" radius="xl">
                  ההזמנות שלי
                </Button>
              )}
              {user?.role === 'Manager' && (
                <Button
                  component={Link}
                  to="/manage"
                  variant="light"
                  color="gold"
                  radius="xl"
                  leftSection={<IconLayoutDashboard size={16} />}
                >
                  ניהול
                </Button>
              )}

              {user ? (
                <Menu shadow="md" width={220} position="bottom-end">
                  <Menu.Target>
                    <Button variant="subtle" color="dark" radius="xl" px={8}>
                      <Group gap={8} wrap="nowrap">
                        <Avatar color="grape" radius="xl" size={30}>
                          {user.displayName?.[0] ?? '?'}
                        </Avatar>
                        <Text fz="sm" fw={600} visibleFrom="sm">{user.displayName}</Text>
                      </Group>
                    </Button>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>
                      {user.email}
                      <Badge ml={6} size="xs" color="grape">{roleLabel[user.role] ?? user.role}</Badge>
                    </Menu.Label>
                    <Menu.Item
                      color="red"
                      leftSection={<IconLogout size={16} />}
                      onClick={() => { logout(); navigate('/') }}
                    >
                      יציאה
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              ) : (
                <Button
                  component={Link}
                  to="/login"
                  variant="gradient"
                  gradient={{ from: 'grape', to: 'pink', deg: 135 }}
                  radius="xl"
                  leftSection={<IconUserCircle size={18} />}
                >
                  כניסה / הרשמה
                </Button>
              )}
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" py="xl">
          {children}
        </Container>
        <Container size="lg" pb="xl">
          <Group justify="center" gap={6} c="dimmed" fz="xs" mt={40}>
            <IconCalendarHeart size={14} />
            <Text fz="xs">EventBooking · פרויקט גמר · השרת הוא מה שנבדק</Text>
          </Group>
        </Container>
      </AppShell.Main>
    </AppShell>
  )
}
