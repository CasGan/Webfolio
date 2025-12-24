import { useEffect, useRef } from "react";

const MAIN_NODE_COUNT = 7;
const SECONDARY_NODE_COUNT = 28;
const NEIGHBORS = 4;
const COLORS = ["#0ff", "#0f0"];
const PACKET_COLOR = "#0ff";

export default function DesktopBackground() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Offscreen canvases
    const bgCanvas = document.createElement("canvas");
    const bgCtx = bgCanvas.getContext("2d");

    const noiseCanvas = document.createElement("canvas");
    const noiseCtx = noiseCanvas.getContext("2d");

    const lineCanvas = document.createElement("canvas");
    const lineCtx = lineCanvas.getContext("2d");

    const packetCanvas = document.createElement("canvas");
    const packetCtx = packetCanvas.getContext("2d");

    let lastTime = performance.now();

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;

      canvas.width = bgCanvas.width = noiseCanvas.width = lineCanvas.width = packetCanvas.width = w;
      canvas.height = bgCanvas.height = noiseCanvas.height = lineCanvas.height = packetCanvas.height = h;

      // Background gradient
      const bgGradient = bgCtx.createRadialGradient(w / 2, h / 2, w / 4, w / 2, h / 2, w);
      bgGradient.addColorStop(0, "#0a0f13");
      bgGradient.addColorStop(1, "#010103");
      bgCtx.fillStyle = bgGradient;
      bgCtx.fillRect(0, 0, w, h);

      // Noise
      const noiseData = noiseCtx.createImageData(w, h);
      for (let i = 0; i < noiseData.data.length; i += 4) {
        const n = Math.random() * 8;
        noiseData.data[i] = n;
        noiseData.data[i + 1] = n;
        noiseData.data[i + 2] = n;
        noiseData.data[i + 3] = 12; // subtle
      }
      noiseCtx.putImageData(noiseData, 0, 0);
    }

    window.addEventListener("resize", resize);
    resize();

    // Nodes
    const nodes = [
      ...Array.from({ length: MAIN_NODE_COUNT }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        color: "#0ff",
        radius: 3,
        isMain: true,
        isStatic: false,
      })),
      ...Array.from({ length: SECONDARY_NODE_COUNT }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        color: "#0f0",
        radius: 2,
        isMain: false,
        isStatic: Math.random() < 0.35,
      }))
    ];

    // Pre-render node glows
    const glowCache = {};
    nodes.forEach((node) => {
      const glowCanvas = document.createElement("canvas");
      const glowCtx = glowCanvas.getContext("2d");
      const size = node.isMain ? 18 : 10;
      glowCanvas.width = glowCanvas.height = size * 2;
      const gradient = glowCtx.createRadialGradient(size, size, 0, size, size, size);
      const colorAlpha = node.color === "#0ff" ? "rgba(0,255,255,0.08)" : "rgba(0,255,0,0.08)";
      gradient.addColorStop(0, colorAlpha);
      gradient.addColorStop(1, "transparent");
      glowCtx.fillStyle = gradient;
      glowCtx.beginPath();
      glowCtx.arc(size, size, size, 0, Math.PI * 2);
      glowCtx.fill();
      glowCache[node.color + size] = glowCanvas;
    });

    const packets = [];
    let lastPacketTime = 0;

    // Mouse tracking
    window.addEventListener("mousemove", (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    });

    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

    const animate = (timestamp) => {
      const deltaTime = (timestamp - lastTime) / 16; // approximate frame-normalized
      lastTime = timestamp;

      if (document.visibilityState === "hidden") {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const w = canvas.width;
      const h = canvas.height;

      lineCtx.clearRect(0, 0, w, h);
      packetCtx.clearRect(0, 0, w, h);

      // Move nodes and draw glows
      nodes.forEach((node) => {
        if (!node.isStatic) {
          // Subtle mouse repulsion
          const dxMouse = node.x - mouse.current.x;
          const dyMouse = node.y - mouse.current.y;
          const distance = Math.hypot(dxMouse, dyMouse);
          if (distance < 100) {
            node.x += (dxMouse / distance) * 0.3;
            node.y += (dyMouse / distance) * 0.3;
          }

          node.x += node.vx * deltaTime;
          node.y += node.vy * deltaTime;
          if (node.x < 0 || node.x > w) node.vx *= -1;
          if (node.y < 0 || node.y > h) node.vy *= -1;
        }

        // Draw pre-rendered glow
        const glow = glowCache[node.color + (node.isMain ? 18 : 10)];
        lineCtx.drawImage(glow, node.x - glow.width / 2, node.y - glow.height / 2);

        // Node dot
        lineCtx.fillStyle = node.color;
        lineCtx.beginPath();
        lineCtx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        lineCtx.fill();
      });

      // Draw lines & spawn packets
      nodes.forEach((node) => {
        const neighbors = nodes
          .filter((n) => n !== node)
          .map((n) => ({ node: n, d: dist(node, n) }))
          .sort((a, b) => a.d - b.d)
          .slice(0, NEIGHBORS);

        neighbors.forEach(({ node: neighbor, d }) => {
          if (d > 250) return;

          const alpha = 0.05 + 0.15 * (1 - d / 250);
          const md = Math.min(
            dist({ x: mouse.current.x, y: mouse.current.y }, node),
            dist({ x: mouse.current.x, y: mouse.current.y }, neighbor)
          );
          const mouseAlpha = md < 100 ? 0.06 : 0;
          const smoothAlpha = Math.min(alpha + mouseAlpha * 0.5, 0.15);

          lineCtx.strokeStyle = node.color;
          lineCtx.globalAlpha = smoothAlpha;
          lineCtx.lineWidth = 1;
          lineCtx.beginPath();
          lineCtx.moveTo(node.x, node.y);
          lineCtx.lineTo(neighbor.x, neighbor.y);
          lineCtx.stroke();

          // Spawn packets along the line
          if (node.isMain && timestamp - lastPacketTime > 200 && Math.random() < 0.3) {
            const t = 0.1 + Math.random() * 0.2; // centered more on line
            packets.push({
              x: node.x + (neighbor.x - node.x) * t,
              y: node.y + (neighbor.y - node.y) * t,
              target: neighbor,
              speed: 0.5 + Math.random() * 0.5,
              life: 0.5 + Math.random() * 0.5,
            });
            lastPacketTime = timestamp;
          }
        });
      });

      // Animate packets
      packets.forEach((p) => {
        const dx = p.target.x - p.x;
        const dy = p.target.y - p.y;
        const distToTarget = Math.hypot(dx, dy);
        if (distToTarget > 0) {
          const moveFraction = 0.02 + 0.03 * p.life;
          p.x += dx * moveFraction * deltaTime;
          p.y += dy * moveFraction * deltaTime;
          p.life -= 0.005 * deltaTime;
        }
      });

      // Remove dead packets
      for (let i = packets.length - 1; i >= 0; i--) {
        if (packets[i].life <= 0) packets.splice(i, 1);
      }

      // Composite layers
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(bgCanvas, 0, 0);
      ctx.drawImage(noiseCanvas, 0, 0);
      ctx.drawImage(lineCanvas, 0, 0);

      packetCtx.save();
      packets.forEach((p) => {
        packetCtx.globalAlpha = Math.max(0, p.life);
        packetCtx.fillStyle = PACKET_COLOR;
        packetCtx.beginPath();
        packetCtx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        packetCtx.fill();
      });
      packetCtx.restore();
      ctx.drawImage(packetCanvas, 0, 0);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate(performance.now());

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
