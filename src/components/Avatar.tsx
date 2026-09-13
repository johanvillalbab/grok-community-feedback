import { AGENT_META, type BotShapeId } from '../data'
import type { AgentKey } from '../types'

type AvatarProps = {
  agent: AgentKey
  size?: number
  stacked?: boolean
  plus?: number
}

export function Avatar({ agent, size = 36, stacked = false, plus = 0 }: AvatarProps) {
  const meta = AGENT_META[agent]

  if (agent === 'user') {
    return <UserPhoto size={size} label={meta.label} />
  }

  if (stacked) {
    return <GroupAvatar agent={agent} size={size} plus={plus} label={meta.label} />
  }

  return (
    <BotFace
      shape={meta.shape}
      color={meta.color}
      size={size}
      label={meta.label}
    />
  )
}

export function AvatarStack({ agents, size = 16 }: { agents: AgentKey[]; size?: number }) {
  return (
    <span className="avatar-chip-stack" aria-hidden="true">
      {agents.map((agent, index) => (
        <span
          key={`${agent}-${index}`}
          className="avatar-chip-stack__item"
          style={{ marginLeft: index === 0 ? 0 : -5, zIndex: index + 1 }}
        >
          <Avatar agent={agent} size={size} />
        </span>
      ))}
    </span>
  )
}

function UserPhoto({ size, label }: { size: number; label: string }) {
  return (
    <span
      className="user-photo user-photo--initials"
      role="img"
      aria-label={label}
      style={{ width: size, height: size, fontSize: Math.max(8, Math.round(size * 0.38)) }}
    >
      SV
    </span>
  )
}

function GroupAvatar({
  agent,
  size,
  plus,
  label,
}: {
  agent: AgentKey
  size: number
  plus: number
  label: string
}) {
  const partner: AgentKey = agent === 'is' ? 'design' : agent === 'craft' ? 'content' : 'ceo'
  const selfMeta = AGENT_META[agent]
  const partnerMeta = AGENT_META[partner]
  const back = Math.round(size * 0.7)
  const front = Math.round(size * 0.72)

  return (
    <span className="bot-stack" style={{ width: size, height: size }} role="img" aria-label={label}>
      <span className="bot-stack__bot">
        <BotFace
          shape={partnerMeta.shape}
          color={partnerMeta.color}
          size={back}
          decorative
        />
      </span>
      <span className="bot-stack__photo">
        <BotFace
          shape={selfMeta.shape}
          color={selfMeta.color}
          size={front}
          decorative
        />
      </span>
      {plus > 0 ? <span className="bot-stack__more">+{plus}</span> : null}
    </span>
  )
}

type BotFaceProps = {
  shape: BotShapeId
  color: string
  size: number
  label?: string
  decorative?: boolean
}

function BotFace({ shape, color, size, label, decorative }: BotFaceProps) {
  const face = opticalScale(shape)
  const eyes = size < 20 ? 1.12 : size >= 28 ? 1.08 : 1

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className="bot-face"
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : label}
    >
      <g
        fill={color}
        stroke={color}
        strokeWidth={shapeStroke(shape)}
        strokeLinejoin="round"
        transform={`translate(20 20) scale(${face}) translate(-20 -20)`}
      >
        <BotBody shape={shape} />
      </g>
      <g transform={`translate(20 20.2) rotate(-26) scale(${eyes})`} fill="#141414">
        <ellipse cx="-3.85" cy="0" rx="1.42" ry="3.35" />
        <ellipse cx="3.85" cy="0" rx="1.42" ry="3.35" />
      </g>
    </svg>
  )
}

function BotBody({ shape }: { shape: BotShapeId }) {
  switch (shape) {
      case 'cercle':
      return <circle cx="20" cy="20" r="18" strokeWidth={0} />
    case 'galet':
      return (
        <path d="M20 4.2C29.4 4.6 36.4 11.4 35.2 21.2C34.2 30.4 26.6 35.6 18.4 34.8C9.2 33.8 4.4 25.8 5.8 16.6C7.1 8.2 13.2 3.9 20 4.2Z" />
      )
    case 'squircle':
      return <rect x="5.2" y="5.2" width="29.6" height="29.6" rx="9.4" strokeWidth={0} />
    case 'capsule':
      return <rect x="4.4" y="10.2" width="31.2" height="19.6" rx="9.8" strokeWidth={0} />
    case 'triangle':
      return <path d="M20 5.2L34.6 31.4H5.4Z" />
    case 'hexagone':
      return <path d="M32.6 20L26.3 8.8H13.7L7.4 20L13.7 31.2H26.3Z" />
    case 'nuage':
      return (
        <path d="M11.2 24.6C8.2 24.4 6.2 21.6 6.8 18.8C7.4 16.2 9.8 14.6 12.4 15C13.2 11.6 16.6 9.4 20.4 9.8C23.8 10.2 26.4 12.6 27 15.8C29.6 15.6 32.2 17.6 32.6 20.4C33.1 23.6 30.8 26.4 27.6 26.8C25.8 29.6 21.8 31.2 17.8 30.2C14.6 29.4 12.4 27 11.2 24.6Z" />
      )
    case 'goutte':
      return (
        <path d="M20 3.6C20 3.6 8.4 16.4 8.4 25.2C8.4 31.6 13.6 36 20 36C26.4 36 31.6 31.6 31.6 25.2C31.6 16.4 20 3.6 20 3.6Z" />
      )
    default: {
      const exhaustive: never = shape
      return exhaustive
    }
  }
}

function opticalScale(shape: BotShapeId) {
  switch (shape) {
    case 'triangle':
    case 'hexagone':
      return 1.22
    case 'capsule':
      return 1.12
    case 'cercle':
    case 'squircle':
    case 'galet':
    case 'nuage':
    case 'goutte':
      return 1.06
    default: {
      const exhaustive: never = shape
      return exhaustive
    }
  }
}

function shapeStroke(shape: BotShapeId) {
  switch (shape) {
    case 'triangle':
    case 'hexagone':
      return 3.1
    case 'galet':
    case 'nuage':
    case 'goutte':
      return 1.4
    case 'cercle':
    case 'squircle':
    case 'capsule':
      return 0
    default: {
      const exhaustive: never = shape
      return exhaustive
    }
  }
}
