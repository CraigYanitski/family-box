import { useEffect, useState } from 'react'
import { useServiceHealth } from '../hooks/useServiceHealth'
import { listFiles, sortPathFiles } from '../api/files'
import type { FtpFile } from '../types/file'
import { Link, useLocation } from 'react-router-dom';
import Image from '../components/Image';
import Video from '../components/Video';
import { formatFilesize } from '../utils/fileSize';
import PageBody from '../components/PageBody';

function formatDirectory(files: FtpFile[], path: string, fileSection: boolean) {
  if (files.length == 0) return;
  const sectionTitle = fileSection ? "Files" : "Directories";
  const sectionType = fileSection ? "file" : "directory";
  return (
    <div>
      <p className="section-label">{sectionTitle}</p>
      <div className={`${sectionType}-grid`}>
        {files.map((file, id) => {
          const card = (
            <>
              <div className={`${sectionType}-card__header`}>
                <h3 className={`${sectionType}-card__name`}>{file.name}</h3>
              </div>
              <p className={`${sectionType}-card__desc`}>{file.isDir ? file.children + " items" : formatFilesize(file.size)}</p>
            </>
          )
          return <Link key={id} to={`${path}/${file.name}`} className={`${sectionType}-card`} >
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

  useEffect(() => {
    if (health !== 'online') return

    let cancelled = false
    setLoading(true)
    setError(null)

    const currentPath = location.pathname.slice("/media/".length);
    console.log(currentPath)

    listFiles(decodeURIComponent(currentPath))
      .then((data) => {
        if (!cancelled) {
          const paths = sortPathFiles(data.paths)
          setDirs(paths.dirs)
          setFiles(paths.files)
          //if (!isImage(currentPath) && !isVideo(currentPath)) {
          //  const dir = parseFiles(currentPath, data);
          //  setDirs(dir.dirs);
          //  setFiles(dir.files);
          //}
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
  }, [health, location])

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

  if (isImage(location.pathname)) {
    return <Image path={location.pathname.slice("/media/".length)} />
  }

  if (isVideo(location.pathname)) {
    return <Video path={location.pathname.slice("/media/".length)} />
  }

  if (!dirs.length && !files.length) return <p className="state-message" >There is nothing in this directory.</p>

  return (
    <div>
      <PageBody>
        This is a connection to a media file server running on your workstation.
        In order for your images and video to be seen here, place in the `Pictures` and `Videos` directories, respectively.
        Just be warned that any files you put in these directories will be viewable to anybody on your network if the know of this website.
        If you have any issues, just let me know.
      </PageBody>
      {formatDirectory(dirs, location.pathname, false)}
      {formatDirectory(files, location.pathname, true)}
    </div>
  )
}

