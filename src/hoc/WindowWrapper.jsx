import useWindowStore from "#store/window.js";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLayoutEffect, useRef, useEffect } from "react";
import { Draggable } from "gsap/Draggable";

const WindowWrapper = (Component, windowKey) => {
  const Wrapped = (props) => {
    const { focusWindow, windows } = useWindowStore();
    const ref = useRef(null);

    // Subscribe to the specific window's state
    const windowState = windows[windowKey];
    const isOpen = windowState?.isOpen ?? false;
    const zIndex = windowState?.zIndex ?? 0;
    const data = windowState?.data ?? null;

    useGSAP(() => {
      const element = ref.current;
      if (!element || !isOpen) return;

      gsap.fromTo(
        element,
        { scale: 0.8, opacity: 0, y: 40 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: "power3.out",
        }
      );
    }, [isOpen]);

    useGSAP(() => {
      const element = ref.current;
      if (!element || !isOpen) return;

      const header = element.querySelector("#window-header");
      if (!header) return;

      const [instance] = Draggable.create(element, {
        trigger: header,
        type: "x,y",
        allowContextMenu: true,
        dragClickables: false,
        allowNativeTouchScrolling: true,
        onDragEnd() {
          const { x, y } = instance;

          useWindowStore.getState().moveWindow(windowKey, x, y);

          // IMPORTANT: clear transform so React position wins
          gsap.set(element, { x: 0, y: 0 });
        },
      });

      return () => instance.kill();
    }, [isOpen]);

    useEffect(() => {
      if (!ref.current) return;

      const el = ref.current;
      const draggableInstance = Draggable.get(el);

      if (draggableInstance) {
        draggableInstance.applyBounds(); // optional, if you add bounds
        draggableInstance.update(); // resets internal coords
      }
    }, [windows[windowKey].top, windows[windowKey].left]);

    useLayoutEffect(() => {
      const element = ref.current;
      if (!element) return;

      element.style.display = isOpen ? "block" : "none";
      element.style.zIndex = zIndex;
    }, [isOpen, zIndex]);

    // early return AFTER all hooks
    if (!windowState) return null;

    return (
      <section
        id={windowKey}
        ref={ref}
        className="absolute"
        style={{
          top: windowState.top,
          left: windowState.left,
        }}
        onPointerUp={(e) => {
          if (e.currentTarget === e.target) {
            focusWindow(windowKey);
          }
        }}
        onPointerDown={() => focusWindow(windowKey)}
      >
        <Component {...props} data={data} />
      </section>
    );
  };

  Wrapped.displayName = `WindowWrapper(${
    Component.displayName || Component.name || "Component"
  })`;

  return Wrapped;
};

export default WindowWrapper;
