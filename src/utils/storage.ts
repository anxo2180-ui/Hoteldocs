export function getLocalStorageSize(): { usedKB: number; usedMB: number; totalKB: number; percent: number } {
  let total = 0
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += (localStorage.getItem(key) || '').length
    }
  }
  const usedKB = +(total * 2 / 1024).toFixed(2)
  const usedMB = +(usedKB / 1024).toFixed(2)
  const totalKB = 5120 // ~5MB browser limit
  const percent = Math.min(100, Math.round((usedKB / totalKB) * 100))
  return { usedKB, usedMB, totalKB, percent }
}
