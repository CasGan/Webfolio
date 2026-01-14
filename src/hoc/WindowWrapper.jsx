import useWindowStore, { debounce } from "#store/window.js";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";
import { Draggable } from "gsap/Draggable";

const WindowWrapper = (Component, windowKey) => {
  const Wrapped = (props) => {
    const { focusWindow, windows, isMobile, resetVersion } = useWindowStore();
    const ref = useRef(null);
    const draggableRef = useRef(null);

    const windowState = windows[windowKey];
    const isOpen = windowState?.isOpen ?? false;
    const zIndex = windowState?.zIndex ?? 0;
    const data = windowState?.data ?? null;
    const lastResetVersion = useRef(resetVersion);

    useGSAP(
      () => {
        if (lastResetVersion.current === resetVersion) return;
        lastResetVersion.current = resetVersion;

        const element = ref.current;
        if (!element || !isOpen) return;

        if (!windowState?.preventTransformReset) {
          gsap.set(element, { clearProps: "transform" });
        }
      },
      { dependencies: [resetVersion] }
    );

    // Open animation
    useGSAP(() => {
      const element = ref.current;
      if (!element || !isOpen) return;
      gsap.fromTo(
        element,
        { scale: 0.8, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }
      );
    }, [isOpen]);

    // Draggable only on desktop
    useGSAP(() => {
      if (!windowState || isMobile) return;

      const element = ref.current;
      if (!element || !isOpen) return;

      const header = element.querySelector("#window-header");
      if (!header) return;

      const root = document.querySelector(".os-root");
      if (!root) return;

      const getRootBounds = () => ({
        top: 50,
        left: 0,
        width: root.clientWidth,
        height: root.clientHeight - 50,
      });

      if (!draggableRef.current) {
        draggableRef.current = Draggable.create(element, {
          trigger: header,
          type: "x,y",
          allowContextMenu: true,
          dragClickables: false,
          bounds: getRootBounds(),

          onDragEnd() {
            const x = this.x || 0;
            const y = this.y || 0;

            useWindowStore.getState().moveWindow(windowKey, x, y);
            gsap.set(element, { x: 0, y: 0 });
          },
        })[0];
      }
      const instance = draggableRef.current; 

      const handleResize = debounce(() => {
        const bounds = getRootBounds();

        // Apply new bounds
        instance.applyBounds(bounds);

        // Get current stored position from state (fresh read to avoid stale closure)
        const currentState = useWindowStore.getState().windows[windowKey];
        const lastX = currentState?.left ?? 0;
        const lastY = currentState?.top ?? 0;

        // Clamp position to new bounds
        const clampedX = Math.min(
          Math.max(lastX, bounds.left),
          bounds.left + bounds.width - element.offsetWidth
        );
        const clampedY = Math.min(
          Math.max(lastY, bounds.top),
          bounds.top + bounds.height - element.offsetHeight
        );

        // compute deltas from current position
        const deltaX = clampedX - lastX;
        const deltaY = clampedY - lastY;
        //only update if position needs to change
        if (deltaX !== 0 || deltaY !== 0) {
          gsap.set(element, { x: 0, y: 0 });
          useWindowStore.getState().moveWindow(windowKey, deltaX, deltaY);
        }
      }, 100);

      window.addEventListener("resize", handleResize);

      return () => {
        instance?.kill();
        draggableRef.current = null; 
        window.removeEventListener("resize", handleResize);
      };
    }, [isOpen, isMobile]);

    // Layout effect
    useLayoutEffect(() => {
      const element = ref.current;
      if (!element) return;

      // Guard against undefined windowState
      if (!windowState) return;

      element.style.display = isOpen ? "flex" : "none";
      element.style.zIndex = zIndex;

      if (isMobile) {
        element.style.position = "fixed";
        element.style.top = "0";
        element.style.left = "0";
        element.style.width = "100dvw";
        element.style.height = "100dvh";
        element.style.transform = "none";
      } else {
        element.style.position = "absolute";
        element.style.top = `${windowState.top}px`;
        element.style.left = `${windowState.left}px`;
        element.style.transform = "none";
        element.style.width = ""; // CSS width
        element.style.height = ""; // CSS height
      }
    }, [isOpen, zIndex, windowState, isMobile]);

    if (!windowState) return null;

    return (
      <section
        id={windowKey}
        ref={ref}
        className="flex flex-col"
        onPointerUp={(e) => {
          if (e.currentTarget === e.target) focusWindow(windowKey);
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
