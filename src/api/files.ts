import type { FtpFile } from '../types/file'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export async function listFiles(path = '/'): Promise<FtpFile[]> {
  const res = await fetch(`${BASE_URL}/files?path=${encodeURIComponent(path)}`)
  if (!res.ok) {
    throw new Error(`Failed to list files (${res.status})`)
  }
  return res.json()
}
