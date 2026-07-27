import { useEffect, useState } from 'react'
import emailjs from '@emailjs/browser'
import { translations } from '../i18n/translations'

const SERVICE_ID = 'service_pweecrd'
const TEMPLATE_ID = 'template_6a8x9rg'
const PUBLIC_KEY = 'aH2UrdkRJjRtJE-Hr'

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

    emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      cursus_type: courseName,
      voornaam: fields.voornaam,
      achternaam: fields.achternaam,
      email: fields.email,
      telefoon: fields.telefoon,
      name: `${fields.voornaam} ${fields.achternaam}`,
    }, PUBLIC_KEY)
      .then(() => {
        setStatus('success')
        setLoading(false)
        setFields({ voornaam: '', achternaam: '', email: '', telefoon: '' })
      })
      .catch((err) => {
        console.error('EmailJS fout:', err)
        setStatus('error')
        setLoading(false)
      })
  }

  const handleClose = () => {
    setOpen(false)
    setStatus(null)
  }

  if (!open) return null

  return (
    <div className="enroll-overlay" onClick={handleClose}>
      <div className="enroll-modal" onClick={e => e.stopPropagation()}>
        <button className="enroll-close" onClick={handleClose} aria-label={T.aria_close}>×</button>

        <div className="enroll-header">
          <span className="enroll-badge">{courseName}</span>
          <h2 className="enroll-title">{T.enroll_title}</h2>
          <p className="enroll-subtitle">{T.enroll_subtitle}</p>
        </div>

        <form onSubmit={handleSubmit}>
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
  )
}

export default CourseEnroll
