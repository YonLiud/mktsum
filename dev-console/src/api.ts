const getToken = () => localStorage.getItem('token')

async function request(method: string, path: string, body?: unknown) {
  const token = getToken()
  const res = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  return res
}

export const api = {
  get: (path: string) => request('GET', path),
  post: (path: string, body?: unknown) => request('POST', path, body),
  patch: (path: string, body: unknown) => request('PATCH', path, body),
  delete: (path: string, body?: unknown) => request('DELETE', path, body),
}
