(() => {
  gsap.registerPlugin(ScrollTrigger);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const target = $(a.getAttribute("href"));
      if (target) { e.preventDefault(); lenis.scrollTo(target, { offset: 0 }); }
    }));
  }

  /* ---------- header: hide on the way down, glass on the way up ---------- */
  const hdr = $("#hdr");
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    const past = y > window.innerHeight * 0.6;
    hdr.classList.toggle("is-hidden", y > lastY && y > 120);
    hdr.classList.toggle("is-glass", past && y < lastY);
    lastY = y;
  };
  window.addEventListener("scroll", onScroll, { passive: true });

  if (reduce) return;

  /* ---------- hero intro (all sizes) ---------- */
  gsap.timeline({ defaults: { ease: "expo.out" } })
    .from(".hero__bg img", { scale: 1.18, duration: 2.4 })
    .from(".hero__arc", { yPercent: 30, opacity: 0, duration: 1.6 }, 0.25)
    .from("#arcText", { attr: { "letter-spacing": 30 }, duration: 2 }, 0.25)
    .from(".hero__plate", { yPercent: 45, rotate: -12, duration: 1.8 }, 0.45)
    .from(".hdr > *", { y: -24, opacity: 0, stagger: 0.08, duration: 1.2 }, 0.7);

  const mm = gsap.matchMedia();

  mm.add("(min-width: 768px)", () => {
    /* hero scroll-out */
    gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } })
      .to(".hero__bg", { yPercent: 14, ease: "none" }, 0)
      .to(".hero__arc", { yPercent: -40, opacity: 0, ease: "none" }, 0)
      .to(".hero__plate", { yPercent: -30, rotate: 18, ease: "none" }, 0);

    /* 02/03 plate journey: pinned, five chapters */
    const chapters = $$(".chapter");
    const num = $(".progress__n");
    const jt = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: ".journey", start: "top top", end: "+=" + chapters.length * 100 + "%",
        pin: ".journey__stage", scrub: 0.8,
        onUpdate: (st) => {
          const i = Math.min(chapters.length - 1, Math.floor(st.progress * chapters.length));
          num.textContent = String(i + 1).padStart(2, "0");
        },
      },
    });
    // the plate is centred with translate(-50%,-50%), so GSAP has to own both percents
    jt.fromTo(".plate--journey", { xPercent: -50, yPercent: -10, scale: 0.86 }, { xPercent: -50, yPercent: -50, scale: 1, duration: 0.6, ease: "power2.out" }, 0)
      .from(".journey__intro, .journey__kicker", { opacity: 0, y: 30, duration: 0.4 }, 0.1)
      .fromTo(".progress__bar i", { scaleX: 1 / chapters.length }, { scaleX: 1, duration: chapters.length }, 0)
      .to(".plate--journey", { rotate: -40, duration: chapters.length }, 0)
      .to(".chapters, .progress", { rotate: 40, duration: chapters.length }, 0)
      .fromTo(".pol--a", { y: 260 }, { y: -520, duration: chapters.length }, 0)
      .fromTo(".pol--b", { y: 360 }, { y: -260, duration: chapters.length }, 0)
      .fromTo(".pol--c", { y: 220 }, { y: -980, duration: chapters.length }, 0)
      .fromTo(".sk--prawn", { y: 120, rotate: -8 }, { y: -160, rotate: 10, duration: chapters.length }, 0)
      .fromTo(".sk--tumbler", { y: 240 }, { y: -200, rotate: -12, duration: chapters.length }, 0)
      .fromTo(".sk--coupe", { y: 420, opacity: 0 }, { y: -60, opacity: 1, duration: chapters.length }, 0)
      .fromTo(".sk--martini", { y: 300, rotate: 10 }, { y: -40, rotate: -6, duration: chapters.length }, 0);

    chapters.forEach((ch, i) => {
      if (i === 0) return;
      const at = i;
      jt.to(chapters[i - 1], { opacity: 0, yPercent: -18, filter: "blur(6px)", duration: 0.3, ease: "power2.in" }, at - 0.15)
        .set(chapters[i - 1], { visibility: "hidden" }, at + 0.15)
        .fromTo(ch, { opacity: 0, yPercent: 18, filter: "blur(6px)", visibility: "visible" },
          { opacity: 1, yPercent: 0, filter: "blur(0px)", duration: 0.35, ease: "power2.out" }, at + 0.05);
    });

    /* 04 atmosphere: heading comes into focus */
    gsap.timeline({ scrollTrigger: { trigger: ".atmos", start: "top bottom", end: "bottom top", scrub: true } })
      .fromTo(".atmos__bg", { yPercent: -8 }, { yPercent: 8, ease: "none" }, 0);
    gsap.timeline({ scrollTrigger: { trigger: ".atmos", start: "top 70%", end: "center center", scrub: 1 } })
      .fromTo(".atmos__title .display", { opacity: 0.15, filter: "blur(16px)", letterSpacing: "0.22em" },
        { opacity: 1, filter: "blur(0px)", letterSpacing: "-0.01em", ease: "none" })
      .fromTo(".atmos__title .script", { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "none" }, 0.4);

    /* 05 days: horizontal rail */
    const rail = $(".days__rail");
    gsap.to(rail, {
      x: () => -(rail.scrollWidth - (window.innerWidth - rail.getBoundingClientRect().left + gsap.getProperty(rail, "x")) + 58),
      ease: "none",
      scrollTrigger: { trigger: ".days", start: "top top", end: () => "+=" + rail.scrollWidth * 0.8, pin: ".days__pin", scrub: 0.8, invalidateOnRefresh: true },
    });
    gsap.from(".days__intro > *", { y: 40, opacity: 0, stagger: 0.1, duration: 1.2, ease: "expo.out",
      scrollTrigger: { trigger: ".days", start: "top 70%" } });

    /* 06 aperitivo: blurred word, glass rises, leaves drift */
    gsap.timeline({ scrollTrigger: { trigger: ".aperitivo", start: "top bottom", end: "bottom top", scrub: true } })
      .fromTo(".aperitivo__word", { filter: "blur(16px)", scale: 0.9 }, { filter: "blur(4px)", scale: 1.04, ease: "none" }, 0)
      .fromTo(".aperitivo__glass", { y: 180 }, { y: -120, ease: "none" }, 0)
      .fromTo(".leaf--l", { y: 160, rotate: 40 }, { y: -140, rotate: 14, ease: "none" }, 0)
      .fromTo(".leaf--r", { y: -80, rotate: -170 }, { y: 200, rotate: -132, ease: "none" }, 0)
      .fromTo(".aperitivo__copy", { y: 80, opacity: 0 }, { y: -40, opacity: 1, ease: "none" }, 0);

    /* 07 gathering: strip slides as it passes */
    const strip = $(".gathering__strip");
    gsap.fromTo(strip, { x: 120 }, {
      x: () => -(strip.scrollWidth - window.innerWidth + 58), ease: "none",
      scrollTrigger: { trigger: ".gathering", start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true },
    });
    $$(".gcard img").forEach((img) => gsap.to(img, { scale: 1, ease: "none",
      scrollTrigger: { trigger: ".gathering", start: "top bottom", end: "bottom top", scrub: true } }));

    /* 08 day to night wipe */
    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: ".daynight", start: "top top", end: "+=180%", pin: ".daynight__pin", scrub: 0.8 },
    })
      .fromTo(".dn--day img", { scale: 1.12 }, { scale: 1, duration: 1 }, 0)
      .to(".dn--night", { clipPath: "inset(0 0 0 0%)", duration: 1 }, 0.15)
      .fromTo(".dn--night img", { scale: 1.2 }, { scale: 1, duration: 1 }, 0.15)
      .to(".dn__t--day", { opacity: 0, filter: "blur(10px)", yPercent: -20, duration: 0.25 }, 0.45)
      .fromTo(".dn__t--night", { opacity: 0, filter: "blur(10px)", yPercent: 20 }, { opacity: 1, filter: "blur(0px)", yPercent: 0, duration: 0.25 }, 0.55)
      .to(".daynight__line i", { scaleX: 1, duration: 1.15 }, 0);

    /* 09 calendar: list drives the polaroid */
    const items = $$(".calendar__list li");
    const imgs = $$(".calendar__imgs img");
    const cap = $(".calendar__cap");
    let current = 0;
    const setActive = (i) => {
      if (i === current) return;
      items[current].classList.remove("is-active"); imgs[current].classList.remove("is-active");
      items[i].classList.add("is-active"); imgs[i].classList.add("is-active");
      cap.textContent = String(i + 1).padStart(2, "0") + " / " + (2 + i * 4) + "th August / " + items[i].textContent;
      current = i;
    };
    ScrollTrigger.create({
      trigger: ".calendar", start: "top top", end: "+=" + items.length * 45 + "%", pin: ".calendar__pin",
      onUpdate: (st) => setActive(Math.min(items.length - 1, Math.floor(st.progress * items.length))),
    });
    gsap.from(".calendar__pol", { rotate: 6, y: 120, opacity: 0, duration: 1.4, ease: "expo.out",
      scrollTrigger: { trigger: ".calendar", start: "top 60%" } });

    /* 10 waves CTA */
    gsap.timeline({
      scrollTrigger: { trigger: ".waves", start: "top top", end: "+=120%", pin: ".waves__pin", scrub: 0.8 },
    })
      .fromTo(".waves__bg", { scale: 1.3, yPercent: -6 }, { scale: 1, yPercent: 0, ease: "none" }, 0)
      .fromTo(".waves__cta > *", { opacity: 0, y: 60, filter: "blur(10px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.12, ease: "power2.out" }, 0.25);

    /* footer */
    gsap.from(".foot__cols > div", { y: 50, opacity: 0, stagger: 0.1, duration: 1.2, ease: "expo.out",
      scrollTrigger: { trigger: ".foot", start: "top 60%" } });
    gsap.fromTo(".foot__mark", { yPercent: -40, scale: 0.9 }, { yPercent: -50, scale: 1, ease: "none",
      scrollTrigger: { trigger: ".foot", start: "top bottom", end: "bottom bottom", scrub: true } });
  });

  mm.add("(max-width: 767px)", () => {
    /* phones: no pins, a simple chapter carousel and soft reveals */
    const chapters = $$(".chapter");
    const num = $(".progress__n");
    let i = 0;
    const id = setInterval(() => {
      chapters[i].classList.remove("is-active");
      i = (i + 1) % chapters.length;
      chapters[i].classList.add("is-active");
      num.textContent = String(i + 1).padStart(2, "0");
      gsap.to(".progress__bar i", { scaleX: (i + 1) / chapters.length, duration: 0.6 });
    }, 3200);
    $$(".dcard, .gcard, .calendar__pol, .foot__cols > div").forEach((el) =>
      gsap.from(el, { y: 40, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } }));
    return () => clearInterval(id);
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
