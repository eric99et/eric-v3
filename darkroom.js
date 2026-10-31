// LAAS · Ring-Lock
// The lock on this page is the studio render of the real Ring-Lock (Drive · Website material, v8, 4500 px):
// six angles in each of the three finishes (images/lock). One lock, fixed behind everything that scrolls,
// moves from chapter to chapter: every section carries its place, size, tilt and angle in data-key, and the
// scroll blends from one to the next. The drawings in the stage (the seal, the tyre, the map) are centred on it.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const phone = () => innerWidth <= 760;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
scrollTo(0, 0);

/* ------------------------------------------------------------- language */
// English is written in the page; Danish replaces each text node (and a few labels) before anything else runs.
const DA = {
  'The keyless ring lock for your bike.': 'Den nøglefri ringlås til din cykel.', 'LAAS Ring-Lock. The keyless ring lock for your bike.': 'LAAS Ring-Lock. Den nøglefri ringlås til din cykel.', 'Skip to content': 'Spring til indhold', 'Scroll down': 'Rul ned', 'Scroll': 'Rul', 'Menu': 'Menu', 'Close': 'Luk',
  'Keyless': 'Nøglefri', 'Find My': 'Find My', 'Varefakta': 'Varefakta', 'Will it fit?': 'Passer den?', 'Fit': 'Pasform', 'Buy': 'Køb', 'FAQ': 'FAQ',
  'Ring-Lock': 'Ring-Lock', 'Shipping': 'Fragt', 'Support': 'Support', 'Yours': 'Din lås', 'Returns': 'Returnering', 'Cart': 'Kurv',
  // the orbit and the seal
  'KEYLESS · INSURANCE-APPROVED IN DENMARK · FITS MOST BIKES · €129 ·': 'NØGLEFRI · FORSIKRINGSGODKENDT I DANMARK · PASSER TIL DE FLESTE CYKLER · 999 KR ·',
  'VAREFAKTA · VK 37868 · VF 5029:4 · INSURANCE-APPROVED IN DENMARK ·': 'VAREFAKTA · VK 37868 · VF 5029:4 · FORSIKRINGSGODKENDT I DANMARK ·',
  '63 mm clearance': '63 mm frigang', 'mm tyre': 'mm dæk', '42 mm tyre': '42 mm dæk',
  // the poster
  'No key.': 'Ingen nøgle.', 'No cable.': 'Intet kabel.', 'No key. No cable. One ring of stainless steel that stays on your bike.': 'Ingen nøgle. Intet kabel. Én ring af rustfrit stål, der bliver på din cykel.',
  'One ring of stainless steel that stays on your bike. Nothing to carry, nothing to forget. Just you and your bike.': 'Én ring af rustfrit stål, der bliver på din cykel. Intet at bære på, intet at glemme. Bare dig og din cykel.',
  'Opens with your phone': 'Åbner med din telefon', 'Insurance-approved in Denmark': 'Forsikringsgodkendt i Danmark', 'Fits most bikes': 'Passer til de fleste cykler', '57 days to return it': '57 dage til at returnere den',
  // added 12 Oct: how it works, the everyday, why a Ring-Lock
  'How it works': 'Sådan virker den', 'Set up once. Then just ride.': 'Sæt den op én gang. Så cykler du bare.',
  'No passwords, no account to make, nothing to carry. The LAAS app is on the App Store and Google Play.': 'Ingen adgangskoder, ingen konto at oprette, intet at bære på. LAAS-appen findes i App Store og Google Play.',
  'Add your lock': 'Tilføj din lås', 'Enter the serial number and give your lock a name.': 'Indtast serienummeret, og giv din lås et navn.',
  'Lock by hand': 'Lås med hånden', 'Push the bolt through the wheel. It locks with a click.': 'Skub bolten gennem hjulet. Den låser med et klik.',
  'Unlock with one tap': 'Lås op med ét tryk', 'Bluetooth, a new key every time. It works without internet.': 'Bluetooth og en ny nøgle hver gang. Det virker uden internet.',
  'Charge twice a year': 'Oplad to gange om året', '90 minutes over USB-C lasts about six months.': '90 minutter via USB-C holder cirka seks måneder.',
  'Everyday': 'Hverdag', 'Moved? Forgot where you parked?': 'Flyttet? Glemt, hvor du parkerede?',
  'The bike was moved to make room, or the street looked different on the way back. It happens to everyone.': 'Cyklen blev flyttet for at gøre plads, eller gaden så anderledes ud på vej tilbage. Det sker for alle.',
  'Busy day.': 'Travl dag.', 'Your phone is already looking.': 'Din telefon leder allerede.', 'A day with the Ring-Lock': 'En dag med Ring-Lock', 'Right where you left it.': 'Lige hvor du stillede den.', 'One tap.': 'Ét tryk.', 'Unlocked with the LAAS app.': 'Låst op med LAAS-appen.', 'Pause story': 'Sæt historien på pause', 'Play story': 'Afspil historien', 'Who we are': 'Hvem vi er', 'Designed in Copenhagen, by people who ride every day.': 'Designet i København af folk, der cykler hver dag.', 'Founder, LAAS': 'Stifter, LAAS', 'Questions? Write to us at': 'Spørgsmål? Skriv til os på', '. A person answers.': '. Et menneske svarer.',
  'Put a ring on it.': 'Sæt en ring på den.', 'Steel, copper or black. Same lock, same price. You have 57 days to fall in love with it.': 'Steel, Copper eller Black. Samme lås, samme pris. Du har 57 dage til at forelske dig i den.',
  'LAAS began with a Swedish carpenter, Marcus Kjellsson, who lost his bike keys once too often. He wanted a lock with no keyhole at all, opened by the phone already in your pocket. The name plays on lås, Danish for lock.': 'LAAS begyndte med en svensk tømrer, Marcus Kjellsson, der mistede sine cykelnøgler én gang for meget. Han ville have en lås helt uden nøglehul, som åbnes med den telefon, du allerede har i lommen. Navnet leger med ordet lås.',
  'It took four factories to get the ring right, and 2,500 backers on Kickstarter and Indiegogo who said yes before it existed.': 'Det krævede fire fabrikker at få ringen rigtig, og 2.500 backere på Kickstarter og Indiegogo, der sagde ja, før den fandtes.',
  'Sivani, Kickstarter backer': 'Sivani, Kickstarter-backer',
  'Probably. Please don’t measure: you have 57 days to try it on your own bike. Want to be sure? Two things decide it.': 'Sandsynligvis. Du behøver ikke måle: du har 57 dage til at prøve den på din egen cykel. Vil du være sikker? To ting afgør det.',
  'Before you decide.': 'Før du beslutter dig.', 'for a lock? Seriously?': 'for en lås? Seriøst?',
  'It replaces your keys, stays on your bike and is approved by Danish insurers. Ride it for 57 days. If it isn’t worth it, send it back.': 'Den erstatter dine nøgler, bliver siddende på cyklen og er godkendt af danske forsikringsselskaber. Kør med den i 57 dage. Er den ikke pengene værd, så send den tilbage.',
  'What if my phone dies?': 'Hvad hvis min telefon løber tør for strøm?', 'Call us on': 'Ring til os på', 'and a person in Copenhagen will walk you through it.': 'så hjælper et menneske i København dig igennem det.',
  '57 days to fall in love': '57 dage til at forelske dig', 'Specifications': 'Specifikationer', 'Weight': 'Vægt', 'Steel bolt': 'Stålbolt', 'Widest tyre': 'Bredeste dæk', 'Per charge': 'Pr. opladning', '6 mo.': '6 mdr.', 'All details': 'Alle detaljer',
  'Your phone. Now your key.': 'Din telefon. Nu din nøgle.',
  'No mandatory account. No password to remember. Tap Unlock. Ride.': 'Ingen tvungen konto. Ingen adgangskode at huske. Tryk Lås op. Kør.',
  'Unlock and share your bike on iPhone and Android. The LAAS app is on the App Store and Google Play.': 'Lås op og del din cykel på iPhone og Android. LAAS-appen findes i App Store og Google Play.',
  'Add it in the LAAS app. It will never appear in your phone’s Bluetooth settings.': 'Tilføj den i LAAS-appen. Den dukker aldrig op i din telefons Bluetooth-indstillinger.',
  'No app needed to lock it. Lock it by hand.': 'Du behøver ikke appen for at låse. Lås den med hånden.',
  'Over Bluetooth, within approximately 10 metres of your bike.': 'Via Bluetooth, inden for cirka 10 meter fra din cykel.',
  'Roughly every six months. Lift the rubber cover and plug in a USB-C cable.': 'Cirka hver sjette måned. Løft gummidækslet og sæt et USB-C-kabel i.',
  'After setup, you can locate your Ring-Lock in the Apple Find My app on your iPhone, iPad or Mac. The location is end-to-end encrypted: neither LAAS nor Apple can see it.': 'Efter opsætningen kan du finde din Ring-Lock i Apple Find My-appen på din iPhone, iPad eller Mac. Placeringen er end-to-end-krypteret: hverken LAAS eller Apple kan se den.',
  'Ring-Lock has passed Denmark’s strict Varefakta insurance tests. As of October 2026, it is the only electronic app-controlled ring lock on': 'Ring-Lock har bestået Varefaktas strenge forsikringstest i Danmark. Pr. oktober 2026 er den den eneste elektroniske, app-styrede ringlås på',
  'Most city, commuter, hybrid, electric, cargo and family bikes. It is not designed for fat bikes. Try it for 57 days; if it does not fit, send it back.': 'De fleste by-, pendler-, hybrid-, el-, lad- og familiecykler. Den er ikke lavet til fatbikes. Prøv den i 57 dage; passer den ikke, så send den tilbage.',
  'Steel, copper or black. Same lock, same price.': 'Steel, Copper eller Black. Samme lås, samme pris.',
  'You have 57 days to fall in love with it. If you’re not obsessed by then, you’ll get your money back.': 'Du har 57 dage til at forelske dig i den. Er du ikke helt solgt til den tid, får du pengene tilbage.',
  'About LAAS': 'Om LAAS',
  'The world is better than we thought.': 'Verden er bedre, end vi troede.',
  'We set out to make a lock you never have to think about. Then our riders showed us something else. A bike that seems gone has often just been moved, borrowed or forgotten.': 'Vi ville lave en lås, du aldrig behøver at tænke på. Så viste vores cyklister os noget andet. En cykel, der ser ud til at være væk, er ofte bare blevet flyttet, lånt ud eller glemt.',
  'Helping people get back to their bikes became our unexpected mission.': 'At hjælpe folk tilbage til deres cykel blev vores uventede mission.',
  '“My job is mostly saying no. My job is to keep LAAS simple. The lock. The app. The website. The campaigns. And every now and then, yes to the right thing.”': '“Mit job er mest at sige nej. Mit job er at holde LAAS enkel. Låsen. Appen. Hjemmesiden. Kampagnerne. Og en gang imellem ja til det rigtige.”',
  'Marcus Kjellsson, Founder, LAAS': 'Marcus Kjellsson, stifter af LAAS',
  'The team: Marcus, Tin, Shyam, Eric, António and Thomas.': 'Holdet: Marcus, Tin, Shyam, Eric, António og Thomas.',
  'Ask away.': 'Spørg løs.',
  'We’re always happy to speak to you, whatever your question. Call': 'Vi taler altid gerne med dig, uanset hvad du vil spørge om. Ring på',
  'or write to': 'eller skriv til',
  'Which bikes does it fit?': 'Hvilke cykler passer den til?',
  'Most city, commuter, hybrid, electric, cargo and family bikes. It is not designed for fat bikes. No mounting holes? Use Flex-Mount, an optional accessory for frames without ring-lock mounting holes.': 'De fleste by-, pendler-, hybrid-, el-, lad- og familiecykler. Den er ikke lavet til fatbikes. Ingen monteringshuller? Brug Flex-Mount, et ekstra tilbehør til stel uden huller til ringlås.',
  'Do I need an account?': 'Skal jeg have en konto?',
  'No. Signing in with Google or Apple makes it easier to regain access if you lose your phone.': 'Nej. Logger du ind med Google eller Apple, er det nemmere at få adgang igen, hvis du mister din telefon.',
  'How safe is Ring-Lock?': 'Hvor sikker er Ring-Lock?',
  'Ring-Lock has passed Denmark’s strict Varefakta insurance tests. It is insurance approved in Denmark, and the lock certificate is in the box.': 'Ring-Lock har bestået Varefaktas strenge forsikringstest i Danmark. Den er forsikringsgodkendt i Danmark, og låsecertifikatet ligger i æsken.',
  'How often does it need charging?': 'Hvor tit skal den lades op?',
  'Roughly every six months, and the app warns you when the battery is low. Lift the rubber cover and plug a USB-C cable into the lock. It can stay on the bike while charging. Battery empty while locked? Plug in a USB-C power bank and unlock in the app.': 'Cirka hver sjette måned, og appen giver dig besked, når batteriet er lavt. Løft gummidækslet og sæt et USB-C-kabel i låsen. Den kan blive siddende på cyklen, mens den lader. Er batteriet tomt, mens den er låst? Sæt en USB-C-powerbank i, og lås op i appen.',
  'Does it work on Android?': 'Virker den på Android?',
  'Yes. Use LAAS on Android to unlock and share your bike. The Android app is available on Google Play. Apple Find My needs an iPhone, iPad or Mac.': 'Ja. Brug LAAS på Android til at låse op og dele din cykel. Android-appen findes på Google Play. Apple Find My kræver en iPhone, iPad eller Mac.',
  'What if my phone is lost or replaced?': 'Hvad hvis jeg mister eller skifter min telefon?',
  'Signed in with Apple or Google? Install the LAAS app on another phone and sign in with the same account. Another Owner has access? Have them invite your new phone. Neither of those works? Call us on': 'Logget ind med Apple eller Google? Installer LAAS-appen på en anden telefon, og log ind med samme konto. Har en anden ejer adgang? Bed dem invitere din nye telefon. Virker ingen af delene? Ring til os på',
  'What is the Keep You Moving promise?': 'Hvad er Keep You Moving-løftet?',
  'If our lock is the problem, it’s our job to fix it. We cover a shared bike, public transport or another reasonable option, up to €30. For two years from delivery, in Denmark.': 'Hvis vores lås er problemet, er det vores job at løse det. Vi dækker en delecykel, offentlig transport eller en anden rimelig løsning, op til 225 kr. I to år fra levering, i Danmark.',
  'Full terms': 'Alle vilkår',
  'When does it ship, and what does it cost?': 'Hvornår sendes den, og hvad koster det?',
  'Can I try it before committing?': 'Kan jeg prøve den, før jeg beslutter mig?',
  'Yes. You have 57 days to fall in love with it. If you’re not obsessed by then, you’ll get your money back. Tell us at': 'Ja. Du har 57 dage til at forelske dig i den. Er du ikke helt solgt til den tid, får du pengene tilbage. Giv os besked på',
  'Help & Guides': 'Hjælp og guides',
  'Locks worth stealing. · © 2026 LAAS ApS · Designed in Copenhagen': 'Locks worth stealing. · © 2026 LAAS ApS · Designet i København',
  'Support': 'Support', 'Help & Guides.': 'Hjælp og guides.', 'Find an answer, a guide, or someone who can help.': 'Find et svar, en guide eller en, der kan hjælpe.', 'Talk to us': 'Tal med os', 'Call us': 'Ring til os', 'Write to us': 'Skriv til os', 'My lock won’t open.': 'Min lås vil ikke åbne.', 'My lock will not open.': 'Min lås vil ikke åbne.', 'Keep You Moving': 'Keep You Moving', 'I lost my phone.': 'Jeg har mistet min telefon.', 'My bike is missing.': 'Min cykel er væk.', 'Manual & guides.': 'Manual og guides.', 'Setup, everyday use and the full manual.': 'Opsætning, daglig brug og hele manualen.',
  'Forgot where you parked?': 'Glemt, hvor du parkerede?', 'Happens to all of us.': 'Det sker for os alle.', 'Your iPhone shows the way.': 'Din iPhone viser vejen.', 'Locate it in the Apple Find My app.': 'Find den i Apple Find My-appen.', 'Unlock with one tap.': 'Lås op med ét tryk.', 'Your phone is the key.': 'Din telefon er nøglen.', 'And off you go.': 'Og så er du afsted.', 'No key. No cable. Just ride.': 'Ingen nøgle. Intet kabel. Bare kør.',
  'Park.': 'Parkér.', 'Push the bolt in. Click.': 'Skub bolten ind. Klik.', 'One tap in the app, and it opens.': 'Ét tryk i appen, og den åbner.', 'No key to dig for. Just ride.': 'Ingen nøgle at lede efter. Bare kør.', 'Moved?': 'Flyttet?', 'Forgot where you parked?': 'Glemt, hvor du parkerede?', 'Your bike, on the map.': 'Din cykel på kortet.', 'There it is.': 'Der er den.', 'Where did I park?': 'Hvor parkerede jeg?', 'Let’s find out.': 'Lad os finde ud af det.', 'Back to your day.': 'Tilbage til din dag.',
  'Why a Ring-Lock': 'Hvorfor en Ring-Lock', 'One lock that stays on your bike.': 'Én lås, der bliver på din cykel.',
  'Nothing to carry, nothing to forget, and no subscription.': 'Intet at bære på, intet at glemme og intet abonnement.',
  'Classic lock': 'Almindelig lås', 'Chain or D‑lock': 'Kæde- eller bøjlelås', '14 days online (by law)': '14 dage ved onlinekøb (lovkrav)', 'LAAS Ring-Lock compared with a chain or D-lock': 'LAAS Ring-Lock sammenlignet med en kæde- eller bøjlelås', 'Varefakta listing': 'Varefakta-liste', 'Keyless, opens with your phone': 'Nøglefri, åbner med din telefon', 'A key, a chain or a D-lock': 'En nøgle, en kæde eller en bøjlelås', 'Insurance approval varies': 'Forsikringsgodkendelse varierer', 'No subscription': 'Intet abonnement', 'No key to carry or lose': 'Ingen nøgle at bære på eller miste', 'Stays on the bike': 'Bliver på cyklen',
  'Opens without internet': 'Åbner uden internet', '57 days to return it': '57 dage til at returnere den', 'Subscription': 'Abonnement',
  'Often not': 'Ofte ikke', 'Some': 'Nogle', 'Rarely': 'Sjældent', 'None': 'Intet',
  // 01 keyless
  'Your phone is the key.': 'Din telefon er nøglen.',
  'One tap in the LAAS app and the 9 mm hardened-steel bolt slides open. Push the bolt in and it locks with a click.': 'Ét tryk i LAAS-appen, og den 9 mm hærdede stålbolt glider op. Skub bolten i, så låser den med et klik.',
  '57 day trial: how it works': '57 dages prøvetid: sådan virker det', 'Keep You Moving promise: how it works': 'Keep You Moving-løftet: sådan virker det', 'Our promises · LAAS': 'Vores løfter · LAAS', 'Remove from cart': 'Fjern fra kurven', 'Check out': 'Gå til kassen', 'Decrease quantity': 'Færre', 'Near': 'Tæt på', 'Locked': 'Låst', 'Unlocked': 'Låst op', 'Unlock': 'Lås op', 'Lock': 'Lås', 'My bikes': 'Mine cykler', 'Steel lock': 'Stållås', 'Copper lock': 'Kobberlås', 'Black lock': 'Sort lås', 'Searching': 'Søger', 'One-time key · Bluetooth': 'Engangsnøgle · Bluetooth',
  // 02 find my: Apple's trademarks are never translated (Apple Find My guidelines p.13)
  'After setup, you can locate your Ring-Lock in the Apple Find My app on your iPhone, iPad or Mac.': 'Når den er sat op, kan du finde din Ring-Lock i Apple Find My-appen på din iPhone, iPad eller Mac.',
  'To use the Apple Find My app to locate this item, the latest version of iOS, iPadOS, or macOS is recommended.': 'For at bruge Apple Find My-appen til at finde denne genstand anbefales den nyeste version af iOS, iPadOS eller macOS.',
  'Nørrebro · Now': 'Nørrebro · Nu', 'Nørrebro · Now ·': 'Nørrebro · Nu ·',
  // 03 varefakta
  'Insurance‑approved in Denmark.': 'Forsikrings­godkendt i Danmark.',
  'The only electronic app-controlled ring lock on': 'Den eneste elektroniske app-styrede ringlås på', 'Varefakta’s public list': 'Varefaktas offentlige liste', '(VK 37868). The certificate is in the box.': '(VK 37868). Låsecertifikatet ligger i æsken.',
  'Listing': 'Liste', 'Certificate': 'Certifikat', 'Standard': 'Norm',
  'Lock certificate': 'Låsecertifikat', 'Example': 'Eksempel', 'Lock': 'Lås', 'Lock ID': 'Låse-ID', 'Frame no.': 'Stel nr.', 'In the box': 'I æsken',
  // 04 fit
  'Will it fit my bike?': 'Passer den til min cykel?', 'Commuter': 'Pendler', 'City': 'Bycykel', 'E-bike': 'Elcykel', 'Cargo': 'Ladcykel', 'Fat bike': 'Fatbike',
  'Two things decide it: your tyre, and whether your frame has holes for a frame lock.': 'To ting afgør det: dit dæk, og om dit stel har huller til en ringlås.', 'Your bike': 'Din cykel',
  'Tyres up to 60 mm fit.': 'Dæk op til 60 mm passer.', 'The width is on the side of the tyre: in 42-622, the 42.': 'Bredden står på siden af dækket: i 42-622 er det 42.',
  'Tyre width': 'Dækbredde', 'Up to 35 mm': 'Op til 35 mm', 'Over 60 mm': 'Over 60 mm', 'tyre': 'dæk', 'Holes for a frame lock?': 'Huller til en ringlås?', 'Yes': 'Ja', 'No': 'Nej',
  'It is printed on the side of the tyre: in 42-622, the 42 is the width in mm.': 'Det står på siden af dækket: i 42-622 er 42 bredden i mm.',
  'Two small threaded holes, either side of the rear wheel, 75 to 100 mm apart.': 'To små gevindhuller, på hver side af baghjulet, 75 til 100 mm fra hinanden.',
  'It fits.': 'Den passer.', 'Too wide.': 'For bredt.', 'Need a Flex-Mount?': 'Mangler du en Flex-Mount?', 'It fits, with the Flex-Mount.': 'Den passer, med Flex-Mount.',
  'The screws are in the box.': 'Skruerne ligger i æsken.',
  'The ring takes tyres up to 60 mm.': 'Ringen tager dæk op til 60 mm.',
  'Add the Flex-Mount (€9.99) when you pre-order. It holds the lock on a frame without holes.': 'Tilføj Flex-Mount (75 kr.), når du forudbestiller. Den holder låsen på et stel uden huller.',
  // 05 buy (the finish names stay Steel, Copper and Black, as in the Drive copy)
  'Steel. Copper. Black.': 'Steel. Copper. Black.', 'Same lock, same price, three finishes. Pick the one that suits your bike.': 'Samme lås, samme pris, tre udgaver. Vælg den, der passer til din cykel.',
  'Drag to turn': 'Træk for at dreje', 'Intro price until 31 Dec 2026': 'Intropris til 31. dec. 2026',
  'Price until 31 Dec 2026': 'Pris til 31. dec. 2026', 'from 1 Jan 2027': 'fra 1. jan. 2027',
  'Pre-order': 'Forudbestil', 'Added': 'Tilføjet', 'promise': 'løfte', 'Shipping €9, free over €250': 'Fragt 75 kr, gratis over 1.900 kr',
  'From Trustpilot, shortened where marked […]. LAAS does not check them; Trustpilot shows all reviews, including the less positive ones. Most are from our Kickstarter backers.': 'Fra Trustpilot, forkortet hvor der står […]. LAAS kontrollerer dem ikke; Trustpilot viser alle anmeldelser, også de mindre positive. De fleste er fra vores Kickstarter-backere.',
  '57-day returns': '57 dages returret', 'Day trial': 'dages prøvetid', 'Promise': 'Løfte', 'Read our reviews': 'Læs vores anmeldelser', 'Pre-order: ships in November': 'Forudbestilling: sendes i november', 'Cancel before it ships and get all your money back (your legal right)': 'Annullér, før den sendes, og få alle pengene tilbage (din ret efter loven)', '3.8': '3,8', 'Free shipping over €250': 'Gratis fragt over 1.900 kr', '6 reviews': '6 anmeldelser', 'LAAS on Trustpilot: 3.8 out of 5 from 6 reviews': 'LAAS på Trustpilot: 3,8 ud af 5 fra 6 anmeldelser', 'Ringo W., Germany': 'Ringo W., Tyskland', 'D. A., Switzerland': 'D. A., Schweiz', 'R. I., United Kingdom': 'R. I., Storbritannien', 'Two-year right to complain': '2 års reklamationsret',
  // 06 faq
  'Questions, answered.': 'Spørgsmål og svar.', 'Question not here? Call us on': 'Finder du ikke dit spørgsmål? Ring til os på',
  'Will my insurance accept it?': 'Godkender mit forsikringsselskab den?',
  'In Denmark, the Ring-Lock is insurance-approved: Varefakta VK 37868. Most Danish insurers ask for a Varefakta-approved lock and a lock certificate, and the certificate is in the box. Check your own policy. Outside Denmark, check what your policy asks for first.': 'I Danmark er Ring-Lock forsikringsgodkendt: Varefakta VK 37868. De fleste danske forsikringsselskaber kræver en Varefakta-godkendt lås og et låsecertifikat, og certifikatet ligger i æsken. Tjek din egen police. Uden for Danmark: tjek først, hvad din police kræver.',
  'Most bikes, cargo bikes and e-bikes too: tyres up to 60 mm, mount spacing 75 to 100 mm. Not fat bikes. Frame holes? The mounting screws are in the box. No holes? The Flex-Mount, €9.99.': 'De fleste cykler, også ladcykler og elcykler: dæk op til 60 mm, monteringsafstand 75 til 100 mm. Ikke fatbikes. Huller i stellet? Monteringsskruerne ligger i æsken. Ingen huller? Flex-Mount, 75 kr.',
  'What if the battery runs low?': 'Hvad hvis batteriet er ved at løbe tør?',
  'About six months per charge. A full charge over USB-C takes 90 minutes, and any USB-C cable works.': 'Cirka seks måneder pr. opladning. En fuld opladning via USB-C tager 90 minutter, og alle USB-C-kabler virker.',
  'How secure is it?': 'Hvor sikker er den?',
  '9 mm of hardened steel. Every unlock uses a one-time key over Bluetooth, so a recorded signal cannot be replayed.': '9 mm hærdet stål. Hver oplåsning bruger en engangsnøgle via Bluetooth, så et optaget signal ikke kan afspilles igen.',
  'How fast does it ship, and what does it cost?': 'Hvor hurtigt sendes den, og hvad koster det?',
  'It is a pre-order and ships in November. You can cancel any time before it ships and get all your money back. Shipping is €9, and free on orders over €250. Questions about an order? Write to': 'Det er en forudbestilling, og den sendes i november. Du kan annullere når som helst, før den sendes, og få alle pengene tilbage. Fragten koster 75 kr. og er gratis ved køb over 1.900 kr. Spørgsmål om en ordre? Skriv til',
  'How do returns and the right to complain work?': 'Hvordan fungerer returnering og reklamationsret?',
  'Changed your mind? Tell us at': 'Fortryder du? Giv os besked på',
  'within 57 days of delivery, then send the lock back to us. You get your money back, shipping included, within 14 days of telling us, once the lock is back with us or you have shown us you sent it. You also have the two-year right to complain (reklamationsret) under Danish law, counted from delivery.': 'senest 57 dage efter levering, og send låsen retur til os. Du får pengene tilbage, inklusive fragt, inden for 14 dage efter din besked, når låsen er tilbage hos os, eller du har vist os, at du har sendt den. Du har også to års reklamationsret efter dansk lov, regnet fra levering.',
  'Terms of sale': 'Handelsbetingelser', 'Privacy': 'Privatliv',
  // the footer
  '© 2026 LAAS ApS · Designed in Copenhagen': '© 2026 LAAS ApS · Designet i København',
  'Apple, Find My, iPhone, iPad, iPadOS, Mac and macOS are trademarks of Apple Inc., registered in the U.S. and other countries and regions. IOS is a trademark or registered trademark of Cisco in the U.S. and other countries and is used under license.': 'Apple, Find My, iPhone, iPad, iPadOS, Mac og macOS er varemærker tilhørende Apple Inc., registreret i USA og andre lande og områder. IOS er et varemærke eller registreret varemærke tilhørende Cisco i USA og andre lande og bruges under licens.',
  // labels a screen reader reads out
  'Turn left': 'Drej til venstre', 'Turn right': 'Drej til højre', 'Decrease quantity': 'Færre', 'Increase quantity': 'Flere', 'Accepted payment methods': 'Betalingsmetoder',
  'What you are covered by': 'Det er du dækket af', 'Your bike': 'Din cykel', 'Chapters': 'Kapitler', 'Sections': 'Sektioner', 'Language': 'Sprog', 'LAAS, back to the top': 'LAAS, til toppen',
  'LAAS on Instagram': 'LAAS på Instagram', 'LAAS on Facebook': 'LAAS på Facebook', 'Turn the lock: drag, or use the arrow keys': 'Drej låsen: træk, eller brug piletasterne', 'Footer': 'Sidefod',
  // shorter copy, 14 Oct
  'No mandatory account. Tap Unlock. Ride.': 'Ingen påkrævet konto. Tryk Lås op. Kør.',
  'The LAAS app, on iPhone and Android.': 'LAAS-appen, til iPhone og Android.',
  'In the LAAS app.': 'I LAAS-appen.',
  'No app needed.': 'Ingen app nødvendig.',
  'Over Bluetooth, within about 10 metres.': 'Via Bluetooth, inden for cirka 10 meter.',
  'Every six months, over USB-C.': 'Hver sjette måned, via USB-C.',
  'Locate it in the Apple Find My app on iPhone, iPad or Mac. End-to-end encrypted.': 'Find den i Apple Find My-appen på iPhone, iPad eller Mac. End-to-end-krypteret.',
  '(VK 37868).': '(VK 37868).',
  'Most city, commuter, electric and cargo bikes. Not fat bikes.': 'De fleste by-, pendler-, el- og ladcykler. Ikke fatbikes.',
  'Two threaded holes by the rear wheel.': 'To gevindhuller ved baghjulet.',
  'Nothing to carry. No subscription.': 'Intet at bære på. Intet abonnement.',
  'Steel, copper or black. Same price.': 'Stål, kobber eller sort. Samme pris.',
  '57 days to fall in love with it, or your money back.': '57 dage til at forelske dig i den, ellers får du pengene tilbage.',
  'A bike that seems gone has often just been moved or borrowed. Helping people get back to their bikes became our mission.': 'En cykel, der ser ud til at være væk, er ofte bare flyttet eller lånt. At hjælpe folk tilbage til deres cykel blev vores mission.',
  'Call': 'Ring på',
  'Answers, guides and people who can help.': 'Svar, guider og folk, der kan hjælpe.',
  'Insurance-approved in Denmark (Varefakta)': 'Forsikringsgodkendt i Danmark (Varefakta)',
  'Try it on your own bike for 57 days. If it doesn’t fit, send it back.': 'Prøv den på din egen cykel i 57 dage. Passer den ikke, så send den tilbage.',
  // the rebuild, 14 Oct: the photo opening, sharing, a simple fit, insurance in depth, step by step
  'Story': 'Historien', 'Sharing': 'Deling', 'Insurance': 'Forsikring',
  'Keyless.': 'Nøglefri.', 'The bike lock that opens with your phone.': 'Cykellåsen, der åbner med din telefon.', 'See how it works': 'Se, hvordan den virker', 'Scroll to the story': 'Rul til historien',
  'She checks her phone, and the Ring-Lock on her rear wheel opens': 'Hun kigger på sin telefon, og Ring-Lock på baghjulet åbner', 'She takes her bike and rides off': 'Hun tager sin cykel og kører afsted',
  'Send a link.': 'Send et link.', 'Not a key.': 'Ikke en nøgle.', 'Send an invitation. They accept it and unlock with their phone.': 'Send en invitation. De accepterer den og låser op med deres telefon.',
  'Guest': 'Gæst', 'Can unlock the bike.': 'Kan låse cyklen op.', 'Owner': 'Ejer', 'Can unlock and manage access.': 'Kan låse op og styre adgangen.',
  'No account needed. Take access back any time, with no key to get back.': 'Ingen konto nødvendig. Tag adgangen tilbage når som helst, uden en nøgle at få retur.',
  'A rider locks his bike. A friend asks to borrow it, he sends her an invitation, she accepts it on her phone, and the lock opens': 'En cyklist låser sin cykel. En ven vil låne den, han sender hende en invitation, hun accepterer den på sin telefon, og låsen åbner',
  'Yes. Ring-Lock fits most bikes, from city bikes to e‑bikes and cargo bikes. Not for fat bikes.': 'Ja. Ring-Lock passer til de fleste cykler, fra bycykler til elcykler og ladcykler. Ikke til fatbikes.',
  'Please do not measure. Try it on your own bike for 57 days. If it does not fit, send it back.': 'Du behøver ikke måle. Prøv den på din egen cykel i 57 dage. Passer den ikke, så send den tilbage.',
  'Varefakta is Denmark’s independent consumer-labeling body, so its mark means the claims were verified by people who do not work for us.': 'Varefakta er Danmarks uafhængige mærkningsordning for forbrugere, så mærket betyder, at påstandene er kontrolleret af folk, der ikke arbejder for os.',
  'The only one on the list.': 'Den eneste på listen.', 'The certificate is in the box.': 'Certifikatet ligger i æsken.',
  'Most Danish insurers ask for a Varefakta-approved lock and a lock certificate. Check your own policy.': 'De fleste danske forsikringsselskaber kræver en Varefakta-godkendt lås og et låsecertifikat. Tjek din egen police.',
  'Built for it.': 'Bygget til det.', 'A 2 mm stainless-steel ring and a 9 mm hardened-steel bolt.': 'En 2 mm ring af rustfrit stål og en 9 mm bolt af hærdet stål.',
  'Video from the actual lab test': 'Video fra den rigtige laboratorietest', 'Replay video': 'Afspil igen', 'Six-second lab test: the tester pulls on the bicycle and tumbles backward': 'Seks sekunders laboratorietest: testeren trækker i cyklen og vælter bagover',
  'No passwords. No email verification. No pet’s name.': 'Ingen adgangskoder. Ingen e-mailbekræftelse. Ikke dit kæledyrs navn.',
  'Set up your lock.': 'Sæt din lås op.', 'Enter the serial number. Give your lock a name.': 'Indtast serienummeret. Giv din lås et navn.',
  'Lock manually.': 'Lås med hånden.', 'Like any other bike lock.': 'Som enhver anden cykellås.',
  'Unlock with the app.': 'Lås op med appen.', 'Even without internet.': 'Også uden internet.',
  'Charge it twice a year.': 'Oplad den to gange om året.',
  // review round 2 (14 Oct): copy
  'Watch the story': 'Se historien', 'No account needed. Take access back any time.': 'Ingen konto nødvendig. Tag adgangen tilbage når som helst.',
  'Hardened steel.': 'Hærdet stål.',
  'Yes. Ring-Lock fits most bikes, from city bikes to e‑bikes and cargo bikes.': 'Ja. Ring-Lock passer til de fleste cykler, fra bycykler til elcykler og ladcykler.',
  'Not for fat bikes.': 'Ikke til fatbikes.', 'days': 'dage', 'Will it fit': 'Passer den', 'my bike?': 'til min cykel?',
  'Please don’t measure. Try it on your own bike for 57 days. If it doesn’t fit, send it back.': 'Du behøver ikke måle. Prøv den på din egen cykel i 57 dage. Passer den ikke, så send den tilbage.', 'No key. No cable.': 'Ingen nøgle. Intet kabel.',
  'Story frames': 'Historiens billeder', 'Frame 1': 'Billede 1', 'Frame 2': 'Billede 2', 'Frame 3': 'Billede 3', 'Frame 4': 'Billede 4', 'Finish': 'Finish',
  '5 out of 5': '5 ud af 5', '4 out of 5': '4 ud af 5', '3.8 out of 5': '3,8 ud af 5',
  'Hundreds of bikes parked side by side under a long shelter': 'Hundredvis af cykler parkeret side om side under et langt halvtag',
  'On her iPhone, a map shows where her bike is': 'På hendes iPhone viser et kort, hvor cyklen er',
  'A copper LAAS Ring-Lock fitted to a blue city bike': 'En LAAS Ring-Lock i kobber monteret på en blå bycykel',
  'A light blue city bike with a LAAS Ring-Lock around the rear wheel': 'En lyseblå bycykel med en LAAS Ring-Lock om baghjulet',
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
  "No more complex handover of keys. Just send a link. They can find and unlock your bike with their phone.": "Slut med besværlige nøgleoverdragelser. Send bare et link. Så kan de finde og låse din cykel op med deres telefon.",
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
  // the SEO round (17 Oct)
  "You bet. The Ring-Lock fits nearly every bike, from city bikes to e‑bikes and cargo bikes, with tyres up to 60 mm. The only bike it’s not suitable for is ‘fat bikes’.": "Det kan du tro. Ring-Lock passer til næsten alle cykler, fra bycykler til elcykler og ladcykler, med dæk op til 60 mm. Den eneste cykel, den ikke passer til, er fatbikes.",
  "Charge twice a year": "Oplad to gange om året",
  "A 90-minute charge over USB-C lasts about 6 months": "90 minutters opladning via USB-C holder i cirka 6 måneder",
  "Meet LAAS. The keyless ring lock that is insurance-approved in Denmark.": "Mød LAAS. Den nøglefri ringlås, der er forsikringsgodkendt i Danmark.",
  "The LAAS Ring-Lock, the keyless ring lock, in": "LAAS Ring-Lock, den nøglefri ringlås, i",
  "A new key for every unlock": "En ny nøgle hver gang",
  "The LAAS Ring-Lock in Steel, a keyless ring lock for the rear wheel": "LAAS Ring-Lock i Steel, en nøglefri ringlås til baghjulet",
};
// the page's language is its address (English at the root, Danish under /da/, see i18n.js)
const lang = document.documentElement.lang === 'da' ? 'da' : 'en';
const t = en => (lang === 'da' && DA[en]) || en;
// the Danish page is built already translated (tools/build-da.py); this only runs on a preview that was not built
if (lang === 'da' && !document.documentElement.dataset.built) {
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = []; let n; while ((n = w.nextNode())) if (!n.parentElement.closest('script,style')) nodes.push(n);
  nodes.forEach(n => { const key = n.nodeValue.replace(/ /g, ' ').replace(/\s+/g, ' ').trim(); if (DA[key]) n.nodeValue = n.nodeValue.replace(n.nodeValue.trim(), DA[key]); });
  // prices in kroner, as the Danish cart and checkout show them (i18n.js)
  $$('.price-line strong').forEach(el => { el.textContent = '999 kr'; }); $$('.price-line [data-price="was"]').forEach(el => { el.textContent = '1.099 kr'; }); $$('[data-price="lock"]').forEach(el => { el.textContent = '999 kr'; });
  $$('[aria-label]').forEach(el => { const v = DA[el.getAttribute('aria-label')]; if (v) el.setAttribute('aria-label', v); });
  $$('[alt]').forEach(el => { const v = DA[el.getAttribute('alt')]; if (v) el.setAttribute('alt', v); });
}
$$('.lang a').forEach(a => a.setAttribute('aria-current', String(a.dataset.lang === lang)));

