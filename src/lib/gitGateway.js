export function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)))
}

export function base64ToUtf8(base64) {
  return decodeURIComponent(escape(atob(base64.replace(/\s/g, ''))))
}

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Foto's rechtstreeks vanaf een telefoon kunnen 2-3MB per stuk zijn; dit
// verkleint en comprimeert ze in de browser vóór ze naar git gecommit worden,
// zodat de galerij niet langzaam blijft aangroeien (zie 37MB -> 2MB opschoning).
export function compressImage(file, { maxWidth = 1600, quality = 0.8 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      const scale = Math.min(1, maxWidth / img.naturalWidth)
      const width = Math.round(img.naturalWidth * scale)
      const height = Math.round(img.naturalHeight * scale)

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Comprimeren mislukt'))),
        'image/webp',
        quality
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Kon de foto niet lezen'))
    }
    img.src = url
  })
}

export function committerFor(user) {
  return { name: user.user_metadata?.full_name || user.email, email: user.email }
}

async function request(token, method, path, body, retry) {
  const url = method === 'GET'
    ? `/.netlify/git/github/contents/${path}?ref=main`
    : `/.netlify/git/github/contents/${path}`
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  if (res.status === 401 && retry) {
    const freshToken = await window.netlifyIdentity.currentUser().jwt(true)
    return request(freshToken, method, path, body, false)
  }

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '')
    throw new Error(`${method} ${path} mislukt (${res.status}): ${bodyText.slice(0, 300)}`)
  }

  return res.json()
}

export const gitGet = (token, path) => request(token, 'GET', path, null, true)
export const gitPut = (token, path, body) => request(token, 'PUT', path, body, true)
export const gitDelete = (token, path, body) => request(token, 'DELETE', path, body, true)
