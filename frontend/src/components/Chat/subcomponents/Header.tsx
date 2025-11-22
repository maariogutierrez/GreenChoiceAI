import React from 'react'
import './Header.css'
import { useAuth } from '../../auth/AuthContext'

const Header: React.FC = () => {
  const { user } = useAuth()
  const companyName = user?.company ?? 'Acme Labs'

  return (
    <header className="chat-header">
      <div className="chat-header-left">
        <h1 className="chat-title">
          GreenChoice AI <span className="chat-version">v0.0</span>
        </h1>
      </div>

      <div className="chat-header-right">
        <span className="company-badge">{companyName}</span>
      </div>
    </header>
  )
}

export default Header
