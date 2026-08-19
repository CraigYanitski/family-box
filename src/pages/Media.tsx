import { useEffect, useState } from 'react'
import { useServiceHealth } from '../hooks/useServiceHealth'
import { listFiles } from '../api/files'
import type { FtpFile } from '../types/file'
import { Link, useLocation } from 'react-router-dom';
import Image from '../components/Image';
import Video from '../components/Video';

interface Directory {
    dirs: FtpFile[],
    files: FtpFile[],
}

function parseFiles(path: string, html: string) : Directory {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const anchorTags = doc.querySelectorAll('a');

  const dirs = Array.from(anchorTags)
    .map((a) => {
      const href = a.getAttribute("href") || '';
      const name = a.textContent?.trim() || '';
      return { name, size: 0, isDir: href.endsWith('/'), modifiedAt: "" };
    })
    .filter((item): item is FtpFile =>
      item.isDir
    );
  const files = Array.from(anchorTags)
    .map((a) => {
      const href = a.getAttribute("href") || '';
      const name = a.textContent?.trim() || '';
      return { name, size: 0, isDir: href.endsWith('/'), modifiedAt: "" };
    })
    .filter((item): item is FtpFile => {
      let mediaFile: boolean = false;
      if (path.startsWith("images")) {
        mediaFile = isImage(item.name);
      }
      if (path.startsWith("videos")) {
        mediaFile = isVideo(item.name);
      }
      return !item.isDir && mediaFile
    });
  return { dirs, files }
}

function formatDirectory(files: FtpFile[], title: string) {
  if (files.length == 0) return
  return (
    <div>
      <p className="section-label">{title}</p>
      <div className="service-grid">
        {files.map((file, id) => {
          const card = (
            <>
              <div className="service-card__header">
                <h3 className="service-card__name">{file.isDir ? file.name.slice(0, -1) : file.name}</h3>
                {!file.isDir && <p>{file.size / 1024} KB</p>}
              </div>
            </>
          )
          return <Link key={id} to={file.name} className="service-card" >
            {card}
          </Link>
        })}
      </div>
    </div>
  )
}

function isImage(file: string) {
  const extensions = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"];
  const path = file.toLowerCase();
  return extensions.some((ext) => path.endsWith(ext));
}

function isVideo(file: string) {
  const extensions = [".mp4", ".mov", ".avi", ".mkv", ".wmv", ".webm", ".flv", ".mpeg"];
  const path = file.toLowerCase();
  return extensions.some((ext) => path.endsWith(ext));
}

export default function Media() {
  const health = useServiceHealth('/api/media/healthz', false)
  const [files, setFiles] = useState<FtpFile[]>([])
  const [dirs, setDirs] = useState<FtpFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const location = useLocation();
  const currentPath = location.pathname.slice("/media/".length);

  useEffect(() => {
    if (health !== 'online') return

    let cancelled = false
    setLoading(true)
    setError(null)

    console.log(currentPath)

    listFiles(`api/${currentPath}`)
      .then((data) => {
        if (!cancelled) {
          if (!isImage(currentPath) && !isVideo(currentPath)) {
            const dir = parseFiles(currentPath, data);
            setDirs(dir.dirs);
            setFiles(dir.files);
          }
        }
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
  }, [health, currentPath])

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

  if (isImage(currentPath)) {
    return <Image path={currentPath} />
  }

  if (isVideo(currentPath)) {
    return <Video path={currentPath} />
  }

  if (!dirs.length && !files.length) return <p className="state-message" >There is nothing in this directory.</p>

  return (
    <div>
      {formatDirectory(dirs, "Directories")}
      {formatDirectory(files, "Files")}
    </div>
  )
}
