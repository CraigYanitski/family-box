export interface FtpFile {
  name: string;
  size: number;
  children: number;
  isDir: boolean;
  modifiedAt: string; // ISO timestamp
}

export interface PathInfo {
  dirs: FtpFile[];
  files: FtpFile[];
}
