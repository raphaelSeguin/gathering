const pad = (n: number) => String(n).padStart(2, '0')

/** Converts an ISO date to the local-time value expected by `<input type="datetime-local">`. */
export function toDateTimeLocal(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
