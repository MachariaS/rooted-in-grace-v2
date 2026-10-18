// Shopping cart kept in this browser only. Lines are { slug, size, quantity };
// prices are looked up from the catalog at display and checkout time.
(function () {
  var KEY = 'rig-cart-v1';
  var memory = [];

  function read() {
    try {
      var parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return memory;
    }
  }

  function write(lines) {
    memory = lines;
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch (e) {}
    document.dispatchEvent(new CustomEvent('cart:change', { detail: lines }));
  }

  function same(line, slug, size) {
    return line.slug === slug && (line.size || '') === (size || '');
  }

  var cart = {
    lines: read,
    count: function () {
      return read().reduce(function (n, l) { return n + l.quantity; }, 0);
    },
    add: function (slug, size, quantity) {
      var lines = read();
      var existing = lines.find(function (l) { return same(l, slug, size); });
      if (existing) existing.quantity = Math.min(20, existing.quantity + quantity);
      else lines.push({ slug: slug, size: size || undefined, quantity: quantity });
      write(lines);
    },
    setQuantity: function (slug, size, quantity) {
      var lines = read();
      lines.forEach(function (l) { if (same(l, slug, size)) l.quantity = Math.max(1, Math.min(20, quantity)); });
      write(lines);
    },
    remove: function (slug, size) {
      write(read().filter(function (l) { return !same(l, slug, size); }));
    },
    clear: function () { write([]); },
  };
  window.RIGCart = cart;

  function renderCount() {
    var n = cart.count();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = n > 0 ? String(n) : '';
      el.hidden = n === 0;
    });
  }
  document.addEventListener('cart:change', renderCount);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderCount);
  else renderCount();
})();
