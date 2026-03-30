import './globals.css'

export const metadata = {
  title: 'Tech News — Personal Hub',
  description: 'Daily technology news briefing — Alfie Edworthy',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink font-serif antialiased">
        {children}
      </body>
    </html>
  )
}
