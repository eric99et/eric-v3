// LAAS · English by default, Danish on request (the EN / DA switch in the bar), with the prices in kroner.
// One place for the language and the prices: buy.js, shop-v2.js and cart-nav.js read window.LAAS_I18N.
// The choice is kept in localStorage ('laas-lang', the same key the landing page uses) and ?lang=da|en sets it.
// The cart stores what is chosen, not what it costs: every page prices a line from the table below, so a cart
// filled in English shows kroner after a switch to Danish, and the other way round.
(() => {
  const q = new URLSearchParams(location.search).get('lang');
  let lang = 'en';
  try { if (q) localStorage.setItem('laas-lang', q); lang = q || localStorage.getItem('laas-lang') || 'en'; } catch { lang = q || 'en'; }
  if (lang !== 'da') lang = 'en';

  // a lock, a Flex Mount, shipping and the free-shipping line (two locks ship free in both)
  const PRICES = { en: { lock: 129, flex: 9.99, ship: 9, free: 250 }, da: { lock: 999, flex: 75, ship: 75, free: 1900 } };
  const P = PRICES[lang];
  const money = n => {
    const r = Math.round(n * 100) / 100, whole = Number.isInteger(r);
    return lang === 'da'
      ? r.toLocaleString('da-DK', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }) + ' kr'
      : '€' + (whole ? r : r.toFixed(2));
  };

  const DA = {
    // the bar, the menu and the footer
    'Skip to content': 'Spring til indhold', 'LAAS, home': 'LAAS, forsiden', 'Sections': 'Sektioner', 'Shipping': 'Fragt', 'Menu': 'Menu', 'Close': 'Luk',
    'Returns': 'Returnering', 'Footer': 'Sidefod', 'LAAS on Instagram': 'LAAS på Instagram', 'LAAS on Facebook': 'LAAS på Facebook',
    '© 2026 LAAS ApS · Designed in Copenhagen': '© 2026 LAAS ApS · Designet i København', 'Terms of sale': 'Handelsbetingelser', 'Privacy': 'Privatliv', 'Language': 'Sprog',
    // the buy page
    'The LAAS Ring-Lock in': 'LAAS Ring-Lock i', 'Same lock, same price, three finishes. Keyless, and': 'Samme lås, samme pris, tre udgaver. Nøglefri og',
    'insurance-approved in Denmark': 'forsikringsgodkendt i Danmark', 'Turn left': 'Drej til venstre', 'Turn right': 'Drej til højre', 'Drag to turn': 'Træk for at dreje',
    'Finish': 'Udgave', 'Intro price until 31 Dec 2026': 'Introduktionspris til 31. dec. 2026', 'Decrease quantity': 'Færre', 'Increase quantity': 'Flere',
    'What you are covered by': 'Det er du dækket af', '57-day returns': '57 dages returret', '57 day trial: how it works': '57 dages prøvetid: sådan virker det', 'Keep You Moving promise: how it works': 'Keep You Moving-løftet: sådan virker det', 'Our promises · LAAS': 'Vores løfter · LAAS', 'FAQ · LAAS': 'FAQ · LAAS', 'Shipping & returns · LAAS': 'Fragt og retur · LAAS', 'Topics': 'Emner', 'Insurance-approved in Denmark': 'Forsikringsgodkendt i Danmark', 'Remove from cart': 'Fjern fra kurven', 'Check out': 'Gå til kassen', 'in your cart.': 'i kurven.', 'removed from your cart.': 'fjernet fra kurven.', 'Before it goes in the cart': 'Før den kommer i kurven', 'Does your frame have holes for a frame lock?': 'Har dit stel huller til en ringlås?', 'Two small threaded holes on the frame, either side of the rear wheel. No holes? The Flex Mount holds the lock on a frame without them.': 'To små gevindhuller i stellet, på hver side af baghjulet. Ingen huller? Flex Mount holder låsen på et stel uden dem.', 'Add the Flex Mount ·': 'Tilføj Flex Mount ·', 'Yes, my frame has holes': 'Ja, mit stel har huller', 'Free shipping over €250': 'Gratis fragt over 1.900 kr', 'Prepaid return label in the box': 'Forudbetalt returlabel i æsken',
    'Two-year right to complain': '2 års reklamationsret', 'Day trial': 'dages prøvetid', 'Promise': 'Løfte', 'Read our reviews': 'Læs vores anmeldelser', 'Reviews': 'Anmeldelser', '6 reviews': '6 anmeldelser', 'on Trustpilot': 'på Trustpilot', 'Germany': 'Tyskland', 'Switzerland': 'Schweiz', 'United Kingdom': 'Storbritannien', 'United States': 'USA', 'Spain': 'Spanien', '3 out of 5': '3 ud af 5', '3.8 out of 5': '3,8 ud af 5', '5 out of 5': '5 ud af 5', '4 out of 5': '4 ud af 5', 'Accepted payment methods': 'Betalingsmetoder', 'Card': 'Kort',
    'Ships from Copenhagen in 1–2 working days. Shipping €9, free on orders over €250. Prices include VAT.': 'Sendes fra København inden for 1–2 hverdage. Fragt 75 kr., gratis ved køb over 1.900 kr. Alle priser er inkl. moms.',
    'Details': 'Detaljer', 'Fit': 'Pasform', 'Tyres up to 60 mm. Mount spacing 75 to 100 mm. Not for fat bikes.': 'Dæk op til 60 mm. Monteringsafstand 75 til 100 mm. Ikke til fatbikes.',
    'Bolt': 'Bolt', '9 mm hardened steel': '9 mm hærdet stål', 'Weight': 'Vægt', 'Battery': 'Batteri',
    'About six months per charge. A full charge over USB-C takes 90 minutes.': 'Cirka seks måneder pr. opladning. En fuld opladning via USB-C tager 90 minutter.',
    'Approval': 'Godkendelse', 'Varefakta-approved, VK 37868 (certificate VF 5029:4)': 'Varefakta-godkendt, VK 37868 (certifikat VF 5029:4)',
    'Fitting': 'Montering', 'The mounting screws are in the box': 'Monteringsskruerne ligger i æsken', 'In the box': 'I æsken',
    'Ring-Lock, mounting screws, certificates, return label. No charging cable and no hex key in the box: any USB-C cable works, and you need a hex key for the M5 screws.':
      'Ring-Lock, monteringsskruer, certifikater og returlabel. Der er ikke ladekabel eller unbrakonøgle i æsken: alle USB-C-kabler virker, og du skal bruge en unbrakonøgle til M5-skruerne.',
    'Questions': 'Spørgsmål', 'See all questions': 'Se alle spørgsmål', 'Ask us': 'Spørg os', 'Call us': 'Ring til os', 'Write to us': 'Skriv til os', 'Will it fit my bike?': 'Passer den til min cykel?',
    'Most bikes, cargo bikes and e-bikes too: tyres up to 60 mm, mount spacing 75 to 100 mm. Not fat bikes. Frame holes? The mounting screws are in the box. No holes? The Flex Mount, €9.99.':
      'De fleste cykler, også ladcykler og elcykler: dæk op til 60 mm, monteringsafstand 75 til 100 mm. Ikke fatbikes. Huller i stellet? Monteringsskruerne ligger i æsken. Ingen huller? Flex Mount, 75 kr.',
    'Will my insurance accept it?': 'Godkender mit forsikringsselskab den?',
    'In Denmark, the Ring-Lock is insurance-approved: Varefakta VK 37868. Most Danish insurers ask for a Varefakta-approved lock and a lock certificate, and the certificate is in the box. Check your own policy. Outside Denmark, check what your policy asks for first.':
      'I Danmark er Ring-Lock forsikringsgodkendt: Varefakta VK 37868. De fleste danske forsikringsselskaber kræver en Varefakta-godkendt lås og et låsecertifikat, og certifikatet ligger i æsken. Tjek din egen police. Uden for Danmark: tjek først, hvad din police kræver.',
    'What if the battery runs low?': 'Hvad hvis batteriet er ved at løbe tør?',
    'About six months per charge. A full charge over USB-C takes 90 minutes, and any USB-C cable works.': 'Cirka seks måneder pr. opladning. En fuld opladning via USB-C tager 90 minutter, og alle USB-C-kabler virker.',
    'How do returns and the right to complain work?': 'Hvordan fungerer returnering og reklamationsret?', 'Changed your mind? Tell us at': 'Fortryder du? Giv os besked på',
    'within 57 days of delivery, then hand the lock to the carrier with the prepaid return label. You get your money back, shipping included, within 14 days of telling us, once the lock is back with us. You also have the two-year right to complain (reklamationsret) under Danish law, counted from delivery.':
      'senest 57 dage efter levering, og aflever låsen til fragtfirmaet med den forudbetalte returlabel. Du får pengene tilbage, inklusive fragt, inden for 14 dage efter din besked, når låsen er tilbage hos os. Du har også to års reklamationsret efter dansk lov, regnet fra levering.',
    'How fast does it ship, and what does it cost?': 'Hvor hurtigt sendes den, og hvad koster det?',
    'It ships in 1–2 working days. Shipping is €9, and free on orders over €250.': 'Den sendes inden for 1–2 hverdage. Fragten koster 75 kr. og er gratis ved køb over 1.900 kr.',
    'Question not here? Call': 'Finder du ikke dit spørgsmål? Ring på', 'or write to': 'eller skriv til',
    // the cart
    'Your cart': 'Din kurv', 'Nothing here yet.': 'Her er ikke noget endnu.', 'Pick a finish and it lands here.': 'Vælg en udgave, så lander den her.', 'See the Ring-Lock': 'Se Ring-Lock',
    'What is in your cart': 'Det er i din kurv', 'No frame holes?': 'Ingen huller i stellet?', 'The Flex Mount fits without them.': 'Flex Mount passer uden.', 'Check fit': 'Tjek pasform',
    'Free shipping': 'Gratis fragt', 'with a second lock.': 'med en lås mere.', 'Finish of the second lock': 'Udgave af den anden lås',
    'Subtotal': 'Subtotal', 'free over €250': 'gratis over 1.900 kr.', 'Total': 'I alt', 'incl. VAT': 'inkl. moms', 'Check out': 'Gå til kassen',
    '57-day returns · Prepaid return label in the box': '57 dages returret · Forudbetalt returlabel i æsken',
    // the checkout
    '← Cart': '← Kurv', 'Checkout': 'Kasse', 'Your cart is empty.': 'Din kurv er tom.', 'Pick a finish first, then come back here.': 'Vælg en udgave først, og kom så tilbage hertil.',
    'Your order': 'Din ordre', 'Edit': 'Ret', 'ships in 1–2 working days': 'sendes inden for 1–2 hverdage', 'Have a discount code?': 'Har du en rabatkode?', 'Discount code': 'Rabatkode', 'Apply': 'Brug',
    'Delivery': 'Levering', 'Email': 'E-mail', 'First name': 'Fornavn', 'Last name': 'Efternavn', 'Street and number': 'Gade og nummer', 'Postal code': 'Postnummer', 'City': 'By',
    'Country': 'Land', 'Denmark': 'Danmark', 'Sweden': 'Sverige', 'Germany': 'Tyskland', 'Netherlands': 'Holland', 'Belgium': 'Belgien', 'Austria': 'Østrig', 'Finland': 'Finland', 'France': 'Frankrig',
    'Phone': 'Telefon', 'optional': 'valgfri',
    'Yes, email me news from LAAS about the Ring-Lock, at most once a month. Unsubscribe at any time.': 'Ja tak, send mig nyheder fra LAAS om Ring-Lock på e-mail, højst én gang om måneden. Du kan altid afmelde dig.',
    'Privacy policy': 'Privatlivspolitik', 'Payment': 'Betaling',
    'You enter your card on the secure payment page after you press Pay. Nothing is stored here.': 'Du indtaster dit kort på den sikre betalingsside, når du har trykket Betal. Intet gemmes her.',
    'By pressing Pay you place an order with an obligation to pay and accept our': 'Når du trykker Betal, afgiver du en ordre med betalingsforpligtelse og accepterer vores',
    'terms of sale': 'handelsbetingelser',
    '. You have 57 days from delivery to change your mind: tell us at support@laaslocks.com, then hand the lock to the carrier with the prepaid label.': '. Du har 57 dage fra levering til at fortryde: skriv til support@laaslocks.com, og aflever låsen til fragtfirmaet med den forudbetalte label.',
    'How we handle your data': 'Sådan behandler vi dine data',
    // what the scripts say
    'Intro price': 'Introduktionspris', 'No drilling': 'Ingen boring', 'One less': 'Én mindre', 'One more': 'Én mere', 'Remove': 'Fjern', 'Quantity': 'Antal',
    'is the most in one order': 'er det højeste antal i én ordre', 'Free': 'Gratis', 'item': 'vare', 'items': 'varer',
    'removed from your cart.': 'er fjernet fra din kurv.', 'Flex Mount added.': 'Flex Mount er lagt i kurven.', 'A second Ring-Lock added.': 'En Ring-Lock mere er lagt i kurven.',
    'Add ·': 'Tilføj ·', 'Your cart is empty': 'Din kurv er tom', 'Pay': 'Betal', 'and place order': 'og bestil', 'Add': 'Tilføj', 'Buy': 'Køb', 'Added': 'Tilføjet',
    'Check the highlighted fields.': 'Tjek de markerede felter.', 'Codes are checked on the payment page, after you press Pay.': 'Koden tjekkes på betalingssiden, når du har trykket Betal.',
    'Payment is not connected yet. Nothing has been charged, and nothing you typed has been sent.': 'Betalingen er ikke koblet på endnu. Der er ikke trukket noget, og intet af det, du har skrevet, er sendt.',
    'Apple Pay opens after you press Pay. No card number to type.': 'Apple Pay åbner, når du har trykket Betal. Intet kortnummer at taste.',
    'You approve the amount in the MobilePay app after you press Pay.': 'Du godkender beløbet i MobilePay-appen, når du har trykket Betal.',
    'Klarna opens after you press Pay, then brings you straight back here.': 'Klarna åbner, når du har trykket Betal, og sender dig derefter direkte tilbage hertil.',
    'Google Pay opens after you press Pay. No card number to type.': 'Google Pay åbner, når du har trykket Betal. Intet kortnummer at taste.',
    'Your cart already has 15 locks, the most in one order.': 'Der er allerede 15 låse i kurven, det højeste antal i én ordre.',
    'Your browser blocked the cart. Allow site data for this page and try again.': 'Din browser blokerede kurven. Tillad webstedsdata for siden, og prøv igen.',
    'added to your cart.': 'lagt i kurven.', 'Cart, empty': 'Kurv, tom', 'Cart': 'Kurv',
    'Drag, or use the arrow keys, to turn it.': 'Træk, eller brug piletasterne, for at dreje den.', 'on the rear wheel of a bike': 'på baghjulet af en cykel',
    // the checkout steps and the order confirmation
    'Checkout steps': 'Trin i kassen', 'you@example.com': 'dig@eksempel.dk', 'Contact': 'Kontakt', 'For the order confirmation and the tracking link. Nothing else, unless you tick the box below.': 'Til ordrebekræftelsen og sporingslinket. Intet andet, medmindre du sætter kryds nedenfor.', 'Continue to delivery': 'Fortsæt til levering', 'Continue to payment': 'Fortsæt til betaling', 'Continue': 'Fortsæt', 'Apartment, floor': 'Lejlighed, etage', 'Ships from Copenhagen in 1–2 working days, with a tracking link by email.': 'Sendes fra København inden for 1–2 hverdage, med et sporingslink på mail.', 'Demo checkout.': 'Demo-kasse.', 'No payment is taken and nothing you type leaves this browser. Pay places a test order.': 'Der trækkes ingen betaling, og intet af det, du skriver, forlader denne browser. Betal afgiver en testordre.', 'Enter your email, so we can send the order confirmation.': 'Skriv din e-mail, så vi kan sende ordrebekræftelsen.', 'That email looks incomplete, e.g. name@example.com.': 'E-mailen ser ufuldstændig ud, fx navn@eksempel.dk.', 'Enter your first name.': 'Skriv dit fornavn.', 'Enter your last name.': 'Skriv dit efternavn.', 'Enter your street and number.': 'Skriv vej og husnummer.', 'Enter your postal code.': 'Skriv dit postnummer.', 'Check the postal code. It looks like this:': 'Tjek postnummeret. Det ser sådan ud:', 'Enter your city.': 'Skriv din by.', 'Use digits, spaces and + only.': 'Brug kun tal, mellemrum og +.', 'Placing your order…': 'Afgiver din ordre …', 'Discount codes cannot be used in this demo checkout.': 'Rabatkoder kan ikke bruges i denne demo-kasse.', 'Type a code first.': 'Skriv en kode først.', 'Order placed · LAAS': 'Ordre afgivet · LAAS', 'Order placed': 'Ordre afgivet', 'Thank you,': 'Tak,', 'Order number': 'Ordrenummer', 'No payment was taken and no email was sent. This is how the confirmation will look.': 'Der er ikke trukket nogen betaling, og der er ikke sendt nogen e-mail. Sådan kommer bekræftelsen til at se ud.', 'Delivery to': 'Leveres til', 'What happens next': 'Det sker nu', 'A confirmation by email': 'En bekræftelse på mail', 'It goes to': 'Den sendes til', ', with your order number.': ', med dit ordrenummer.', 'It ships from Copenhagen': 'Den sendes fra København', 'Within 1–2 working days, and you get a tracking link by email.': 'Inden for 1–2 hverdage, og du får et sporingslink på mail.', '57 days to try it': '57 dage til at prøve den', 'Not for you? Tell us within 57 days of delivery and send it back with the prepaid label in the box.': 'Ikke noget for dig? Skriv til os senest 57 dage efter levering, og send den retur med den forudbetalte label i æsken.', 'How returns work': 'Sådan virker retur', 'Questions?': 'Spørgsmål?', 'Write to': 'Skriv til', 'with your order number.': 'med dit ordrenummer.', 'Back to the Ring-Lock': 'Tilbage til Ring-Lock', 'Read the FAQ': 'Læs FAQ', 'No recent order to show.': 'Der er ingen ny ordre at vise.', 'The confirmation shows in the tab where the order was placed.': 'Bekræftelsen vises i den fane, hvor ordren blev afgivet.', 'Your order: the number, what is in it and what happens next.': 'Din ordre: nummeret, indholdet og hvad der sker nu.',
    // page titles
    'Buy the LAAS Ring-Lock · €129': 'Køb LAAS Ring-Lock · 999 kr', 'Your cart · LAAS': 'Din kurv · LAAS', 'Checkout · LAAS': 'Kasse · LAAS',
    'Terms of sale · LAAS': 'Handelsbetingelser · LAAS', 'Privacy policy · LAAS': 'Privatlivspolitik · LAAS', 'Page not found · LAAS': 'Siden findes ikke · LAAS',
    'This page is not here.': 'Siden findes ikke.', 'The link may be old. The Ring-Lock is one tap away.': 'Linket er måske gammelt. Ring-Lock er et tryk væk.',
  };
  const t = s => (lang === 'da' && DA[s]) || s;
  window.LAAS_I18N = { lang, P, money, t };

  // the landing page translates itself (darkroom.js); here only its prices are shared
  if (document.getElementById('stage')) return;

  if (lang === 'da') {
    document.documentElement.lang = 'da';
    document.title = t(document.title);
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = []; let n; while ((n = w.nextNode())) if (!n.parentElement.closest('script, style, [lang="en"], [data-lang-block]')) nodes.push(n);
    nodes.forEach(nd => { const key = nd.nodeValue.replace(/\s+/g, ' ').trim(); if (DA[key]) nd.nodeValue = nd.nodeValue.replace(nd.nodeValue.trim(), DA[key]); });
    document.querySelectorAll('[aria-label], [placeholder]').forEach(el => {
      ['aria-label', 'placeholder'].forEach(a => { const v = el.getAttribute(a); if (v && DA[v]) el.setAttribute(a, DA[v]); });
    });
  }
  // pages written in both languages (the terms, the privacy policy) show the one that is chosen
  document.querySelectorAll('[data-lang-block]').forEach(el => { el.hidden = el.dataset.langBlock !== lang; });
  // prices written into the page
  document.querySelectorAll('[data-price]').forEach(el => { el.textContent = money(P[el.dataset.price]); });

  // the switch: in the bar on a computer, in the menu on a phone (the same markup as the landing page)
  const sw = cls => {
    const p = document.createElement('p');
    p.className = 'lang label' + (cls ? ' ' + cls : ''); p.setAttribute('role', 'group'); p.setAttribute('aria-label', t('Language'));
    p.innerHTML = '<a href="?lang=en" data-lang="en" hreflang="en">EN</a><i aria-hidden="true">/</i><a href="?lang=da" data-lang="da" hreflang="da">DA</a>';
    p.querySelectorAll('a').forEach(a => {
      a.setAttribute('aria-current', String(a.dataset.lang === lang));
      // keep the rest of the address (the finish, the quantity) when switching
      const u = new URL(location.href); u.searchParams.set('lang', a.dataset.lang); a.href = u.pathname + u.search + u.hash;
    });
    return p;
  };
  const end = document.querySelector('.nav__end');
  if (end && !end.querySelector('.lang')) end.insertBefore(sw(''), end.firstChild);
  const menu = document.getElementById('menu');
  if (menu && !menu.querySelector('.lang')) menu.appendChild(sw('lang--menu'));
})();
