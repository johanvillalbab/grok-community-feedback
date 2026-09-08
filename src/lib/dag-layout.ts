export type DAGLayoutOptions = {
  nodes: Array<{ id: string }>
  edges: Array<{ from: string; to: string }>
  direction?: 'vertical' | 'horizontal'
  nodeWidth?: number
  nodeHeight?: number
  rankGap?: number
  nodeGap?: number
  padding?: number
}

export type DAGLayoutNode = {
  id: string
  x: number
  y: number
  rank: number
  order: number
}

export type DAGLayoutEdge = {
  from: string
  to: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  isBackEdge: boolean
}

export type DAGLayoutResult = {
  nodes: DAGLayoutNode[]
  edges: DAGLayoutEdge[]
  width: number
  height: number
  direction: 'vertical' | 'horizontal'
}

export function computeDAGLayout(options: DAGLayoutOptions): DAGLayoutResult {
  const direction = options.direction ?? 'horizontal'
  const nodeWidth = options.nodeWidth ?? 132
  const nodeHeight = options.nodeHeight ?? 48
  const rankGap = options.rankGap ?? 36
  const nodeGap = options.nodeGap ?? 16
  const padding = options.padding ?? 12

  const ids = options.nodes.map((node) => node.id)
  const idSet = new Set(ids)
  const outgoing = new Map<string, string[]>()
  const incoming = new Map<string, string[]>()

  for (const id of ids) {
    outgoing.set(id, [])
    incoming.set(id, [])
  }

  const rawEdges = options.edges.filter((edge) => idSet.has(edge.from) && idSet.has(edge.to))
  for (const edge of rawEdges) {
    outgoing.get(edge.from)?.push(edge.to)
    incoming.get(edge.to)?.push(edge.from)
  }

  const backEdges = findBackEdges(ids, outgoing)
  const forwardOutgoing = new Map<string, string[]>()
  const forwardIncoming = new Map<string, string[]>()
  for (const id of ids) {
    forwardOutgoing.set(id, [])
    forwardIncoming.set(id, [])
  }
  for (const edge of rawEdges) {
    if (backEdges.has(edgeKey(edge.from, edge.to))) continue
    forwardOutgoing.get(edge.from)?.push(edge.to)
    forwardIncoming.get(edge.to)?.push(edge.from)
  }

  const ranks = assignRanks(ids, forwardIncoming, forwardOutgoing)
  const byRank = new Map<number, string[]>()
  for (const id of ids) {
    const rank = ranks.get(id) ?? 0
    const bucket = byRank.get(rank) ?? []
    bucket.push(id)
    byRank.set(rank, bucket)
  }

  const maxRank = Math.max(0, ...byRank.keys())
  for (let pass = 0; pass < 2; pass += 1) {
    for (let rank = 1; rank <= maxRank; rank += 1) {
      const nodesAtRank = byRank.get(rank)
      if (!nodesAtRank) continue
      nodesAtRank.sort((a, b) => barycenter(a, forwardIncoming, byRank) - barycenter(b, forwardIncoming, byRank))
    }
  }

  const rankSizes = Array.from({ length: maxRank + 1 }, (_, rank) => byRank.get(rank)?.length ?? 0)
  const maxInRank = Math.max(1, ...rankSizes)

  const nodes: DAGLayoutNode[] = []
  const nodeMap = new Map<string, DAGLayoutNode>()

  for (let rank = 0; rank <= maxRank; rank += 1) {
    const rankNodes = byRank.get(rank) ?? []
    const extra = (maxInRank - rankNodes.length) * (crossSize(direction, nodeWidth, nodeHeight) + nodeGap)
    const offset = extra / 2

    rankNodes.forEach((id, order) => {
      const along = padding + rank * (alongSize(direction, nodeWidth, nodeHeight) + rankGap)
      const across = padding + offset + order * (crossSize(direction, nodeWidth, nodeHeight) + nodeGap)
      const placed: DAGLayoutNode = {
        id,
        rank,
        order,
        x: direction === 'horizontal' ? along : across,
        y: direction === 'horizontal' ? across : along,
      }
      nodes.push(placed)
      nodeMap.set(id, placed)
    })
  }

  const edges: DAGLayoutEdge[] = rawEdges.flatMap((edge) => {
    const from = nodeMap.get(edge.from)
    const to = nodeMap.get(edge.to)
    if (!from || !to) return []

    const isBackEdge = backEdges.has(edgeKey(edge.from, edge.to))
    if (direction === 'horizontal') {
      return [{
        from: edge.from,
        to: edge.to,
        sourceX: from.x + nodeWidth,
        sourceY: from.y + nodeHeight / 2,
        targetX: to.x,
        targetY: to.y + nodeHeight / 2,
        isBackEdge,
      }]
    }

    return [{
      from: edge.from,
      to: edge.to,
      sourceX: from.x + nodeWidth / 2,
      sourceY: from.y + nodeHeight,
      targetX: to.x + nodeWidth / 2,
      targetY: to.y,
      isBackEdge,
    }]
  })

  const width = padding * 2
    + (maxRank + 1) * alongSize(direction, nodeWidth, nodeHeight)
    + maxRank * rankGap
  const height = padding * 2
    + maxInRank * crossSize(direction, nodeWidth, nodeHeight)
    + (maxInRank - 1) * nodeGap

  return { nodes, edges, width, height, direction }
}