/* ------------------------------------------------ headlines, word by word */
$$('.split').forEach(el => {
  // split on ordinary spaces only: a no-break space keeps 'Find My' together; <br> survives
  const tmp = document.createElement('div');
  const lines = el.innerHTML.split(/<br\s*\/?>/i).map(h => { tmp.innerHTML = h; return tmp.textContent.trim().replace(/[ \t\n\r]+/g, ' '); });
  let i = 0;
  const html = lines.map(line => line.split(' ').map(w => `<span class="w" aria-hidden="true"><span style="--i:${i++}">${w}</span></span>`).join(' ')).join('<br>');
  el.innerHTML = `<span class="visually-hidden">${lines.join(' ')}</span>${html}`;
  el.style.setProperty('--n', i - 1);
});

/* ------------------------------------------------------- in-page links */
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a) return;
  const id = a.getAttribute('href').slice(1);
  const el = id === 'top' ? document.body : document.getElementById(id);
  if (!el) return;
  e.preventDefault(); closeMenu();
  // a question linked by name (#shipping) opens, and the page glides to its chapter (the same glide as a scroll push)
  if (el.matches('details')) el.open = true;
  const to = id === 'top' ? 0 : landing(el);
  // the keyboard and a screen reader follow the link too (the skip link, Shipping, Returns)
  const f = el.matches('details') ? el.querySelector('summary') : (el.closest('main > section, main > footer') || el);
  if (f && f !== document.body) { if (!f.matches('summary, a, button')) f.tabIndex = -1; f.focus({ preventScroll: true }); }
  if (reduce) { scrollTo(0, to); return; }
  Object.assign(glider, { on: true, from: scrollY, to, t0: performance.now(), dur: Math.min(1600, 700 + Math.abs(to - scrollY) * 0.12) });
  // a question that was closed grows as it opens (0.45 s): aim again once the answer has its full height, so it lands in view
  if (el.matches('details')) setTimeout(() => { const t2 = landing(el); if (reduce) scrollTo(0, t2); else if (glider.on) glider.to = t2; else if (Math.abs(scrollY - t2) > 4) Object.assign(glider, { on: true, from: scrollY, to: t2, t0: performance.now(), dur: 500 }); }, 520);
});

