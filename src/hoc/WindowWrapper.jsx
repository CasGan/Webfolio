import useWindowStore from "#store/window.js";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";
import { Draggable } from "gsap/Draggable";

const WindowWrapper = (Component, windowKey) => {
  const Wrapped = (props) => {
    const { focusWindow, windows } = useWindowStore();
    const { isOpen, zIndex } = windows[windowKey];
    const ref = useRef(null);

    useGSAP(() => {
        const element = ref.current;
        if(!element || !isOpen) return; 

        element.style.display = "block";
        // animation to open windows
        gsap.fromTo(
            element,
            {scale: 0.8, opacity: 0, y: 40},
            {scale: 1, opacity: 1, y: 0, duration: 0.3, ease: "power3.out"},
        );

    }, [isOpen]);

    // animation for dragging windows
    useGSAP(() => {
        const element = ref.current; 

        if(!element) return; 
        Draggable.create(element, {onPress: () => focusWindow(windowKey)})
    }, []);

    useLayoutEffect(() => {
        const element = ref.current;
        if(!element) return; 
        
        element.style.display = isOpen ? "block" : "none"; 

    }, [isOpen]);

    return (
      <section id={windowKey} ref={ref} style={{ zIndex }} className="absolute">
        <Component {...props} />
      </section>
    );
  };

  Wrapped.displayName = `WindowWrapper(${Component.displayName || Component.name || "Component"})`;

  return Wrapped;
};

export default WindowWrapper;
