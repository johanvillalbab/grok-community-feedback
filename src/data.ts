import type { AgentKey, Conversation, FeedItem, WorkspaceFile } from './types'

export const CURRENT_USER = {
  name: 'Sho V.',
  agent: 'user' as const,
}

export type BotShapeId =
  | 'cercle'
  | 'galet'
  | 'squircle'
  | 'capsule'
  | 'triangle'
  | 'hexagone'
  | 'nuage'
  | 'goutte'

export const AGENT_META: Record<
  AgentKey,
  { label: string; color: string; shape: BotShapeId }
> = {
  is: {
    label: 'Core · Engineering',
    color: '#2fbfa0',
    shape: 'cercle',
  },
  content: {
    label: 'Content & Brand Specialist',
    color: '#3b93f0',
    shape: 'hexagone',
  },
  visual: {
    label: 'Visual Designer',
    color: '#f08a24',
    shape: 'hexagone',
  },
  design: {
    label: 'Design Engineer',
    color: '#e152b0',
    shape: 'cercle',
  },
  craft: {
    label: 'Core · Craft',
    color: '#2fbfa0',
    shape: 'cercle',
  },
  masterclass: {
    label: 'Core · Masterclass Second',
    color: '#f1efe9',
    shape: 'galet',
  },
  ceo: {
    label: 'CEO',
    color: '#2fbfa0',
    shape: 'cercle',
  },
  pm: {
    label: 'Product Manager',
    color: '#8b5e3c',
    shape: 'squircle',
  },
  community: {
    label: 'Community Manager',
    color: '#3ecf8e',
    shape: 'cercle',
  },
  growth: {
    label: 'Growth Marketer',
    color: '#a3a3a3',
    shape: 'cercle',
  },
  fullstack: {
    label: 'Full-stack Engineer',
    color: '#8b5cf6',
    shape: 'capsule',
  },
  marketing: {
    label: 'Product Marketing Specialist',
    color: '#f0b429',
    shape: 'triangle',
  },
  org: {
    label: 'Org',
    color: '#f1efe9',
    shape: 'goutte',
  },
  user: {
    label: 'Sho V.',
    color: '#e152b0',
    shape: 'cercle',
  },
}