/* ------------------------------------------------------------------ loader */
const loaderEl = $('#loader'), pctEl = $('#loader-pct'), ringFill = $('#loader-fill');
const progress = { img: 0, glb: 0, shown: 0, done: false };
(document.fonts ? document.fonts.ready : Promise.resolve()).then(() => { progress.img = 1; });
let loadedAt = 0;
function tickLoader(dt) {
  if (progress.done) return;
  const target = progress.img * 0.25 + progress.glb * 0.75;
  progress.shown = target; // bar and counter are hidden: nothing to animate
  ringFill.style.transform = `scaleX(${progress.shown.toFixed(4)})`;
  pctEl.textContent = String(Math.round(progress.shown * 100)).padStart(3, '0');
  if (progress.shown >= 0.999 && !loadedAt) { loadedAt = performance.now(); setTimeout(reveal, 220); }
}
function reveal() {
  if (progress.done) return;
  progress.done = true;
  root.classList.remove('is-loading'); root.classList.add('is-loaded');
  scrollTo(0, 0);
  intro.t = performance.now() + 200;
  goToHash();
}
// where a link lands: the top of the chapter, or, for a question in a chapter taller than the screen, low enough
// that the question and its answer are in view
function landing(el) {
  const sec = el.closest('main > section, main > footer') || el;
  const top = Math.round(sec.getBoundingClientRect().top + scrollY);
  if (!el.matches('details')) return top;
  const maxY = document.documentElement.scrollHeight - innerHeight;
  const q = Math.round(el.getBoundingClientRect().top + scrollY) - 110;
  return clamp(Math.max(top, q), 0, Math.min(maxY, top + Math.max(0, sec.offsetHeight - innerHeight)));
}
// arriving from another page with #faq or #shipping: go straight there (a question opens). Runs from reveal(), and
// from the 9 s safety net when the loader never finished; once now and once after the answer has opened
function goToHash() {
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (target && target.closest('main')) {
    if (target.matches('details')) target.open = true;
    const go = () => scrollTo(0, landing(target));
    go(); requestAnimationFrame(go); setTimeout(go, 520);
  }
}
// never hold anyone back: show the page after 7 s whatever has arrived
setTimeout(() => { progress.img = 1; progress.glb = 1; }, 7000);

