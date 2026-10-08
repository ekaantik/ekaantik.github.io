/* Ekaantik — site interactions (vanilla, no dependencies) */
(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme ---------- */
  var themeBtn = document.querySelector("[data-theme-toggle]");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      themeBtn.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
    });
  }

  /* ---------- Header: scrolled state + back-to-top ---------- */
  var header = document.querySelector(".site-header");
  var toTop = document.querySelector(".to-top");
  var onScroll = function () {
    var y = window.scrollY;
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (toTop) toTop.classList.toggle("is-shown", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });

  /* ---------- Mobile menu ---------- */
  var menuBtn = document.querySelector(".menu-toggle");
  var nav = document.getElementById("site-nav");
  function setMenu(open) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
  }
  if (menuBtn) menuBtn.addEventListener("click", function () { setMenu(!nav.classList.contains("is-open")); });
  if (nav) nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- Scroll-spy for nav ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]:not(.nav__cta)'));
  var spyTargets = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if ("IntersectionObserver" in window && spyTargets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    spyTargets.forEach(function (t) { spy.observe(t); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var revealer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add("is-visible");
        obs.unobserve(el);
        var delay = parseInt(el.style.getPropertyValue("--d"), 10) || 0;
        setTimeout(function () { el.classList.remove("reveal", "is-visible"); }, 900 + delay);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealEls.forEach(function (el) { revealer.observe(el); });
  }

  /* ---------- Animated counters ---------- */
  function formatNumber(n) { return n.toLocaleString("en-US"); }
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (reduceMotion) { el.textContent = formatNumber(target); return; }
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
      el.textContent = formatNumber(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var counterObs = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        runCounter(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { counterObs.observe(c); });
  } else {
    counters.forEach(runCounter);
  }

  /* ---------- Portfolio filters ---------- */
  var filterBtns = document.querySelectorAll("[data-filter]");
  var works = document.querySelectorAll("[data-category]");
  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var f = btn.getAttribute("data-filter");
      filterBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      works.forEach(function (w) {
        var show = f === "all" || w.getAttribute("data-category") === f;
        w.classList.toggle("is-hidden", !show);
        w.classList.remove("is-entering");
        if (show && !reduceMotion) { void w.offsetWidth; w.classList.add("is-entering"); }
      });
    });
  });

  /* ---------- Contact form → opens the visitor's mail client ---------- */
  var form = document.getElementById("contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form);
      var subject = d.get("subject") || "Project enquiry";
      var body =
        "Name: " + d.get("name") + "\n" +
        "Email: " + d.get("email") + "\n" +
        (d.get("phone") ? "Phone: " + d.get("phone") + "\n" : "") +
        "\n" + d.get("message");
      window.location.href =
        "mailto:" + form.getAttribute("data-to") +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
