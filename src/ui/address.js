// Measure text off-DOM, once per address/font/available-width combination.
export function createAddressFitter() {
  const parents = new Map();
  const known = new Map(),
    pending = new Set();
  const canvas = document.createElement("canvas"),
    context = canvas.getContext("2d");
  let frame = 0;
  const enqueue = (el) => {
    pending.add(el);
    if (!frame) frame = requestAnimationFrame(flush);
  };
  const observer = new ResizeObserver((entries) =>
    entries.forEach(({ target }) => {
      for (const el of known.keys())
        if (el.parentElement === target) enqueue(el);
    }),
  );
  function flush() {
    frame = 0;
    const writes = [];
    for (const el of pending) {
      if (!el.isConnected || !el.getClientRects().length) continue;
      const style = getComputedStyle(el),
        parent = el.parentElement,
        ps = getComputedStyle(parent);
      const siblings = [...parent.children].filter((n) => n !== el);
      const width = Math.max(
        0,
        parent.clientWidth -
          parseFloat(ps.paddingLeft || 0) -
          parseFloat(ps.paddingRight || 0) -
          siblings.reduce((sum, n) => {
            const st = getComputedStyle(n);
            return (
              sum +
              n.getBoundingClientRect().width +
              parseFloat(st.marginLeft || 0) +
              parseFloat(st.marginRight || 0)
            );
          }, 0) -
          (parseFloat(ps.columnGap) || 0) * siblings.length,
      );
      const full = el.dataset.fullAddress;
      const key = [
        full,
        Math.floor(width),
        style.font,
        style.letterSpacing,
      ].join("|");
      if (known.get(el) === key) continue;
      known.set(el, key);
      context.font = style.font;
      const spacing = parseFloat(style.letterSpacing) || 0;
      const fits = (text) =>
        context.measureText(text).width +
          Math.max(0, text.length - 1) * spacing <=
        width + 1;
      let value = full;
      if (!fits(full)) {
        let lo = 0,
          hi = full.length - 1;
        value = "...";
        while (lo <= hi) {
          const count = (lo + hi) >> 1,
            right = Math.floor(count / 2);
          const candidate =
            full.slice(0, Math.ceil(count / 2)) +
            "..." +
            (right ? full.slice(-right) : "");
          if (fits(candidate)) {
            value = candidate;
            lo = count + 1;
          } else hi = count - 1;
        }
      }
      writes.push([
        el,
        value,
        Math.ceil(
          context.measureText(full).width +
            Math.max(0, full.length - 1) * spacing,
        ),
      ]);
    }
    pending.clear();
    for (const [el, value, naturalWidth] of writes) {
      if (el.style.width !== naturalWidth + "px")
        el.style.width = naturalWidth + "px";
      if (el.textContent !== value) el.textContent = value;
    }
  }
  function release(root) {
    for (const el of known.keys())
      if (root.contains(el) || !el.isConnected) {
        if (parents.has(el)) observer.unobserve(parents.get(el));
        parents.delete(el);
        known.delete(el);
        pending.delete(el);
      }
  }
  function observe(root) {
    for (const el of known.keys())
      if (!el.isConnected) {
        if (parents.has(el)) observer.unobserve(parents.get(el));
        parents.delete(el);
        known.delete(el);
        pending.delete(el);
      }
    root.querySelectorAll("[data-full-address]").forEach((el) => {
      if (!known.has(el)) {
        known.set(el, null);
        parents.set(el, el.parentElement);
        observer.observe(el.parentElement);
      }
      enqueue(el);
    });
  }
  const fontChange = () => {
    for (const el of known.keys()) {
      known.set(el, null);
      enqueue(el);
    }
  };
  document.fonts.ready.then(fontChange);
  document.fonts.addEventListener("loadingdone", fontChange);
  return { observe, release };
}
