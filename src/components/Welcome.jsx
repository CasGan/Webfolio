import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const FONT_WEIGHTS = {
  subtitle: { min: 100, max: 400, default: 100 },
  title: { min: 400, max: 900, default: 400 },
};

const renderText = (text, className, baseWeight = 400) => {
  return [...text].map((char, i) => (
    <span
      key={i}
      className={`${className} inline-block`}
      style={{ fontWeight: baseWeight }}
    >
      {char === " " ? "\u00A0" : char}
    </span>
  ));
};

const setupTextHover = (container, type) => {
  if (!container) return () => {};

  const letters = container.querySelectorAll("span");
  const { min, max, default: base } = FONT_WEIGHTS[type];

  const animateLetter = (letter, weight, duration = 0.25) =>
    gsap.to(letter, {
      duration,
      ease: "power2.out",
      fontWeight: Math.round(weight),
    });

  const handleMouseMove = (e) => {
    const { left } = container.getBoundingClientRect();
    const mouseX = e.clientX - left;

    letters.forEach((letter) => {
      const { left: l, width: w } = letter.getBoundingClientRect();
      const center = l - left + w / 2;
      const distance = Math.abs(mouseX - center);
      const intensity = Math.exp(-(distance ** 2) / 2000);

      animateLetter(letter, min + (max - min) * intensity);
    });
  };

  const resetLetters = () => {
    letters.forEach((letter) =>
      animateLetter(letter, base, 0.4)
    );
  };

  container.addEventListener("mousemove", handleMouseMove);
  container.addEventListener("mouseleave", resetLetters);

  return () => {
    container.removeEventListener("mousemove", handleMouseMove);
    container.removeEventListener("mouseleave", resetLetters); 
  };
};

const Welcome = () => {
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);

  useGSAP(() => {
    const cleanupTitle = setupTextHover(titleRef.current, "title");
    const cleanupSubtitle = setupTextHover(subtitleRef.current, "subtitle");

    return () => {
      cleanupTitle?.(); 
      cleanupSubtitle?.(); 
    };

  }, []);

  return (
    <section id="welcome">
      <p ref={subtitleRef}>
        {renderText(
          "Hey, I'm Cassandra! Welcome to my",
          "text-3xl font-georama",
          FONT_WEIGHTS.subtitle.default
        )}
      </p>

      <h1 ref={titleRef} className="mt-7">
        {renderText(
          "webfolio",
          "text-9xl italic font-georama",
          FONT_WEIGHTS.title.default
        )}
      </h1>

      <div className="small-screen">
        <p>
          This portfolio is designed for desktop/tablet screens only.
        </p>
      </div>
    </section>
  );
};

export default Welcome;
