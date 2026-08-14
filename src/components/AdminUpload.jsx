import { useRef, useState } from 'react'
import { blobToBase64, compressImage, utf8ToBase64, gitPut, committerFor } from '../lib/gitGateway.js'

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

function AdminUpload({ user, onUploaded }) {
  const [imageFile, setImageFile] = useState(null)
  const [titleNl, setTitleNl] = useState('')
  const [titleTi, setTitleTi] = useState('')
  const [category, setCategory] = useState('speciaal')
  const [orderable, setOrderable] = useState(false)
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
      const committer = committerFor(user)

      const prefix = timestampPrefix()
      const slug = slugify(titleNl) || 'foto'
      const baseName = `${prefix}-${slug}`

      let ext = 'webp'
      let imageBlob
      try {
        imageBlob = await compressImage(imageFile)
      } catch (err) {
        console.error('Comprimeren mislukt, upload originele foto:', err)
        imageBlob = imageFile
        ext = (imageFile.name.split('.').pop() || 'jpg').toLowerCase()
      }

      const imagePath = `public/gallery/${baseName}.${ext}`
      const contentPath = `src/content/gallery/${baseName}.json`

      const imageBase64 = await blobToBase64(imageBlob)
      await gitPut(token, imagePath, {
        path: imagePath,
        message: `Foto toegevoegd: ${titleNl}`,
        content: imageBase64,
        branch: 'main',
        committer,
      })

      const entry = {
        image: `/gallery/${baseName}.${ext}`,
        title_nl: titleNl.trim(),
        ...(titleTi.trim() ? { title_ti: titleTi.trim() } : {}),
        category,
        orderable,
      }
      await gitPut(token, contentPath, {
        path: contentPath,
        message: `Taart toegevoegd: ${titleNl}`,
        content: utf8ToBase64(JSON.stringify(entry, null, 2) + '\n'),
        branch: 'main',
        committer,
      })

      setStatus('success')
      setTitleNl('')
      setTitleTi('')
      setCategory('speciaal')
      setOrderable(false)
      setImageFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      onUploaded?.()
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

        <div className="form-group admin-checkbox-group">
          <label htmlFor="a-bestelbaar">
            <input
              id="a-bestelbaar"
              type="checkbox"
              checked={orderable}
              onChange={(e) => setOrderable(e.target.checked)}
            />
            Klanten kunnen deze taart bestellen via het bestelformulier
          </label>
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
