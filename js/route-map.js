/* ZEITSPRUNG V2 — js/route-map.js
   PHASE 2.7C.1 — INTERACTIVE ROUTE MAP.

   REUSES DATA FROM TWO EXISTING SOURCES, joined by monumentId === id
   (confirmed identical strings, no fuzzy matching needed):

     1. ../STEINERNE_BRUECKE_V1/routes/regensburg-main-route.json
        (status "ACTIVE_SCHEMATIC", v1.5.0) — supplies stops[].order,
        stops[].name (redundant with monuments.config.json but harmless,
        NOT used here — see below) and stops[].era. Its own header comment
        is explicit: stops[].layoutPosition is an ILLUSTRATIVE SCHEMATIC
        0-1000 drawing coordinate for a DIFFERENT reference canvas, "NOT a
        geographic coordinate". That schematic canvas does not match the
        composition of THIS project's actual map illustration (verified by
        visual inspection — see PIN_LAYOUT below), so layoutPosition is
        deliberately NOT used for on-screen placement; only order/era are
        read from this file. Real geo-coordinates remain null in the source
        and are never fabricated here.

     2. ./monuments.config.json — SAME single source of truth already used
        by js/gallery.js. Supplies name/subtitle/status/enabled/cta. This
        file does NOT duplicate that data by hardcoding a second copy of
        any name/status string; it only re-fetches the same JSON.

   PIN_LAYOUT below is this component's OWN, separately-calibrated visual
   placement: the five stops were visually located, by inspecting
   assets/maps/regensburg_interactive_map_v01.png directly, against the
   actual rendered buildings/route line already baked into that artwork
   (the bridge crossing, the Altes Rathaus tower on the left, the Porta
   Praetoria gate arch on the right, Dom St. Peter's twin spires, and the
   excavated foundations bottom-center standing in for Neupfarrplatz /
   Jüdisches Viertel). Values are fractions (0-1) of the image's own
   width/height — NOT a re-scaling of the old 0-1000 schematic, which the
   brief itself warned may target a differently-composed reference image.
   This still respects the source JSON's own disclaimer: the pins are an
   illustrative on-screen layout aid, not a geographic claim.

   NO NEW HISTORICAL CLAIM IS MADE HERE — era text for the 3 not-yet-briefed
   stops ("PENDING_BRIEFING" in the route JSON) is never shown to the
   visitor as if it were a real date; the component falls back to the
   monument's own status/cta badge from monuments.config.json instead. */

import { STEINERNE_ROUTE_JSON_URL } from "./zt-paths.js";

const ROUTE_JSON_URL = STEINERNE_ROUTE_JSON_URL;
const CONFIG_URL = "./monuments.config.json";
const MAP_IMG = "assets/maps/regensburg_interactive_map_v01.png";

// Visually calibrated against the actual artwork (see file header).
const PIN_LAYOUT = {
  "steinerne-bruecke": { x: 0.55, y: 0.29 },
  "dom-st-peter": { x: 0.79, y: 0.615 },
  "altes-rathaus": { x: 0.17, y: 0.51 },
  "porta-praetoria": { x: 0.855, y: 0.545 },
  "neupfarrplatz": { x: 0.40, y: 0.685 }
};

function el(tag, className, attrs) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (attrs) Object.keys(attrs).forEach((k) => node.setAttribute(k, attrs[k]));
  return node;
}

function pick(obj, lang) {
  if (!obj) return "";
  return obj[lang] !== undefined ? obj[lang] : (obj.de || "");
}