export const FILES: Record<string, WorkspaceFile> = {
  contrato: {
    id: 'contrato',
    path: '/workspace/about/COMPONENT-CONTRACT.md',
    name: 'COMPONENT-CONTRACT.md',
    language: 'markdown',
    content: `# Component contract - About

Source of truth for implementing the About page. If an agent touches this surface, it has to read this file first and reply \`Accept\` before writing code.

## Tokens

- \`--bg\` \`#070707\` - page background
- \`--surface\` \`#141414\` - sections and cards
- \`--text\` \`#f4f4f5\` - titles and body
- \`--muted\` \`#a1a1aa\` - supporting text and captions
- \`--accent\` \`#e23d8c\` - CTAs and highlights
- \`--line\` \`#2a2a2a\` - soft borders
- \`--radius-card\` \`20px\` - cards and blocks
- \`--space-section\` \`96px / 64px\` - desktop / mobile

Type: system sans, titles \`-0.03em\`, body 16/26. Do not introduce a second family.

## Layout

### Container
Max width 1120px, horizontal padding 24px. Never a full-bleed block except Hero and CTA.

### Section
Vertical padding \`var(--space-section)\`. Each section declares \`aria-labelledby\` pointing to its h2.

### Grid
12 columns on desktop, 1 on mobile. Gaps 24px. Do not mix different grids inside the same section.

## Primitives

### Button
- Variants: \`primary\`, \`ghost\`, \`link\`
- Sizes: \`md\` (44px), \`sm\` (36px)
- Primary: accent background, white text, radius 999px
- The accessible name has to include the object (\`View team\`, not \`View\`)

**Do:** one primary per viewport.
**Don't:** icon-only buttons without \`aria-label\`.

### Badge
Short text, radius 999px, background \`#2a2a2a\`. Use it for roles and dates. Do not use it as a CTA.

### Card
Surface background, radius 20px, padding 24px. If it is clickable, the whole card is the hit target and focus wraps the border.

### Quote
1 or 2 lines, typographic quotes, author below in muted. No stacks of more than 3 quotes.

### Stat
Number + label. The number uses tabular-nums. The label explains the metric in human language (\`years in market\`, not \`YOE\`).

## Blocks

### Hero
Eyebrow + h1 + paragraph + CTA. Image on the right on desktop, below on mobile. The h1 stays under 12 words.

### Timeline
Ordered list of milestones. Each item: year, title, one line. The year cannot be the only thing that distinguishes the item.

### Team
People grid. Each card: photo, name, role (Badge), one line of focus. Photo alt = name + role.

### Values
3 or 4 values. Short title + 2-line body. Do not use decorative icons without text.

### CTA
Page close. One promise + one primary Button. Accent background at 8% or surface, never a loud block.

## Adoption

1. Copy \`llms.txt\` to the repo root.
2. Merge \`origin/main\`.
3. In Cursor: \`@COMPONENT-CONTRACT.md implement X\`.
4. The agent replies \`Accept\` and only then writes code.

If a component is not in this contract, do not invent it. Propose an append to the contract and wait for OK.
`,
  },
  llms: {
    id: 'llms',
    path: '/workspace/about/llms.txt',
    name: 'llms.txt',
    language: 'markdown',
    content: `# About - instructions for agents

Before editing the About page:

1. Read /workspace/about/COMPONENT-CONTRACT.md
2. Reply Accept if you will implement against that contract
3. Do not add primitives or blocks that are not listed
4. Do not change color or type tokens
5. Keep the copy in English, second person, no emojis

Surface: src/pages/about/*
Owner: Design Engineer
Review: Content & Brand Specialist + Core · Engineering
`,
  },
  frases: {
    id: 'frases',
    path: '/workspace/about/UI-PHRASES.md',
    name: 'UI-PHRASES.md',
    language: 'markdown',
    content: `# UI phrases - About

Approved copy for the About page.

## Hero

**Eyebrow:** We are Atlas

**Title:** We design programs for people who want to move the industry.

**CTA:** Meet the school

## Community

The community brings together people who share a craft, questions, and judgment. The copy avoids negative contrasts and describes what already happens.

## Rule

This file is the source of truth for page copy. Any tone change is reviewed with Content & Brand Specialist before it ships.
`,
  },
}

const contratoChip = { type: 'file' as const, fileId: 'contrato' }
const llmsChip = { type: 'file' as const, fileId: 'llms' }

export const CONVERSATIONS: Conversation[] = [
  {
    id: 'is-1',
    agent: 'is',
    title: 'Core · Engineering',
    preview: 'Full-stack Engineer: If in the #…',
    time: '',
    unread: true,
    stacked: true,
    stackPlus: 4,
  },
  {
    id: 'content-1',
    agent: 'content',
    title: 'Content & Brand Specialist',
    preview: 'Frontend is still without acc…',
    time: '',
    unread: true,
  },
  {
    id: 'visual-1',
    agent: 'visual',
    title: 'Visual Designer',
    preview: 'Content left layout GO and now…',
    time: '',
    unread: true,
  },
  {
    id: 'design-1',
    agent: 'design',
    title: 'Design Engineer',
    preview: 'Wrote to Visual Designer: Lat…',
    time: '18:25',
    unread: false,
  },
  {
    id: 'craft-1',
    agent: 'craft',
    title: 'Core · Craft',
    preview: 'Design Engineer: Aligned with D…',
    time: '18:22',
    unread: false,
    stacked: true,
    stackPlus: 2,
  },
  {
    id: 'masterclass-1',
    agent: 'masterclass',
    title: 'Core · Masterclass Second …',
    preview: 'CEO: Closed. Soft 15 on Sep 15 …',
    time: '18:13',
    unread: false,
    stacked: true,
    stackPlus: 2,
  },
  {
    id: 'ceo-1',
    agent: 'ceo',
    title: 'CEO',
    preview: 'Message from Product Manager: OK.',
    time: '18:04',
    unread: false,
  },
  {
    id: 'pm-1',
    agent: 'pm',
    title: 'Product Manager',
    preview: 'Message from Community Man…',
    time: '',
    unread: true,
  },
  {
    id: 'community-1',
    agent: 'community',
    title: 'Community Manager',
    preview: 'Message from Product Manager…',
    time: '',
    unread: false,
  },
  {
    id: 'growth-1',
    agent: 'growth',
    title: 'Growth Marketer',
    preview: 'Message from Product Manager…',
    time: '',
    unread: true,
  },
  {
    id: 'fullstack-1',
    agent: 'fullstack',
    title: 'Full-Stack Engineer',
    preview: 'Message from Full-Stack Engineer…',
    time: '',
    unread: true,
  },
  {
    id: 'marketing-1',
    agent: 'marketing',
    title: 'Product Marketing Spec…',
    preview: 'Message from Product Marketin…',
    time: '18:02',
    unread: false,
  },
  {
    id: 'org-1',
    agent: 'org',
    title: 'Org',
    preview: 'Lead to launch…',
    time: '18:02',
    unread: false,
  },
]

