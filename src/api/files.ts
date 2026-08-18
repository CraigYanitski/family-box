//import type { FtpFile } from '../types/file'

const BASE_URL = import.meta.env.VITE_YANITSKIBOX_MEDIA_PORT || 'localhost'

export async function listFiles(path = '/'): Promise<string> {
  const mediaURL = new URL(path, `http://${BASE_URL}`);//`http://${BASE_URL}/${path}`;
  console.log(mediaURL.href);
  const res = await fetch(mediaURL, {
    method: "GET",
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`Failed to list files (${res.status})`);
  }
  return res.text();
}
