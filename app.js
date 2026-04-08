/* ============================================
   ReflexSort — app.js
   Particle system, counters, scroll FX, nav
   ============================================ */

// ─── Particle Canvas ───────────────────────────────────────────────────
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");

let particles = [];
let W = window.innerWidth;
let H = window.innerHeight;

function resizeCanvas() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const COLORS = ["rgba(30,86,214,", "rgba(79,70,229,", "rgba(5,150,105,", "rgba(8,145,178,"];

class Particle {
  constructor() {
    this.reset(true);
  }
  reset(init = false) {
    this.x = Math.random() * W;
    this.y = init ? Math.random() * H : H + 10;
    this.r = Math.random() * 1.6 + 0.4;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -(Math.random() * 0.6 + 0.2);
    this.life = 0;
    this.maxLife = Math.random() * 300 + 150;
    this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life += 1;
    if (this.life > this.maxLife || this.y < -10) this.reset();
  }
  draw() {
    const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color + alpha + ")";
    ctx.fill();
  }
}

// Initialize particles
for (let i = 0; i < 130; i++) particles.push(new Particle());

// Draw connecting lines between nearby particles
function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 90) {
        const alpha = (1 - dist / 90) * 0.12;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(30,86,214,${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

// Mouse interaction
let mouse = { x: -999, y: -999 };
document.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  drawConnections();
  particles.forEach((p) => {
    // Gentle mouse repel
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 80) {
      p.vx += (dx / dist) * 0.05;
      p.vy += (dy / dist) * 0.05;
    }
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ─── Navbar scroll state ───────────────────────────────────────────────
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
  updateActiveNavLink();
});

// Active nav link on scroll
function updateActiveNavLink() {
  const sections = document.querySelectorAll("section[id]");
  let current = "";
  sections.forEach((sec) => {
    const top = sec.getBoundingClientRect().top;
    if (top <= 100) current = sec.id;
  });
  document.querySelectorAll(".nav-links a").forEach((a) => {
    a.classList.remove("active");
    if (a.getAttribute("href") === `#${current}`) a.classList.add("active");
  });
}

// ─── Hamburger menu ────────────────────────────────────────────────────
const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector(".nav-links");
const navCta = document.querySelector(".nav-cta");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  navLinks.classList.toggle("mobile-open");
});

// ─── Intersection Observer — animate on scroll ─────────────────────────
const observerOpts = { threshold: 0.15, rootMargin: "0px 0px -60px 0px" };

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, observerOpts);

// All glass-cards & step-cards
document
  .querySelectorAll(
    ".glass-card, .step-card, .feat-card, .metric-card, .timeline-phase, .about-icon-card, .impact-card",
  )
  .forEach((el, i) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(32px)";
    el.style.transition = `opacity 0.6s cubic-bezier(.4,0,.2,1) ${i * 0.05}s, transform 0.6s cubic-bezier(.4,0,.2,1) ${i * 0.05}s`;
    el.classList.add("reveal-target");
    revealObserver.observe(el);
  });

// Add "visible" style rule dynamically
const revealStyle = document.createElement("style");
revealStyle.textContent = `.reveal-target.visible { opacity: 1 !important; transform: translateY(0) !important; }`;
document.head.appendChild(revealStyle);

// ─── Animated Counters ─────────────────────────────────────────────────
function animateCounter(el, target, duration = 1800, suffix = "", prefix = "") {
  let start = 0;
  const step = 16;
  const steps = Math.ceil(duration / step);
  const inc = target / steps;
  let count = 0;

  const timer = setInterval(() => {
    count++;
    const val = Math.min(Math.round(inc * count), target);
    el.innerHTML = prefix + val + suffix;
    if (count >= steps) clearInterval(timer);
  }, step);
}

const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || "";
      const prefix = el.dataset.prefix || "";
      animateCounter(el, target, 1800, suffix, prefix);
      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.5 },
);

document
  .querySelectorAll(".metric-num")
  .forEach((el) => counterObserver.observe(el));

// ─── Metric ring + bar animate on scroll ──────────────────────────────
const metricObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      card.classList.add("animated");
      const fill = card.querySelector(".metric-bar-fill");
      if (fill) {
        const w = fill.style.width; // holds the target %
        fill.style.width = "0";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            fill.style.transition = "width 2s cubic-bezier(.4,0,.2,1)";
            fill.style.width = w;
          });
        });
      }
      metricObserver.unobserve(card);
    });
  },
  { threshold: 0.3 },
);

document
  .querySelectorAll(".metric-card")
  .forEach((el) => metricObserver.observe(el));

