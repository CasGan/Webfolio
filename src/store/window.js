import { INITIAL_Z_INDEX, WINDOW_CONFIG } from "#constants";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import gsap from "gsap";

const useWindowStore = create(
  immer((set, get) => ({
    windows: Object.fromEntries(
      Object.entries(WINDOW_CONFIG).map(([k, v]) => [k, { ...v }])
    ),
    nextZIndex: INITIAL_Z_INDEX + 1,

    // optional internal timeout ID for debounce
    _resetTimeout: null,

    moveWindow: (windowKey, deltaX, deltaY) =>
      set((state) => {
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
        win.zIndex = state.nextZIndex;
        win.data = data ?? win.data;
        state.nextZIndex++;
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

          win.top = isMobile
            ? clamp(
                window.innerHeight / 2 - h / 2,
                margin,
                Math.max(margin, window.innerHeight - h - margin)
              )
            : win.defaultTop ?? 100;

          win.left = isMobile
            ? clamp(
                window.innerWidth / 2 - w / 2,
                margin,
                Math.max(margin, window.innerWidth - w - margin)
              )
            : win.defaultLeft ?? 200;
        });

        // Minimal safe fix: fully clear transforms
        if (state._resetTimeout) clearTimeout(state._resetTimeout);

        state._resetTimeout = setTimeout(() => {
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
        window.removeEventListener("orientationchange", handler);
      };
    },
  }))
);

// Automatically attach the listener once when the store is imported
if (typeof window !== "undefined") {
  useWindowStore.getState()._attachResizeListener();
}

export default useWindowStore;
