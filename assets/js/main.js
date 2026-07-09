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

  /* ---- floating WhatsApp button -------------------------------------------- */
  var waNumber = "260977211393";
  var waMessage = encodeURIComponent("Hello Evaregi, I'd like to request a quote for a modular building.");
  var waLink = document.createElement("a");
  waLink.className = "whatsapp-float";
  waLink.href = "https://wa.me/" + waNumber + "?text=" + waMessage;
  waLink.target = "_blank";
  waLink.rel = "noopener";
  waLink.setAttribute("aria-label", "Chat with Evaregi on WhatsApp");
  waLink.innerHTML = '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16.02 3C9.4 3 4.02 8.36 4.02 15c0 2.36.66 4.56 1.8 6.44L4 29l7.74-1.78A11.9 11.9 0 0 0 16.02 27C22.65 27 28 21.64 28 15S22.65 3 16.02 3zm0 21.7c-1.98 0-3.83-.55-5.4-1.5l-.39-.23-4.6 1.06 1.08-4.5-.25-.4a9.6 9.6 0 0 1-1.5-5.13c0-5.35 4.36-9.7 9.72-9.7 5.36 0 9.72 4.35 9.72 9.7 0 5.36-4.36 9.7-9.72 9.7zm5.32-7.27c-.29-.15-1.72-.85-1.99-.94-.27-.1-.46-.15-.66.14-.2.3-.75.94-.92 1.13-.17.2-.34.22-.63.08-.29-.15-1.23-.45-2.34-1.44-.87-.77-1.45-1.72-1.62-2.01-.17-.3-.02-.46.13-.6.13-.13.29-.34.44-.51.15-.17.2-.3.29-.49.1-.2.05-.37-.02-.51-.08-.15-.66-1.6-.91-2.18-.24-.58-.48-.5-.66-.5-.17 0-.37-.02-.56-.02-.2 0-.51.07-.78.37-.27.3-1.02 1-1.02 2.43 0 1.43 1.04 2.82 1.19 3.01.15.2 2.05 3.13 4.96 4.39.69.3 1.23.48 1.65.61.7.22 1.33.19 1.83.12.56-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.2-.55-.34z"/></svg>';
  document.body.appendChild(waLink);

  /* ---- animated stat counters ---------------------------------------------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduceMotion) { el.textContent = target + suffix; return; }
      var duration = 1400;
      var start = null;
      var step = function (ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = target % 1 === 0 ? Math.round(target * eased) : (target * eased).toFixed(1);
        el.textContent = value + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if ("IntersectionObserver" in window) {
      var countIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countIo.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { countIo.observe(el); });
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ---- FAQ accordion --------------------------------------------------------- */
  document.querySelectorAll(".faq-q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".faq-item");
      var open = item.getAttribute("data-open") === "true";
      item.parentElement.querySelectorAll(".faq-item").forEach(function (i) { i.setAttribute("data-open", "false"); });
      item.setAttribute("data-open", String(!open));
    });
  });

  /* ---- lightbox: gallery grid + certification thumbnails -------------------- */
  var lightboxTriggers = document.querySelectorAll("[data-lightbox]");
  if (lightboxTriggers.length) {
    var lb = document.createElement("div");
    lb.className = "lightbox";
    lb.setAttribute("data-open", "false");
    lb.innerHTML =
      '<button class="lightbox-close" aria-label="Close">✕</button>' +
      '<button class="lightbox-prev" aria-label="Previous image">‹</button>' +
      '<img alt="">' +
      '<button class="lightbox-next" aria-label="Next image">›</button>' +
      '<div class="lightbox-cap"></div>';
    document.body.appendChild(lb);

    var lbImg = lb.querySelector("img");
    var lbCap = lb.querySelector(".lightbox-cap");
    var groups = {};
    lightboxTriggers.forEach(function (el, idx) {
      var group = el.getAttribute("data-lightbox") || "default";
      groups[group] = groups[group] || [];
      groups[group].push(el);
    });

    var activeGroup = [];
    var activeIndex = 0;

    var showAt = function (index) {
      activeIndex = (index + activeGroup.length) % activeGroup.length;
      var el = activeGroup[activeIndex];
      var full = el.getAttribute("data-lightbox-src") || el.querySelector("img").src;
      var cap = el.getAttribute("data-lightbox-cap") || "";
      lbImg.src = full;
      lbImg.alt = cap;
      lbCap.textContent = cap;
    };

    var openLightbox = function (el) {
      var group = el.getAttribute("data-lightbox") || "default";
      activeGroup = groups[group];
      showAt(activeGroup.indexOf(el));
      lb.setAttribute("data-open", "true");
      document.body.style.overflow = "hidden";
    };
    var closeLightbox = function () {
      lb.setAttribute("data-open", "false");
      document.body.style.overflow = "";
    };

    lightboxTriggers.forEach(function (el) {
      el.addEventListener("click", function () { openLightbox(el); });
    });
    lb.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
    lb.querySelector(".lightbox-prev").addEventListener("click", function () { showAt(activeIndex - 1); });
    lb.querySelector(".lightbox-next").addEventListener("click", function () { showAt(activeIndex + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLightbox(); });
    document.addEventListener("keydown", function (e) {
      if (lb.getAttribute("data-open") !== "true") return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showAt(activeIndex - 1);
      if (e.key === "ArrowRight") showAt(activeIndex + 1);
    });
  }

  /* ---- project filter pills -------------------------------------------------- */
  var filterButtons = document.querySelectorAll("[data-filter]");
  if (filterButtons.length) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) { b.setAttribute("aria-selected", "false"); });
        btn.setAttribute("aria-selected", "true");
        var filter = btn.getAttribute("data-filter");
        document.querySelectorAll("[data-project-cat]").forEach(function (card) {
          var match = filter === "all" || card.getAttribute("data-project-cat") === filter;
          card.style.display = match ? "" : "none";
        });
      });
    });
  }
})();
