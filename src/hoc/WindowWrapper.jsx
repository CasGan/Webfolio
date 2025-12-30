import useWindowStore from "#store/window.js";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";
import { Draggable } from "gsap/Draggable";
const WindowWrapper = (Component, windowKey) => {
  const Wrapped = (props) => {
    const { focusWindow, windows } = useWindowStore();
    const ref = useRef(null);

    // Subscribe to the specific window's state
    const windowState = windows[windowKey];
    if (!windowState) return null;
    const { isOpen, zIndex, data } = windowState;

    useGSAP(() => {
      const element = ref.current;
      if (!element || !isOpen) return;

      gsap.fromTo(
        element,
        { scale: 0.8, opacity: 0, y: 40 },
        { scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }
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
        preventDefault: false,
        allowNativeTouchScrolling: true,
        onPress: () => focusWindow(windowKey),
      });

      return () => instance.kill();
    }, [isOpen]);

    useLayoutEffect(() => {
      const element = ref.current;
      if (!element) return;

      element.style.display = isOpen ? "block" : "none";
      element.style.zIndex = zIndex; 
    }, [isOpen, zIndex]);

    return (
      <section
        id={windowKey}
        ref={ref}
        className="absolute"
        onPointerUp={() => focusWindow(windowKey)}
      >
        <Component {...props} data={data} />
      </section>
    );
  };

  Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || "Component"})`;

  return Wrapped;
};

export default WindowWrapper;
