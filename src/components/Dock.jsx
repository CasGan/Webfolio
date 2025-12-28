import { dockApps } from "#constants";
import useWindowStore from "#store/window";
import { Tooltip } from "react-tooltip";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const Dock = () => {
  const dockRef = useRef(null);
  const { openWindow, closeWindow, windows } = useWindowStore();

  const ANIMATION_CONFIG = {
    DISTANCE_EXPONENT: 2.75,
    FALLOFF_DIVISOR: 20000,
    SCALE_MULTIPLIER: 0.25,
    Y_OFFSET: -15,
    MAX_Z_INDEX: 1000,
    HOVER_DURATION: 0.2,
    RESET_DURATION: 0.3,
  };

  // GSAP dock hover/magnification
  useGSAP(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const icons = dock.querySelectorAll(".dock-icon");

    const animateIcons = (mouseX) => {
      const dockRect = dock.getBoundingClientRect();
      icons.forEach((icon) => {
        const { left: iconLeft, width } = icon.getBoundingClientRect();
        const center = iconLeft - dockRect.left + width / 2;
        const distance = Math.abs(mouseX - center);

        // exponential falloff
        const intensity = Math.exp(
          -(distance ** ANIMATION_CONFIG.DISTANCE_EXPONENT) /
            ANIMATION_CONFIG.FALLOFF_DIVISOR
        );

        gsap.to(icon, {
          scale: 1 + ANIMATION_CONFIG.SCALE_MULTIPLIER * intensity,
          y: ANIMATION_CONFIG.Y_OFFSET * intensity,
          zIndex: Math.round(ANIMATION_CONFIG.MAX_Z_INDEX * intensity),
          duration: ANIMATION_CONFIG.HOVER_DURATION,
          ease: "power1.out",
        });
      });
    };

    const handleMouseMove = (e) => {
      const dockRect = dock.getBoundingClientRect();
      animateIcons(e.clientX - dockRect.left);
    };

    const resetIcons = () =>
      icons.forEach((icon) =>
        gsap.to(icon, {
          scale: 1,
          y: 0,
          zIndex: 0,
          duration: 0.3,
          ease: "power1.out",
        })
      );

    dock.addEventListener("mousemove", handleMouseMove);
    dock.addEventListener("mouseleave", resetIcons);

    return () => {
      dock.removeEventListener("mousemove", handleMouseMove);
      dock.removeEventListener("mouseleave", resetIcons);
    };
  }, []);

  // Toggle app windows
  const toggleApp = (appId) => {
    const appWindow = windows[appId];
    if (!appWindow) return;

    appWindow.isOpen ? closeWindow(appId) : openWindow(appId);
  };

  return (
    <section id="dock">
      <div
        ref={dockRef}
        className="dock-container flex justify-center items-end p-1.5 bg-white/20 backdrop-blur-md rounded-2xl gap-1.5 select-none"
      >
        {dockApps.map(({ id, name, icon, canOpen }) => (
          <button
            key={id}
            type="button"
            className={`dock-icon relative size-14 3xl:size-20 ${
              canOpen ? "" : "opacity-60"
            }`}
            aria-label={name}
            data-tooltip-id="dock-tooltip"
            data-tooltip-content={name}
            data-tooltip-delay-show={150}
            disabled={!canOpen}
            onClick={() => toggleApp(id)}
          >
            <img
              src={`/images/${icon}`}
              alt={name}
              loading="lazy"
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>
      <Tooltip id="dock-tooltip" place="top" className="tooltip" />
    </section>
  );
};

export default Dock;