/* --------------------------------------------------------------- the lock */
const stage = $('#stage'), sheetEl = $('#sheet');
const backdrop = $('#backdrop');
// the render's own geometry (measured on the front view): the ring's centre and outer radius as shares of the frame
const RING = { cx: 0.4997, cy: 0.5093, r: 0.4314 };
// every other view: the centre and half the largest extent of the lock in its frame, so each angle stands as big
const GEO = { '00': { cx: 0.5128, cy: 0.4881, r: 0.3787 }, '01': RING, '02': { cx: 0.4844, cy: 0.4878, r: 0.3803 },
  '03': { cx: 0.5228, cy: 0.4872, r: 0.3972 }, '04': { cx: 0.5109, cy: 0.4866, r: 0.3884 }, '05': { cx: 0.4862, cy: 0.48, r: 0.3912 } };
// in turning order round the lock (left 3/4, front, hero, side, from behind, from above), starting on the hero view
const ANGLES = ['00', '03', '04', '05', '02', '01'];
const lockEl = document.createElement('div');
lockEl.className = 'lockimg';
lockEl.innerHTML = '<img alt="" decoding="async" draggable="false"><img alt="" decoding="async" draggable="false">';
stage.prepend(lockEl);
const layers = $$('img', lockEl).map(img => ({ img, src: '' }));
let res = Math.min(innerWidth, innerHeight) * Math.min(devicePixelRatio || 1, 2) > 900 ? 1600 : 800;
const srcOf = (f, a) => `${(window.LAAS_ROOT || '')}images/lock/${f}-${a}-${res}.webp`;
const cache = new Map();
const fetchImg = src => cache.get(src) || (cache.set(src, new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(src); i.onerror = no; i.src = src; })), cache.get(src));
let finish = 'steel', lockReady = false;
const intro = { t: -1 };
const swap = { sweep: 0 };
function show(f) {
  finish = f;
  stage.dataset.metal = f; $('#buy').dataset.metal = f;
  // the angles in view first, then the rest of the turn
  return Promise.all(['00', '01'].map(a => fetchImg(srcOf(f, a)))).then(() => { ANGLES.forEach(a => fetchImg(srcOf(f, a)).catch(() => {})); });
}
// steel first: it is the bestseller and the one the page opens on
{
  progress.glb = 1; // the lock only comes forward in the shop: the page no longer waits for it
  const loadLock = () => fetchImg(srcOf('steel', '00')).then(() => { lockReady = true; }, () => { lockEl.remove(); });
  if (location.hash === '#buy' || document.readyState === 'complete') loadLock();
  else addEventListener('load', () => (window.requestIdleCallback ? requestIdleCallback(loadLock, { timeout: 1500 }) : loadLock()), { once: true });
}
const loadOthers = () => ['copper', 'black'].forEach(f => fetchImg(srcOf(f, '00')).catch(() => {}));
$$('[data-finish]').forEach(b => ['pointerenter', 'focus', 'touchstart'].forEach(ev => b.addEventListener(ev, loadOthers, { passive: true })));

/* ---------------------------------------------------------------- the poses */
const DEF = { hide: 0, bike: 0, mpx: 0, yaw: 0, pitch: 0, roll: 0, size: 0.42, x: 0, y: 0, fade: 0, drag: 0, free: 0, logo: 0, orbit: 0, radar: 0, seal: 0, fit: 0 };
const KEYS = Object.keys(DEF);
const sections = $$('main > section, main > footer');
const poses = sections.map(s => ({ ...DEF, ...JSON.parse(s.dataset.key || '{}') }));
const anchors = sections;
const slots = sections.map(s => $('.slot', s) || s);
const keylessIdx = sections.findIndex(s => s.hasAttribute('data-keyless'));
const productIdx = sections.findIndex(s => s.id === 'buy');
const findIdx = sections.findIndex(s => s.id === 'findmy');
const introIdx = sections.findIndex(s => s.id === 'intro');
const cur = { ...poses[0] };
function flash() {
  const el = $('#click'); if (!el) return;
  el.classList.remove('is-on'); void el.offsetWidth; el.classList.add('is-on');
}
const user = { angle: 0, taught: false, spin: 0, goal: 0, vel: 0, dragging: false, lockWant: 1, lock: 1, roll: 0, px: 0, py: 0, mx: 0, my: 0 };

let W = innerWidth, H = innerHeight;
function resize() {
  W = innerWidth; H = innerHeight;
  // 1600 px renders once the lock can be drawn larger than about 800 device pixels
  res = Math.min(W, H) * Math.min(devicePixelRatio || 1, 2) > 900 ? 1600 : 800;
}
addEventListener('resize', resize); resize();
// where the route ends inside the drawn phone (the lock is placed there)
const fpin = { x: 0, y: 0 };
function measurePin() {
  const f = $('.fmp'); if (!f) return;
  const Wp = f.offsetWidth, Hp = f.offsetHeight; if (!Wp || !Hp) return; const pad = Hp * 0.012, ws = Wp - 2 * pad, hs = Hp - 2 * pad;
  const k = Math.max(ws / 520, hs / 1130), ox = (ws - 520 * k) / 2;
  fpin.x = pad + ox + (837.4 - 590) * k; fpin.y = pad + (598 - 300) * k;
  f.style.setProperty('--fpx', fpin.x.toFixed(1) + 'px'); f.style.setProperty('--fpy', fpin.y.toFixed(1) + 'px');
}
addEventListener('resize', measurePin); measurePin();
// the phone is hidden (size 0) until its chapter comes near, and its height follows the viewport: measure again whenever it changes
if (window.ResizeObserver && $('.fmp')) new ResizeObserver(measurePin).observe($('.fmp'));
// the map is drawn wide; a phone gets its own crop, with the bike in it
/* -------------------------------------------------------- chrome per frame */
const navLinks = $$('[data-nav]'), railLinks = $$('[data-rail]'), menuLinks = $$('.menu nav a');
const heroSec = $('.hero'), heroFront = $('.hero__pin'), heroCopy = $('.hero__pin'), heroTitle = $('.hero__pin'), rail = $('#rail');
const hero = { p: 0, e: 0, lock: 1, on: false, fadeIn: 0 };
// the opening glide (see the end of the file): stepped from the render loop, before anything is measured
const glider = { on: false, from: 0, to: 0, t0: 0, dur: 2600, coolUntil: 0 };
// sine in-out: no lurch at the start, no rush in the middle
const glideEase = x => -(Math.cos(Math.PI * x) - 1) / 2;
function glideTick(now) {
  if (!glider.on) return;
  const x = clamp((now - glider.t0) / glider.dur);
  scrollTo({ top: glider.from + (glider.to - glider.from) * glideEase(x), behavior: 'instant' });
  if (x >= 1) { glider.on = false; glider.coolUntil = Math.max(glider.coolUntil, now + 380); }
}

/* ------------------------------------------------- the pixel wordmark
   The supplied LAAS artwork, sampled onto a grid of square pixels (a deliberate, owner-approved exception to the
   logo rules, 9 Oct). Scrolling, every pixel is pulled into the same letter of the laser-marked logo on the lock. */
