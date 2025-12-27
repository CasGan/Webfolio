import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const FONT_WEIGHTS = {
  subtitle: { min: 100, max: 400, default: 100 },
  title: { min: 400, max: 900, default: 400 },
};
const getInputMode = () => {
  if(typeof window === "undefines") return "unknown"; 
  if (window.matchMedia("(hover: hover)").matches) return "hover";
  if (
    window.matchMedia("(hover: none)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  )
    return "touch";
  return "unknown";
};


const renderText = (text, className, baseWeight = 400) =>
  [...text].map((char, i) => (
    <span
      key={i}
      className={`${className} inline-block`}
      style={{ fontWeight: baseWeight }}
    >
      {char === " " ? "\u00A0" : char}
    </span>
  ));

/*  HOVER (DESKTOP)  */
const setupTextHover = (container, type) => {
  if (!container) return;

  const letters = container.querySelectorAll("span");
  const { min, max, default: base } = FONT_WEIGHTS[type];

  const handleMouseMove = (e) => {
    const { left } = container.getBoundingClientRect();
    const mouseX = e.clientX - left;

    letters.forEach((letter) => {
      const { left: l, width: w } = letter.getBoundingClientRect();
      const center = l - left + w / 2;
      const distance = Math.abs(mouseX - center);
      const intensity = Math.exp(-(distance ** 2) / 2000);

      gsap.to(letter, {
        fontWeight: Math.round(min + (max - min) * intensity),
        duration: 0.25,
        ease: "power2.out",
      });
    });
  };

  const resetLetters = () =>
    letters.forEach((letter) =>
      gsap.to(letter, {
        fontWeight: base,
        duration: 0.4,
        ease: "power2.out",
      })
    );

  container.addEventListener("mousemove", handleMouseMove);
  container.addEventListener("mouseleave", resetLetters);

   return () => {
    container.removeEventListener("mousemove", handleMouseMove);
    container.removeEventListener("mouseleave", resetLetters);
    
  };
};

/*  TAP (MOBILE – RIPPLE)  */
const setupTextTap = (container, type) => {
  if (!container) return;

  const letters = container.querySelectorAll("span");
  const { max, default: base } = FONT_WEIGHTS[type];

  const handleTap = (e) => {
    const touch = e.touches?.[0];
    if (!touch) return;

    const { left } = container.getBoundingClientRect();
    const tapX = touch.clientX - left;

    letters.forEach((letter) => {
      const { left: l, width: w } = letter.getBoundingClientRect();
      const center = l - left + w / 2;
      const distance = Math.abs(tapX - center);
      const delay = distance * 0.002;

      gsap.timeline()
        // compression
        .to(letter, {
          scale: 0.9,
          duration: 0.08,
          delay,
          ease: "power2.in",
        })
        // expansion + glow
        .to(letter, {
          fontWeight: max,
          scale: 1.15,
          y: -4,
          filter: "drop-shadow(0 0 8px rgba(255,255,255,0.35))",
          duration: 0.25,
          ease: "power3.out",
        })
        // elastic settle
        .to(letter, {
          fontWeight: base,
          scale: 1,
          y: 0,
          filter: "none",
          duration: 0.45,
          ease: "elastic.out(1, 0.4)",
        });
    });
  };

  container.addEventListener("touchstart", handleTap, { passive: true });

  return () => {
    container.removeEventListener("touchstart", handleTap);
  };
};

/*  COMPONENT  */
const Welcome = () => {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

useGSAP(() => {
  const hoverQuery = window.matchMedia("(hover: hover)");
  const coarseQuery = window.matchMedia("(pointer: coarse)");

  let ctx;
  let currentMode = getInputMode();
  let cleanups = [];

  const init = () => {
    // Run all previous cleanups first
    cleanups.forEach((fn) => fn?.());
    cleanups = [];

    // Revert previous GSAP context
    ctx?.revert();

    // Create new GSAP context
    ctx = gsap.context(() => {
      if (currentMode === "hover") {
        cleanups.push(
          setupTextHover(titleRef.current, "title"),
          setupTextHover(subtitleRef.current, "subtitle")
        );
      } else if (currentMode === "touch") {
        cleanups.push(
          setupTextTap(titleRef.current, "title"),
          setupTextTap(subtitleRef.current, "subtitle")
        );
      }
    }, titleRef);
  };

  init();

  const handleChange = () => {
    const nextMode = getInputMode();
    if (nextMode !== currentMode) {
      currentMode = nextMode;
      init();
    }
  };

  // Listen to media query changes
  hoverQuery.addEventListener("change", handleChange);
  coarseQuery.addEventListener("change", handleChange);

  // Cleanup on unmount
  return () => {
    hoverQuery.removeEventListener("change", handleChange);
    coarseQuery.removeEventListener("change", handleChange);

    // Cleanup hover/tap event listeners
    cleanups.forEach((fn) => fn?.());
    cleanups = [];

    // Revert GSAP context
    ctx?.revert();
  };
}, []);

  return (
    <section id="welcome">
      <p ref={subtitleRef}>
        {renderText(
          "Hey, I'm Cassandra! Welcome to my",
          "fluid-subtitle font-georama",
          FONT_WEIGHTS.subtitle.default
        )}
      </p>

      <h1 ref={titleRef} className="mt-7">
        {renderText(
          "webfolio",
          "fluid-title italic font-georama",
          FONT_WEIGHTS.title.default
        )}
      </h1>

      <div className="small-screen"> 
        <p>This portfolio is designed for desktop/tablet screens only.</p>
      </div>
    </section>
  );
};

export default Welcome;
