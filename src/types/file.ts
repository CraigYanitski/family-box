export interface FtpFile {
  name: string
  size: number
  isDir: boolean
  modifiedAt: string // ISO timestamp
}