const pxCanvas = $('#px'), pctx = pxCanvas ? pxCanvas.getContext('2d') : null;
const logoRect = { cx: 0, cy: 0, w: 0, h: 0, ang: 0, ok: false };
const MARK_PATHS = [...document.querySelectorAll('#laas-mark path')].map(p => new Path2D(p.getAttribute('d')));
const MARK_W = 343.43, MARK_H = 88.44, MARK_X = 966, MARK_Y = 758.556;
const px = { cells: [], cell: 10, w: 0, h: 0, x: 0, y: 0, dpr: 1, built: '' };
const PX_TINT = '#9BCDD0', PX_CHALK = '#ECECEA';
function buildPixels() {
  const key = W + 'x' + H;
  if (px.built === key) return;
  px.built = key;
  px.dpr = Math.min(devicePixelRatio || 1, 2);
  pxCanvas.width = Math.round(W * px.dpr); pxCanvas.height = Math.round(H * px.dpr);
  // the wordmark as wide as the screen allows, above the copy
  px.w = phone() ? W * 0.9 : Math.min(W * 0.84, H * 2.6);
  px.h = px.w * MARK_H / MARK_W;
  px.x = (W - px.w) / 2; px.y = H * 0.47 - px.h / 2;
  px.cell = Math.max(5, Math.round(px.w / (phone() ? 58 : 92)));
  // rasterise the artwork once, then read how much of each cell it covers
  const cols = Math.ceil(px.w / px.cell), rows = Math.ceil(px.h / px.cell), ss = 4;
  const off = document.createElement('canvas'); off.width = cols * ss; off.height = rows * ss;
  const o = off.getContext('2d');
  // one supersampled block per cell: mark units → cells → samples
  o.setTransform(ss / px.cell * px.w / MARK_W, 0, 0, ss / px.cell * px.h / MARK_H, 0, 0);
  o.translate(-MARK_X, -MARK_Y);
  o.fillStyle = '#000'; MARK_PATHS.forEach(p => o.fill(p));
  const data = o.getImageData(0, 0, off.width, off.height).data;
  px.cells = [];
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    let a = 0;
    for (let y = 0; y < ss; y++) for (let x = 0; x < ss; x++) a += data[((r * ss + y) * off.width + c * ss + x) * 4 + 3];
    const cov = a / (ss * ss * 255);
    if (cov < 0.12) continue;
    const hx = px.x + (c + 0.5) * px.cell, hy = px.y + (r + 0.5) * px.cell;
    px.cells.push({ hx, hy, u: (hx - px.x) / px.w, v: (hy - px.y) / px.h, cov: Math.min(1, cov * 1.15), ph: rnd() * 6.28, sw: rnd() < 0.5 ? -1 : 1, tint: rnd() < 0.07, d: rnd() });
  }
}
addEventListener('resize', () => { px.built = ''; });
// decode the rider frames up front, so no frame of the glide waits on an image
$$('.hero__shot img').forEach(img => img.decode?.().catch(() => {}));
const pxPointer = { x: -1e4, y: -1e4 };
addEventListener('pointermove', e => { pxPointer.x = e.clientX; pxPointer.y = e.clientY; }, { passive: true });
function drawPixels(now) {
  // the photo opening (14 Oct) has no pixel wordmark
  if (!pxCanvas) return;
  const t = reduce ? 1 : clamp((hero.p - 0.04) / 0.78);
  const show = hero.on && root.classList.contains('is-loaded');
  setVar(root, '--pxo', show ? '1' : '0');
  if (!show) return;
  buildPixels();
  const ctx = pctx, k = px.dpr, time = now / 1000;
  ctx.setTransform(k, 0, 0, k, 0, 0);
  ctx.clearRect(0, 0, W, H);
  // where the logo on the lock is (until the lock has drawn once, its resting place in the macro)
  const R = logoRect.ok ? logoRect : { cx: W / 2, cy: H / 2, w: phone() ? W * 0.8 : W * 0.46, h: (phone() ? W * 0.8 : W * 0.46) * MARK_H / MARK_W, ang: 0.07 };
  const ca = Math.cos(R.ang), sa = Math.sin(R.ang), tcell = px.cell * R.w / px.w;
  for (const p of px.cells) {
    // each pixel leaves a little after its neighbours nearer the middle, and accelerates in, like being pulled
    const start = 0.28 * Math.hypot(p.u - 0.5, (p.v - 0.5) * 0.4) + 0.12 * p.d;
    const q = clamp((t - start) / 0.62), e = q * q * q * (q * (6 * q - 15) + 10);
    const lu = (p.u - 0.5) * R.w, lv = (p.v - 0.5) * R.h;
    const tx = R.cx + lu * ca - lv * sa, ty = R.cy + lu * sa + lv * ca;
    // a slight swirl on the way in
    const dxv = tx - p.hx, dyv = ty - p.hy, sw = Math.sin(Math.PI * e) * 0.12 * p.sw;
    let x = p.hx + dxv * e - dyv * sw, y = p.hy + dyv * e + dxv * sw;
    // at rest the pixels breathe, and step aside for the pointer
    let size = px.cell * (0.42 + 0.5 * p.cov);
    if (t <= 0.001 && !reduce) {
      size *= 0.9 + 0.1 * Math.sin(time * 1.6 + p.ph);
      const ddx = x - pxPointer.x, ddy = y - pxPointer.y, dd = Math.hypot(ddx, ddy), rad = px.cell * 7;
      if (dd < rad) { const f = (1 - dd / rad) ** 2 * px.cell * 1.6; x += ddx / (dd || 1) * f; y += ddy / (dd || 1) * f; }
    }
    size = size + (tcell * 0.9 - size) * e;
    const a = 1 - smooth(clamp((e - 0.72) / 0.28));
    if (a <= 0.01) continue;
    ctx.globalAlpha = a;
    ctx.fillStyle = p.tint ? PX_TINT : PX_CHALK;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);
  }
  ctx.globalAlpha = 1;
}
// the closed window: a card in the right column, clear of the title (on a phone, above it)
const card0 = { x: 0, y: 0, w: 300, h: 380 };
function placeCard(m) {
  const t = m.titleR, gut = m.copyR.left;
  if (phone()) {
    const top = 84, bot = m.copyR.top - 18;
    card0.h = Math.max(200, Math.min(bot - top, (W - 2 * gut) * 1.15));
    card0.w = Math.min(W - 2 * gut, card0.h * 0.82);
    card0.x = W / 2; card0.y = top + (bot - top) / 2;
  } else {
    const right = W - gut - W * 0.04, left = t.right + 56;
    card0.h = Math.min(H * 0.66, 560);
    card0.w = Math.max(220, Math.min(card0.h * 0.8, right - left, W * 0.3));
    card0.h = Math.min(card0.h, card0.w * 1.25);
    card0.x = right - card0.w / 2; card0.y = H / 2 + 12;
  }
}
const radar = $('#radar'), chipText = $('#chip-text'), fmp = $('.fmp'), fmGhost = $('.fm-ghost');
const route = $('#map-route');
let lastNav = '', lastChip = '';
const mixHex = (a, b, t) => '#' + [1, 3, 5].map(i => Math.round(lerp(parseInt(a.substr(i, 2), 16), parseInt(b.substr(i, 2), 16), t)).toString(16).padStart(2, '0')).join('');
const setVar = (el, k, v) => { if (el['_' + k] !== v) { el['_' + k] = v; el.style.setProperty(k, v); } };

// every read of layout happens here, once per frame, before anything is written
function measure() {
  const m = {
    rects: sections.map(s => s.getBoundingClientRect()),
    // a chapter holds the middle while its top sits at the top of the screen (phones make some taller than one screen)
    // the hero is taller than the screen (its window opens first): it holds the middle until its last screen
    centers: anchors.map(a => { const r = a.getBoundingClientRect(); return a === heroSec ? r.bottom - H / 2 : r.top + Math.min(r.height, H) / 2; }),
    slotR: slots.map(a => a.getBoundingClientRect()),
    // the room between the nav and the cover type, where the macro lives
    fmpW: fmp ? fmp.offsetWidth : 0,
    ghostR: fmGhost ? fmGhost.getBoundingClientRect() : null,
    heroCopyTop: heroCopy.getBoundingClientRect().top - heroFront.getBoundingClientRect().top,
    copyR: heroCopy.getBoundingClientRect(),
    titleR: heroTitle.getBoundingClientRect(),
    widths: slots.map(a => a.offsetWidth),
    maxY: document.documentElement.scrollHeight - H,
    sy: scrollY,
  };
  // find my: the lock lies where the route on the map ends
  if (findIdx >= 0 && route) {
    const L = route.getTotalLength(), p = route.getPointAtLength(L), ctm = route.getScreenCTM();
    if (ctm) m.pin = { x: p.x * ctm.a + p.y * ctm.c + ctm.e, y: p.x * ctm.b + p.y * ctm.d + ctm.f };
  }
  return m;
}

function frameChrome(m) {
  const { rects } = m;
  const mid = H / 2;
  // which section owns the middle of the screen
  let ci = 0;
  rects.forEach((r, i) => { if (r.top <= mid) ci = i; });
  const s = sections[ci];
  const nav = s.dataset.navSection;
  if (nav !== lastNav) {
    lastNav = nav;
    // in the buy chapter the Buy pill in the nav would only repeat the button on the page
    root.classList.toggle('in-buy', nav === 'buy');
    navLinks.forEach(a => a.setAttribute('aria-current', String(a.dataset.nav === nav)));
    railLinks.forEach(a => a.setAttribute('aria-current', String(a.dataset.rail === nav)));
    menuLinks.forEach(a => a.setAttribute('aria-current', String(a.getAttribute('href') === '#' + nav)));
  }
  // phones: the lock sits in its chapter's own window, sized to it
  if (phone()) rects.forEach((r, i) => {
    const P = poses[i], sr = m.slotR[i];
    if (sections[i] === heroSec) {
      P.mx = 0; P.my = 0; P.mpx = W * 0.84;
    } else if (sections[i].matches('.void') && slots[i] !== sections[i] && i !== findIdx) {
      P.mx = (sr.left + sr.width / 2 - W / 2) / H;
      // once the chapter scrolls past its stop, the lock goes up with its window instead of hanging over the type
      P.my = (sr.top - r.top + sr.height / 2 - H / 2 + Math.min(0, r.top)) / H;
      const sec = sections[i], k = sec.matches('.void--macro') ? [0.8, 0.78] : sec.matches('.void--seal') ? [0.6, 0.56] : sec.matches('.void--fit') ? [0.56, 0.5] : sec.matches('.void--intro') ? [0.92, 0.72] : [0.92, 0.86];
      P.mpx = Math.min(sr.height * k[0], W * k[1]);
    } else P.mpx = Math.min(W * 0.84, H * 0.47) * ((P.msize ?? P.size) / 0.44);
  });
  rects.forEach((r, i) => {
    const sec = sections[i];
    if (sec === heroSec) return;
    const rv = reduce ? 1 : clamp((H * 0.9 - r.top) / (H * 0.62));
    const c = r.top + r.height / 2;
    const xv = reduce ? 0 : clamp((H * 0.18 - c) / (H * 0.25));
    setVar(sec, '--r', rv.toFixed(3));
    setVar(sec, '--x', xv.toFixed(3));
  });
  // buy, desktop: the lock sits in the middle of its own column, a size that leaves room round it
  if (!phone() && productIdx >= 0) {
    const sr = m.slotR[productIdx], r = rects[productIdx];
    poses[productIdx].x = (sr.left + sr.width / 2 - W / 2) / H;
    poses[productIdx].y = (sr.top - r.top + sr.height * 0.46 - H / 2) / H;
    poses[productIdx].size = Math.min(0.56, sr.width * 0.96 / (Math.min(W * 0.95, H * 1.32) * 0.88));
  }
  const hr = rects[0], extra = Math.max(1, hr.height - H);
  // the window opens over the first part of the hero (--hp), then the hero leaves (--hd)
  hero.p = reduce ? 1 : clamp(-hr.top / extra); hero.e = hero.p < 0.5 ? 4 * hero.p ** 3 : 1 - (-2 * hero.p + 2) ** 3 / 2;
  const hd = clamp((-hr.top - extra) / (H * 0.9));
  setVar(heroSec, '--hp', hero.p.toFixed(4)); setVar(root, '--hp', hero.p.toFixed(4)); setVar(heroSec, '--hq', smooth(clamp((hero.p - 0.82) / 0.18)).toFixed(3));
  setVar(heroSec, '--hd', hd.toFixed(3));
  // the lock fades in, 0 → 100 %, as the hero leaves and the light page rises (it is not shown over the hero)
  // (when the first chapter hides the lock, as the story does, it stays out of the slide down)
  const nextHides = /"hide":\s*1/.test(sections[1]?.dataset.key || '');
  hero.fadeIn = reduce ? 1 : hr.bottom > 0 ? (nextHides ? 0 : smooth(clamp(hd / 0.85))) : 1;
  setVar(stage, '--clip', 'none');
  // the lock appears as the pixels arrive on it
  hero.lock = reduce ? 1 : smooth(clamp((hero.p - 0.28) / 0.5));
  hero.on = hr.bottom > 0 && hero.p < 1;
  setVar(stage, '--hg', clamp(1 - hd * 1.4).toFixed(3));
  if (hd > 0 && hd < 1) {
    // the page stays Ink; the next chapter's colour rises with its top edge, as a sheet behind the lock
    root.classList.add('bg-live');
    setVar(root, '--bg', heroSec.dataset.bg);
    sheetEl.style.background = sections[1].dataset.bg;
    setVar(sheetEl, '--st', Math.max(0, rects[1].top).toFixed(1) + 'px');
    sheetEl.classList.add('is-on');
  } else {
    sheetEl.classList.remove('is-on');
    root.classList.remove('bg-live');
    setVar(root, '--bg', hd >= 1 ? s.dataset.bg || '#ECECEA' : heroSec.dataset.bg);
  }
  // the intro's photo shows through exactly where the intro is, behind the lock
  if (backdrop && introIdx > 0) {
    const ir = rects[introIdx], seen = ir.bottom > 0 && ir.top < H;
    backdrop.classList.toggle('is-on', seen);
    if (seen) { setVar(backdrop, '--bt', Math.max(0, ir.top).toFixed(1) + 'px'); setVar(backdrop, '--bb', Math.max(0, H - ir.bottom).toFixed(1) + 'px'); }
  }
  // the footer has its own logo, links and buy button: the nav and the rail step aside for it
  const fr = rects[rects.length - 1];
  root.classList.toggle('in-foot', fr.top < H * 0.96);
  // the opening keeps the same header as every other chapter (14 Oct): the nav is never hidden over it
  setVar(rail, '--ro', hd > 0.9 && nav !== 'buy' && fr.top > H * 0.9 ? '1' : '0');
  // the nav changes colour on the green chapters
  const tone = s.dataset.tone || 'light';
  if (root.dataset.tone !== tone) { root.dataset.tone = tone; stage.dataset.tone = tone; }
  // find my counts the distance down as you arrive
  if (findIdx >= 0) {
    const r = rects[findIdx], p = clamp((H - r.top) / H);
    // the distance on the phone counts down as you arrive
    const n = Math.round(450 + 1950 * (1 - p));
    const txt = n >= 1000 ? (n / 1000).toFixed(1).replace('.', lang === 'da' ? ',' : '.') + '\u00a0km' : n + '\u00a0m';
    if (txt !== lastChip) { lastChip = txt; chipText.textContent = txt; }
    // the phone is drawn round the lock: the lock sits where its placeholder's pin would be, about a third of the screen wide
    if (m.ghostR) {
      const g = m.ghostR;
      poses[findIdx].x = poses[findIdx].mx = (g.left + fpin.x - W / 2) / H;
      poses[findIdx].y = poses[findIdx].my = (g.top - r.top + fpin.y - H / 2) / H;
      const px = m.fmpW * 0.34;
      poses[findIdx].size = px / (Math.min(W * 0.95, H * 1.32) * 0.88);
      poses[findIdx].mpx = px;
    }
  }
  // the footer only lifts the buy chapter a little: the lock rides up with it
  const fi = sections.length - 1, foot = sections[fi];
  if (foot.matches('footer') && productIdx >= 0) {
    const lift = rects[fi].height / H;
    Object.assign(poses[fi], poses[productIdx], { y: poses[productIdx].y - lift, my: (poses[productIdx].my ?? poses[productIdx].y) - lift, fade: 1 });
  }
}