export const FEEDS: Record<string, FeedItem[]> = {
  'design-1': [
    {
      kind: 'message',
      id: 'm1',
      blocks: [
        [
          { type: 'text', text: 'Frontend asked for the component contract: it is already in ' },
          contratoChip,
          { type: 'text', text: ' (page, 5 banners, chips, 1 new Full-stack, home radius and gutter).' },
        ],
      ],
    },
    {
      kind: 'wrote',
      id: 't1',
      count: 2,
      agents: ['design', 'content', 'fullstack'],
    },
    {
      kind: 'message',
      id: 'm2',
      blocks: [
        [
          {
            type: 'text',
            text: 'I reviewed the About type wire (Visual Designer). The BO-B4 structure is fine; I asked for the copy changes Content marked (School first, button only, Community without the “it is not X” contrast) and reminded them the platform container is 1200px with ',
          },
          contratoChip,
          { type: 'text', text: '.' },
        ],
      ],
    },
    {
      kind: 'thread',
      id: 'w1',
      count: 14,
      agents: ['design', 'is', 'content', 'pm'],
    },
    { kind: 'new', id: 'n1' },
    {
      kind: 'wrote',
      id: 'w2',
      count: 3,
      agents: ['is', 'content', 'pm'],
    },
    {
      kind: 'message',
      id: 'm3',
      blocks: [
        [
          {
            type: 'text',
            text: 'Content gave final voice OK for About. The phrases in ',
          },
          { type: 'file', fileId: 'frases', text: '/workspace/about/UI-PHRASES.md' },
          { type: 'text', text: ' are now the source of truth; Frontend can touch them.' },
        ],
      ],
    },
    {
      kind: 'thread',
      id: 't2',
      count: 16,
      agents: ['design', 'is', 'content', 'pm'],
    },
    {
      kind: 'message',
      id: 'm4',
      blocks: [
        [
          {
            type: 'text',
            text: 'Deeper home audit on ',
          },
          { type: 'chip', text: 'origin/main' },
          { type: 'text', text: ': Atlas Agentic is not hidden text. It is visible prose on the page, plus ' },
          llmsChip,
          { type: 'text', text: ' and markdown negotiation from the ' },
          { type: 'chip', text: 'Accept' },
          { type: 'text', text: ' header. I already fixed the contract and told Frontend. Also: the home already covers School / Who it is for / Programs / Community in an intro block, so About has to complement identity, not repeat those paragraphs.' },
        ],
      ],
    },
    {
      kind: 'thread',
      id: 't3',
      count: 6,
      agents: ['is', 'content'],
    },
    {
      kind: 'message',
      id: 'm5',
      blocks: [
        [
          { type: 'text', text: 'Frontend opened the About PR: ' },
          { type: 'link', href: 'https://github.com/acme/atlas-platform/pull/5' },
          { type: 'text', text: ' and match it to the draft; Semantic handles the pattern for the next push.' },
        ],
      ],
    },
    {
      kind: 'thread',
      id: 't4',
      count: 4,
      agents: ['visual'],
    },
  ],
}

function simpleFeed(agent: AgentKey, text: string): FeedItem[] {
  return [
    {
      kind: 'message',
      id: `${agent}-simple`,
      blocks: [[{ type: 'text', text }]],
    },
  ]
}

for (const conversation of CONVERSATIONS) {
  if (!FEEDS[conversation.id]) {
    FEEDS[conversation.id] = simpleFeed(
      conversation.agent,
      conversation.preview.replace('…', '. No deliverables to preview here yet.'),
    )
  }
}

export const DEFAULT_CONVERSATION_ID = 'design-1'
