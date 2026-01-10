import useWindowStore from "#store/window.js";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";
import { Draggable } from "gsap/Draggable";

const WindowWrapper = (Component, windowKey) => {
  const Wrapped = (props) => {
    const { focusWindow, windows } = useWindowStore();
    const ref = useRef(null);

    const windowState = windows[windowKey];
    const isOpen = windowState?.isOpen ?? false;
    const zIndex = windowState?.zIndex ?? 0;
    const data = windowState?.data ?? null;

    const isMobile = typeof window !== "undefined" && window.innerWidth <= 640;

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
  if(!root) return; 

  const rootBounds = { top: 50, left: 0, width: root.clientWidth, height: root.clientHeight - 50,};
  const instance = Draggable.create(element, {
    trigger: header,
    type: "x,y",
    allowContextMenu: true,
    dragClickables: false,
    bounds: rootBounds,

    onDragEnd() {
      // Use GSAP's internal values (NOT React state)
      const x = this.x || 0;
      const y = this.y || 0;

      useWindowStore.getState().moveWindow(
        windowKey,
        x,
        y
      );

      // Reset transform so React owns position
      gsap.set(element, { x: 0, y: 0 });
    },
  })[0];

 const handleResize = () => instance.applyBounds(root);


  window.addEventListener("resize", handleResize);

  return () => {
    instance.kill();
    window.removeEventListener("resize", handleResize);
  };
}, [isOpen, isMobile]);

    // Layout effect
    useLayoutEffect(() => {
      const element = ref.current;
      if (!element) return;

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
    }, [isOpen, zIndex, windowState?.top, windowState?.left, isMobile]);

    if (!windowState) return null;

    return (
      <section
        id={windowKey}
        ref={ref}
        className="absolute flex flex-col overflow-hidden"
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
