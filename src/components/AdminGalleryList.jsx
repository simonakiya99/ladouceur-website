import { useEffect, useState } from 'react'
import { base64ToUtf8, utf8ToBase64, gitGet, gitPut, gitDelete, committerFor } from '../lib/gitGateway.js'

const CATEGORIES = [
  { value: 'bruiloft', label: 'Bruiloft' },
  { value: 'verjaardag', label: 'Verjaardag' },
  { value: 'speciaal', label: 'Speciaal' },
]

const categoryLabel = (value) => CATEGORIES.find((c) => c.value === value)?.label || value

function AdminGalleryList({ user }) {
  const [entries, setEntries] = useState(null)
  const [error, setError] = useState(false)
  const [editingPath, setEditingPath] = useState(null)
  const [editFields, setEditFields] = useState({ title_nl: '', title_ti: '', category: 'speciaal' })
  const [busyPath, setBusyPath] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setError(false)
    setEntries(null)
    try {
      const token = await user.jwt()
      const files = await gitGet(token, 'src/content/gallery')
      const jsonFiles = (Array.isArray(files) ? files : []).filter((f) => f.name.endsWith('.json'))
      const withContent = await Promise.all(jsonFiles.map(async (f) => {
        const d = await gitGet(token, f.path)
        return { path: f.path, sha: d.sha, data: JSON.parse(base64ToUtf8(d.content)) }
      }))
      withContent.sort((a, b) => b.path.localeCompare(a.path))
      setEntries(withContent)
    } catch (err) {
      console.error(err)
      setError(true)
    }
  }

  function startEdit(entry) {
    setEditingPath(entry.path)
    setEditFields({
      title_nl: entry.data.title_nl,
      title_ti: entry.data.title_ti || '',
      category: entry.data.category,
    })
  }

  async function saveEdit(entry) {
    setBusyPath(entry.path)
    try {
      const token = await user.jwt()
      const newData = { ...entry.data, title_nl: editFields.title_nl.trim(), category: editFields.category }
      if (editFields.title_ti.trim()) newData.title_ti = editFields.title_ti.trim()
      else delete newData.title_ti

      await gitPut(token, entry.path, {
        path: entry.path,
        message: `Taart bijgewerkt: ${newData.title_nl}`,
        content: utf8ToBase64(JSON.stringify(newData, null, 2) + '\n'),
        branch: 'main',
        sha: entry.sha,
        committer: committerFor(user),
      })
      setEditingPath(null)
      await load()
    } catch (err) {
      console.error(err)
      alert('Opslaan mislukt. Probeer het opnieuw.')
    } finally {
      setBusyPath(null)
    }
  }

  async function deleteEntry(entry) {
    if (!confirm(`"${entry.data.title_nl}" verwijderen? Dit kan niet ongedaan gemaakt worden.`)) return
    setBusyPath(entry.path)
    try {
      const token = await user.jwt()
      const committer = committerFor(user)

      await gitDelete(token, entry.path, {
        message: `Taart verwijderd: ${entry.data.title_nl}`,
        sha: entry.sha,
        branch: 'main',
        committer,
      })

      const imagePath = `public${entry.data.image}`
      try {
        const imgMeta = await gitGet(token, imagePath)
        await gitDelete(token, imagePath, {
          message: `Foto verwijderd: ${entry.data.title_nl}`,
          sha: imgMeta.sha,
          branch: 'main',
          committer,
        })
      } catch (err) {
        console.error('Foto kon niet verwijderd worden (mogelijk al weg):', err)
      }

      await load()
    } catch (err) {
      console.error(err)
      alert('Verwijderen mislukt. Probeer het opnieuw.')
    } finally {
      setBusyPath(null)
    }
  }

  if (error) {
    return (
      <div className="admin-gallery-error">
        <p>Kon de foto's niet laden.</p>
        <button className="admin-logout" onClick={load}>Opnieuw proberen</button>
      </div>
    )
  }

  if (!entries) {
    return <p className="admin-loading">Foto's laden...</p>
  }

  return (
    <div className="admin-gallery-list">
      {entries.length === 0 && <p className="admin-loading">Nog geen foto's toegevoegd.</p>}

      {entries.map((entry) => (
        <div className="admin-gallery-item" key={entry.path}>
          <img src={entry.data.image} alt={entry.data.title_nl} className="admin-gallery-thumb" />

          {editingPath === entry.path ? (
            <div className="admin-gallery-edit">
              <div className="form-group">
                <label>Titel</label>
                <input
                  type="text"
                  value={editFields.title_nl}
                  onChange={(e) => setEditFields((f) => ({ ...f, title_nl: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Titel (Tigrinya)</label>
                <input
                  type="text"
                  value={editFields.title_ti}
                  onChange={(e) => setEditFields((f) => ({ ...f, title_ti: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Categorie</label>
                <select
                  value={editFields.category}
                  onChange={(e) => setEditFields((f) => ({ ...f, category: e.target.value }))}
                >
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="admin-gallery-actions">
                <button className="btn-form" onClick={() => saveEdit(entry)} disabled={busyPath === entry.path}>
                  {busyPath === entry.path ? 'Bezig...' : 'Opslaan'}
                </button>
                <button className="admin-logout" onClick={() => setEditingPath(null)}>Annuleren</button>
              </div>
            </div>
          ) : (
            <div className="admin-gallery-info">
              <p className="admin-gallery-title">{entry.data.title_nl}</p>
              <p className="admin-gallery-category">{categoryLabel(entry.data.category)}</p>
              <div className="admin-gallery-actions">
                <button className="admin-logout" onClick={() => startEdit(entry)}>Bewerken</button>
                <button
                  className="admin-logout admin-gallery-delete"
                  onClick={() => deleteEntry(entry)}
                  disabled={busyPath === entry.path}
                >
                  {busyPath === entry.path ? 'Bezig...' : 'Verwijderen'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default AdminGalleryList
