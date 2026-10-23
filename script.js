const root = document.documentElement;
const themeToggle = document.querySelector("#theme-toggle");
const themeMeta = document.querySelector('meta[name="theme-color"]');
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function applyTheme(theme, persist = true) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  root.dataset.theme = nextTheme;

  if (themeToggle) {
    themeToggle.setAttribute(
      "aria-label",
      nextTheme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"
    );
  }

  if (themeMeta) {
    themeMeta.setAttribute("content", nextTheme === "dark" ? "#121510" : "#f4efe6");
  }

  if (persist) {
    try {
      localStorage.setItem("rawaq-theme", nextTheme);
    } catch (error) {
      return;
    }
  }
}

applyTheme(root.dataset.theme, false);

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });
}

const header = document.querySelector(".site-header");

function updateHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 18);
}

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const nav = document.querySelector("#primary-nav");
const menuToggle = document.querySelector("#menu-toggle");

function setMenuState(open) {
  if (!nav || !menuToggle) return;

  nav.classList.toggle("is-open", open);
  menuToggle.classList.toggle("is-active", open);
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
}

if (nav && menuToggle) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("click", (event) => {
    if (menuToggle.getAttribute("aria-expanded") !== "true") return;
    if (!nav.contains(event.target) && !menuToggle.contains(event.target)) {
      setMenuState(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (menuToggle.getAttribute("aria-expanded") !== "true") return;
    setMenuState(false);
    menuToggle.focus();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 920) setMenuState(false);
  });
}

const revealItems = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const arabicNumbers = new Intl.NumberFormat("ar-EG", { useGrouping: false });
const counters = document.querySelectorAll("[data-count]");

function animateCounter(element) {
  const target = Number(element.dataset.count);
  const duration = 1400;
  let startTime = null;

  if (!Number.isFinite(target)) return;

  function tick(timestamp) {
    if (startTime === null) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = arabicNumbers.format(Math.round(target * eased));

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

if (counters.length) {
  if ("IntersectionObserver" in window && !prefersReducedMotion.matches) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach((counter) => {
      counter.textContent = arabicNumbers.format(Number(counter.dataset.count));
    });
  }
}

const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

function setActiveLink(sectionId) {
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

if ("IntersectionObserver" in window && observedSections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveLink(entry.target.id);
      });
    },
    { rootMargin: "-28% 0px -62% 0px", threshold: 0 }
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const submitLabel = submitButton ? submitButton.querySelector("span") : null;
    const originalLabel = submitLabel ? submitLabel.textContent : "";

    if (submitButton) submitButton.disabled = true;
    if (submitLabel) submitLabel.textContent = "جارٍ الإرسال...";

    formStatus.textContent = "";
    formStatus.classList.remove("is-success");

    window.setTimeout(() => {
      contactForm.reset();
      if (submitButton) submitButton.disabled = false;
      if (submitLabel) submitLabel.textContent = originalLabel;

      formStatus.textContent = "شكرًا لك! وصلتنا فكرتك، وسنعود إليك خلال يومي عمل.";
      formStatus.classList.add("is-success");
    }, 850);
  });

  contactForm.addEventListener("input", () => {
    if (!formStatus.classList.contains("is-success")) return;
    formStatus.textContent = "";
    formStatus.classList.remove("is-success");
  });
}

const year = document.querySelector("#year");

if (year) {
  year.textContent = arabicNumbers.format(new Date().getFullYear());
}
