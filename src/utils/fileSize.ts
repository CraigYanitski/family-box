const UNITS = ["B", "KiB", "MiB", "GiB", "TiB"]

export function formatFilesize(bytes: number, decimals: number = 3): string {
  if (bytes === 0) return "0 B";
  if (bytes < 0) return "0 B";
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const idx = Math.floor(Math.log(bytes) / Math.log(k));
  const uIdx = Math.min(idx, UNITS.length-1);
  const val = bytes / Math.pow(k, uIdx)

  return `${val.toPrecision(dm)} ${UNITS[uIdx]}`
}
