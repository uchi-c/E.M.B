(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- theme toggle ---------------------------------------------------- */
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem("emb-theme"); } catch (e) {}
  if (stored) root.setAttribute("data-theme", stored);

  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var effectiveDark = current ? current === "dark" : prefersDark;
      var next = effectiveDark ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("emb-theme", next); } catch (e) {}
    });
  });

  /* ---- mobile nav -------------------------------------------------------- */
  var navToggle = document.querySelector("[data-nav-toggle]");
  var nav = document.querySelector("[data-nav]");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      navToggle.setAttribute("aria-expanded", String(!open));
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.setAttribute("data-open", "false");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---- scroll reveal ----------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -60px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---- 3D module tilt on hover -------------------------------------------- */
  if (!reduceMotion && matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".module").forEach(function (mod) {
      var maxTilt = 7;
      mod.addEventListener("mousemove", function (e) {
        var rect = mod.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width - 0.5;
        var py = (e.clientY - rect.top) / rect.height - 0.5;
        mod.style.setProperty("--tilt-y", (px * maxTilt * 2).toFixed(2) + "deg");
        mod.style.setProperty("--tilt-x", (py * -maxTilt * 2).toFixed(2) + "deg");
      });
      mod.addEventListener("mouseleave", function () {
        mod.style.setProperty("--tilt-y", "0deg");
        mod.style.setProperty("--tilt-x", "0deg");
      });
    });
  }

  /* ---- hero isometric scene: mouse parallax + scroll rotation ------------ */
  var scene = document.querySelector(".iso-scene");
  if (scene && !reduceMotion) {
    var baseX = 52, baseZ = -38;
    var mx = 0, my = 0;
    var heroEl = document.querySelector(".hero");

    if (matchMedia("(hover: hover)").matches && heroEl) {
      heroEl.addEventListener("mousemove", function (e) {
        var rect = heroEl.getBoundingClientRect();
        mx = (e.clientX - rect.left) / rect.width - 0.5;
        my = (e.clientY - rect.top) / rect.height - 0.5;
        applyTransform();
      });
      heroEl.addEventListener("mouseleave", function () {
        mx = 0; my = 0;
        applyTransform();
      });
    }

    var scrollTilt = 0;
    function onScroll() {
      var y = window.scrollY;
      scrollTilt = Math.max(-10, Math.min(10, y * 0.02));
      applyTransform();
    }
    function applyTransform() {
      scene.style.transform =
        "rotateX(" + (baseX - my * 10 - scrollTilt) + "deg) rotateZ(" + (baseZ + mx * 14) + "deg)";
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    applyTransform();
  }

  /* ---- sector tabs --------------------------------------------------------- */
  var tabButtons = document.querySelectorAll(".tab-btn");
  if (tabButtons.length) {
    var activateTab = function (group, name) {
      group.querySelectorAll(".tab-btn").forEach(function (b) { b.setAttribute("aria-selected", String(b.dataset.tab === name)); });
      group.querySelectorAll(".tab-panel").forEach(function (p) { p.setAttribute("data-active", String(p.dataset.panel === name)); });
    };
    tabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activateTab(btn.closest("[data-tabgroup]"), btn.dataset.tab);
      });
    });
    var applyHash = function () {
      var hash = window.location.hash.replace("#", "");
      if (!hash) return;
      var targetBtn = document.querySelector('.tab-btn[data-tab="' + hash + '"]');
      if (targetBtn) activateTab(targetBtn.closest("[data-tabgroup]"), hash);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
  }

  /* ---- current year in footer --------------------------------------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
