import type { MarketplaceListing } from '../types'
import { listingById, MARKETPLACE } from '../workspace-data'
import { GridIcon } from './Icons'
import { WorkspaceScreen } from './WorkspaceScreen'

type MarketplaceViewProps = {
  selectedId?: string
  installedIds: string[]
  onSelect: (id: string) => void
  onToggle: (id: string, installed: boolean) => void
  onOpenBot: (listing: MarketplaceListing) => void
}

export function MarketplaceView({
  selectedId,
  installedIds,
  onSelect,
  onToggle,
  onOpenBot,
}: MarketplaceViewProps) {
  const selected = listingById(selectedId ?? '') ?? MARKETPLACE[0]

  return (
    <WorkspaceScreen
      title="Marketplace"
      parent="Sample bots for this feedback workspace"
      icon={<GridIcon />}
    >
      <ul className="market-grid">
        {MARKETPLACE.map((listing) => {
          const isOn = isListingOn(listing, installedIds)
          return (
            <li key={listing.id}>
              <button
                type="button"
                className={listing.id === selected?.id ? 'market-card market-card--active' : 'market-card'}
                onClick={() => onSelect(listing.id)}
              >
                <span className="market-card__swatch" style={{ background: listing.color }} />
                <strong>{listing.name}</strong>
                <span>{listing.blurb}</span>
                <span className="market-card__tags">{listing.tags.join(' · ')}{isOn ? ' · in workspace' : ''}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {selected ? (
        <article className="market-detail">
          <h2>{selected.name}</h2>
          <p>{selected.blurb}</p>
          <p className="artifact-detail__source">
            {isListingOn(selected, installedIds) ? 'Installed in this sample workspace.' : 'Available as a sample add-on. No connector is real.'}
          </p>
          <div className="goal-detail__actions">
            <button
              type="button"
              className="ws-button"
              onClick={() => onToggle(selected.id, !isListingOn(selected, installedIds))}
            >
              {isListingOn(selected, installedIds) ? 'Remove from sample' : 'Install sample bot'}
            </button>
            {selected.agent ? (
              <button type="button" className="ws-button ws-button--ghost" onClick={() => onOpenBot(selected)}>
                Open bot detail
              </button>
            ) : null}
          </div>
        </article>
      ) : null}
    </WorkspaceScreen>
  )
}

function isListingOn(listing: MarketplaceListing, installedIds: string[]) {
  if (listing.installed) return !installedIds.includes(`off:${listing.id}`)
  return installedIds.includes(listing.id)
}
