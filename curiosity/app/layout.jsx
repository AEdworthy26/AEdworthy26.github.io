import './globals.css'

export const metadata = {
  title: 'Curiosity Corner — Personal Hub',
  description: 'Long-form history, remarkable lives, and the events that shaped the world.',
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
