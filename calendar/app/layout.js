import './globals.css'

export const metadata = {
  title: 'Calendar — Personal Hub',
  description: 'Personal calendar and event planner',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-paper text-ink min-h-screen">{children}</body>
    </html>
  )
}
