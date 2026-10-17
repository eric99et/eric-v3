// LAAS · the checkout is Shopify's. When the variant IDs below are filled in, checkout-v2.html sends the cart straight
// to Shopify's own checkout (a cart permalink: /cart/<variant>:<qty>,...). Shopify takes the address and the payment,
// applies the automatic discounts (every second lock, free shipping with two locks) and treats every line as a
// pre-order. Until the IDs are set, the page keeps its demo checkout.
(() => {
  const SHOP = {
    domain: 'laas-copenhagen.myshopify.com',
    // numeric Shopify variant IDs, from Shopify admin → Products → the variant (the number at the end of its URL)
    // Ring-Lock Steel / Copper / Black and Flex-Mount, read from the store's admin on 17 Oct 2026
    variants: { steel: '43924324516107', copper: '52884621918475', black: '43924317274379', flex: '43893585707275' },
  };
  const FIN = { steel: 'steel', silver: 'steel', copper: 'copper', black: 'black' };
  const ready = () => Object.values(SHOP.variants).every(Boolean);
  const read = () => { try { const v = JSON.parse(localStorage.getItem('laas.cart.v1.en')); return Array.isArray(v) ? v.filter(Boolean) : []; } catch { return []; } };
  // the cart as Shopify lines, merged by variant
  const lines = items => {
    const q = {};
    items.forEach(i => {
      const key = /Flex/.test(i.name) ? 'flex' : FIN[String(i.finish || 'steel').toLowerCase()];
      const id = key && SHOP.variants[key];
      if (id) q[id] = (q[id] || 0) + Math.max(1, +i.qty || 1);
    });
    return Object.entries(q).map(([id, n]) => id + ':' + n);
  };
  const url = () => {
    const l = lines(read());
    if (!l.length) return null;
    const lang = (window.LAAS_I18N && window.LAAS_I18N.lang) === 'da' ? 'da' : 'en';
    return `https://${SHOP.domain}/cart/${l.join(',')}?locale=${lang}&ref=laaslocks`;
  };
  window.LAAS_SHOPIFY = { ready, url };
  // on the checkout page: straight on to Shopify (back and forward keep working: replace, not push)
  // an empty cart has nothing to check out: back to the cart
  if (ready() && document.documentElement.dataset.checkout === 'shopify') {
    location.replace(url() || 'cart-v2.html');
  }
})();