/* --------------------------------------------------------------- the loop */
let last = performance.now(), keylessSince = 0, autoOpened = false, userTouchedLock = false, lastSY = scrollY;
const t0 = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  glideTick(now);
  tickLoader(dt);
  // the 9 s safety net opened the page without the loader: start the entrance anyway
  if (intro.t < 0 && root.classList.contains('is-loaded')) { progress.done = true; intro.t = now; goToHash(); }

  const M = measure(), rects = M.rects;
  frameChrome(M);
  if (!lockReady) { drawPixels(now); return; }
  const mid = H / 2;
  const centers = M.centers.slice();
  // the footer can never reach the middle: land its pose as the page ends
  {
    const L = centers.length - 1;
    const endT = clamp(1 - (M.maxY - M.sy) / (H * 0.3));
    centers[L] = lerp(centers[L], Math.min(centers[L], mid - 1), endT);
  }

  // blend the two poses either side of the middle
  let i = 0;
  while (i < centers.length - 1 && centers[i + 1] <= mid) i++;
  const a = poses[i], b = poses[Math.min(i + 1, poses.length - 1)];
  const span = (centers[i + 1] ?? centers[i] + H) - centers[i];
  const t = centers[i] >= mid ? 0 : smooth(clamp((mid - centers[i]) / span));
  const target = {};
  KEYS.forEach(k => { target[k] = lerp(a[k], b[k], t); });
  if (phone()) {
    target.size = lerp(a.msize ?? a.size, b.msize ?? b.size, t);
    target.x = lerp(a.mx ?? a.x, b.mx ?? b.x, t); target.y = lerp(a.my ?? a.y, b.my ?? b.y, t);
    target.roll = lerp(a.mroll ?? a.roll, b.mroll ?? b.roll, t);
  } else {
    // a tall tablet: x is measured in screen heights, so keep the ring (and the seal round it) inside the width
    // (the buy chapter places the lock in its own column, so there it is held by the ring's real radius only)
    const pr = (i === productIdx ? 1 - t : 0) + (i + 1 === productIdx ? t : 0);
    const maxX = Math.max(0, (W / 2 - target.size * lerp(H * 0.62, Math.min(W * 0.95, H * 1.32) * 0.44, pr) - 24) / H);
    target.x = clamp(target.x, -maxX, maxX);
  }

  // keyless: open by itself once, a moment after you arrive
  const wk = keylessIdx < 0 ? 0 : clamp(1 - Math.abs(centers[keylessIdx] - mid) / (H * 0.45));
  if (wk > 0.85) {
    if (!keylessSince) keylessSince = now;
    // it opens only when you tap the button: never by itself
  } else keylessSince = 0;
  user.lock = reduce ? user.lockWant : damp(user.lock, user.lockWant, 5.5, dt);
  const lock = lerp(1, user.lock, smooth(wk));

  // buy: your own turn, kept while you are there, given back as you leave
  const wp = productIdx < 0 ? 0 : clamp(1 - Math.abs(centers[productIdx] - mid) / (H * 0.6));
  // leaving the buy chapter, the turn goes back to the first view
  if (wp < 0.2) user.angle = 0;

  // the page's own speed leans the ring a little, like something with weight
  const v = (scrollY - lastSY) / Math.max(dt, 1e-3) / 60; lastSY = scrollY;
  user.roll = damp(user.roll, reduce ? 0 : clamp(v * 0.004, -0.18, 0.18), 4, dt);
  user.mx = damp(user.mx, user.px, 3, dt); user.my = damp(user.my, user.py, 3, dt);
  setVar(heroSec, '--gx', (55 + user.mx * 10).toFixed(1) + '%');

  // follow, with weight (snappier for the macro, so the logo never smears)
  const k = reduce ? 1e3 : 7;
  KEYS.forEach(key => { cur[key] = damp(cur[key], target[key], k, dt); });
  swap.sweep = damp(swap.sweep, 0, 2.2, dt);

  // the entrance: the macro drifts in from a little closer and settles
  const ip = intro.t < 0 ? 0 : clamp((now - intro.t) / 2200), ie = 1 - Math.pow(1 - ip, 4);
  const alpha = clamp(1 - cur.fade) * (intro.t < 0 ? 0 : clamp((now - intro.t) / 400)) * (hero.fadeIn ?? 1);
  // find my shows the bike as a pin on the map instead: the lock steps out of the way, its drawings stay
  const shown = alpha * (1 - smooth(clamp(cur.hide)));
  lockEl.style.opacity = shown.toFixed(3);
  // the drawings wait until the bike has gone (the ring of words never hangs round a bike)
  const nobike = smooth(clamp((0.3 - cur.bike) / 0.3));
  ['orbit', 'radar', 'seal', 'fit'].forEach(kk => {
    const v = cur[kk] * alpha * nobike;
    setVar(stage, '--' + kk, v.toFixed(3));
    // a drawing that is not shown leaves the page entirely, so moving the lock (or the mouse) never recalculates it
    const off = v < 0.002, f = '_off-' + kk;
    if (stage[f] !== off) { stage[f] = off; stage.classList.toggle('off-' + kk, off); }
  });
  const tilt = findIdx < 0 ? 0 : (1 - smooth(clamp(+(sections[findIdx]['_--r'] || 0)))) * 20;
  setVar(stage, '--ft', tilt.toFixed(2) + 'deg');
  setVar(stage, '--sh', (alpha * (1 - cur.hide) * (1 - cur.radar) * (1 - cur.logo) * (1 - cur.fit) * (1 - cur.seal) * (1 - cur.bike)).toFixed(3));
  if (shown < 0.005) return; // lock hidden: nothing to paint

  const time = (now - t0) / 1000;
  // size: the ring's diameter on screen
  let px = phone() ? (cur.mpx || Math.min(W * 0.84, H * 0.47) * (cur.size / 0.44)) : Math.min(W * 0.95, H * 1.32) * cur.size * 0.88;
  if (!phone()) {
    const sw = lerp(M.widths[i] || W, M.widths[Math.min(i + 1, slots.length - 1)] || W, t);
    px = Math.min(px, lerp(sw * 1.02, px, clamp(cur.free + cur.logo)));
  }
  // it breathes a little and leans with the page; the face-on chapters (the seal, the tyre) hold still
  const still = Math.max(cur.seal, cur.fit);
  const bob = reduce ? 0 : Math.sin(time * 0.8) * px * 0.006 * (1 - still);
  const dx = cur.x * H + (reduce ? 0 : user.mx * 6 * (1 - still)), dy = cur.y * H + bob + (reduce ? 0 : user.my * 4 * (1 - still));
  const roll = cur.roll + user.roll * (1 - still);
  setVar(stage, '--lx', dx.toFixed(1) + 'px'); setVar(stage, '--ly', dy.toFixed(1) + 'px'); setVar(stage, '--lr', (px / 2).toFixed(0) + 'px');
  // the angle: each chapter names its view; in the buy chapter your own turn picks it; between two, a cross-fade
  const angOf = (P, idx) => idx === productIdx ? ANGLES[((user.angle % 6) + 6) % 6] : (P.img || '00');
  const iB = Math.min(i + 1, poses.length - 1), aA = angOf(a, i), aB = angOf(b, iB);
  // the lock is steel everywhere; only the buy chapter shows the finish you pick
  const fA = i === productIdx ? finish : 'steel', fB = iB === productIdx ? finish : 'steel';
  const same = aA === aB && fA === fB, mixB = same ? 0 : t;
  const place = { W, H, dx, dy, px, roll };
  paintLayer(layers[0], aA, 1 - mixB, place, fA);
  paintLayer(layers[1], aB, same ? 0 : mixB, place, fB);
  drawPixels(now);
}
// one image layer: a new picture only once it has arrived, so nothing ever flashes empty
// each view is placed by its own geometry: the ring's centre on the lock's place, its extent px wide
function paintLayer(L, ang, op, p, f = finish) {
  const src = srcOf(f, ang), g = GEO[ang] || RING, S = p.px / (2 * g.r);
  const st = L.img.style;
  st.width = st.height = S.toFixed(1) + 'px';
  st.transformOrigin = `${g.cx * 100}% ${g.cy * 100}%`;
  st.transform = `translate3d(${(p.W / 2 + p.dx - g.cx * S).toFixed(1)}px, ${(p.H / 2 + p.dy - g.cy * S).toFixed(1)}px, 0) rotate(${p.roll.toFixed(4)}rad)`;
  if (L.src !== src) {
    L.want = src;
    fetchImg(src).then(() => { if (L.want === src) { L.img.src = src; L.src = src; } }, () => {});
  }
  const o = (L.src ? op : 0).toFixed(3);
  if (L.op !== o) { L.op = o; L.img.style.opacity = o; }
}
requestAnimationFrame(loop);

/* ------------------------------------------------------------ keyless UI */
const unlockBtn = $('#unlock'), unlockState = $('#unlock-state'), unlockCta = $('#unlock-cta');
if (unlockBtn) {
function setLock(v, byUser) {
  user.lockWant = v;
  const open = v === 0;
  unlockBtn.classList.toggle('is-open', open);
  unlockBtn.classList.remove('is-nudge');
  unlockBtn.setAttribute('aria-pressed', String(open));
  unlockState.textContent = t(open ? 'Unlocked' : 'Locked');
  unlockCta.textContent = t(open ? 'Lock' : 'Unlock');
  if (byUser) navigator.vibrate?.(open ? [10, 40, 10] : 14);
  if (!open && !reduce) setTimeout(flash, 380);
}
unlockBtn.addEventListener('click', () => { userTouchedLock = true; setLock(user.lockWant === 0 ? 1 : 0, true); });
unlockBtn.classList.add('is-nudge');
// the Near dot only breathes while the chapter is on screen
{
  const kl = $('#keyless');
  if (kl && 'IntersectionObserver' in window) new IntersectionObserver(([e]) => kl.classList.toggle('is-live', e.isIntersecting)).observe(kl);
  else if (kl) kl.classList.add('is-live');
}
}

