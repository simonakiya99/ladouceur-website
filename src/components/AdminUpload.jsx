import { useRef, useState } from 'react'

const CATEGORIES = [
  { value: 'bruiloft', label: 'Bruiloft' },
  { value: 'verjaardag', label: 'Verjaardag' },
  { value: 'speciaal', label: 'Speciaal' },
]

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function timestampPrefix() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)))
}

async function putFile(token, path, base64Content, message, committer, retry = true) {
  const res = await fetch(`/.netlify/git/github/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      path,
      message,
      content: base64Content,
      branch: 'main',
      committer,
    }),
  })

  if (res.status === 401 && retry) {
    const freshToken = await window.netlifyIdentity.currentUser().jwt(true)
    return putFile(freshToken, path, base64Content, message, committer, false)
  }

  if (!res.ok) {
    throw new Error(`Opslaan mislukt (${res.status})`)
  }

  return res.json()
}

function AdminUpload({ user }) {
  const [imageFile, setImageFile] = useState(null)
  const [titleNl, setTitleNl] = useState('')
  const [titleTi, setTitleTi] = useState('')
  const [category, setCategory] = useState('speciaal')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const fileInputRef = useRef()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!imageFile || !titleNl.trim() || !user) return
    setLoading(true)
    setStatus(null)

    try {
      const token = await user.jwt()
      const committer = { name: user.user_metadata?.full_name || user.email, email: user.email }

      const prefix = timestampPrefix()
      const slug = slugify(titleNl) || 'foto'
      const ext = (imageFile.name.split('.').pop() || 'jpg').toLowerCase()
      const baseName = `${prefix}-${slug}`
      const imagePath = `public/gallery/${baseName}.${ext}`
      const contentPath = `src/content/gallery/${baseName}.json`

      const imageBase64 = await fileToBase64(imageFile)
      await putFile(token, imagePath, imageBase64, `Foto toegevoegd: ${titleNl}`, committer)

      const entry = {
        image: `/gallery/${baseName}.${ext}`,
        title_nl: titleNl.trim(),
        ...(titleTi.trim() ? { title_ti: titleTi.trim() } : {}),
        category,
      }
      await putFile(
        token,
        contentPath,
        utf8ToBase64(JSON.stringify(entry, null, 2) + '\n'),
        `Taart toegevoegd: ${titleNl}`,
        committer
      )

      setStatus('success')
      setTitleNl('')
      setTitleTi('')
      setCategory('speciaal')
      setImageFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      console.error(err)
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-upload">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="a-foto">Foto</label>
          <input
            id="a-foto"
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="a-titel">Titel</label>
          <input
            id="a-titel"
            type="text"
            value={titleNl}
            onChange={(e) => setTitleNl(e.target.value)}
            placeholder="Bijvoorbeeld: Gouden Accent Taart"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="a-titel-ti">Titel in het Tigrinya (mag later)</label>
          <input
            id="a-titel-ti"
            type="text"
            value={titleTi}
            onChange={(e) => setTitleTi(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="a-categorie">Categorie</label>
          <select id="a-categorie" value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {status === 'success' && (
          <div className="form-success">Gelukt! De foto verschijnt over een paar minuten op de website.</div>
        )}
        {status === 'error' && (
          <div className="form-error">Er ging iets mis. Controleer je internetverbinding en probeer het nog eens.</div>
        )}

        <button type="submit" className="btn-form" disabled={loading}>
          {loading ? 'Bezig met uploaden...' : 'Foto toevoegen'}
        </button>
      </form>
    </div>
  )
}

export default AdminUpload
