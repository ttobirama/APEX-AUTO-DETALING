/* ============================================================================
   APEX AUTO DETAILING — BUSINESS CONFIGURATION
   ============================================================================
   THIS FILE IS THE SINGLE SOURCE OF TRUTH FOR THE ENTIRE WEBSITE.

   To convert this template into another company's website:
     1. Edit the values below (business info, services, prices, reviews…).
     2. Replace the logo/favicon in index.html.
     3. Replace images: drop real photos into /assets/img and set the `img`
        field on any item (services, gallery, before/after). Until you do,
        the site renders its built-in stylised visuals.
     4. Update the SEO block at the bottom.
     5. Test, build, deploy. That's it — nothing else in the code needs to
        change.

   All business information here is FICTIONAL DEMO data, clearly marked.
   Replace it with the client's real details before selling/delivering.

   NOTE ON PRICING LOGIC:
   The quote calculator combines:
     base service price × vehicle multiplier × condition multiplier + add-ons
   All of it is defined below so you can adjust pricing in one place.
   ========================================================================== */

window.APEX_CONFIG = {
  /* ------------------------------------------------------------------ */
  /* BUSINESS                                                           */
  /* ------------------------------------------------------------------ */
  business: {
    name: 'APEX AUTO DETAILING',
    shortName: 'APEX',
    tagline: 'Obsessive Care. Exceptional Finish.',
    description:
      'Premium automotive detailing studio — interior detail, exterior detail, full detail, paint correction and ceramic coating. Engineered for an exceptional finish, inside and out.',
    phone: {
      display: '(512) 555-0147',
      href: 'tel:+15125550147'
    },
    text: {
      display: '(512) 555-0147',
      href: 'sms:+15125550147'
    },
    email: 'hello@apexauto.example',
    address: {
      line1: '1200 Barton Springs Rd',
      line2: 'Suite 210',
      city: 'Austin',
      state: 'TX',
      zip: '78704'
    },
    serviceArea: 'Greater Austin metro — including Round Rock, Cedar Park, Pflugerville and San Marcos',
    hours: [
      { days: 'Mon – Fri', time: '8:00 AM – 6:00 PM' },
      { days: 'Saturday', time: '9:00 AM – 4:00 PM' },
      { days: 'Sunday', time: 'Closed' }
    ],
    mapsEmbedUrl: 'https://www.google.com/maps?q=Austin%2C%20TX&output=embed',
    /* DEMO PLACEHOLDER — replace with the client's real map embed URL. */
    mapsLink: 'https://www.google.com/maps',
    /* Marked as demo data so it can never be mistaken for a real claim. */
    isDemo: true
  },

  /* ------------------------------------------------------------------ */
  /* NAVIGATION                                                          */
  /* ------------------------------------------------------------------ */
  nav: [
    { label: 'Services', href: '#services' },
    { label: 'Packages', href: '#packages' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Process', href: '#process' },
    { label: 'Reviews', href: '#reviews' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Contact', href: '#contact' }
  ],

  /* ------------------------------------------------------------------ */
  /* HERO                                                                */
  /* ------------------------------------------------------------------ */
  hero: {
    eyebrow: 'Premium auto detailing studio',
    titleA: 'YOUR CAR.',
    titleB: 'PERFECTED.',
    sub: 'Paint correction, ceramic coating, and obsessive interior & exterior detailing — engineered for an exceptional finish, inside and out.',
    primaryCta: { label: 'BOOK YOUR DETAIL', href: '#booking' },
    secondaryCta: { label: 'GET A FREE QUOTE', href: '#calculator' },
    bullets: ['Paint-safe techniques', 'Premium products only', 'Mobile & in-studio'],
    /* Ticker items shown under the hero. */
    ticker: [
      'INTERIOR DETAIL',
      'EXTERIOR DETAIL',
      'FULL DETAIL',
      'PAINT CORRECTION',
      'CERAMIC COATING',
      'CAR POLISHING',
      'PAINT PROTECTION',
      'MAINTENANCE DETAIL'
    ]
  },

  /* ------------------------------------------------------------------ */
  /* TRUST BAR — DEMO PLACEHOLDERS. Replace with real figures.          */
  /* ------------------------------------------------------------------ */
  trust: {
    lead: 'Trusted by drivers across the greater Austin area',
    stats: [
      { value: 500, suffix: '+', label: 'Vehicles detailed' },
      { value: 5.0, decimal: 1, suffix: '', label: 'Customer rating' },
      { value: 100, suffix: '%', label: 'Finish inspected' },
      { value: 9, suffix: '+', label: 'Years of experience' }
    ],
    /* Products the studio works with — DEMO PLACEHOLDERS. Replace with the
       client's actual product partnerships or remove the array entirely. */
    products: ['Gtechniq', 'Gyeon', 'Koch Chemie', 'CarPro', '3M']
  },

  /* ------------------------------------------------------------------ */
  /* SERVICES                                                           */
  /* Each card renders an image: set `img` to a photo path (e.g.         */
  /* "assets/img/interior-detail.webp") or leave empty for the built-in   */
  /* art. The bundled photos are demo shots from Pexels (free for        */
  /* commercial use) — replace them with the client's own photos before  */
  /* delivery.                                                           */
  /* ------------------------------------------------------------------ */
  services: [
    {
      name: 'Interior Detail',
      img: 'assets/img/interior-detail.webp',
      desc: 'Deep cleaning, extraction, conditioning, and finishing — your cabin restored to like-new.',
      price: 149,
      duration: '2–4 hrs',
      features: ['Full vacuum & steam', 'Leather & fabric conditioning', 'Carpet & upholstery extraction', 'Interior glass & vents'],
      accent: '#C9A45C'
    },
    {
      name: 'Exterior Detail',
      img: 'assets/img/exterior-detail.webp',
      desc: 'Safe wash, decontamination, wheels, tires, and a crisp protective finish.',
      price: 129,
      duration: '2–3 hrs',
      features: ['pH-neutral hand wash', 'Iron & tar decontamination', 'Wheels, tires & wells', 'Gloss-enhancing finish'],
      accent: '#E3C88E'
    },
    {
      name: 'Full Detail',
      img: 'assets/img/full-detail.webp',
      desc: 'The complete interior and exterior transformation in one appointment.',
      price: 249,
      duration: '4–6 hrs',
      features: ['Interior + exterior detail', 'Engine bay safe-clean', 'Trim & plastics restored', 'Paint protection layer'],
      accent: '#B0813F'
    },
    {
      name: 'Paint Correction',
      img: 'assets/img/paint-correction.webp',
      desc: 'Machine polishing that restores clarity, gloss, and depth to your paint.',
      price: 499,
      duration: '1–2 days',
      features: ['Paint depth inspection', 'Multi-stage machine polish', 'Swirl & scratch removal', 'Protection to lock it in'],
      accent: '#A67C3D'
    },
    {
      name: 'Ceramic Coating',
      img: 'assets/img/ceramic-coating.webp',
      desc: 'Advanced, long-term paint protection with deep hydrophobic gloss.',
      price: 899,
      duration: '1–2 days',
      features: ['Paint correction included', '9H ceramic coating', 'Hydrophobic self-cleaning', 'Multi-year durability'],
      accent: '#D9C59A'
    },
    {
      name: 'Maintenance Detail',
      img: 'assets/img/maintenance-detail.webp',
      desc: 'Keep your vehicle looking exceptional year-round with regular care.',
      price: 99,
      duration: '1–2 hrs',
      features: ['Quick interior refresh', 'Exterior wash & wheels', 'Interior dressing', 'Monthly-keep pricing'],
      accent: '#8A90A6'
    }
  ],

  /* ------------------------------------------------------------------ */
  /* PACKAGES                                                           */
  /* ------------------------------------------------------------------ */
  packages: [
    {
      name: 'Essential',
      price: 149,
      tag: '',
      blurb: 'A complete interior refresh that makes daily driving feel brand new.',
      features: [
        'Interior detail',
        'Full vacuum & steam',
        'Carpet & upholstery extraction',
        'Leather & fabric conditioning',
        'Windows & vents cleaned'
      ]
    },
    {
      name: 'Signature',
      price: 249,
      tag: 'Most Popular',
      blurb: 'The full transformation — inside and out — for drivers who notice everything.',
      features: [
        'Full interior + exterior detail',
        'Paint decontamination & polish',
        'Wheels, tires & engine bay',
        'One-step paint enhancement',
        'Protection layer included'
      ]
    },
    {
      name: 'Ultimate',
      price: 499,
      tag: '',
      blurb: 'Showroom-level correction and protection for enthusiasts and collectors.',
      features: [
        'Multi-stage paint correction',
        'Full interior & exterior detail',
        'Engine bay deep detail',
        'Ceramic-lite paint protection',
        'Trim & plastic restoration'
      ]
    },
    {
      name: 'Ceramic Protection',
      price: 899,
      tag: '',
      blurb: 'The highest level of protection. A glass-like coating that lasts for years.',
      features: [
        'Multi-stage paint correction',
        'Full detail before coating',
        '9H ceramic coating — 2+ year life',
        'Hydrophobic self-cleaning finish',
        'Annual coating inspection'
      ]
    }
  ],

  /* ------------------------------------------------------------------ */
  /* QUOTE CALCULATOR                                                   */
  /* Estimate = service.price × vehicle.multiplier × condition.multiplier*/
  /* + selected add-ons. All values are editable below.                  */
  /* ------------------------------------------------------------------ */
  calculator: {
    title: 'Build your quote',
    vehicles: [
      { name: 'Sedan', multiplier: 1.0 },
      { name: 'SUV', multiplier: 1.2 },
      { name: 'Truck', multiplier: 1.25 },
      { name: 'Coupe', multiplier: 1.0 },
      { name: 'Sports Car', multiplier: 1.1 },
      { name: 'Luxury Vehicle', multiplier: 1.3 }
    ],
    conditions: [
      { name: 'Light', multiplier: 1.0, hint: 'Regularly maintained' },
      { name: 'Moderate', multiplier: 1.2, hint: 'Some wear, light dirt' },
      { name: 'Heavy', multiplier: 1.45, hint: 'Deep cleaning needed' }
    ],
    services: [
      { name: 'Interior Detail', price: 149 },
      { name: 'Exterior Detail', price: 129 },
      { name: 'Full Detail', price: 249 },
      { name: 'Paint Correction', price: 499 },
      { name: 'Ceramic Coating', price: 899 }
    ],
    addons: [
      { name: 'Pet Hair Removal', price: 60 },
      { name: 'Stain Removal', price: 45 },
      { name: 'Odor Treatment', price: 50 },
      { name: 'Engine Bay Detail', price: 75 },
      { name: 'Headlight Restoration', price: 80 }
    ],
    disclaimer: 'This is an estimate. Final pricing may vary after vehicle inspection.'
  },

  /* ------------------------------------------------------------------ */
  /* BOOKING FORM BACKEND                                                */
  /* Leave `endpoint` empty to keep demo mode (simulated confirmation,   */
  /* no data leaves the browser). Set it to receive real submissions:    */
  /*   - Formspree:  'https://formspree.io/f/yourFormId'                 */
  /*   - Own server: any URL that accepts a JSON POST (see api/book.js   */
  /*     — a ready-to-deploy Vercel serverless function).                */
  /* ------------------------------------------------------------------ */
  booking: {
    endpoint: '' // e.g. 'https://formspree.io/f/xxxxxx'
  },

  /* ------------------------------------------------------------------ */
  /* BEFORE / AFTER                                                      */
  /* Real demo photos (Pexels, free for commercial use). For the slider  */
  /* to align, both images should be the same aspect ratio — replace     */
  /* with the client's own before/after pair before delivery.            */
  /* ------------------------------------------------------------------ */
  beforeAfter: {
    beforeImg: 'assets/img/before.webp',
    afterImg: 'assets/img/after.webp',
    beforeLabel: 'BEFORE',
    afterLabel: 'AFTER'
  },

  /* ------------------------------------------------------------------ */
  /* GALLERY — `img` paths point at the bundled demo photos (Pexels,     */
  /* free for commercial use). Swap in the client's real work shots.     */
  /* ------------------------------------------------------------------ */
  gallery: [
    { category: 'Interior', title: 'Cabin refresh — full extraction', img: 'assets/img/gallery-interior-1.webp' },
    { category: 'Exterior', title: 'Decontamination & gloss finish', img: 'assets/img/gallery-exterior-1.webp' },
    { category: 'Paint Correction', title: 'Swirl removal — 2-stage polish', img: 'assets/img/gallery-paint-1.webp' },
    { category: 'Ceramic Coating', title: '9H coating — after 6 months', img: 'assets/img/gallery-ceramic-1.webp' },
    { category: 'Interior', title: 'Leather conditioning', img: 'assets/img/gallery-interior-2.webp' },
    { category: 'Exterior', title: 'Wheels, tires & wells detailed', img: 'assets/img/gallery-exterior-2.webp' },
    { category: 'Paint Correction', title: 'Depth & clarity restored', img: 'assets/img/gallery-paint-2.webp' },
    { category: 'Ceramic Coating', title: 'Hydrophobic beading', img: 'assets/img/gallery-ceramic-2.webp' },
    { category: 'Interior', title: 'Steam & extraction detail', img: 'assets/img/gallery-interior-3.webp' }
  ],

  /* ------------------------------------------------------------------ */
  /* PROCESS                                                             */
  /* ------------------------------------------------------------------ */
  process: [
    { title: 'Request your quote', desc: 'Tell us about your vehicle and the finish you want — two minutes, no pressure.' },
    { title: 'Choose your service', desc: 'Pick a package or build a custom quote that fits your car and your budget.' },
    { title: 'Schedule your appointment', desc: 'Book a time that works — in-studio or mobile, at your home or office.' },
    { title: 'We transform your vehicle', desc: 'Certified technicians, premium products, obsessive attention to detail.' },
    { title: 'Drive away perfect', desc: 'A finish you can see, feel, and protect — with care instructions included.' }
  ],

  /* ------------------------------------------------------------------ */
  /* WHY CHOOSE US                                                       */
  /* ------------------------------------------------------------------ */
  whyChooseUs: [
    { icon: 'wrench', title: 'Professional equipment', desc: 'Industry-grade tools, extraction machines and polishing systems.' },
    { icon: 'sparkles', title: 'Premium products', desc: 'Only trusted, automotive-grade products from leading brands.' },
    { icon: 'shield', title: 'Paint-safe techniques', desc: 'Proper wash methods and measured polishing — never shortcuts.' },
    { icon: 'users', title: 'Experienced technicians', desc: 'Trained, certified detailers who treat your car like their own.' },
    { icon: 'dollar', title: 'Transparent pricing', desc: 'Clear estimates before we start. No surprise add-ons, ever.' },
    { icon: 'calendar', title: 'Convenient scheduling', desc: 'Online booking, weekend slots, and mobile detailing to you.' },
    { icon: 'search', title: 'Attention to detail', desc: 'We inspect every panel, seam and surface before you collect.' }
  ],

  /* ------------------------------------------------------------------ */
  /* VEHICLE TYPES                                                       */
  /* ------------------------------------------------------------------ */
  vehicleTypes: [
    'Luxury Cars', 'Sports Cars', 'Sedans', 'SUVs', 'Trucks', 'Classic Cars', 'Electric Vehicles'
  ],

  /* ------------------------------------------------------------------ */
  /* TESTIMONIALS — DEMO PLACEHOLDERS.                                   */
  /* Replace these with genuine client reviews (with permission) before  */
  /* delivering to a real business. They are clearly marked as demo.     */
  /* ------------------------------------------------------------------ */
  testimonials: [
    {
      quote: 'My car looked brand new when I picked it up — better than the day I bought it. The attention to detail was unreal; they even cleaned the cupholders.',
      name: 'Jordan M.',
      detail: 'Full detail · 2023 BMW M3',
      initials: 'JM',
      avatar: '#C9A45C'
    },
    {
      quote: 'Booked the ceramic coating package. Two years later the paint still beads water like it was just applied. Worth every penny.',
      name: 'Sarah K.',
      detail: 'Ceramic protection · 2022 Tesla Model S',
      initials: 'SK',
      avatar: '#B0813F'
    },
    {
      quote: 'They came to my office, detailed my truck in the parking lot, and left it gleaming. Convenient, professional, and the finish was flawless.',
      name: 'David T.',
      detail: 'Mobile exterior detail · Ford F-150',
      initials: 'DT',
      avatar: '#8A90A6'
    }
  ],

  /* ------------------------------------------------------------------ */
  /* FAQ                                                                 */
  /* ------------------------------------------------------------------ */
  faqs: [
    {
      q: 'How long does detailing take?',
      a: 'Most details take between 1 and 6 hours depending on the service and the condition of your vehicle. A maintenance detail can be done in about an hour, while paint correction or ceramic coating appointments take one to two days. We confirm the time estimate when you book.'
    },
    {
      q: 'Do you offer mobile detailing?',
      a: 'Yes. We bring the full studio to you — your home, office, or anywhere with power and water access. Mobile appointments are available within the greater Austin metro service area.'
    },
    {
      q: 'How much does detailing cost?',
      a: 'Packages start at $149, and most customers pay between $149 and $899 depending on the service, vehicle size, and condition. Use our quote calculator for an estimate, or request a free custom quote. Final pricing is confirmed after a vehicle inspection.'
    },
    {
      q: 'Do you work on luxury and exotic vehicles?',
      a: 'Absolutely — a large share of our work is on premium, luxury, and exotic vehicles. We use paint-safe techniques, measured polishing, and products designed for high-end finishes. Tell us what you drive when you book so we can plan accordingly.'
    },
    {
      q: 'How often should I detail my vehicle?',
      a: 'A full detail every 3–6 months keeps most vehicles in great shape, with a maintenance detail in between. Vehicles with ceramic coating typically need a lighter wash-and-protect routine. We\'ll recommend a schedule based on your car and how you use it.'
    },
    {
      q: 'What is ceramic coating?',
      a: 'Ceramic coating is a liquid polymer applied to your paint that bonds with the surface to create a durable, hydrophobic layer. It adds deep gloss, makes the car easier to clean, and protects against UV, minor scratches, and environmental contaminants for years — not months.'
    },
    {
      q: 'Can I get a custom quote?',
      a: 'Yes — every vehicle is different. Use the calculator for a quick estimate, then request a final quote and we\'ll inspect your car and give you an exact price. Custom quotes are free and there\'s never an obligation.'
    }
  ],

  /* ------------------------------------------------------------------ */
  /* SOCIAL LINKS                                                        */
  /* ------------------------------------------------------------------ */
  /* DEMO PLACEHOLDERS — replace with the client's real profiles. */
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/', icon: 'instagram' },
    { label: 'YouTube', href: 'https://www.youtube.com/', icon: 'youtube' },
    { label: 'Facebook', href: 'https://www.facebook.com/', icon: 'facebook' }
  ],

  /* ------------------------------------------------------------------ */
  /* SEO — update these per client.                                      */
  /* ------------------------------------------------------------------ */
  seo: {
    title: 'APEX AUTO DETAILING | Premium Auto Detailing in Austin, TX',
    description:
      'Premium auto detailing in Austin, TX — interior detail, exterior detail, full detail, paint correction and ceramic coating. Book your appointment today.',
    keywords: 'auto detailing austin, ceramic coating, paint correction, car detailing, mobile detailing austin',
    canonical: 'https://apexauto-demo.example/',
    ogImage: '',
    localBusiness: {
      type: 'AutoDetail',
      name: 'APEX AUTO DETAILING',
      phone: '+15125550147',
      email: 'hello@apexauto.example',
      address: '1200 Barton Springs Rd, Suite 210, Austin, TX 78704',
      geo: { lat: 30.2635, lng: -97.7612 },
      url: 'https://apexauto-demo.example/'
    }
  }
};
