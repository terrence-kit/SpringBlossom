const header = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");
const glow = document.querySelector(".cursor-glow");
const petalContainer = document.querySelector(".petals");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.getElementById("year").textContent = new Date().getFullYear();

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 30);
}, { passive: true });

navToggle.addEventListener("click", () => {
  const open = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!open));
  navToggle.setAttribute("aria-label", open ? "Open navigation" : "Close navigation");
  nav.classList.toggle("open", !open);
  document.body.classList.toggle("menu-open", !open);
});

nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    navToggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("open");
    document.body.classList.remove("menu-open");
  });
});

if (!reducedMotion) {
  window.addEventListener("pointermove", event => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  }, { passive: true });

  for (let index = 0; index < 15; index += 1) {
    const petal = document.createElement("i");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.animationDuration = `${9 + Math.random() * 11}s`;
    petal.style.animationDelay = `${Math.random() * -18}s`;
    petal.style.transform = `scale(${.55 + Math.random() * .75})`;
    petalContainer.appendChild(petal);
  }
}

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  revealObserver.observe(element);
});

const tabs = document.querySelectorAll(".menu-tab");
const menus = document.querySelectorAll(".menu-list");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const selected = tab.dataset.filter;
    tabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
    });
    menus.forEach(menu => menu.classList.toggle("active", menu.dataset.menu === selected));
  });
});

document.querySelectorAll(".experience-card").forEach(card => {
  card.addEventListener("pointermove", event => {
    if (reducedMotion || window.innerWidth < 900) return;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - .5;
    const y = (event.clientY - bounds.top) / bounds.height - .5;
    card.style.transform = `perspective(900px) rotateY(${x * 2.6}deg) rotateX(${y * -2.6}deg)`;
  });
  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

const fullMenu = document.querySelector(".full-menu");
const menuPosters = document.querySelectorAll(".menu-poster");
const lightbox = document.querySelector(".menu-lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxLabel = lightbox.querySelector("p");
const lightboxClose = lightbox.querySelector(".lightbox-close");

menuPosters.forEach(poster => {
  const image = poster.querySelector("img");

  const removeMissingPoster = () => {
    poster.remove();
    if (!document.querySelector(".menu-poster")) fullMenu.remove();
  };

  image.addEventListener("error", removeMissingPoster);
  if (image.complete && image.naturalWidth === 0) removeMissingPoster();

  poster.addEventListener("click", () => {
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
    lightboxLabel.textContent = poster.dataset.label;
    lightbox.hidden = false;
    document.body.classList.add("menu-open");
    lightboxClose.focus();
  });
});

const closeLightbox = () => {
  lightbox.hidden = true;
  lightboxImage.src = "";
  document.body.classList.remove("menu-open");
};

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", event => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !lightbox.hidden) closeLightbox();
});

const socialSection = document.querySelector("#socials");
const qrGrid = socialSection.querySelector(".qr-grid");
const qrCards = socialSection.querySelectorAll(".qr-card");

qrCards.forEach(card => {
  const image = card.querySelector("img");

  const removeMissingQr = () => {
    card.remove();
    if (!qrGrid.querySelector(".qr-card")) qrGrid.remove();
  };

  image.addEventListener("error", removeMissingQr);
  if (image.complete && image.naturalWidth === 0) removeMissingQr();
});
