export const metadata = {
  title: 'NPS Courier',
  description: 'NPS Courier Service Management System',
  icons: {
    icon: '/nps-logo.png',
  },
}

import './globals.css'
import ReduxProvider from './lib/ReduxProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="overflow-x-hidden">
      <body className="overflow-x-hidden">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  )
}

