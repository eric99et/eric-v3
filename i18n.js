// LAAS · English by default, Danish on request (the EN / DA switch in the bar), with the prices in kroner.
// One place for the language and the prices: buy.js, shop-v2.js and cart-nav.js read window.LAAS_I18N.
// Each language has its own address: English at the root, Danish under /da/ (built by tools/build-da.py, so search
// engines see real Danish pages). The page's <html lang> is the language; data-alt holds the other language's page
// and data-root the way back to the site root ('../' under /da/), for the pictures the scripts load.
// The choice is kept in localStorage ('laas-lang'): ?lang=da|en (old links) and a stored choice send you to that
// language's address. The cart stores what is chosen, not what it costs: every page prices a line from the table
// below, so a cart filled in English shows kroner on the Danish pages, and the other way round.
(() => {
  const H = document.documentElement;
  const ROOT = H.dataset.root || '';
  window.LAAS_ROOT = ROOT;
  const alt = H.dataset.alt;
  const go = to => { const u = new URL(alt, location.href); u.search = location.search.replace(/[?&]lang=\w+/, '').replace(/^&/, '?'); u.hash = location.hash; location.replace(u.href); };
  let want = null;
  try {
    const q = new URLSearchParams(location.search).get('lang');
    if (q === 'da' || q === 'en') localStorage.setItem('laas-lang', q);
    want = q || localStorage.getItem('laas-lang');
  } catch {}
  // a page with one address for both languages (the 404 page) follows the choice and translates itself
  const lang = alt ? (H.lang === 'da' ? 'da' : 'en') : (want === 'da' ? 'da' : 'en');
  if (!alt) H.lang = lang;
  if (alt && (want === 'da' || want === 'en') && want !== lang) { go(); return; }

  // a lock, every second lock, a Flex-Mount and shipping (Marcus, 16 Oct): the first lock 129 / 999, every second one
  // 119 / 899, the third back at 129 / 999; two locks ship free. 'free' stays only for old callers
  const PRICES = { en: { lock: 129, second: 119, was: 149, flex: 9.99, ship: 9, free: 250 }, da: { lock: 999, second: 899, was: 1099, flex: 75, ship: 75, free: 1900 } };
  const P = PRICES[lang];
  const lockSum = n => Math.ceil(n / 2) * P.lock + Math.floor(n / 2) * P.second;
  const shipFor = locks => locks >= 2 ? 0 : P.ship;
  const money = n => {
    const r = Math.round(n * 100) / 100, whole = Number.isInteger(r);
    return lang === 'da'
      ? r.toLocaleString('da-DK', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }) + '\u00a0kr'
      : '€' + (whole ? r : r.toFixed(2));
  };

  const DA = {
    // the bar, the menu and the footer
    'Skip to content': 'Spring til indhold', 'LAAS, home': 'LAAS, forsiden', 'Sections': 'Sektioner', 'Shipping': 'Fragt', 'Menu': 'Menu', 'Close': 'Luk',
    'Returns': 'Returnering', 'Footer': 'Sidefod', 'LAAS on Instagram': 'LAAS på Instagram', 'LAAS on Facebook': 'LAAS på Facebook',
    '© 2026 LAAS ApS · Designed in Copenhagen': '© 2026 LAAS ApS · Designet i København', 'Locks worth stealing. · © 2026 LAAS ApS · Designed in Copenhagen': 'Locks worth stealing. · © 2026 LAAS ApS · Designet i København', 'Terms of sale': 'Handelsbetingelser', 'Privacy': 'Privatliv', 'Language': 'Sprog',
    // the buy page
    'The LAAS Ring-Lock in': 'LAAS Ring-Lock i', 'Same lock, same price, three finishes. Keyless, and': 'Samme lås, samme pris, tre udgaver. Nøglefri og',
    'insurance-approved in Denmark': 'forsikringsgodkendt i Danmark', 'Turn left': 'Drej til venstre', 'Turn right': 'Drej til højre', 'Drag to turn': 'Træk for at dreje',
    'Finish': 'Udgave', 'Intro price until 31 Dec 2026': 'Intropris til 31. dec. 2026', 'Decrease quantity': 'Færre', 'Increase quantity': 'Flere',
    'What you are covered by': 'Det er du dækket af', '57-day returns': '57 dages returret', '57 day trial: how it works': '57 dages prøvetid: sådan virker det', 'Keep You Moving warranty: how it works': 'Keep You Moving-løftet: sådan virker det', 'Our promises · LAAS': 'Vores løfter · LAAS', 'FAQ · LAAS': 'FAQ · LAAS', 'Shipping & returns · LAAS': 'Fragt og retur · LAAS', 'Topics': 'Emner', 'Insurance-approved in Denmark': 'Forsikringsgodkendt i Danmark', 'Remove from cart': 'Fjern fra kurven', 'Check out': 'Gå til kassen', 'in your cart.': 'i kurven.', 'removed from your cart.': 'fjernet fra kurven.', 'Before it goes in the cart': 'Før den kommer i kurven', 'Does your frame have holes for a frame lock?': 'Har dit stel huller til en ringlås?', 'Two small threaded holes on the frame, either side of the rear wheel. No holes? The Flex-Mount holds the lock on a frame without them.': 'To små gevindhuller i stellet, på hver side af baghjulet. Ingen huller? Flex-Mount holder låsen på et stel uden dem.', 'Add the Flex-Mount ·': 'Tilføj Flex-Mount ·', 'Yes, my frame has holes': 'Ja, mit stel har huller', 'Free shipping over €250': 'Gratis fragt over 1.900 kr', 'Pre-order: ships in October': 'Forudbestilling: sendes i oktober',
    'Two-year right to complain': '2 års reklamationsret', 'Day trial': 'dages prøvetid', 'Promise': 'Løfte', 'Read our reviews': 'Læs vores anmeldelser', 'Reviews': 'Anmeldelser', '6 reviews': '6 anmeldelser', 'on Trustpilot': 'på Trustpilot', 'Germany': 'Tyskland', 'Switzerland': 'Schweiz', 'United Kingdom': 'Storbritannien', 'United States': 'USA', 'Spain': 'Spanien', '3 out of 5': '3 ud af 5', '3.8 out of 5': '3,8 ud af 5', '5 out of 5': '5 ud af 5', '4 out of 5': '4 ud af 5', 'Accepted payment methods': 'Betalingsmetoder', 'Card': 'Kort',
    'Pre-order: ships from Copenhagen in October. Shipping €9, free on orders over €250. Prices include VAT.': 'Forudbestilling: sendes fra København i oktober. Fragt 75 kr., gratis ved køb over 1.900 kr. Alle priser er inkl. moms.',
    'Details': 'Detaljer', 'Fit': 'Pasform', 'Tyres up to 60 mm. Mount spacing 75 to 100 mm. Not for fat bikes.': 'Dæk op til 60 mm. Monteringsafstand 75 til 100 mm. Ikke til fatbikes.',
    'Bolt': 'Bolt', '9 mm hardened steel': '9 mm hærdet stål', 'Weight': 'Vægt', 'Battery': 'Batteri',
    'About six months per charge. A full charge over USB-C takes 90 minutes.': 'Cirka seks måneder pr. opladning. En fuld opladning via USB-C tager 90 minutter.',
    'Approval': 'Godkendelse', 'Varefakta-approved, VK 37868 (certificate VF 5029:4)': 'Varefakta-godkendt, VK 37868 (certifikat VF 5029:4)',
    'Fitting': 'Montering', 'The mounting screws are in the box': 'Monteringsskruerne ligger i æsken', 'In the box': 'I æsken',
    'Ring-Lock, mounting screws, certificates. No charging cable and no hex key in the box: any USB-C cable works, and you need a hex key for the M5 screws.':
      'Ring-Lock, monteringsskruer og certifikater. Der er ikke ladekabel eller unbrakonøgle i æsken: alle USB-C-kabler virker, og du skal bruge en unbrakonøgle til M5-skruerne.',
    'Questions': 'Spørgsmål', 'See all questions': 'Se alle spørgsmål', 'Ask us': 'Spørg os', 'Call us': 'Ring til os', 'Write to us': 'Skriv til os', 'Will it fit my bike?': 'Passer den til min cykel?',
    'Most bikes, cargo bikes and e-bikes too: tyres up to 60 mm, mount spacing 75 to 100 mm. Not fat bikes. Frame holes? The mounting screws are in the box. No holes? The Flex-Mount, €9.99.':
      'De fleste cykler, også ladcykler og elcykler: dæk op til 60 mm, monteringsafstand 75 til 100 mm. Ikke fatbikes. Huller i stellet? Monteringsskruerne ligger i æsken. Ingen huller? Flex-Mount, 75 kr.',
    'Will my insurance accept it?': 'Godkender mit forsikringsselskab den?',
    'In Denmark, the Ring-Lock is insurance-approved: Varefakta VK 37868. Most Danish insurers ask for a Varefakta-approved lock and a lock certificate, and the certificate is in the box. Check your own policy. Outside Denmark, check what your policy asks for first.':
      'I Danmark er Ring-Lock forsikringsgodkendt: Varefakta VK 37868. De fleste danske forsikringsselskaber kræver en Varefakta-godkendt lås og et låsecertifikat, og certifikatet ligger i æsken. Tjek din egen police. Uden for Danmark: tjek først, hvad din police kræver.',
    'What if the battery runs low?': 'Hvad hvis batteriet er ved at løbe tør?',
    'About six months per charge. A full charge over USB-C takes 90 minutes, and any USB-C cable works.': 'Cirka seks måneder pr. opladning. En fuld opladning via USB-C tager 90 minutter, og alle USB-C-kabler virker.',
    'How do returns and the right to complain work?': 'Hvordan fungerer returnering og reklamationsret?', 'Changed your mind? Tell us at': 'Fortryder du? Giv os besked på',
    'within 57 days of delivery, then send the lock back to us. You get your money back, shipping included, within 14 days of telling us, once the lock is back with us or you have shown us you sent it. You also have the two-year right to complain (reklamationsret) under Danish law, counted from delivery.':
      'senest 57 dage efter levering, og send låsen retur til os. Du får pengene tilbage, inklusive fragt, inden for 14 dage efter din besked, når låsen er tilbage hos os, eller du har vist os, at du har sendt den. Du har også to års reklamationsret efter dansk lov, regnet fra levering.',
    'How fast does it ship, and what does it cost?': 'Hvor hurtigt sendes den, og hvad koster det?', 'When does it ship, and what does it cost?': 'Hvornår sendes den, og hvad koster det?',
    'It is a pre-order and ships in October. You can cancel any time before it ships and get all your money back. Shipping is €9, and free on orders over €250.': 'Det er en forudbestilling, og den sendes i oktober. Du kan annullere når som helst, før den sendes, og få alle pengene tilbage. Fragten koster 75 kr. og er gratis ved køb over 1.900 kr.',
    'Question not here? Call': 'Finder du ikke dit spørgsmål? Ring på', 'or write to': 'eller skriv til',
    // the cart
    'Your cart': 'Din kurv', 'Nothing here yet.': 'Her er ikke noget endnu.', 'Pick a finish and it lands here.': 'Vælg en udgave, så lander den her.', 'See the Ring-Lock': 'Se Ring-Lock',
    'What is in your cart': 'Det er i din kurv', 'No frame holes?': 'Ingen huller i stellet?', 'The Flex-Mount fits without them.': 'Flex-Mount passer uden.', 'Check fit': 'Tjek pasform',
    'Free shipping': 'Gratis fragt', 'with a second lock.': 'med en lås mere.', 'Got another bike at home?': 'To cykler derhjemme?', 'Add a second Ring-Lock. Shipping is on us.': 'Tilføj en lås mere, så er fragten gratis.', 'Cancel before it ships and get all your money back (your legal right)': 'Annullér, før den sendes, og få alle pengene tilbage (din ret efter loven)', '3.8': '3,8', 'Finish of the second lock': 'Udgave af den anden lås',
    'Subtotal': 'Subtotal', 'free over €250': 'gratis over 1.900 kr.', 'Total': 'I alt', 'incl. VAT': 'inkl. moms', 'Check out': 'Gå til kassen',
    '57-day trial: Fall in love or your money back · Pre-order: ships in October': '57 dages prøvetid · Forudbestilling: sendes i oktober',
    // the checkout
    '← Cart': '← Kurv', 'Checkout': 'Kasse', 'Your cart is empty.': 'Din kurv er tom.', 'Pick a finish first, then come back here.': 'Vælg en udgave først, og kom så tilbage hertil.',
    'Your order': 'Din ordre', 'Edit': 'Ret', 'pre-order: ships in October': 'forudbestilling: sendes i oktober', 'Have a discount code?': 'Har du en rabatkode?', 'Discount code': 'Rabatkode', 'Apply': 'Brug',
    'Delivery': 'Levering', 'Email': 'E-mail', 'First name': 'Fornavn', 'Last name': 'Efternavn', 'Street and number': 'Gade og nummer', 'Postal code': 'Postnummer', 'City': 'By',
    'Country': 'Land', 'Denmark': 'Danmark', 'Sweden': 'Sverige', 'Germany': 'Tyskland', 'Netherlands': 'Holland', 'Belgium': 'Belgien', 'Austria': 'Østrig', 'Finland': 'Finland', 'France': 'Frankrig',
    'Phone': 'Telefon', 'optional': 'valgfri',
    'Yes, email me news from LAAS about the Ring-Lock, at most once a month. Unsubscribe at any time.': 'Ja tak, send mig nyheder fra LAAS om Ring-Lock på e-mail, højst én gang om måneden. Du kan altid afmelde dig.',
    'Privacy policy': 'Privatlivspolitik', 'Payment': 'Betaling',
    'You enter your card on the secure payment page after you press Pay. Nothing is stored here.': 'Du indtaster dit kort på den sikre betalingsside, når du har trykket Betal. Intet gemmes her.',
    'By pressing Pay you place an order with an obligation to pay and accept our': 'Når du trykker Betal, afgiver du en ordre med betalingsforpligtelse og accepterer vores',
    'terms of sale': 'handelsbetingelser',
    '. You have 57 days from delivery to change your mind: tell us at support@laaslocks.com, then send the lock back to us.': '. Du har 57 dage fra levering til at fortryde: skriv til support@laaslocks.com, og send låsen retur til os.',
    'How we handle your data': 'Sådan behandler vi dine data',
    // what the scripts say
    'No drilling': 'Ingen boring', 'One less': 'Én mindre', 'One more': 'Én mere', 'Remove': 'Fjern', 'Quantity': 'Antal',
    'is the most in one order': 'er det højeste antal i én ordre', 'Free': 'Gratis', 'item': 'vare', 'items': 'varer',
    'removed from your cart.': 'er fjernet fra din kurv.', 'Flex-Mount added.': 'Flex-Mount er lagt i kurven.', 'A second Ring-Lock added.': 'En Ring-Lock mere er lagt i kurven.',
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
    // the Flex-Mount on its own
    'Accessory': 'Tilbehør', 'Holds the lock on a frame without frame-lock holes. No drilling.': 'Holder låsen på et stel uden huller til ringlås. Ingen boring.', 'Fitting the Flex-Mount on a frame without holes': 'Flex-Mount monteres på et stel uden huller', 'Need a Flex-Mount?': 'Mangler du en Flex-Mount?', 'No frame-lock holes? Get the Flex-Mount': 'Ingen huller til ringlås? Køb Flex-Mount', 'Add to cart': 'Læg i kurven',
    // the checkout steps and the order confirmation
    'Checkout steps': 'Trin i kassen', 'you@example.com': 'dig@eksempel.dk', 'Contact': 'Kontakt', 'For the order confirmation and the tracking link. Nothing else, unless you tick the box below.': 'Til ordrebekræftelsen og sporingslinket. Intet andet, medmindre du sætter kryds nedenfor.', 'Continue to delivery': 'Fortsæt til levering', 'Continue to payment': 'Fortsæt til betaling', 'Continue': 'Fortsæt', 'Apartment, floor': 'Lejlighed, etage', 'Pre-order: ships from Copenhagen in October, with a tracking link by email. You can cancel any time before it ships and get all your money back.': 'Forudbestilling: sendes fra København i oktober, med et sporingslink på mail. Du kan annullere når som helst, før den sendes, og få alle pengene tilbage.', 'Demo checkout.': 'Demo-kasse.', 'No payment is taken and nothing you type leaves this browser. Pay places a test order.': 'Der trækkes ingen betaling, og intet af det, du skriver, forlader denne browser. Betal afgiver en testordre.', 'Enter your email, so we can send the order confirmation.': 'Skriv din e-mail, så vi kan sende ordrebekræftelsen.', 'That email looks incomplete, e.g. name@example.com.': 'E-mailen ser ufuldstændig ud, fx navn@eksempel.dk.', 'Enter your first name.': 'Skriv dit fornavn.', 'Enter your last name.': 'Skriv dit efternavn.', 'Enter your street and number.': 'Skriv vej og husnummer.', 'Enter your postal code.': 'Skriv dit postnummer.', 'Check the postal code. It looks like this:': 'Tjek postnummeret. Det ser sådan ud:', 'Enter your city.': 'Skriv din by.', 'Use digits, spaces and + only.': 'Brug kun tal, mellemrum og +.', 'Placing your order…': 'Afgiver din ordre …', 'Discount codes cannot be used in this demo checkout.': 'Rabatkoder kan ikke bruges i denne demo-kasse.', 'Type a code first.': 'Skriv en kode først.', 'Order placed · LAAS': 'Ordre afgivet · LAAS', 'Order placed': 'Ordre afgivet', 'Thank you,': 'Tak,', 'Order number': 'Ordrenummer', 'No payment was taken and no email was sent. This is how the confirmation will look.': 'Der er ikke trukket nogen betaling, og der er ikke sendt nogen e-mail. Sådan kommer bekræftelsen til at se ud.', 'Delivery to': 'Leveres til', 'What happens next': 'Det sker nu', 'A confirmation by email': 'En bekræftelse på mail', 'It goes to': 'Den sendes til', ', with your order number.': ', med dit ordrenummer.', 'It ships from Copenhagen': 'Den sendes fra København', 'It is a pre-order and ships in October. You get a tracking link by email.': 'Det er en forudbestilling, og den sendes i oktober. Du får et sporingslink på mail.', '57 days to try it': '57 dage til at prøve den', 'Not for you? Tell us within 57 days of delivery and send the lock back to us.': 'Ikke noget for dig? Skriv til os senest 57 dage efter levering, og send låsen retur til os.', 'How returns work': 'Sådan virker retur', 'Questions?': 'Spørgsmål?', 'Write to': 'Skriv til', 'with your order number.': 'med dit ordrenummer.', 'Back to the Ring-Lock': 'Tilbage til Ring-Lock', 'Read the FAQ': 'Læs FAQ', 'No recent order to show.': 'Der er ingen ny ordre at vise.', 'The confirmation shows in the tab where the order was placed.': 'Bekræftelsen vises i den fane, hvor ordren blev afgivet.', 'Your order: the number, what is in it and what happens next.': 'Din ordre: nummeret, indholdet og hvad der sker nu.',
    // page titles
    'Buy the LAAS Ring-Lock · €129': 'Køb LAAS Ring-Lock · 999 kr', 'Your cart · LAAS': 'Din kurv · LAAS', 'Checkout · LAAS': 'Kasse · LAAS',
    // the buy page details, v2 (loop round 1)
    'Hardened-steel bolt': 'Bolt i hærdet stål', 'Widest tyre': 'Bredeste dæk', '6 months': '6 måneder', 'Per charge, about': 'Pr. opladning, cirka',
    'Mount spacing 75 to 100 mm. Not for fat bikes.': 'Monteringsafstand 75 til 100 mm. Ikke til fatbikes.', 'Charging': 'Opladning', '90 minutes over USB-C': '90 minutter via USB-C',
    'Varefakta VK 37868 · tested to VF 5029:4': 'Varefakta VK 37868 · testet efter VF 5029:4', 'Mounting screws': 'Monteringsskruer', 'Certificates': 'Certifikater',
    'Not in the box: a USB-C cable (any one works) and a 4 mm hex key for the M5 screws.': 'Ikke i æsken: et USB-C-kabel (alle virker) og en 4 mm unbrakonøgle til M5-skruerne.',
    // round 1 review (legal, UI, psych)
    'Apple, Find My, iPhone, iPad, iPadOS, Mac and macOS are trademarks of Apple Inc., registered in the U.S. and other countries and regions. IOS is a trademark or registered trademark of Cisco in the U.S. and other countries and is used under license.': 'Apple, Find My, iPhone, iPad, iPadOS, Mac og macOS er varemærker tilhørende Apple Inc., registreret i USA og andre lande og områder. IOS er et varemærke eller registreret varemærke tilhørende Cisco i USA og andre lande og bruges under licens.',
    'Pre-order': 'Forudbestil', 'promise': 'løfte', 'Price until 31 Dec 2026': 'Pris til 31. dec. 2026', 'Until 31 Dec 2026': 'Til 31. dec. 2026', 'from 1 Jan 2027': 'fra 1. jan. 2027',
    ', free over': ', gratis over', 'Lock certificate': 'Låsecertifikat', 'Manual (on the back of the box)': 'Manual (bag på æsken)',
    'About six months per charge, and the app warns you when it is low. Empty while locked? Plug in a USB-C power bank and unlock in the app. A full charge takes 90 minutes, and any USB-C cable works.': 'Cirka seks måneder pr. opladning, og appen giver dig besked, når den er lav. Tom, mens den er låst? Sæt en USB-C-powerbank i, og lås op i appen. En fuld opladning tager 90 minutter, og alle USB-C-kabler virker.',
    'From Trustpilot, shortened where marked […]. LAAS does not check them; Trustpilot shows all reviews, including the less positive ones. Most are from our Kickstarter backers.': 'Fra Trustpilot, forkortet hvor der står […]. LAAS kontrollerer dem ikke; Trustpilot viser alle anmeldelser, også de mindre positive. De fleste er fra vores Kickstarter-backere.',
    'The Ring-Lock in Steel round the rear tyre of a bike': 'Ring-Lock i Steel om baghjulet på en cykel',
    'Terms of sale · LAAS': 'Handelsbetingelser · LAAS', 'Privacy policy · LAAS': 'Privatlivspolitik · LAAS', 'Page not found · LAAS': 'Siden findes ikke · LAAS',
    'Ring-Lock · The keyless bike lock': 'Ring-Lock · Den nøglefri cykellås', 'Does it work with my phone?': 'Virker den med min telefon?',
    'Yes, on iPhone and Android. You unlock and share your bike in the LAAS app, on the App Store and Google Play. Lost or replaced your phone? Sign in to the LAAS app on the new phone with the same account. Apple Find My needs an iPhone, iPad or Mac.': 'Ja, på iPhone og Android. Du låser op og deler din cykel i LAAS-appen, der findes i App Store og Google Play. Har du mistet eller skiftet telefon? Log ind i LAAS-appen på den nye telefon med samme konto. Apple Find My kræver en iPhone, iPad eller Mac.',
    'Get the app ready': 'Gør appen klar', 'The LAAS app is on the App Store and Google Play. You add your lock in the app when it arrives.': 'LAAS-appen findes i App Store og Google Play. Du tilføjer din lås i appen, når den kommer.',
    'This page is not here.': 'Siden findes ikke.', 'The link may be old. The Ring-Lock is one tap away.': 'Linket er måske gammelt. Ring-Lock er et tryk væk.',
  // Liz's copy (16 Oct)
  "Help & guides": "Hjælp og guides",
  "Get the app": "Hent appen",
  "57-day trial: Fall in love or your money back": "57 dages prøvetid: Forelsk dig, eller få pengene tilbage",
  "Keep You Moving warranty": "Keep You Moving-løftet",
  "Call LAAS ↗": "Ring til LAAS ↗",
  "warranty": "løfte",
  "Keep You Moving warranty: how it works": "Keep You Moving-løftet: sådan virker det",
  "Introductory price through 31 December 2026": "Introduktionspris til 31. december 2026",
  "Too cool for keys": "For cool til nøgler",
  "The first keyless bike lock to work with Apple Find My": "Den første nøglefri ringlås, der virker med Apple Find My",
  "Stressing it’s stolen?": "Bange for, at den er stjålet?",
  "Lost, stolen, or rusty memory?": "Væk, stjålet eller bare en rusten hukommelse?",
  "Find it instantly with your phone": "Find den med det samme med din telefon",
  "Let’s find out": "Lad os finde ud af det",
  "It’s never lost with LAAS": "Med LAAS er den aldrig væk",
  "A snitch for your bike": "En sladrehank til din cykel",
  "Less keys. More breeze.": "Færre nøgler. Mere medvind.",
  "Love it.": "Elsk den.",
  "Lend it.": "Lån den ud.",
  "No more complex handover of keys. No stressed calls explaining where the bike is. Just send a link. They can find and unlock your bike with their phone. And when you need it back, you can find it instantly.": "Slut med besværlige nøgleoverdragelser. Slut med stressede opkald om, hvor cyklen står. Send bare et link. Så kan de finde og låse din cykel op med deres telefon. Og når du skal bruge den igen, finder du den med det samme.",
  "Meet the Ring‑Lock": "Mød Ring‑Lock",
  "Keyless. Apple Find My. Share with a link": "Nøglefri. Apple Find My. Del med et link",
  "You bet. The Ring-Lock fits 99% of bikes, from city bikes to e‑bikes or cargo bikes. The only bike it’s not suitable for is ‘fat bikes’.": "Det kan du tro. Ring-Lock passer til 99 % af alle cykler, fra bycykler til elcykler og ladcykler. Den eneste cykel, den ikke passer til, er fatbikes.",
  "Insurance‑approved in Denmark by Varefakta": "Forsikrings­godkendt i Danmark af Varefakta",
  "Don’t just take our word for it. Denmark’s independent consumer-labelling body, Varefakta, has given LAAS locks its seal of approval.": "Tag ikke bare vores ord for det. Varefakta, Danmarks uafhængige mærkningsordning for forbrugere, har givet LAAS-låse sit godkendelsesstempel.",
  "No password. No email verification. No pet’s name required.": "Ingen adgangskode. Ingen e-mailbekræftelse. Intet kæledyrsnavn påkrævet.",
  "Set up your lock": "Sæt din lås op",
  "Enter the serial number": "Indtast serienummeret",
  "Give your lock a name": "Giv din lås et navn",
  "Done": "Færdig",
  "Charging it for 1 hour powers it for the next 6 months": "Oplad den i 1 time, så kører den de næste 6 måneder",
  "Meet LAAS. Denmark’s first insurance-approved, app-controlled bike lock.": "Mød LAAS. Danmarks første forsikringsgodkendte, app-styrede cykellås.",
  "Ring-Lock · Choose your finish": "Ring-Lock · Vælg din finish",
  "Included with your lock": "Følger med din lås",
  "Insurance certificate": "Forsikringscertifikat",
  "Manual on the back of the box": "Manual bag på æsken",
  "Under the hood": "Under motorhjelmen",
  "2 mm stainless-steel pipe. 9 mm hardened-steel shackle. One watertight electronics unit.": "2 mm rør i rustfrit stål. 9 mm bolt i hærdet stål. Én vandtæt elektronikenhed.",
  "The stainless-steel pipe": "Røret i rustfrit stål",
  "A 2 mm thick stainless-steel pipe forms the body of the lock. Polished or surface treated, depending on your chosen finish.": "Et 2 mm tykt rør i rustfrit stål udgør låsens krop. Poleret eller overfladebehandlet, afhængigt af den finish, du vælger.",
  "The hardened shackle": "Den hærdede bolt",
  "A 9 mm hardened-steel shackle closes through the rear wheel and stops it turning. This is the part that physically locks your bike.": "En 9 mm bolt i hærdet stål lukker gennem baghjulet og forhindrer det i at dreje. Det er den del, der fysisk låser din cykel.",
  "One watertight electronics unit": "Én vandtæt elektronikenhed",
  "The PCB, batteries, motor and unlocking mechanism sit together in one watertight unit. It’s the part that makes Ring-Lock smart.": "Printkort, batterier, motor og oplåsningsmekanisme sidder samlet i én vandtæt enhed. Det er den del, der gør Ring-Lock smart.",
  "Made to come apart": "Lavet til at blive skilt ad",
  "The inside goes to e-waste. The hardened shackle, steel pipe and other metals go to metal recycling.": "Indmaden går til elektronikaffald. Den hærdede bolt, stålrøret og de andre metaller går til metalgenbrug.",
  "Electronic security": "Elektronisk sikkerhed",
  "Cutting-edge security": "Sikkerhed helt i front",
  "Custom-made for the Ring-Lock": "Skræddersyet til Ring-Lock",
  "LAAS uses encrypted communication and a new unlocking key for every unlock. Meaning recording an unlock and replaying it won’t open the lock.": "LAAS bruger krypteret kommunikation og en ny oplåsningsnøgle hver gang. Så hvis nogen optager en oplåsning og afspiller den igen, åbner låsen ikke.",
  "Before you decide": "Før du beslutter dig",
  "for a bike lock? Seriously?": "for en cykellås? Seriøst?",
  "Right now it’s": "Lige nu koster den",
  "It’s not about what the bike costs. It’s about what you get out of it. No more turning your house upside down looking for keys. Bike wandered off again? Friend can’t remember where they left it? Hazy memory of last night? No stress. We’ve got your back. And your bike.": "Det handler ikke om, hvad cyklen koster. Det handler om, hvad du får ud af den. Slut med at vende op og ned på hjemmet for at finde nøglerne. Er cyklen vandret væk igen? Kan din ven ikke huske, hvor de stillede den? En tåget erindring om i går aftes? Bare rolig. Vi har din ryg. Og din cykel.",
  "Can LAAS see where my bike is?": "Kan LAAS se, hvor min cykel er?",
  "No. Your bike’s location is in Apple Find My. LAAS doesn’t receive it.": "Nej. Din cykels placering ligger i Apple Find My. LAAS modtager den ikke.",
  "Does it work on Android?": "Virker den på Android?",
  "57-day trial: Fall in love or your money back · Pre-order: ships in October": "57 dages prøvetid: Forelsk dig, eller få pengene tilbage · Forudbestilling: sendes i oktober",
  // the whole-site handoff (16 Oct): Marcus's naming and wording
  "warranty": "garanti",
  "Keep You Moving warranty": "Keep You Moving-garantien",
  "Keep You Moving warranty: how it works": "Keep You Moving-garantien: sådan virker det",
  "57-day trial:": "57 dages prøvetid:",
  "Fall in love or your money back": "Forelsk dig, eller få pengene tilbage",
  "57-day trial: Fall in love or your money back": "57 dages prøvetid: Forelsk dig, eller få pengene tilbage",
  "Every last detail": "Alle detaljer",
  "About LAAS": "Om LAAS",
  "Home": "Forside",
  "Shop": "Shop",
  "Help & Guides": "Hjælp og guides",
  "Help & guides": "Hjælp og guides",
  "Get the app": "Hent appen",
  "Call LAAS ↗": "Ring til LAAS ↗",
  "Ring-Lock": "Ring-Lock",
  "Locks you can love. · © 2026 LAAS ApS · Designed in Copenhagen": "Locks you can love. · © 2026 LAAS ApS · Designet i København",
  "Shipping €9, free with two locks": "Fragt 75 kr., gratis med to låse",
  "Lock manually like any other bike lock.": "Lås med hånden som enhver anden cykellås.",
  "Unlock with the app, even without internet.": "Lås op med appen, også uden internet.",
  "Don’t measure. 57-day trial: Fall in love or your money back": "Du behøver ikke måle. 57 dages prøvetid: Forelsk dig, eller få pengene tilbage",
  "Help & Guides.": "Hjælp og guides.",
  "My lock won’t open.": "Min lås vil ikke åbne.",
  "I lost my phone.": "Jeg har mistet min telefon.",
  "My bike is missing.": "Min cykel er væk.",
  "Manual & guides.": "Manual og guides.",
  "Setup, everyday use and the full manual.": "Opsætning, hverdagsbrug og hele manualen.",
  ", free with two locks": ", gratis med to låse",
  "free with two locks": "gratis med to låse",
  "Second-lock offer": "Tilbud på lås nummer to",
  "Add a second Ring-Lock for": "Tilføj en Ring-Lock mere for",
  "and get free shipping.": "og få gratis fragt.",
  "It is a pre-order and ships in October. You can cancel any time before it ships and get all your money back. Shipping is €9, and free with two locks.": "Det er en forudbestilling, og den sendes i oktober. Du kan annullere når som helst, før den sendes, og få alle pengene tilbage. Fragten koster 75 kr. og er gratis med to låse.",
  "Yes. Use LAAS on Android to unlock and share your bike. The Android app is available on Google Play. Apple Find My requires an Apple device.": "Ja. Brug LAAS på Android til at låse op og dele din cykel. Android-appen findes på Google Play. Apple Find My kræver en Apple-enhed.",
  "for our first customers – for a limited time only": "for vores første kunder – kun i en begrænset periode",
  "About LAAS · LAAS": "Om LAAS · LAAS",
  "The world is better than we thought": "Verden er bedre, end vi troede",
  "Our riders taught us that.": "Det har vores cyklister lært os.",
  "Our mission": "Vores mission",
  "The mission we didn’t see coming": "Den mission, vi ikke så komme",
  "We built a lock to stop theft.": "Vi byggede en lås for at stoppe tyveri.",
  "Then our riders showed us something else. Some bikes they thought were stolen had just been moved, borrowed or forgotten. A big night out can do that.": "Så viste vores cyklister os noget andet. Nogle cykler, de troede var stjålet, var bare blevet flyttet, lånt eller glemt. En stor bytur kan gøre det.",
  "Getting misplaced bikes back to their owners became our unexpected, customer-designed mission.": "At få bortkomne cykler hjem til deres ejere blev vores uventede mission, designet af vores kunder.",
  "Marcus, founder": "Marcus, stifter",
  "My job is mostly saying no": "Mit job er mest at sige nej",
  "People love adding features. Why don’t you do this? Why don’t you do that?": "Folk elsker at tilføje funktioner. Hvorfor gør I ikke det her? Hvorfor gør I ikke det der?",
  "My job is to keep LAAS simple. The lock. The app. The website. The campaigns.": "Mit job er at holde LAAS enkel. Låsen. Appen. Hjemmesiden. Kampagnerne.",
  "No. No. No. And every now and then, yes to the right thing.": "Nej. Nej. Nej. Og en gang imellem ja til det rigtige.",
  "I have obsessed over this lock for many years. I hope it makes finding, sharing, and lending your bike so much easier and more enjoyable. And that you become a little bit obsessed too.": "Jeg har været besat af denne lås i mange år. Jeg håber, den gør det meget lettere og sjovere at finde, dele og låne din cykel ud. Og at du også bliver en lille smule besat.",
  "Founder, LAAS": "Stifter, LAAS",
  "The team": "Teamet",
  "The team: Marcus, Tin, Shyam, Eric, António and Thomas.": "Teamet: Marcus, Tin, Shyam, Eric, António og Thomas.",
  "Marcus Kjellsson, founder of LAAS, with his bike in a Copenhagen courtyard": "Marcus Kjellsson, stifter af LAAS, med sin cykel i en københavnsk gård",
  "Marcus in the workshop, holding a sign that says: You're about to catch feelings for a lock": "Marcus i værkstedet med et skilt, hvor der står: You’re about to catch feelings for a lock",
  "An early prototype of the Ring-Lock, opened up on the workbench": "En tidlig prototype af Ring-Lock, åbnet på arbejdsbænken",
  // the SEO round (17 Oct)
  "You bet. The Ring-Lock fits nearly every bike, from city bikes to e‑bikes and cargo bikes, with tyres up to 60 mm. The only bike it’s not suitable for is ‘fat bikes’.": "Det kan du tro. Ring-Lock passer til næsten alle cykler, fra bycykler til elcykler og ladcykler, med dæk op til 60 mm. Den eneste cykel, den ikke passer til, er fatbikes.",
  "Charge twice a year": "Oplad to gange om året",
  "A 90-minute charge over USB-C lasts about 6 months": "90 minutters opladning via USB-C holder i cirka 6 måneder",
  "Meet LAAS. The keyless ring lock that is insurance-approved in Denmark.": "Mød LAAS. Den nøglefri ringlås, der er forsikringsgodkendt i Danmark.",
  "The LAAS Ring-Lock, the keyless ring lock, in": "LAAS Ring-Lock, den nøglefri ringlås, i",
  "A new key for every unlock": "En ny nøgle hver gang",
  "The LAAS Ring-Lock in Steel, a keyless ring lock for the rear wheel": "LAAS Ring-Lock i Steel, en nøglefri ringlås til baghjulet",
  // the Varefakta links (17 Oct)
  "Opening the secure checkout…": "Åbner den sikre kasse …",
  "See VK 37868 on varefakta.dk": "Se VK 37868 på varefakta.dk",
  "· tested to VF 5029:4": "· testet efter VF 5029:4",
  "Approval": "Godkendelse",
  };
  const t = s => (lang === 'da' && DA[s]) || s;
  window.LAAS_I18N = { lang, P, money, t, lockSum, shipFor };

  // the landing page translates itself (darkroom.js); here only its prices are shared
  if (document.getElementById('stage')) { wire(); return; }

  // a Danish page that was not built (a preview of a new page): translate it here
  if (lang === 'da' && !H.dataset.built) {
    document.title = t(document.title);
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = []; let n; while ((n = w.nextNode())) if (!n.parentElement.closest('script, style, [lang="en"], [data-lang-block]')) nodes.push(n);
    nodes.forEach(nd => { const key = nd.nodeValue.replace(/\s+/g, ' ').trim(); if (DA[key]) nd.nodeValue = nd.nodeValue.replace(nd.nodeValue.trim(), DA[key]); });
    document.querySelectorAll('[aria-label], [placeholder], img[alt]').forEach(el => {
      ['aria-label', 'placeholder', 'alt'].forEach(a => { const v = el.getAttribute(a); if (v && DA[v]) el.setAttribute(a, DA[v]); });
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
    p.innerHTML = '<a data-lang="en" hreflang="en">EN</a><i aria-hidden="true">/</i><a data-lang="da" hreflang="da">DA</a>';
    p.querySelectorAll('a').forEach(a => { if (!a.hasAttribute('href')) a.setAttribute('href', a.dataset.lang === lang ? location.pathname.split('/').pop() || './' : alt || '?lang=' + a.dataset.lang); });
    return p;
  };
  // every switch on the page (the landing page has its own in the markup): mark the current language, keep the
  // rest of the address (the finish, the quantity) and remember the choice
  function wire() { document.querySelectorAll('.lang a[data-lang]').forEach(a => {
    a.setAttribute('aria-current', String(a.dataset.lang === lang));
    a.addEventListener('click', e => {
      try { localStorage.setItem('laas-lang', a.dataset.lang); } catch {}
      if (a.dataset.lang === lang) { e.preventDefault(); return; }
      if (alt) { e.preventDefault(); const u = new URL(alt, location.href); u.search = location.search; u.hash = location.hash; location.href = u.href; }
      else { e.preventDefault(); location.reload(); }
    });
  }); }
  const end = document.querySelector('.nav__end');
  if (end && !end.querySelector('.lang')) end.insertBefore(sw(''), end.firstChild);
  const menu = document.getElementById('menu');
  if (menu && !menu.querySelector('.lang')) menu.appendChild(sw('lang--menu'));
  wire();
})();
