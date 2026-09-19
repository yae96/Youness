/**
 * Field measurement of this page's Core Web Vitals, via the browser's own
 * PerformanceObserver — the same signals Chrome reports to CrUX.
 *
 * Honesty notes, because this panel is the page's central claim:
 *  - The composite below is a WEIGHTED APPROXIMATION of Lighthouse's
 *    performance score, not a Lighthouse run. Lighthouse also weighs FCP,
 *    Speed Index and Total Blocking Time, and runs under simulated throttling.
 *    The UI is labelled "field score" for that reason.
 *  - Nothing is floored. A slow load reports a low number. A panel that
 *    cannot show a bad score is decoration, not measurement.
 */

// [good, needs-improvement] boundaries — web.dev thresholds.
const THRESHOLDS = {
  lcp:  [2500, 4000],
  cls:  [0.1, 0.25],
  inp:  [200, 500],
  ttfb: [800, 1800],
};

// Upper bound of each meter, so the bar has a consistent scale.
const SCALE = { lcp: 6000, cls: 0.5, inp: 800, ttfb: 3000 };

const FORMAT = {
  lcp:  (v) => `${(v / 1000).toFixed(2)}s`,
  cls:  (v) => v.toFixed(3),
  inp:  (v) => `${Math.round(v)}ms`,
  ttfb: (v) => `${Math.round(v)}ms`,
};

const metrics = { lcp: null, cls: null, inp: null, ttfb: null };

const rating = (name, value) => {
  const [good, poor] = THRESHOLDS[name];
  if (value <= good) return 'good';
  return value <= poor ? 'warn' : 'bad';
};

function render(name, value) {
  const valueEl = document.getElementById(`${name}Val`);
  const barEl = document.getElementById(`${name}Bar`);
  if (!valueEl || !barEl) return;

  const grade = rating(name, value);
  valueEl.textContent = FORMAT[name](value);
  valueEl.className = `cwv-metric-val ${grade}`;
  barEl.className = `cwv-metric-bar bar-${grade}`;

  requestAnimationFrame(() => {
    barEl.style.width = `${Math.min(100, (value / SCALE[name]) * 100)}%`;
  });
}

function record(name, value) {
  metrics[name] = value;
  render(name, value);
}

/** Subscribe to one entry type, ignoring browsers that don't support it. */
function observe(type, handler, options = {}) {
  try {
    new PerformanceObserver(handler).observe({ type, buffered: true, ...options });
    return true;
  } catch {
    return false;
  }
}

function collect() {
  observe('largest-contentful-paint', (list) => {
    const entries = list.getEntries();
    record('lcp', entries[entries.length - 1].startTime);
  });

  let clsTotal = 0;
  observe('layout-shift', (list) => {
    for (const entry of list.getEntries()) {
      if (!entry.hadRecentInput) clsTotal += entry.value;
    }
    record('cls', clsTotal);
  });

  // Interaction latency: prefer `event` timings, fall back to `first-input`.
  const gotEvents = observe('event', (list) => {
    for (const entry of list.getEntries()) {
      const duration = entry.duration ?? entry.processingEnd - entry.startTime;
      if (metrics.inp === null || duration > metrics.inp) record('inp', duration);
    }
  }, { durationThreshold: 16 });

  if (!gotEvents) {
    observe('first-input', (list) => {
      for (const entry of list.getEntries()) {
        record('inp', entry.processingStart - entry.startTime);
      }
    });
  }

  try {
    const [nav] = performance.getEntriesByType('navigation');
    if (nav) record('ttfb', nav.responseStart - nav.requestStart);
  } catch { /* navigation timing unavailable */ }
}

/** Piecewise curves approximating Lighthouse's scoring of each metric. */
function scoreOf(name, value) {
  if (value === null) return null;
  const [good, poor] = THRESHOLDS[name];
  if (value <= good) return 100;
  if (value >= poor) return Math.max(0, 50 - ((value - poor) / poor) * 50);
  return 100 - ((value - good) / (poor - good)) * 50;
}

const WEIGHTS = { lcp: 0.4, cls: 0.3, inp: 0.2, ttfb: 0.1 };

function composite() {
  let total = 0;
  let weight = 0;
  for (const [name, w] of Object.entries(WEIGHTS)) {
    const score = scoreOf(name, metrics[name]);
    if (score === null) continue;
    total += score * w;
    weight += w;
  }
  return weight === 0 ? null : Math.round(total / weight);
}

function paintGauge(score) {
  const numberEl = document.getElementById('gaugeNum');
  const arcEl = document.getElementById('gaugeFill');
  const statusEl = document.querySelector('.cwv-status-badge');
  if (!numberEl || !arcEl) return;

  const grade = score >= 90 ? 'good' : score >= 50 ? 'warn' : 'bad';
  const CIRCUMFERENCE = 2 * Math.PI * 45;

  arcEl.style.stroke = `var(--${grade})`;
  arcEl.style.strokeDashoffset = String(CIRCUMFERENCE - (score / 100) * CIRCUMFERENCE);
  numberEl.className = `gauge-number ${grade}`;

  const gauge = numberEl.closest('.gauge-wrap');
  if (gauge) gauge.setAttribute('aria-label', `Field performance score: ${score} out of 100`);

  if (statusEl) {
    statusEl.textContent = 'Measured on your device';
    statusEl.classList.add('is-settled');
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    numberEl.textContent = String(score);
    return;
  }

  const DURATION = 900;
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min(1, (now - start) / DURATION);
    const eased = 1 - Math.pow(1 - progress, 3);
    numberEl.textContent = String(Math.round(score * eased));
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export function initVitals() {
  if (!('PerformanceObserver' in window)) return;
  collect();

  // Let LCP and CLS settle before scoring; both can still change after load.
  const settle = () => setTimeout(() => {
    const score = composite();
    if (score !== null) paintGauge(score);
  }, 1500);

  if (document.readyState === 'complete') settle();
  else window.addEventListener('load', settle, { once: true });
}
