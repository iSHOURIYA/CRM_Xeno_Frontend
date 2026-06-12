import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Button } from './Button'
import { DarkModeToggle } from './DarkModeToggle'

const links = [
  { to: '/dashboard', icon: '▦', label: 'Dashboard' },
  { to: '/businesses', icon: '◈', label: 'Businesses' },
  { to: '/segments', icon: '⊞', label: 'Segments' },
  { to: '/campaigns', icon: '◉', label: 'Campaigns' },
  { to: '/analytics', icon: '▤', label: 'Analytics' },
]

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  function closeMenu() {
    setMenuOpen(false)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ cursor: 'pointer' }} onClick={() => { navigate('/dashboard'); closeMenu() }}>
          <span>x</span>eno CRM
        </div>
        <button className="hamburger" onClick={() => setMenuOpen(v => !v)}>
          {menuOpen ? '✕' : '☰'}
        </button>
        <nav className={`sidebar-nav ${menuOpen ? 'open' : ''}`}>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/dashboard'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeMenu}
            >
              <span className="sidebar-link-icon">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
          <div className="sidebar-footer mobile-only">
            <DarkModeToggle />
            <Button variant="default" size="sm" onClick={handleLogout} style={{ fontSize: '0.7rem' }}>
              ↺ Logout
            </Button>
          </div>
        </nav>
        <div className="sidebar-footer desktop-only">
          <DarkModeToggle />
          <Button variant="default" size="sm" onClick={handleLogout} style={{ fontSize: '0.7rem' }}>
            ↺ Logout
          </Button>
        </div>
      </aside>
      {menuOpen && <div className="sidebar-overlay" onClick={closeMenu} />}
    </>
  )
}
