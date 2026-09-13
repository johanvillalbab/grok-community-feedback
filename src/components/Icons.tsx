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

export function PlanIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect x="3.5" y="5.5" width="8" height="3.2" rx="1.6" fill="currentColor" stroke="none" />
      <rect x="8" y="10.4" width="12" height="3.2" rx="1.6" fill="currentColor" stroke="none" />
      <rect x="13.5" y="15.3" width="7" height="3.2" rx="1.6" fill="currentColor" stroke="none" />
    </Icon>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  )
}

export function HashIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M5 9h14" />
      <path d="M5 15h14" />
      <path d="m9.5 4-2 16" />
      <path d="m16.5 4-2 16" />
    </Icon>
  )
}

export function FolderIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M3.5 7.5A1.5 1.5 0 0 1 5 6h4.2c.3 0 .6.1.8.3l1.3 1.2c.2.2.5.3.8.3H19a1.5 1.5 0 0 1 1.5 1.5V18A1.5 1.5 0 0 1 19 19.5H5A1.5 1.5 0 0 1 3.5 18Z" />
    </Icon>
  )
}

export function CloudIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M7.2 17.5h9.3a3.7 3.7 0 0 0 .5-7.35 5 5 0 0 0-9.6-1.1A3.6 3.6 0 0 0 7.2 17.5Z" />
    </Icon>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="m5.5 12.5 4 4 9-9" />
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

export function FlagIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M5 4v16" />
      <path d="M5 5h10.5L14 8.5 15.5 12H5" />
    </Icon>
  )
}

export function PulseIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M3 12h3.2l2-6 3.6 12 2.4-6H21" />
    </Icon>
  )
}

export function SparkIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M12 3.5 13.4 9l5.6 1.4L13.4 12 12 17.5 10.6 12 5 10.4 10.6 9Z" />
    </Icon>
  )
}

export function LayersIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="m4 8 8-4 8 4-8 4Z" />
      <path d="m4 12 8 4 8-4" />
      <path d="m4 16 8 4 8-4" />
    </Icon>
  )
}

export function ArchiveIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect x="3.5" y="4" width="17" height="4" rx="1.2" />
      <path d="M5 8v10.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V8" />
      <path d="M9.5 12h5" />
    </Icon>
  )
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M12 3.5 19 6v6.2c0 4-2.8 6.8-7 8.3-4.2-1.5-7-4.3-7-8.3V6Z" />
    </Icon>
  )
}
