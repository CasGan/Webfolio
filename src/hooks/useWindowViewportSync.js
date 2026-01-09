import { useEffect } from "react";
import gsap from "gsap";
import useWindowStore from "#store/window";

export default function useWindowViewportSync() {
  const resetWindows = useWindowStore((s) => s.resetWindows);

  useEffect(() => {
    const handler = () => {
      resetWindows();

      requestAnimationFrame(() => {
        document.querySelectorAll("section[id]").forEach((el) => {
          if(el.id === "welcome") return; 
          gsap.set(el, { x: 0, y: 0 });
        });
      });
    };

    window.addEventListener("resize", handler);
    window.addEventListener("orientationchange", handler);

    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("orientationchange", handler);
    };
  }, [resetWindows]);
}
