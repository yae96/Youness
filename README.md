# yae96.github.io

Portfolio site for **Youness Ait El Hadj** — Senior Adobe Commerce / Magento 2 developer.

Live at <https://yae96.github.io>

## Concept

The site is the proof. The panel in the hero measures this page's own Core Web
Vitals live, through the browser's `PerformanceObserver` API, and scores them.
Nothing is hardcoded and nothing is floored — a slow load reports a low number.

## Structure

```
index.html                  markup, metadata, JSON-LD structured data
assets/
  css/
    tokens.css              custom properties: colour, type, theme
    base.css                reset, document defaults, layout, a11y utilities
    components.css          section components, in document order
  js/
    main.js                 entry point (ES module)
    modules/
      storage.js            localStorage access that cannot throw
      theme.js              three-state theme control
      reveal.js             scroll reveal via IntersectionObserver
      vitals.js             Core Web Vitals measurement and scoring
      contact.js            contact form validation and mailto handoff
robots.txt
sitemap.xml
social-card.png             1200x630 Open Graph preview
```

No build step, no dependencies, no framework. Push and it deploys.

## Notes on the vitals panel

The composite figure is a **weighted approximation** of Lighthouse's performance
score, computed from field measurements of LCP, CLS, INP and TTFB. It is not a
Lighthouse run: Lighthouse also weighs FCP, Speed Index and Total Blocking Time,
and runs under simulated throttling. The UI is labelled "field score" for that
reason.

INP shows `—` until the visitor interacts with the page, because interaction
latency cannot be measured before an interaction happens. Metrics that are
unavailable are excluded from the score rather than substituted.

## Theme

Light and dark are both designed. The palette is declared on bare `:root`, then
redefined under `prefers-color-scheme: dark` and again under `[data-theme]`, so
the system default and the manual toggle both resolve correctly.

## Local development

```bash
python3 -m http.server 8000
```

ES modules require a server; opening `index.html` over `file://` will not work.