function alongSize(direction: 'vertical' | 'horizontal', nodeWidth: number, nodeHeight: number) {
  return direction === 'horizontal' ? nodeWidth : nodeHeight
}

function crossSize(direction: 'vertical' | 'horizontal', nodeWidth: number, nodeHeight: number) {
  return direction === 'horizontal' ? nodeHeight : nodeWidth
}

function edgeKey(from: string, to: string) {
  return `${from}->${to}`
}

function findBackEdges(ids: string[], outgoing: Map<string, string[]>) {
  const backEdges = new Set<string>()
  const color = new Map<string, 'white' | 'gray' | 'black'>()
  for (const id of ids) color.set(id, 'white')

  const visit = (id: string) => {
    color.set(id, 'gray')
    for (const next of outgoing.get(id) ?? []) {
      const state = color.get(next)
      if (state === 'gray') {
        backEdges.add(edgeKey(id, next))
        continue
      }
      if (state === 'white') visit(next)
    }
    color.set(id, 'black')
  }

  for (const id of ids) {
    if (color.get(id) === 'white') visit(id)
  }

  return backEdges
}

function assignRanks(
  ids: string[],
  incoming: Map<string, string[]>,
  outgoing: Map<string, string[]>,
) {
  const ranks = new Map<string, number>()
  const ready = ids.filter((id) => (incoming.get(id)?.length ?? 0) === 0)
  const remaining = new Map(ids.map((id) => [id, incoming.get(id)?.length ?? 0]))

  for (const id of ready) ranks.set(id, 0)

  while (ready.length > 0) {
    const id = ready.shift()
    if (!id) break
    const rank = ranks.get(id) ?? 0
    for (const next of outgoing.get(id) ?? []) {
      ranks.set(next, Math.max(ranks.get(next) ?? 0, rank + 1))
      const left = (remaining.get(next) ?? 1) - 1
      remaining.set(next, left)
      if (left === 0) ready.push(next)
    }
  }

  for (const id of ids) {
    if (!ranks.has(id)) ranks.set(id, 0)
  }

  return ranks
}

function barycenter(
  id: string,
  incoming: Map<string, string[]>,
  byRank: Map<number, string[]>,
) {
  const parents = incoming.get(id) ?? []
  if (parents.length === 0) return 0

  const sum = parents.reduce((total, parent) => {
    const parentRank = [...byRank.entries()].find(([, nodes]) => nodes.includes(parent))?.[0] ?? 0
    const order = byRank.get(parentRank)?.indexOf(parent) ?? 0
    return total + order
  }, 0)

  return sum / parents.length
}
