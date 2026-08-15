import { useEffect, useState } from 'react'
import { useServiceHealth } from '../hooks/useServiceHealth'
import { listFiles } from '../api/files'
import type { FtpFile } from '../types/file'

export default function Media() {
  const health = useServiceHealth('/api/media/healthz')
  const [files, setFiles] = useState<FtpFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Don't bother hitting the listing endpoint if we already know the
    // workstation is offline — avoids a slow, doomed request.
    if (health !== 'online') return

    let cancelled = false
    setLoading(true)
    setError(null)

    listFiles('/')
      .then((data) => {
        if (!cancelled) setFiles(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load files')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [health])

  if (health === 'checking') {
    return <p className="state-message">Checking file server…</p>
  }

  if (health === 'offline') {
    return (
      <p className="state-message state-message--error">
        The file server workstation appears to be offline. Files can't be listed right now.
      </p>
    )
  }

  if (loading) return <p className="state-message">Loading files…</p>
  if (error) return <p className="state-message state-message--error">{error}</p>

  return (
    <div>
      <p className="section-label">Files</p>
      <ul className="file-list">
        {files.map((file) => (
          <li key={file.name} className="file-list__row">
            <span className="file-list__name">{file.isDir ? '📁' : '📄'} {file.name}</span>
            {!file.isDir && <span className="file-list__size">{Math.round(file.size / 1024)} KB</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}