// ─── Live panel counter tick ───────────────────────────────────────────
const liveCount = document.querySelector(".ls-count");
if (liveCount) {
  let base = parseInt(liveCount.dataset.base, 10);
  setInterval(() => {
    base += Math.floor(Math.random() * 3) + 1;
    liveCount.textContent = base.toLocaleString();
    liveCount.style.color = "var(--green)";
    setTimeout(() => (liveCount.style.color = ""), 300);
  }, 2800);
}

// ─── Section label reveal ──────────────────────────────────────────────
const labelObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.5 },
);

document.querySelectorAll(".section-label").forEach((el) => {
  el.style.opacity = "0";
  el.style.transform = "translateY(16px)";
  el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
  labelObserver.observe(el);
});

// ─── Hero entrance animations ──────────────────────────────────────────
(function heroEntrance() {
  const badge = document.querySelector(".hero-badge");
  const title = document.querySelector(".hero-title");
  const sub = document.querySelector(".hero-sub");
  const acts = document.querySelector(".hero-actions");
  const stats = document.querySelector(".hero-stats");
  const visual = document.querySelector(".hero-visual");

  const els = [badge, title, sub, acts, stats, visual];
  els.forEach((el, i) => {
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = i < 5 ? "translateY(28px)" : "translateX(40px)";
    el.style.transition = `opacity 0.7s cubic-bezier(.4,0,.2,1) ${i * 0.12 + 0.2}s,
                           transform 0.7s cubic-bezier(.4,0,.2,1) ${i * 0.12 + 0.2}s`;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "none";
      }),
    );
  });
})();

// ─── Smooth scroll for all anchor links ───────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (e) => {
    const target = document.querySelector(anchor.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    // close mobile menu if open
    navLinks.classList.remove("mobile-open");
    hamburger.classList.remove("open");
  });
});

// ─── Nav active link styling (dynamic) ────────────────────────────────
const navActiveStyle = document.createElement("style");
navActiveStyle.textContent = `
  .nav-links a.active { color: var(--green) !important; }
  .nav-links.mobile-open {
    display: flex !important;
    flex-direction: column;
    position: absolute;
    top: 64px; left: 0; right: 0;
    background: rgba(11,15,26,0.97);
    backdrop-filter: blur(20px);
    padding: 20px 24px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    gap: 4px;
    z-index: 999;
  }
  .nav-links.mobile-open a { color: var(--gray); padding: 12px 0; }
  .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
  .hamburger.open span:nth-child(2) { opacity: 0; }
  .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }
  @media (max-width: 768px) {
    .nav-links.mobile-open {
      display: flex !important;
    }
  }
`;
document.head.appendChild(navActiveStyle);

// ─── Glow cursor trail ─────────────────────────────────────────────────
const trail = document.createElement("div");
trail.style.cssText = `
  width: 400px; height: 400px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(30,86,214,0.04) 0%, transparent 70%);
  position: fixed;
  pointer-events: none;
  z-index: 0;
  transform: translate(-50%, -50%);
  transition: left 0.12s ease, top 0.12s ease;
`;
document.body.appendChild(trail);

document.addEventListener("mousemove", (e) => {
  trail.style.left = e.clientX + "px";
  trail.style.top = e.clientY + "px";
});

// ─── Feat card stagger on scroll ───────────────────────────────────────
const featObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const cards = entry.target.querySelectorAll(".feat-card");
        cards.forEach((card, i) => {
          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "translateY(0)";
          }, i * 80);
        });
        featObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);

const featGrid = document.querySelector(".features-grid");
if (featGrid) featObserver.observe(featGrid);

// ─── HUD panel live flicker ────────────────────────────────────────────
const hudItems = document.querySelectorAll(".hud-item .hud-val");
setInterval(() => {
  const picks = (Math.random() * 0.3 + 0.4).toFixed(2);
  const conf = (Math.random() * 2 + 96).toFixed(1);
  if (hudItems[2]) hudItems[2].textContent = picks + " /s";
  if (hudItems[1]) hudItems[1].textContent = conf + "%";
}, 2000);

// ─── Step card hover ripple ────────────────────────────────────────────
document.querySelectorAll(".step-card").forEach((card) => {
  card.addEventListener("mouseenter", function () {
    this.querySelector(".step-icon").style.transform =
      "scale(1.2) rotate(-5deg)";
    this.querySelector(".step-icon").style.transition = "transform 0.3s ease";
  });
  card.addEventListener("mouseleave", function () {
    this.querySelector(".step-icon").style.transform = "";
  });
});

console.log("%cReflexSort — AI Waste Sorting System", "color:#1E56D6;font-size:16px;font-weight:bold");
console.log("%cBuilt with precision. Engineered for the future.", "color:#4F46E5;font-size:12px");
