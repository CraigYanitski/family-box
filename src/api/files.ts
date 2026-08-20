import type { FtpFile, PathInfo } from '../types/file'

const BASE_URL = import.meta.env.VITE_YANITSKIBOX_MEDIA_PORT || 'localhost';

interface infoData {
  paths: FtpFile[];
}

export async function listFiles(path = '/'): Promise<infoData> {
  //const mediaURL = new URL(path, `http://${BASE_URL}`);//`http://${BASE_URL}/${path}`;
  const mediaURL = new URL("api/info", `http://${BASE_URL}`);//`http://${BASE_URL}/${path}`;
  console.log(mediaURL.href);
  const res = await fetch(mediaURL, {
    method: "POST",
    redirect: "follow",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path: path,
    }),
  });
  if (!res.ok) {
    throw new Error(`Failed to list files (${res.status})`);
  }
  //const result: infoData = await res.json();
  return res.json(); //sortPathFiles(result.paths);
}

export function sortPathFiles(paths: FtpFile[]): PathInfo {
  for (let path of paths) {
    console.log(path.name)
  }
  const dirs = paths.filter((item) => item.isDir);
  const files = paths.filter((item) => !item.isDir);
  dirs.sort((a, b) => a.name.localeCompare(b.name));
  files.sort((a, b) => a.name.localeCompare(b.name));
  return {
    dirs: dirs,
    files: files
  };
}
