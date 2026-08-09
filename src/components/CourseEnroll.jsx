import { useEffect, useState } from 'react'
import { translations } from '../i18n/translations'

function CourseEnroll({ lang }) {
  const [open, setOpen] = useState(false)
  const [courseName, setCourseName] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fields, setFields] = useState({ voornaam: '', achternaam: '', email: '', telefoon: '' })
  const T = translations[lang]

  useEffect(() => {
    const handler = (e) => {
      setCourseName(e.detail.courseName)
      setOpen(true)
      setStatus(null)
      setFields({ voornaam: '', achternaam: '', email: '', telefoon: '' })
    }
    window.addEventListener('course-enroll', handler)
    return () => window.removeEventListener('course-enroll', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleChange = (e) => {
    setFields(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        'form-name': 'cursusinschrijving',
        cursus_type: courseName,
        voornaam: fields.voornaam,
        achternaam: fields.achternaam,
        email: fields.email,
        telefoon: fields.telefoon,
        naam: `${fields.voornaam} ${fields.achternaam}`,
      }).toString(),
    })
      .then(() => {
        setStatus('success')
        setLoading(false)
        setFields({ voornaam: '', achternaam: '', email: '', telefoon: '' })
      })
      .catch((err) => {
        console.error('Verzenden mislukt:', err)
        setStatus('error')
        setLoading(false)
      })
  }

  const handleClose = () => {
    setOpen(false)
    setStatus(null)
  }

  return (
    <>
      {/* Statische stub-form zodat Netlify dit formulier bij het builden herkent (de echte modal wordt pas client-side gerenderd) */}
      <form name="cursusinschrijving" data-netlify="true" netlify-honeypot="bot-field" hidden>
        <input type="text" name="cursus_type" />
        <input type="text" name="voornaam" />
        <input type="text" name="achternaam" />
        <input type="email" name="email" />
        <input type="tel" name="telefoon" />
        <input type="text" name="naam" />
        <input type="text" name="bot-field" />
      </form>

      {open && (
      <div className="enroll-overlay" onClick={handleClose}>
      <div className="enroll-modal" onClick={e => e.stopPropagation()}>
        <button className="enroll-close" onClick={handleClose} aria-label={T.aria_close}>×</button>

        <div className="enroll-header">
          <span className="enroll-badge">{courseName}</span>
          <h2 className="enroll-title">{T.enroll_title}</h2>
          <p className="enroll-subtitle">{T.enroll_subtitle}</p>
        </div>

        <form
          onSubmit={handleSubmit}
          name="cursusinschrijving"
          data-netlify="true"
          netlify-honeypot="bot-field"
        >
          <input type="hidden" name="form-name" value="cursusinschrijving" />
          <p style={{ display: 'none' }}>
            <label>
              Laat dit veld leeg: <input name="bot-field" />
            </label>
          </p>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="e-voornaam">{T.label_firstname}</label>
              <input
                id="e-voornaam"
                type="text"
                name="voornaam"
                value={fields.voornaam}
                onChange={handleChange}
                placeholder={T.ph_firstname}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="e-achternaam">{T.label_lastname}</label>
              <input
                id="e-achternaam"
                type="text"
                name="achternaam"
                value={fields.achternaam}
                onChange={handleChange}
                placeholder={T.ph_lastname}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="e-email">{T.label_email}</label>
            <input
              id="e-email"
              type="email"
              name="email"
              value={fields.email}
              onChange={handleChange}
              placeholder={T.ph_email}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="e-telefoon">{T.label_phone}</label>
            <input
              id="e-telefoon"
              type="tel"
              name="telefoon"
              value={fields.telefoon}
              onChange={handleChange}
              placeholder={T.ph_phone}
              required
            />
          </div>

          {status === 'success' && (
            <div className="form-success">{T.enroll_success}</div>
          )}
          {status === 'error' && (
            <div className="form-error">{T.enroll_error}</div>
          )}

          <button type="submit" className="btn-form" disabled={loading}>
            {loading ? T.btn_sending : T.enroll_btn}
          </button>
        </form>
      </div>
      </div>
      )}
    </>
  )
}

export default CourseEnroll
