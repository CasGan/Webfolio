import { INITIAL_Z_INDEX, WINDOW_CONFIG } from "#constants";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import gsap from "gsap";

const useWindowStore = create(
  immer((set, get) => ({
    windows: WINDOW_CONFIG,
    nextZIndex: INITIAL_Z_INDEX + 1,

    moveWindow: (windowKey, deltaX, deltaY) =>
      set((state) => {
        const win = state.windows[windowKey];
        if (!win) return;

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

        // Capture the keys ahead of time
        const windowKeys = Object.keys(state.windows).filter(
          (key) => state.windows[key].isOpen
        );

        // Update positions immediately
        windowKeys.forEach((key) => {
          const win = state.windows[key];

          const newTop = isMobile
            ? window.innerHeight / 2 - (win.height || 400) / 2
            : win.defaultTop ?? 100;

          const newLeft = isMobile
            ? window.innerWidth / 2 - (win.width || 600) / 2
            : win.defaultLeft ?? 200;

          win.top = newTop;
          win.left = newLeft;
        });

        // Use keys only in async code
        setTimeout(() => {
          windowKeys.forEach((key) => {
            const el = document.getElementById(key);
            if (el && el.id !== "welcome") {
              gsap.set(el, { x: 0, y: 0 });
            }
          });
        }, 0);
      }),
  }))
);

export default useWindowStore;