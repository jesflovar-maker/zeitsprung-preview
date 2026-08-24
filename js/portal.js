/* ZEITSPRUNG V2 — portal.js
   "Time Portal" motif — an original geometric motif (NOT the CodePen's glowing circle).
   Built as layered SVG arcs/rings that open, rotate and shift as the scroll
   progress of the main stage moves through the 9 historical states.
   Driven externally by GSAP timelines (see main.js) via CSS custom properties
   and direct attribute updates — this module only builds/exposes the DOM + helpers. */

export function buildPortal(container) {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 400 400");
  svg.setAttribute("class", "portal__svg");
  svg.setAttribute("aria-hidden", "true");

  // Outer ring — the "portal frame". Starts closed (thin arc), opens with scroll.
  const ringOuter = document.createElementNS(svgNS, "circle");
  ringOuter.setAttribute("cx", "200");
  ringOuter.setAttribute("cy", "200");
  ringOuter.setAttribute("r", "170");
  ringOuter.setAttribute("class", "portal__ring portal__ring--outer");
  ringOuter.setAttribute("fill", "none");

  // Mid ring — geometric arc segments (echoes Regensburg arch geometry, not a copy of any logo)
  const ringMid = document.createElementNS(svgNS, "circle");
  ringMid.setAttribute("cx", "200");
  ringMid.setAttribute("cy", "200");
  ringMid.setAttribute("r", "130");
  ringMid.setAttribute("class", "portal__ring portal__ring--mid");
  ringMid.setAttribute("fill", "none");

  // Inner aperture — the "window into time" where the historical image is revealed
  const aperture = document.createElementNS(svgNS, "circle");
  aperture.setAttribute("cx", "200");
  aperture.setAttribute("cy", "200");
  aperture.setAttribute("r", "92");
  aperture.setAttribute("class", "portal__aperture");
  aperture.setAttribute("fill", "url(#portalGradient)");

  // Radial tick marks — evokes a timeline dial / archaeological survey marks
  const ticksGroup = document.createElementNS(svgNS, "g");
  ticksGroup.setAttribute("class", "portal__ticks");
  const TICK_COUNT = 24;
  for (let i = 0; i < TICK_COUNT; i++) {
    const angle = (i / TICK_COUNT) * Math.PI * 2;
    const r1 = 178;
    const r2 = i % 6 === 0 ? 190 : 184;
    const x1 = 200 + Math.cos(angle) * r1;
    const y1 = 200 + Math.sin(angle) * r1;
    const x2 = 200 + Math.cos(angle) * r2;
    const y2 = 200 + Math.sin(angle) * r2;
    const tick = document.createElementNS(svgNS, "line");
    tick.setAttribute("x1", x1.toFixed(2));
    tick.setAttribute("y1", y1.toFixed(2));
    tick.setAttribute("x2", x2.toFixed(2));
    tick.setAttribute("y2", y2.toFixed(2));
    tick.setAttribute("class", "portal__tick");
    ticksGroup.appendChild(tick);
  }

  const defs = document.createElementNS(svgNS, "defs");
  const gradient = document.createElementNS(svgNS, "radialGradient");
  gradient.setAttribute("id", "portalGradient");
  gradient.setAttribute("cx", "50%");
  gradient.setAttribute("cy", "50%");
  gradient.setAttribute("r", "60%");
  const stop1 = document.createElementNS(svgNS, "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "rgba(212,175,120,0.0)");
  const stop2 = document.createElementNS(svgNS, "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "rgba(212,175,120,0.0)");
  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);

  svg.appendChild(defs);
  svg.appendChild(ringOuter);
  svg.appendChild(ticksGroup);
  svg.appendChild(ringMid);
  svg.appendChild(aperture);

  container.appendChild(svg);

  return {
    svg,
    ringOuter,
    ringMid,
    aperture,
    ticksGroup
  };
}
