import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider, DirectionProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dates/styles.css'
import './styles.css'

import { theme } from './theme.js'
import { AuthProvider } from './auth.jsx'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DirectionProvider initialDirection="rtl">
      <MantineProvider theme={theme} defaultColorScheme="light">
        <Notifications position="top-center" />
        <BrowserRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </BrowserRouter>
      </MantineProvider>
    </DirectionProvider>
  </React.StrictMode>,
)
