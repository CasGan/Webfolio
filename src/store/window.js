import { INITIAL_Z_INDEX, WINDOW_CONFIG } from "#constants";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import gsap from "gsap";

// Module-scope constants
let _resetTimeout = null;
const DEFAULT_WINDOW_TOP = 100;
const DEFAULT_WINDOW_LEFT = 200;
const CASCADE_OFFSET = 24;
const WINDOW_MARGIN = 12;

// Helpers
export const isMobile = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 640px)").matches;

export const debounce = (fn, delay = 100) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const getCenteredPosition = (width, height) => ({
  top: Math.max((window.innerHeight - height) / 2, WINDOW_MARGIN),
  left: Math.max((window.innerWidth - width) / 2, WINDOW_MARGIN),
});

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const useWindowStore = create(
  immer((set, get) => ({
    isMobile: isMobile(),
    windows: Object.fromEntries(
      Object.entries(WINDOW_CONFIG).map(([k, v]) => [k, { ...v }])
    ),
    nextZIndex: INITIAL_Z_INDEX + 1,

    moveWindow: (windowKey, deltaX, deltaY) =>
      set((state) => {
        if (get().isMobile) return;

        const win = state.windows[windowKey];
        if (!win) return;
        if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) return;

        win.left = clamp(
          win.left + deltaX,
          WINDOW_MARGIN,
          window.innerWidth - (win.width || 600) - WINDOW_MARGIN
        );
        win.top = clamp(
          win.top + deltaY,
          WINDOW_MARGIN,
          window.innerHeight - (win.height || 400) - WINDOW_MARGIN
        );
      }),

    openWindow: (windowKey, data = null) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (!win) return;

        win.isOpen = true;
        win.zIndex = state.nextZIndex++;
        win.data = data ?? win.data;

        if (get().isMobile) {
          win.top = 0;
          win.left = 0;
          win.width = window.innerWidth;
          win.height = window.innerHeight;
          return;
        }

        const width = win.width ?? 600;
        const height = win.height ?? 400;

        if (windowKey === "finder") {
          if (win._cascadeIndex == null) win._cascadeIndex = 0;
          const base = getCenteredPosition(width, height);
          win.top = clamp(base.top + CASCADE_OFFSET * win._cascadeIndex, WINDOW_MARGIN, window.innerHeight - height - WINDOW_MARGIN);
          win.left = clamp(base.left + CASCADE_OFFSET * win._cascadeIndex, WINDOW_MARGIN, window.innerWidth - width - WINDOW_MARGIN);
          win._cascadeIndex++;
        } else {
          const { top, left } = getCenteredPosition(width, height);
          win.top = top;
          win.left = left;
        }
      }),

    closeWindow: (windowKey) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (!win) return;
        win.isOpen = false;
        win.zIndex = INITIAL_Z_INDEX;
        win.data = null;
      }),

    focusWindow: (windowKey) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (!win) return;
        win.zIndex = state.nextZIndex++;
      }),

    resetWindows: () =>
      set((state) => {
        Object.values(state.windows).forEach((win) => {
          delete win._cascadeIndex;
        });

        const windowKeys = Object.keys(state.windows).filter((key) => state.windows[key].isOpen);

        windowKeys.forEach((key) => {
          const win = state.windows[key];
          const w = win.width || 600;
          const h = win.height || 400;

          if (isMobile()) {
            win.top = 0;
            win.left = 0;
            win.width = window.innerWidth;
            win.height = window.innerHeight;
          } else {
            win.top = win.defaultTop ?? DEFAULT_WINDOW_TOP;
            win.left = win.defaultLeft ?? DEFAULT_WINDOW_LEFT;
          }
        });

        if (_resetTimeout) clearTimeout(_resetTimeout);

        _resetTimeout = setTimeout(() => {
          windowKeys.forEach((key) => {
            const el = document.getElementById(key);
            const win = get().windows[key];
            if (el && !win.preventTransformReset) {
              gsap.set(el, { clearProps: "transform" });
            }
          });
        }, 0);
      }),
  }))
);

export default useWindowStore;
