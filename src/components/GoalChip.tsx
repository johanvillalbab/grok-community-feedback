import { goalById } from '../workspace-data'
import { FlagIcon } from './Icons'

type GoalChipProps = {
  goalId: string
  text?: string
  active?: boolean
  onOpen: (goalId: string) => void
}

export function GoalChip({ goalId, text, active = false, onOpen }: GoalChipProps) {
  const goal = goalById(goalId)
  const label = text ?? goal?.title ?? goalId

  return (
    <span
      className={['file-chip', 'file-chip--interactive', 'goal-chip', active ? 'file-chip--active' : ''].join(' ')}
      role="button"
      tabIndex={0}
      aria-expanded={active}
      onClick={() => onOpen(goalId)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen(goalId)
        }
      }}
    >
      <FlagIcon />
      {label}
    </span>
  )
}
