# starship

Personal site for Oluwasemilore Omotade-Michaels. Astro, plain CSS, no UI framework.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Editing content

Everything personal lives in [`src/data/site.ts`](src/data/site.ts): bio lines, hero quote,
featured projects, playground, archive rows and footer badges. Give a project an `image`
(path under `public/`) to replace its generated ASCII planet cover.

## Layout

| Section | File |
| --- | --- |
| Nav + light/dark toggle | `src/components/Nav.astro` |
| ASCII starfield hero | `src/components/Hero.astro`, `src/lib/starfield/` |
| Featured projects | `src/components/Featured.astro`, `src/lib/ascii-cover.ts` |
| Playground | `src/components/Playground.astro` |
| Archive with tag filter | `src/components/Archive.astro` |
| Badge physics, tic-tac-toe, email | `src/components/Footer.astro`, `src/lib/nudge.ts`, `src/lib/tictactoe.ts` |

## Credits

- Hero layout, typewriter quote and canvas-behind-the-bio idea from [daoho.dev](https://www.daoho.dev/).
- Starfield loop, cell grid and wake diffusion adapted from
  [ascii-sharks](https://github.com/stackedlol/ascii-sharks) (MIT, © 2026 drewdi).
- Section structure, archive, playground and footer arcade inspired by
  [ajanwachuku.work](https://www.ajanwachuku.work/).
