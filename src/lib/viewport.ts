import { useEffect, useState } from 'react'

export const PHONE_MAX = 860

export function isPhoneLayout() {
  return window.matchMedia(`(max-width: ${PHONE_MAX}px)`).matches
}

export function usePhoneLayout() {
  const [phone, setPhone] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia(`(max-width: ${PHONE_MAX}px)`).matches
  ))

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${PHONE_MAX}px)`)
    const sync = () => setPhone(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  return phone
}
