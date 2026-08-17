//import type { FtpFile } from '../types/file'

const BASE_URL = import.meta.env.VITE_YANITSKIBOX_MEDIA_PORT

export async function listFiles(path = '/'): Promise<string> {
  console.log(`${BASE_URL}/${path}`)
  const res = await fetch(`${BASE_URL}/${path}`)
  if (!res.ok) {
    throw new Error(`Failed to list files (${res.status})`)
  }
  return res.text()
}
