import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        {children}
      </main>
    </div>
  )
}