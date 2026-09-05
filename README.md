# Grok Community Feedback

An exploratory interface for turning community feedback about Grok into ideas the team can read, discuss, and build on.

![Grok Community Feedback prototype](docs/images/prototype.png)

## Why this exists

Good feedback rarely arrives as a finished product brief. It starts in conversations, Space discussions, screenshots, small frustrations, and ideas that deserve a little more care before they reach a product team.

This project explores a workspace where those signals can be condensed into clear proposals without losing the voice behind them. The goal is to help the Grok team see what people are asking for, why it matters, and how several related comments might point to the same opportunity.

I built it with the same care I bring to my role as a SpaceX and AI community ambassador. That means listening closely, giving ideas useful context, and treating feedback as an invitation to build together. The interface is a prototype, but the intent is practical: make it easier for community insight to travel.

## What the prototype explores

- A familiar workspace for conversations between product roles
- Compact threads that connect feedback, decisions, and supporting files
- Resizable document previews that keep source material close to the discussion
- Distinct bot identities that make multi-agent conversations easier to scan
- Fictional sample content that demonstrates the flow without exposing private information

## Run it locally

You need Node.js 20 or newer.

```bash
git clone https://github.com/johanvillalbab/grok-community-feedback.git
cd grok-community-feedback
npm install
npm run dev
```

Open the local URL printed by Vite.

## Commands

```bash
npm run dev      # Start the development server
npm run lint     # Check the source with Oxlint
npm run build    # Type-check and create a production build
npm run preview  # Preview the production build locally
```

## Project structure

```text
src/
  components/    Interface components and custom icons
  lib/           Shared layout utilities
  App.tsx        Workspace state and panel composition
  data.ts        Fictional conversations, files, and bot metadata
  index.css      Layout, visual tokens, and interaction states
docs/
  images/        Project screenshots
public/          Static assets
```

The app uses React 19, TypeScript, Vite, Tailwind CSS 4, React Markdown, and Oxlint. It has no backend and sends no user data anywhere.

## Contributing

Community notes, interaction ideas, and focused pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening one. If your contribution starts as a rough observation, that is fine. Include the problem you noticed, the context in which it happened, and what a better outcome would feel like.

## Credits

The bot-avatar direction was adapted from [jeremy-prt/bloub](https://github.com/jeremy-prt/bloub), an MIT-licensed SVG recreation of the xAI bot avatar. Thanks to Jeremy Prt for publishing the work and documenting the shapes.

## Independent project

This is an independent community experiment. It is not affiliated with, endorsed by, or operated by Grok, xAI, X, or SpaceX. Product names and trademarks belong to their respective owners.

## License

[MIT](LICENSE)
