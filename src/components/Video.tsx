interface Props {
  path: string
}

export default function Video({ path }: Props) {
  const basePath = import.meta.env.VITE_YANITSKIBOX_MEDIA_PORT || ''
  return (
    <video 
      src={`http://${basePath}/api/${path}`}
      controls
      playsInline
      width="100%"
    >
      Your browser cannot play {path}.
    </video >
  )
}
