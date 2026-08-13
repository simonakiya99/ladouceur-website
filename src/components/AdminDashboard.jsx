import { useEffect, useState } from 'react'
import AdminUpload from './AdminUpload.jsx'
import AdminGalleryList from './AdminGalleryList.jsx'
import CertificateGenerator from './CertificateGenerator.jsx'

const TABS = [
  { key: 'foto', label: "Foto's" },
  { key: 'certificaat', label: 'Certificaat' },
]

function AdminDashboard() {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('foto')
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0)

  useEffect(() => {
    const identity = window.netlifyIdentity
    if (!identity) return
    setReady(true)
    setUser(identity.currentUser())

    const onLogin = (u) => { setUser(u); identity.close() }
    const onLogout = () => setUser(null)
    identity.on('login', onLogin)
    identity.on('logout', onLogout)
    return () => {
      identity.off('login', onLogin)
      identity.off('logout', onLogout)
    }
  }, [])

  if (!ready) {
    return <p className="admin-loading">Laden...</p>
  }

  if (!user) {
    return (
      <div className="admin-login">
        <p>Log in om het beheer te openen.</p>
        <button className="btn-form" onClick={() => window.netlifyIdentity.open('login')}>
          Inloggen
        </button>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-upload-header">
        <p>Ingelogd als {user.email}</p>
        <button className="admin-logout" onClick={() => window.netlifyIdentity.logout()}>
          Uitloggen
        </button>
      </div>

      <div className="admin-tabs filter-buttons">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`filter-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'foto' && (
        <>
          <AdminUpload user={user} onUploaded={() => setGalleryRefreshKey((k) => k + 1)} />
          <h3 className="admin-gallery-heading">Bestaande foto's</h3>
          <AdminGalleryList key={galleryRefreshKey} user={user} />
        </>
      )}
      {tab === 'certificaat' && <CertificateGenerator />}
    </div>
  )
}

export default AdminDashboard
