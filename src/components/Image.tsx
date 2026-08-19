interface Props {
  path: string
}

export default function Image({ path }: Props) {
  const basePath = import.meta.env.VITE_YANITSKIBOX_MEDIA_PORT || ''
  return <img src={`http://${basePath}/api/${path}`} alt={path} width="100%" />
}
