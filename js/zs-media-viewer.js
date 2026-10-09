/* ZEITSPRUNG V2 — zs-media-viewer.js
   ============================================================================
   ONE lightweight, monument-agnostic enlarge overlay (2026-10-09).
     openPhoto({ src, alt })        -> centered contain photo, nearly full safe screen
     openElement(el, { onClose })   -> temporarily re-parents an existing element
                                        (e.g. the timeline .mf__frame, so playback and
                                        audio continue) into the overlay and restores it.
   Dark museum backdrop, visible close button, ESC / backdrop click closes,
   focus moves to the close button and returns to the opener, aria-modal dialog.
   Never used for the Index hero / scrub. No gallery, no carousel.
   ============================================================================ */

const LABELS = {
  de: { close: "Schließen", expand: "Vergrößern" },
  en: { close: "Close", expand: "Enlarge" },
  es: { close: "Cerrar", expand: "Ampliar" }
};
export function viewerLabel(key) {
  const lang = (document.documentElement.lang || "de").slice(0, 2).toLowerCase();
  return (LABELS[lang] || LABELS.de)[key];
}

let active = null;

function build(contentClass) {
  const root = document.createElement("div");
  root.className = "zs-viewer";
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  const stage = document.createElement("div");
  stage.className = "zs-viewer__stage " + contentClass;
  const close = document.createElement("button");
  close.type = "button";
  close.className = "zs-viewer__close";
  close.setAttribute("aria-label", viewerLabel("close"));
  close.textContent = "×";
  root.appendChild(stage);
  root.appendChild(close);
  return { root, stage, close };
}

function open(contentClass, mount, onClose) {
  if (active) active.closeFn();
  const opener = document.activeElement;
  const { root, stage, close } = build(contentClass);
  mount(stage);
  document.body.appendChild(root);
  document.documentElement.classList.add("zs-viewer-open");
  const closeFn = () => {
    if (!active) return;
    active = null;
    document.removeEventListener("keydown", onKey, true);
    root.remove();
    document.documentElement.classList.remove("zs-viewer-open");
    if (onClose) onClose();
    if (opener && opener.focus) { try { opener.focus(); } catch (e) { /* noop */ } }
  };
  const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); closeFn(); } };
  document.addEventListener("keydown", onKey, true);
  close.addEventListener("click", closeFn);
  root.addEventListener("click", (e) => { if (e.target === root) closeFn(); });
  active = { closeFn };
  close.focus();
  return closeFn;
}

export function openPhoto({ src, alt }) {
  return open("zs-viewer__stage--photo", (stage) => {
    const img = document.createElement("img");
    img.className = "zs-viewer__photo";
    img.src = src; img.alt = alt || ""; img.draggable = false;
    stage.appendChild(img);
  });
}

export function openElement(el, opts) {
  const parent = el.parentNode;
  const marker = document.createComment("zs-viewer-origin");
  parent.insertBefore(marker, el);
  return open("zs-viewer__stage--element", (stage) => { stage.appendChild(el); }, () => {
    if (marker.parentNode) marker.parentNode.insertBefore(el, marker);
    marker.remove();
    if (opts && opts.onClose) opts.onClose();
  });
}
