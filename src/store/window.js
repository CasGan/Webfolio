import { INITIAL_Z_INDEX, WINDOW_CONFIG } from "#constants";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import gsap from "gsap";

let _resetTimeout = null;
const isMobile = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 640px)").matches;

const getCenteredPosition = (width, height) => {
  const margin = 12;
  return {
    top: Math.max((window.innerHeight - height) / 2, margin),
    left: Math.max((window.innerWidth - width) / 2, margin),
  };
};

const CASCADE_OFFSET = 24;

const useWindowStore = create(
  immer((set, get) => ({
    windows: Object.fromEntries(
      Object.entries(WINDOW_CONFIG).map(([k, v]) => [k, { ...v }])
    ),
    nextZIndex: INITIAL_Z_INDEX + 1,

    moveWindow: (windowKey, deltaX, deltaY) =>
      set((state) => {
        if(isMobile()) return; 
        
        const win = state.windows[windowKey];
        if (!win) return;
        if (!Number.isFinite(deltaX) || !Number.isFinite(deltaY)) return;
        win.left += deltaX;
        win.top += deltaY;
      }),

    openWindow: (windowKey, data = null) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (!win) return;

        win.isOpen = true;
        win.zIndex = state.nextZIndex++;
        win.data = data ?? win.data;

        // 📱 MOBILE → FULLSCREEN
        if (isMobile()) {
          win.top = 0;
          win.left = 0;
          win.width = window.innerWidth;
          win.height = window.innerHeight;
          return;
        }

        // 🖥 DESKTOP
        const width = win.width ?? 600;
        const height = win.height ?? 400;

        // Finder → macOS-style cascade
        if (windowKey === "finder") {
          if (win._cascadeIndex == null) win._cascadeIndex = 0;

          const base = getCenteredPosition(width, height);

          let top = base.top + CASCADE_OFFSET * win._cascadeIndex;
          let left = base.left + CASCADE_OFFSET * win._cascadeIndex;

          const margin = 12;
          top = Math.min(
            Math.max(top, margin),
            window.innerHeight - height - margin
          );
          left = Math.min(
            Math.max(left, margin),
            window.innerWidth - width - margin
          );

          win.top = top;
          win.left = left;
          win._cascadeIndex++;
        } else {
          // All other windows → centered
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
        const isMobile = window.matchMedia("(max-width: 640px)").matches;
        const margin = 12;
        const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

        const windowKeys = Object.keys(state.windows).filter(
          (key) => state.windows[key].isOpen
        );

        // Update positions immediately
        windowKeys.forEach((key) => {
          const win = state.windows[key];
          const w = win.width || 600;
          const h = win.height || 400;

          if (isMobile) {
            win.top = 0;
            win.left = 0;
            win.width = window.innerWidth;
            win.height = window.innerHeight;
          } else {
            win.top = win.defaultTop ?? 100;
            win.left = win.defaultLeft ?? 200;
          }
        });

        // Minimal safe fix: fully clear transforms
        if (_resetTimeout) clearTimeout(_resetTimeout);

        _resetTimeout = setTimeout(() => {
          windowKeys.forEach((key) => {
            const el = document.getElementById(key);
            if (el && el.id !== "welcome") {
              gsap.set(el, { clearProps: "transform" });
            }
          });
        }, 0);
      }),

    // --- new: attach automatic resize/orientation listener ---
    _attachResizeListener: () => {
      const debounce = (fn, delay = 100) => {
        let timer;
        return () => {
          clearTimeout(timer);
          timer = setTimeout(fn, delay);
        };
      };

      const handler = debounce(() => {
        get().resetWindows();
      }, 100);

      window.addEventListener("resize", handler);
      window.addEventListener("orientationchange", handler);

      // optional: return cleanup function
      return () => {
        window.removeEventListener("resize", handler);
        window.removeEventListener("orientationchangge", handler);
      };
    },
  }))
);
let _cleanupResizeListener = null;
// Automatically attach the listener once when the store is imported
if (typeof window !== "undefined") {
  _cleanupResizeListener = useWindowStore.getState()._attachResizeListener();
}
export { _cleanupResizeListener };

export default useWindowStore;
