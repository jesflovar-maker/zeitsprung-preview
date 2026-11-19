/* ZEITSPRUNG — js/zt-sound.js (06G)
   One compact, platform-wide sound control (♪) placed beside the DE | EN | ES switch of a monument page.
   - State shared with INDEX + Steinerne via sessionStorage "zeitsprung:soundEnabled" ("1" = on).
   - Never audible before a real user gesture on THIS page (browser autoplay policy + owner rule): until the
     first pointerdown / keydown, every registered video stays muted even if the stored preference is "on".
   - Videos register themselves; the control mutes / unmutes all of them together. No large in-panel buttons.
   Usage: import { ztSound } from "../js/zt-sound.js";  ztSound.mount(langGroupEl, labelsFn);  ztSound.add(video, { onEnable });
*/
const KEY = "zeitsprung:soundEnabled";
let on = false;
try { on = sessionStorage.getItem(KEY) === "1"; } catch (e) {}
let armed = false; // becomes true at the first user gesture on this page
const vids = new Map(); // video -> { onEnable }
const btns = new Set();
const L10N = { de: { on: "Ton an", off: "Ton aus" }, en: { on: "Sound on", off: "Sound off" }, es: { on: "Activar sonido", off: "Quitar sonido" } };
let labels = () => L10N[(document.documentElement.lang || "de").slice(0, 2)] || L10N.de;

const audible = () => on && armed;
function apply(fromToggle) {
  const a = audible();
  vids.forEach((opt, v) => {
    v.muted = !a; if (a) v.removeAttribute("muted"); else v.setAttribute("muted", "");
    if (a && fromToggle && opt.onEnable) { try { opt.onEnable(v); } catch (e) {} }
  });
  paint();
}
function paint() {
  const L = labels();
  btns.forEach((b) => { b.setAttribute("aria-pressed", String(on)); b.classList.toggle("is-on", on); b.setAttribute("aria-label", on ? L.off : L.on); b.title = on ? L.off : L.on; });
}
function arm() { if (armed) return; armed = true; removeEventListener("pointerdown", arm, true); removeEventListener("keydown", arm, true); apply(false); }
addEventListener("pointerdown", arm, true); addEventListener("keydown", arm, true);

let styled = false;
function style() {
  if (styled) return; styled = true;
  const s = document.createElement("style");
  s.textContent = ".zt-snd{position:relative;flex:0 0 auto;width:34px;height:34px;margin-left:6px;border-radius:50%;border:1px solid rgba(241,235,225,.24);background:transparent;color:rgba(241,235,225,.62);font:400 15px/1 serif;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:color .2s,border-color .2s,background .2s}"
    + ".zt-snd::before{content:'';position:absolute;inset:-5px}" /* 44 px touch target */
    + ".zt-snd:hover{border-color:rgba(212,175,120,.6);color:#e6cf9f}.zt-snd.is-on{border-color:rgba(212,175,120,.75);color:#e6cf9f;background:rgba(212,175,120,.1)}"
    + ".zt-snd:focus-visible{outline:2px solid #d4af78;outline-offset:3px}";
  document.head.append(s);
}

export const ztSound = {
  get on() { return on; },
  get audible() { return audible(); },
  /** place the ♪ control right after a language group element */
  mount(afterEl, labelFn) {
    if (labelFn) labels = labelFn; style();
    const b = document.createElement("button"); b.type = "button"; b.className = "zt-snd"; b.innerHTML = '<span aria-hidden="true">♪</span>';
    b.addEventListener("click", () => { armed = true; on = !on; try { sessionStorage.setItem(KEY, on ? "1" : "0"); } catch (e) {} apply(true); });
    afterEl.insertAdjacentElement("afterend", b); btns.add(b); paint(); return b;
  },
  /** register a video with genuine audio; opt.onEnable(video) runs when the visitor switches sound on */
  add(v, opt) { vids.set(v, opt || {}); v.muted = !audible(); if (v.muted) v.setAttribute("muted", ""); return v; },
  relabel() { paint(); },
};