/* -------------------------------------------------------- will it fit */
if ($('#fitg')) {
const fitg = $('#fitg'), verdict = $('#verdict'), vHead = $('#verdict-head'), vBody = $('#verdict-body'), fitDim = $('#fit-dim');
const fitState = { mm: 42, holes: true };
function renderFit() {
  const { mm, holes } = fitState;
  // the box: tyres up to 60 mm go through the ring's 63 mm clearance; without frame holes, the Flex-Mount holds it
  const no = mm > 60;
  verdict.dataset.state = no ? 'no' : 'yes'; fitg.dataset.state = no ? 'no' : 'yes';
  vHead.textContent = t(no ? 'Too wide.' : holes ? 'It fits.' : 'It fits, with the Flex-Mount.');
  vBody.textContent = no ? t('The ring takes tyres up to 60 mm.')
    : holes ? t('The screws are in the box.')
    : t('Add the Flex-Mount (€9.99) when you pre-order. It holds the lock on a frame without holes.');
  // no holes: a quiet way to the Flex-Mount on its own (the buy page's accessory)
  if (!no && !holes) { const a = document.createElement('a'); a.className = 'link verdict__more'; a.href = 'buy.html#flex-mount'; a.textContent = t('Need a Flex-Mount?'); vBody.append(' ', a); }
  verdict.classList.remove('is-swap'); void verdict.offsetWidth; verdict.classList.add('is-swap');
  // the tyre, to scale: the drawn hole is the ring's 105 mm inside (v8 model); the 63 mm clearance sits between the mounts
  fitg.style.setProperty('--tw', Math.min(1, mm / 105).toFixed(3));
  // the tyre's number counts to the new width as the tyre and its bracket glide there
  const to = no ? 100 : mm, from = fitShown;
  cancelAnimationFrame(fitTween);
  const say = n => { fitDim.textContent = (no && n === to ? '100+' : '~' + n) + ' ' + t('mm tyre'); };
  if (reduce || from === to) { fitShown = to; say(to); return; }
  const t1 = performance.now();
  const step = now => {
    const p = Math.min(1, (now - t1) / 600), e = 1 - Math.pow(1 - p, 3);
    fitShown = Math.round(from + (to - from) * e); say(fitShown);
    if (p < 1) fitTween = requestAnimationFrame(step);
  };
  fitTween = requestAnimationFrame(step);
}
let fitShown = 42, fitTween = 0;
// the picked chip sits on one dark pill that glides from chip to chip
function pillRow(row) {
  if (!row) return;
  const pill = document.createElement('span');
  pill.className = 'pickrow__pill'; pill.setAttribute('aria-hidden', 'true');
  row.prepend(pill); row.classList.add('has-pill');
  const place = () => {
    const b = row.querySelector('.chip[aria-checked="true"]'); if (!b) return;
    pill.style.width = b.offsetWidth + 'px'; pill.style.height = b.offsetHeight + 'px';
    pill.style.transform = `translate(${b.offsetLeft}px, ${b.offsetTop}px)`;
  };
  place(); setTimeout(() => row.classList.add('is-ready'), 60);
  row.addEventListener('click', () => requestAnimationFrame(place));
  if ('ResizeObserver' in window) new ResizeObserver(place).observe(row);
}
pillRow($('#tyre')); pillRow($('#holes'));
// the chapter's steps come in once, one after the other, when it first shows
{
  const fit = $('#fit');
  if (fit && !reduce && 'IntersectionObserver' in window) {
    fit.classList.add('fit-armed');
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { fit.classList.add('fit-in'); io.disconnect(); } }, { threshold: 0.35 });
    io.observe(fit);
  }
}
function radio(group, pick) {
  $$('#' + group + ' .chip').forEach(b => b.addEventListener('click', () => {
    $$('#' + group + ' .chip').forEach(x => x.setAttribute('aria-checked', String(x === b)));
    pick(b); renderFit();
  }));
}
radio('tyre', b => { fitState.mm = +b.dataset.mm; });
// the answer is kept for the Pre-order question: holes means it is not asked again (cart-nav.js)
radio('holes', b => { fitState.holes = b.dataset.holes === '1'; try { if (fitState.holes) sessionStorage.setItem('laas-flex', 'no'); else sessionStorage.removeItem('laas-flex'); } catch { /* private mode */ } });
renderFit();
}

/* ------------------------------------------- finishes: one sliding outline */
// António's buy block: the dots name the finish, the price stays above the button, the button just says Buy (owner, 10 Oct)
const FIN_NAME = { steel: 'Steel', copper: 'Copper', black: 'Black' };
let qty = 1;
// once this finish is in the cart (cart-nav.js), the stepper shows and sets the cart: the minus at 1 is a bin
// and takes it out, and Buy becomes Check out
const C = () => window.LAAS_CART;
const inCart = () => (C() && C().qtyOf ? C().qtyOf(finish) : 0);
let added = 0; // the moment the locks went in: the button says Added for a beat before it turns into Check out
function renderBuy() {
  const n = inCart();
  $('#qty-value').textContent = n || qty;
  const minus = $('[data-qty="-1"]'), plus = $('[data-qty="1"]');
  minus.disabled = !n && qty <= 1; plus.disabled = (n || qty) >= 15;
  minus.classList.toggle('is-trash', n === 1);
  minus.setAttribute('aria-label', t(n === 1 ? 'Remove from cart' : 'Decrease quantity'));
  $('.qty-row').classList.toggle('is-cart', !!n);
  const just = n && Date.now() - added < 1600;
  $('#buy-label').classList.toggle('is-added', !!just);
  $('#buy-label').textContent = t(just ? 'Added' : n ? 'Check out' : 'Pre-order');
  // the link is the fallback when the cart script is missing: the buy page, with the choice
  $('#buy-label').href = n ? 'checkout-v2.html' : `buy.html?finish=${finish}&qty=${qty}`;
  $('#finish-name').textContent = FIN_NAME[finish];
}
$$('[data-qty]').forEach(b => b.addEventListener('click', () => {
  const d = +b.dataset.qty, n = inCart();
  if (n) C().setQty(finish, n + d); else qty = clamp(qty + d, 1, 15);
  renderBuy();
}));
renderBuy();
addEventListener('laas-cart', renderBuy);
addEventListener('storage', renderBuy);
// Buy: one question (the Flex-Mount), then the locks go in the cart right here; in the cart already, Check out
$('#buy-label').addEventListener('click', e => {
  if (inCart() || !C() || !C().buy) return;
  e.preventDefault();
  C().buy(finish, qty, () => { qty = 1; if (inCart()) { added = Date.now(); setTimeout(renderBuy, 1600); } renderBuy(); });
});
// the finish dots are one radio group (as on buy.html): one tab stop, the arrow keys move and pick
const dots = $$('[data-finish]');
const syncDots = () => dots.forEach(b => { b.tabIndex = b.getAttribute('aria-checked') === 'true' ? 0 : -1; });
dots.forEach((btn, i) => {
  btn.addEventListener('click', () => {
    const f = btn.dataset.finish;
    if (f === finish) return;
    dots.forEach(b => b.setAttribute('aria-checked', String(b === btn)));
    syncDots();
    show(f).catch(() => {}); renderBuy();
  });
  btn.addEventListener('keydown', e => {
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!d) return;
    e.preventDefault();
    const n = dots[(i + d + dots.length) % dots.length];
    n.focus(); n.click();
  });
});
syncDots();

/* ---------------------------------------------------------- buy: turn */
// the six studio angles: a sideways drag steps through them (one step per 60 px), so do the arrows and the keys
const zone = $('#dragzone');
let lastX = 0, acc = 0;
const step = d => { user.angle += d; ANGLES.forEach(a2 => fetchImg(srcOf(finish, a2)).catch(() => {})); };
zone.addEventListener('pointerdown', e => { user.dragging = true; lastX = e.clientX; acc = 0; zone.setPointerCapture(e.pointerId); });
zone.addEventListener('pointermove', e => {
  if (!user.dragging) return;
  acc += e.clientX - lastX; lastX = e.clientX;
  while (Math.abs(acc) >= 60) { step(acc > 0 ? -1 : 1); acc -= Math.sign(acc) * 60; }
});
const endDrag = () => { user.dragging = false; };
zone.addEventListener('pointerup', endDrag); zone.addEventListener('pointercancel', endDrag);
$$('[data-turn]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); step(+b.dataset.turn); }));
$$('[data-turn]').forEach(b => b.addEventListener('pointerdown', e => e.stopPropagation()));
zone.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); step(e.key === 'ArrowRight' ? 1 : -1); }
});

/* ------------------------------------------------------------- pointer */
if (fine && !reduce) addEventListener('pointermove', e => { user.px = e.clientX / W * 2 - 1; user.py = e.clientY / H * 2 - 1; }, { passive: true });

/* -------------------------------------------------------- the nav capsule */
{
  const links = $('.nav__links'), hover = $('.nav__hover'), lamp = $('.nav__lamp');
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY, d = y - lastY; lastY = y;
    root.classList.toggle('nav-float', y > 8);
    if (d > 4 && y > innerHeight * 0.6) root.classList.add('nav-compact');
    else if (d < -4 || y < 8) root.classList.remove('nav-compact');
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  // the pill under the pointer
  $$('a', links).forEach(a => a.addEventListener('pointerenter', () => {
    links.style.setProperty('--hx', a.offsetLeft + 'px'); links.style.setProperty('--hw', a.offsetWidth + 'px'); links.style.setProperty('--ho', '1');
  }));
  links.addEventListener('pointerleave', () => links.style.setProperty('--ho', '0'));
  // the lamp follows the chapter you are in
  const placeLamp = () => {
    const a = $('a[aria-current="true"]', links);
    links.style.setProperty('--lmo', a ? '1' : '0');
    if (a) links.style.setProperty('--lmx', (a.offsetLeft + a.offsetWidth / 2) + 'px');
  };
  new MutationObserver(placeLamp).observe(links, { attributes: true, subtree: true, attributeFilter: ['aria-current'] });
  addEventListener('resize', placeLamp);
}

/* ------------------------------------------------------------------ menu */
const menu = $('#menu'), menuBtn = $('#menu-open');
function openMenu() {
  menu.hidden = false; menuBtn.setAttribute('aria-expanded', 'true'); menuBtn.textContent = t('Close');
  requestAnimationFrame(() => menu.classList.add('is-open'));
  $('main').inert = true;
  setTimeout(() => menu.querySelector('a')?.focus(), 50);
}
function closeMenu() {
  if (menu.hidden) return;
  menu.classList.remove('is-open'); menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = t('Menu');
  setTimeout(() => { if (!menu.classList.contains('is-open')) menu.hidden = true; }, reduce ? 0 : 700);
  $('main').inert = false;
  menuBtn.focus();
}
menuBtn.addEventListener('click', () => (menu.hidden ? openMenu() : closeMenu()));
addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

