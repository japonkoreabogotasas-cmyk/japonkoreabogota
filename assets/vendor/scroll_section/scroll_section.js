(() => {
  const linkSelector = ".jk-nav-scroll[href^='#']";
  const links = Array.from(document.querySelectorAll(linkSelector));
  const header = document.querySelector(".JK_Header");
  const menu = document.querySelector(".jk2025_menu");
  const hamburger = document.querySelector(".jk2025_hamburger");
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!links.length) {
    return;
  }

  const getHeaderOffset = () => {
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    return Math.ceil(headerHeight + 10);
  };

  const getTargetFromHash = (hash) => {
    if (!hash || hash === "#") return null;
    const target = document.querySelector(hash);
    if (!target) return null;

    if (hash === "#products" || hash === "#autopartes") {
      const productsSection = document.querySelector("#autopartes");
      const productsGrid = productsSection
        ? productsSection.querySelector(".grid-fichas-compact")
        : null;
      return productsGrid || productsSection || target;
    }

    return target;
  };

  const getPortfolioTop = () => {
    const syncCard = document.querySelector("#autopartes .ficha-sincronizacion");
    if (syncCard) {
      let top = 0;
      let node = syncCard;
      while (node) {
        top += node.offsetTop || 0;
        node = node.offsetParent;
      }
      const extraUp = Math.round(window.innerHeight * 0.15);
      return Math.max(0, Math.round(top - extraUp));
    }
    return null;
  };

  const getCoverageTop = () => {
    const coverageSection = document.querySelector("#mensajeria");
    if (!coverageSection) {
      return null;
    }
    const top =
      coverageSection.getBoundingClientRect().top +
      window.pageYOffset -
      getHeaderOffset() +
      Math.round(window.innerHeight * 0.21);
    return Math.max(0, Math.round(top));
  };

  const closeMobileMenu = () => {
    if (menu) menu.classList.remove("active");
    if (hamburger) hamburger.classList.remove("active");
  };

  const refreshScrollTrigger = () => {
    if (!window.ScrollTrigger || typeof window.ScrollTrigger.refresh !== "function") {
      return;
    }
    window.setTimeout(() => {
      window.ScrollTrigger.refresh();
    }, 420);
  };

  const scrollToHash = (hash, updateHistory) => {
    const target = getTargetFromHash(hash);
    if (!target) return false;

    let destinationTop = null;
    if (hash === "#products" || hash === "#autopartes") {
      const portfolioTop = getPortfolioTop();
      if (portfolioTop !== null) {
        destinationTop = portfolioTop;
      }
    } else if (hash === "#urban-coverage" || hash === "#mensajeria") {
      const coverageTop = getCoverageTop();
      if (coverageTop !== null) {
        destinationTop = coverageTop;
      }
    } else {
      const fallbackTop = target.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();
      destinationTop = Math.max(0, Math.round(fallbackTop));
      if (
        hash === "#inventory" ||
        hash === "#almacen-jkb" ||
        hash === "#support-team" ||
        hash === "#about"
      ) {
        destinationTop += Math.round(window.innerHeight * 0.06);
      }
    }

    if (destinationTop === null) {
      return false;
    }
    const maxScrollTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    destinationTop = Math.max(0, Math.min(destinationTop, maxScrollTop));

    window.scrollTo({
      top: destinationTop,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });

    if (updateHistory && window.history && typeof window.history.pushState === "function") {
      window.history.pushState(null, "", hash);
    }

    refreshScrollTrigger();
    window.setTimeout(() => {
      window.scrollTo(0, destinationTop);
    }, 460);
    return true;
  };

  const uniqueHashes = Array.from(
    new Set(
      links
        .map((link) => link.getAttribute("href"))
        .filter((href) => href && href.startsWith("#") && href.length > 1)
    )
  );

  const targets = uniqueHashes
    .map((hash) => ({ hash, el: getTargetFromHash(hash) }))
    .filter((item) => item.el);

  const setActiveLink = (activeHash) => {
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === activeHash);
    });
  };

  const updateActiveState = () => {
    if (!targets.length) return;
    const scrollMark = window.pageYOffset + getHeaderOffset() + 24;
    let activeHash = targets[0].hash;

    targets.forEach((item) => {
      const sectionTop = item.el.getBoundingClientRect().top + window.pageYOffset;
      if (scrollMark >= sectionTop) {
        activeHash = item.hash;
      }
    });

    setActiveLink(activeHash);
  };

  links.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      if (!getTargetFromHash(href)) return;

      event.preventDefault();
      closeMobileMenu();
      scrollToHash(href, true);
      setActiveLink(href);
    });
  });

  let rafId = 0;
  const queueActiveUpdate = () => {
    if (rafId) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = 0;
      updateActiveState();
    });
  };

  window.addEventListener("scroll", queueActiveUpdate, { passive: true });
  window.addEventListener("resize", queueActiveUpdate);

  if (window.location.hash && getTargetFromHash(window.location.hash)) {
    window.setTimeout(() => {
      scrollToHash(window.location.hash, false);
      setActiveLink(window.location.hash);
    }, 40);
  } else {
    updateActiveState();
  }
})();
