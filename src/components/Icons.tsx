import type { ReactNode } from 'react'

type IconProps = {
  className?: string
}

function Icon({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.4-3.4" />
    </Icon>
  )
}

export function GridIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect x="3" y="3" width="7.2" height="7.2" rx="1.4" />
      <rect x="13.8" y="3" width="7.2" height="7.2" rx="1.4" />
      <rect x="3" y="13.8" width="7.2" height="7.2" rx="1.4" />
      <path
        d="M17.4 13.2 18.2 16l2.8.8-2.8.8-.8 2.8-.8-2.8-2.8-.8 2.8-.8z"
        fill="currentColor"
        stroke="none"
      />
    </Icon>
  )
}

export function ShareIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M12 16V5" />
      <path d="m8 8.5 4-4 4 4" />
      <path d="M5 14v4.2A1.8 1.8 0 0 0 6.8 20h10.4a1.8 1.8 0 0 0 1.8-1.8V14" />
    </Icon>
  )
}

export function MonitorIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect x="3" y="4" width="18" height="12.5" rx="2" />
      <path d="M8 20h8" />
      <path d="M12 16.5V20" />
    </Icon>
  )
}

export function MenuIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </Icon>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  )
}

export function MicIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect x="9" y="3" width="6" height="10" rx="3" />
      <path d="M6.5 11a5.5 5.5 0 0 0 11 0" />
      <path d="M12 16.5V20" />
      <path d="M9.5 20h5" />
    </Icon>
  )
}

export function SmileIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.2 14.2s1.4 1.8 3.8 1.8 3.8-1.8 3.8-1.8" />
      <path d="M9 10h.01" />
      <path d="M15 10h.01" />
    </Icon>
  )
}

export function ReplyIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="m9 17-5-5 5-5" />
      <path d="M20 18v-1.5A4.5 4.5 0 0 0 15.5 12H4" />
    </Icon>
  )
}

export function DotsIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx="5" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.15" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="m6 6 12 12" />
      <path d="m18 6-12 12" />
    </Icon>
  )
}

export function CanvasIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <g transform="rotate(45 12 12)">
        <rect x="7.25" y="8" width="9.5" height="9.5" rx="1.4" />
        <path d="M7.25 14.85h9.5" />
        <path d="M12 8V3.6" />
      </g>
    </Icon>
  )
}

export function FileIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M14.5 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5Z" />
      <path d="M14 3v5a1 1 0 0 0 1 1h5" />
    </Icon>
  )
}
