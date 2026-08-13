export function utf8ToBase64(str) {
  return btoa(unescape(encodeURIComponent(str)))
}

export function base64ToUtf8(base64) {
  return decodeURIComponent(escape(atob(base64.replace(/\s/g, ''))))
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
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