/* ------------------------------------------------- one chapter per push
   Every push of the wheel, the trackpad, a swipe or a key glides to the next stop (or the one before) and lands on
   it: you never hang between two chapters, and you never fly past one. The opening is one long stop of its own: one
   push carries you from the pixel wordmark, through the lock, out to the first chapter. A chapter taller than the
   screen (a phone) gets a second stop at its bottom, so nothing in it is skipped. */
{
  const introEl = sections.find(sec => sec !== heroSec) || $('#intro');
  // the stops, measured fresh each time (fonts, a resize, an opened FAQ answer all move them)
  const stops = () => {
    const maxY = document.documentElement.scrollHeight - innerHeight, out = [0];
    sections.forEach(sec => {
      if (sec === heroSec) return;
      const top = Math.round(sec.getBoundingClientRect().top + scrollY), h = Math.max(sec.offsetHeight, sec.scrollHeight);
      // the footer ends the page; one taller than the screen (a phone) stops at its top first, so its logo and links are seen
      if (sec.matches('footer')) { if (h > innerHeight + 8) out.push(Math.min(top, maxY)); out.push(maxY); return; }
      out.push(Math.min(top, maxY));
      // a story chapter (data-steps) stops once per frame
      const steps = +sec.dataset.steps || 0; // (no chapter uses steps now; kept for a story that stops per frame)
      for (let k = 1; k < steps; k++) out.push(Math.min(top + k * innerHeight, maxY));
      if (!steps && h > innerHeight * 1.15) out.push(Math.min(top + h - innerHeight, maxY));
    });
    return [...new Set(out)].sort((a, b) => a - b);
  };
  function glide(to, dur) {
    if (Math.abs(to - scrollY) < 2) return;
    if (reduce) { scrollTo(0, to); return; }
    root.style.scrollSnapType = 'none';
    Object.assign(glider, { on: true, from: scrollY, to, t0: performance.now(), dur });
  }
  // a trackpad keeps coasting after a push: swallow it until it has gone quiet, so one push is one chapter
  const busy = () => glider.on || performance.now() < glider.coolUntil;
  const intent = dir => {
    const S = stops(), y = scrollY;
    const to = dir > 0 ? S.find(v => v > y + 4) : [...S].reverse().find(v => v < y - 4);
    if (to == null) return false;
    // the opening is the long, slow one; every other step is a quick, soft one
    glide(to, Math.min(1100, 650 + Math.abs(to - y) * 0.35));
    return true;
  };
  const insideScroller = el => el && el.closest && el.closest('.menu');
  addEventListener('wheel', e => {
    if (e.ctrlKey || insideScroller(e.target) || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (busy()) { if (!glider.on) glider.coolUntil = performance.now() + 180; return; }
    if (Math.abs(e.deltaY) < 3) return;
    intent(Math.sign(e.deltaY));
    glider.coolUntil = performance.now() + 180;
  }, { passive: false });
  let ty = null, tx = null, used = false;
  addEventListener('touchstart', e => { ty = e.touches[0].clientY; tx = e.touches[0].clientX; used = false; }, { passive: true });
  addEventListener('touchmove', e => {
    // a sideways drag on the lock turns it (the line below leaves it alone); an up-and-down swipe there moves a chapter too
    if (ty == null || insideScroller(e.target)) return;
    const d = ty - e.touches[0].clientY;
    // a sideways drag on the lock is the lock's; anywhere else the page never drifts between two stops
    if (Math.abs(e.touches[0].clientX - tx) > Math.abs(d) && e.target.closest('#dragzone')) return;
    e.preventDefault();
    if (used || busy() || Math.abs(d) < 12) return;
    used = true; intent(Math.sign(d));
  }, { passive: false });
  addEventListener('keydown', e => {
    if (e.target.closest('input, textarea, select, [contenteditable]')) return;
    const k = e.key, down = k === 'ArrowDown' || k === 'PageDown' || (k === ' ' && !e.shiftKey), up = k === 'ArrowUp' || k === 'PageUp' || (k === ' ' && e.shiftKey);
    if (!down && !up) return;
    // the space bar presses a focused button, opens a question, follows a link; the arrows move inside a radio group
    if (k === ' ' && e.target.closest('button, summary, [role="radio"], [role="button"], #dragzone')) return;
    if ((k === 'ArrowUp' || k === 'ArrowDown') && e.target.closest('[role="radiogroup"]')) return;
    e.preventDefault();
    if (!busy()) intent(down ? 1 : -1);
  });
}
/* ------------------------------------------------- the everyday story: it plays itself while it is on screen.
   A photo holds for 3.6 s; a film frame (the unlock, the ride off) plays to its end, from its first frame, and then
   the story moves on, so frames 3 and 4 run as one short film. The dots jump to a frame. Reduced motion: no autoplay,
   the films show their first frame, the dots still work. */
const wideMQ = matchMedia('(min-width: 761px) and (min-aspect-ratio: 1/1)');
// a film's source follows the screen: the landscape cut on wide screens, the portrait cut on phones
function pickFilm(v) {
  const k = wideMQ.matches ? 'wide' : 'm';
  if (v.dataset.on === k) return;
  v.dataset.on = k;
  v.poster = v.dataset['poster' + (k === 'wide' ? 'Wide' : 'M')];
  v.src = v.dataset[k];
}
const playSafe = v => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
{
  const MS = 3600;
  $$('.tale').forEach(t => {
    const frames = $$('[data-i]', t), dots = $$('.tale__dots li', t), n = dots.length;
    const films = $$('.tale__shot video', t);
    films.forEach(pickFilm);
    wideMQ.addEventListener?.('change', () => films.forEach(pickFilm));
    let i = 0, timer = 0, visible = false, paused = false;
    const filmOf = k => $(`.tale__shot[data-i="${k}"] video`, t);
    const show = k => {
      i = (k + n) % n;
      t.dataset.frame = i;
      frames.forEach(el => { const on = +el.dataset.i === i; el.classList.toggle('is-on', on); if (el.matches('h2')) el.setAttribute('aria-hidden', String(!on)); });
      dots.forEach((d, k2) => d.classList.toggle('is-on', k2 === i));
      const cnt = t.querySelector('.tale__count b'); if (cnt) cnt.textContent = String(i + 1).padStart(2, '0');
      // only the frame in view runs; every film starts again from its first frame when it comes back
      // the film going out keeps moving through the crossfade, then rests on its first frame
      films.forEach(v => { if (v !== filmOf(i) && !v.paused) setTimeout(() => { if (v !== filmOf(i)) { v.pause(); try { v.currentTime = 0; } catch { /* fine */ } } }, 1100); else if (v !== filmOf(i)) { try { v.currentTime = 0; } catch { /* not loaded yet */ } } });
      // the next film starts loading while this frame is on
      const next = filmOf((i + 1) % n); if (next && next.preload !== 'auto') { next.preload = 'auto'; next.load(); }
    };
    const stop = () => { clearTimeout(timer); timer = 0; t.classList.remove('is-playing'); const v = filmOf(i); if (v) v.pause(); };
    // one frame's turn: a photo for MS, a film for as long as it runs (the progress bar follows either)
    const run = () => {
      clearTimeout(timer); timer = 0;
      if (reduce || paused || !visible) return;
      const v = filmOf(i);
      const go = ms => {
        t.style.setProperty('--tale-ms', ms + 'ms');
        t.classList.remove('is-playing'); void t.offsetWidth; t.classList.add('is-playing');
        timer = setTimeout(() => { show(i + 1); run(); }, ms);
      };
      if (!v) { go(MS); return; }
      if (v.preload !== 'auto') { v.preload = 'auto'; v.load(); }
      const start = () => {
        if (filmOf(i) !== v || paused || !visible) return;
        try { v.currentTime = 0; } catch { /* fine */ }
        playSafe(v);
        // film into film (the unlock, then the ride off): the next one comes in while this one still moves, like one cut
        const nextFilm = filmOf((i + 1) % n);
        go(Math.round((v.duration || 4) * 1000) + (nextFilm ? -700 : 250));
      };
      // a film that cannot load never stalls the story: it holds like a photo
      if (v.error) go(MS); else if (v.readyState >= 1 && v.duration) start(); else { v.addEventListener('loadedmetadata', start, { once: true }); v.addEventListener('error', () => { if (filmOf(i) === v && visible && !paused) go(MS); }, { once: true }); }
    };
    // start only once the page has landed on the story, and always from frame 1 after it has been away,
    // so the first photo stays put for a full beat instead of switching during the glide in
    new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) { if (i) show(0); }
      const was = visible;
      visible = e.isIntersecting && e.intersectionRect.height >= 0.97 * Math.min(e.boundingClientRect.height, innerHeight);
      if (visible && !was && !document.hidden) run(); else if (!visible) stop();
    }, { threshold: [0, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.97, 0.99, 1] }).observe(t);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : run()));
    const pauseBtn = $('.tale__pause', t);
    // (t is this story here, so the label goes through DA directly)
    const say = s => (lang === 'da' && DA[s]) || s;
    const setPaused = p => { paused = p; pauseBtn?.setAttribute('aria-pressed', String(p)); pauseBtn?.setAttribute('aria-label', say(p ? 'Play story' : 'Pause story')); p ? stop() : run(); };
    pauseBtn?.addEventListener('click', () => setPaused(!paused));
    dots.forEach((d, k) => d.querySelector('button').addEventListener('click', () => { stop(); show(k); run(); }));
    show(0);
  });
  // the nav goes clear over the photos: the opening and the story
  const shellEl = document.querySelector('.nav__shell'), menuEl = document.getElementById('menu');
  const dark = $$('.hero--photo, .tale, .void--share, .void--fit3');
  const nav = () => {
    const nb = shellEl ? shellEl.offsetTop + shellEl.offsetHeight + 12 : 80;
    const over = dark.some(el => { const r = el.getBoundingClientRect(); return r.top <= 4 && r.bottom >= nb; });
    document.documentElement.classList.toggle('in-tale', over && (!menuEl || menuEl.hidden));
  };
  addEventListener('scroll', nav, { passive: true }); addEventListener('resize', nav);
  if (menuEl) new MutationObserver(nav).observe(menuEl, { attributes: true, attributeFilter: ['hidden'] });
  nav();
}

/* ------------------------------------------------- films that play while they are on screen
   Sharing and the lab test loop while on screen. Reduced motion: the poster stays. */
{
  const watch = (v, onIn) => {
    if (!v || !('IntersectionObserver' in window)) return;
    // fetch the film one chapter ahead, so it is there when you arrive
    if (!reduce) new IntersectionObserver(([e], o) => { if (e.isIntersecting) { v.preload = 'auto'; o.disconnect(); } }, { rootMargin: '100% 0px' }).observe(v);
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && e.intersectionRatio > 0.55) { if (v.preload !== 'auto') { v.preload = 'auto'; } if (!reduce) onIn(); }
      else v.pause();
    }, { threshold: [0, 0.55, 0.8] }).observe(v);
  };
  const share = $('.share__film video');
  watch(share, () => playSafe(share));
  // the lab test loops while it is on screen (Eric, 14 Oct: no replay button)
  const lab = $('.ins__film video');
  watch(lab, () => playSafe(lab));
}

/* ------------------------------------------------- how it works: the steps light up one by one while on screen.
   Each step shows its own picture beside the list; a step with a film stays until its film has run */
{
  const MS = 3200;
  $$('.void--how').forEach(sec => {
    const list = $('.how', sec); if (!list) return;
    const items = $$('li', list), n = items.length, media = $$('.how__m', sec);
    let i = 0, timer = 0, on = false, held = false;
    const mediaOf = k => media.find(m => +m.dataset.step === k);
    // the connector runs from the first circle's centre to the last one's, and the teal part stops on the current circle
    const ics = items.map(li => $('.how__ic', li));
    const place = () => {
      if (!ics[0] || !ics[n - 1]) return;
      const lb = list.getBoundingClientRect(), mid = el => { const b = el.getBoundingClientRect(); return b.top + b.height / 2 - lb.top; };
      const a = mid(ics[0]), z = mid(ics[n - 1]), c = mid(ics[i]);
      if (z <= a) return;
      list.style.setProperty('--how-a', a.toFixed(1) + 'px');
      list.style.setProperty('--how-z', (lb.height - z).toFixed(1) + 'px');
      list.style.setProperty('--how-p', ((c - a) / (z - a)).toFixed(3));
    };
    if ('ResizeObserver' in window) new ResizeObserver(place).observe(list);
    list.addEventListener('transitionend', e => { if (e.target.tagName === 'P') place(); });
    // the focus ring on a step's circle is for the keyboard only, never after a tap or click
    list.addEventListener('pointerdown', () => list.classList.add('is-pointer'));
    list.addEventListener('keydown', () => list.classList.remove('is-pointer'));
    const show = k => {
      i = (k + n) % n;
      items.forEach((li, j) => { li.classList.toggle('is-on', j === i); li.setAttribute('aria-current', String(j === i)); });
      list.style.setProperty('--how-p', (i / (n - 1)).toFixed(3));
      place();
      media.forEach(m => { const me = m === mediaOf(i); m.classList.toggle('is-on', me); if (m.tagName === 'VIDEO' && !me) m.pause(); });
      const next = mediaOf((i + 1) % n); if (on && next && next.tagName === 'VIDEO' && next.preload !== 'auto') next.preload = 'auto';
    };
    const run = () => {
      clearTimeout(timer); timer = 0;
      if (reduce || !on || held) return;
      const m = mediaOf(i);
      if (m && m.tagName === 'VIDEO') {
        m.preload = 'auto';
        const start = () => { if (mediaOf(i) !== m || !on) return; try { m.currentTime = 0; } catch { /* fine */ } playSafe(m); timer = setTimeout(() => { show(i + 1); run(); }, Math.max(MS, Math.round((m.duration || 3) * 1000) + 300)); };
        if (m.readyState >= 1 && m.duration) start(); else m.addEventListener('loadedmetadata', start, { once: true });
      } else timer = setTimeout(() => { show(i + 1); run(); }, MS);
    };
    const stop = () => { clearTimeout(timer); timer = 0; const m = mediaOf(i); if (m && m.tagName === 'VIDEO') m.pause(); };
    new IntersectionObserver(([e]) => { on = e.isIntersecting && !document.hidden; on ? run() : stop(); }, { threshold: 0.5 }).observe(list);
    items.forEach((li, j) => {
      li.tabIndex = 0;
      // a picked step stays put (WCAG 2.2.2): its film plays once, the list stops moving
      const pick = () => { stop(); show(j); held = true; const m = mediaOf(j); if (m && m.tagName === 'VIDEO' && !reduce) playSafe(m); };
      li.addEventListener('click', pick);
      li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
    show(0);
  });
}
// loops that are off screen (the hero photos, the review band) stop costing anything
if ('IntersectionObserver' in window) { const away = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('is-away', !e.isIntersecting))); $$('.hero').forEach(el => away.observe(el)); }
// the review strip: one review at a time, a calm crossfade (none with reduced motion)
{
  const qs = $$('.tpr__quotes q');
  if (qs.length > 1 && !reduce) { let k = 0; setInterval(() => { if (document.hidden) return; qs[k].classList.remove('is-on'); k = (k + 1) % qs.length; qs[k].classList.add('is-on'); }, 5200); }
}
window.LAAS_UI = true;