export async function initRouteMap({ root, getLang, getGalleryHandle, reducedMotion }) {
  if (!root) return null;

  let routeStops = [];
  let monuments = [];
  try {
    const [routeRes, configRes] = await Promise.all([
      fetch(ROUTE_JSON_URL, { cache: "no-store" }),
      fetch(CONFIG_URL, { cache: "no-store" })
    ]);
    const routeData = await routeRes.json();
    const configData = await configRes.json();
    routeStops = (routeData.stops || []).slice().sort((a, b) => a.order - b.order);
    monuments = configData.monuments || [];
  } catch (err) {
    // Fail quietly but visibly — never render fabricated stops/positions.
    console.error("ZEITSPRUNG route-map: could not load route/config data", err);
    return null;
  }
  if (!routeStops.length || !monuments.length) return null;

  const byId = new Map(monuments.map((m) => [m.id, m]));

  const stops = routeStops
    .map((stop) => {
      const cfg = byId.get(stop.monumentId);
      const pos = PIN_LAYOUT[stop.monumentId];
      if (!cfg || !pos) return null; // no invented position — skip silently
      return { stop, cfg, pos };
    })
    .filter(Boolean);
  if (!stops.length) return null;

  // -- DOM scaffold ---------------------------------------------------------
  root.innerHTML = "";
  const img = el("img", "route-map__img", { alt: "", draggable: "false" });
  img.src = MAP_IMG;
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "route-map__svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none");
  const line = document.createElementNS(svgNS, "polyline");
  line.setAttribute("class", "route-map__line");
  line.setAttribute(
    "points",
    stops.map(({ pos }) => `${(pos.x * 100).toFixed(2)},${(pos.y * 100).toFixed(2)}`).join(" ")
  );
  svg.appendChild(line);

  const caption = el("div", "route-map__caption");
  const capEra = el("p", "route-map__caption-era");
  const capName = el("p", "route-map__caption-name");
  const capStatus = el("p", "route-map__caption-status");
  caption.appendChild(capEra);
  caption.appendChild(capName);
  caption.appendChild(capStatus);

  root.appendChild(img);
  root.appendChild(svg);

  const pinEls = stops.map(({ stop, cfg, pos }) => {
    const pin = el("button", "route-map__pin", {
      type: "button",
      style: `left:${(pos.x * 100).toFixed(2)}%; top:${(pos.y * 100).toFixed(2)}%;`,
      "data-id": cfg.id,
      "aria-label": pick(cfg.name, getLang())
    });
    pin.textContent = String(stop.order).padStart(2, "0");
    pin.classList.toggle("is-active", !!cfg.enabled);
    pin.classList.toggle("is-pending", !cfg.enabled);
    root.appendChild(pin);
    return { pin, stop, cfg };
  });

  root.appendChild(caption);

  let currentId = stops[0].cfg.id;

  function renderCaption(id) {
    const found = stops.find((s) => s.cfg.id === id);
    if (!found) return;
    const lang = getLang();
    const { stop, cfg } = found;
    // Never present the "PENDING_BRIEFING" placeholder as a real date.
    if (stop.era && stop.era !== "PENDING_BRIEFING") {
      capEra.textContent = stop.era;
      capEra.hidden = false;
    } else {
      capEra.hidden = true;
    }
    capName.textContent = pick(cfg.name, lang);
    capStatus.textContent = pick(cfg.cta, lang);
  }

  function setCurrent(id) {
    currentId = id;
    pinEls.forEach(({ pin, cfg }) => pin.classList.toggle("is-current", cfg.id === id));
    renderCaption(id);
  }

  function selectStop(id, { scroll } = {}) {
    setCurrent(id);
    const handle = getGalleryHandle && getGalleryHandle();
    if (handle && typeof handle.selectById === "function") handle.selectById(id);
    if (scroll) {
      const galleryRoot = document.getElementById("galleryRoot");
      if (galleryRoot) {
        galleryRoot.scrollIntoView({
          behavior: reducedMotion && reducedMotion() ? "auto" : "smooth",
          block: "center"
        });
      }
    }
  }

  pinEls.forEach(({ pin, cfg }) => {
    pin.addEventListener("click", () => selectStop(cfg.id, { scroll: true }));
    pin.addEventListener("mouseenter", () => renderCaption(cfg.id));
    pin.addEventListener("focus", () => renderCaption(cfg.id));
    pin.addEventListener("mouseleave", () => renderCaption(currentId));
    pin.addEventListener("blur", () => renderCaption(currentId));
  });

  setCurrent(currentId);

  return {
    refreshLang() {
      const lang = getLang();
      pinEls.forEach(({ pin, cfg }) => pin.setAttribute("aria-label", pick(cfg.name, lang)));
      renderCaption(currentId);
    },
    getCurrentId: () => currentId,
    // PHASE 2.7C.2 — REVERSE sync entry point: js/index-main.js calls this
    // when the gallery's OWN tabs/prev/next/swipe change selection (not via
    // a map pin click), so the corresponding pin still becomes visually
    // current. Deliberately named differently from the internal
    // selectStop()/setCurrent() pair — this public method only updates the
    // map's own visual state (setCurrent) and never calls back into
    // getGalleryHandle().selectById(), which would re-enter the gallery
    // that just triggered this call in the first place. No monument state
    // is duplicated: this still just re-derives everything from the SAME
    // `stops`/`byId` data already loaded above via `id`.
    setActive(id) {
      if (!stops.some((s) => s.cfg.id === id)) return false;
      setCurrent(id);
      return true;
    }
  };
}
