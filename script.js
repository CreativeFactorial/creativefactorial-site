// Each category is exclusive to one business per zone. Edit zone statuses here: 'TAKEN' | 'OPEN'
const ZONES = ['West Bozeman', 'Southeast Bozeman', 'Springhill Bridger', 'Belgrade'];

function allZonesOpen() {
  return Object.fromEntries(ZONES.map((z) => [z, 'OPEN']));
}

const CATEGORIES = [
  { category: 'Roofing', zones: allZonesOpen() },
  { category: 'HVAC', zones: allZonesOpen() },
  { category: 'Windows & Doors', zones: allZonesOpen() },
  { category: 'Remodel / General Contractor', zones: allZonesOpen() },
  { category: 'Dental & Ortho', zones: allZonesOpen() },
  { category: 'Med Spa', zones: allZonesOpen() },
  { category: 'Cosmetic & Medical Services', zones: allZonesOpen() },
  { category: 'Landscape & Hardscape', zones: allZonesOpen() },
  { category: 'Garage Doors', zones: allZonesOpen() },
  { category: 'Gutters', zones: allZonesOpen() },
  { category: 'Pest Control', zones: allZonesOpen() },
  { category: 'Plumbing', zones: allZonesOpen() },
  { category: 'Auto Repair', zones: allZonesOpen() },
  { category: 'Self Storage', zones: allZonesOpen() },
  { category: 'Chiropractic', zones: allZonesOpen() },
  { category: 'Veterinary', zones: allZonesOpen() },
  { category: 'Insurance', zones: allZonesOpen() },
];

function openZoneCount(cat) {
  return ZONES.filter((z) => cat.zones[z] === 'OPEN').length;
}

const FAQS = [
  { q: 'Is design included?', a: 'Yes. We design your side of the card so it matches the look of the shared piece and reads clearly in four seconds. You approve the art before the deadline.' },
  { q: 'What if my category is already taken?', a: 'One business holds each zone at a time. If your category is taken in the zone you want, you can join the waitlist, and we will contact you the moment it opens. In the meantime you may have other zones open.' },
  { q: 'How do I know it worked?', a: 'We use a dedicated phone number and a simple offer specific to the card so calls are traceable back to the drop. You will know which calls came from the mail.' },
  { q: 'What is the minimum commitment?', a: 'Direct mail compounds with repetition, so we ask for a short run of consecutive drops rather than a single send. We will walk through the schedule before you commit.' },
  { q: 'How are the routes chosen?', a: 'Routes are hand-selected by carrier route in the USPS EDDM tool. Single family homes with $90,000 to $120,000+ median household income. No apartments, no businesses. The same routes every month.' },
  { q: 'What sizes are available?', a: 'The shared card runs at a set format so every business gets comparable space. We will confirm the exact dimensions and your allotment when we prepare your art.' },
];

function slotMeta(cat) {
  const openCount = openZoneCount(cat);
  if (openCount === 0) return { label: 'Full', tileClass: 'slot-taken', badgeClass: 'badge-taken', clickable: false };
  if (openCount === ZONES.length) return { label: `${openCount} open`, tileClass: 'slot-open', badgeClass: 'badge-open', clickable: true };
  return { label: `${openCount} of ${ZONES.length} open`, tileClass: 'slot-oneleft', badgeClass: 'badge-oneleft', clickable: true };
}

function renderSlotGrid() {
  const grid = document.getElementById('slotGrid');
  grid.innerHTML = CATEGORIES.map((c) => {
    const meta = slotMeta(c);
    const tag = meta.clickable ? 'button' : 'div';
    const typeAttr = meta.clickable ? 'type="button"' : 'aria-disabled="true"';
    const dataAttr = meta.clickable ? `data-category="${c.category}"` : '';
    return `<${tag} ${typeAttr} class="slot-tile ${meta.tileClass}" ${dataAttr}>
      <span class="slot-name">${c.category}</span>
      <span class="slot-badge ${meta.badgeClass}">${meta.label}</span>
    </${tag}>`;
  }).join('');

  grid.querySelectorAll('button.slot-tile').forEach((btn) => {
    btn.addEventListener('click', () => selectCategory(btn.dataset.category));
  });
}

function populateCategorySelect() {
  const select = document.getElementById('categorySelect');
  CATEGORIES.forEach((c) => {
    const opt = document.createElement('option');
    opt.value = c.category;
    opt.textContent = openZoneCount(c) === 0 ? `${c.category} (waitlist)` : c.category;
    select.appendChild(opt);
  });
}

function selectCategory(name) {
  document.getElementById('categorySelect').value = name;
  const el = document.getElementById('apply');
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 16, behavior: 'smooth' });
}

function renderFaq() {
  const list = document.getElementById('faqList');
  list.innerHTML = FAQS.map((f, i) => `
    <div class="faq-item" data-index="${i}">
      <button type="button" class="faq-question">
        <span>${f.q}</span>
        <span class="faq-icon">+</span>
      </button>
      <div class="faq-answer"><p>${f.a}</p></div>
    </div>
  `).join('');

  list.querySelectorAll('.faq-item').forEach((item) => {
    item.querySelector('.faq-question').addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      list.querySelectorAll('.faq-item.open').forEach((el) => el.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}

// Replace with your own Formspree form ID (sign up free at https://formspree.io,
// create a form, and copy the ID from the endpoint it gives you: https://formspree.io/f/XXXXXXXX)
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xaewqydw';

function setupForm() {
  const form = document.getElementById('applyForm');
  const submitBtn = document.getElementById('submitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Form submission failed');

      window.location.href = 'thank-you.html';
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Check My Category';
      alert('Something went wrong submitting your application. Please try again or call/email us directly.');
    }
  });
}

// Zone shapes traced by hand in Google My Maps against real satellite/street
// imagery (exported as KML), not precise USPS route boundaries. Homes sourced
// from each zone's EDDM order summary; income and household size are
// household-weighted averages across that zone's selected routes from the
// EDDM table view.
const ZONE_INFO = [
  {
    name: 'West Bozeman',
    color: '#E8590C',
    coords: [[45.736442, -111.185149], [45.659058, -111.186143], [45.638478, -111.196958], [45.631036, -111.171208], [45.641838, -111.161338], [45.641418, -111.14709], [45.642032, -111.083484], [45.652934, -111.071281], [45.655169, -111.062891], [45.657569, -111.063063], [45.659838, -111.106763], [45.671203, -111.10993], [45.673707, -111.109973], [45.678246, -111.115269], [45.682113, -111.114324], [45.685779, -111.103878], [45.700302, -111.103556], [45.700308, -111.082771], [45.707201, -111.08247], [45.72476, -111.082384], [45.729342, -111.091325], [45.730121, -111.12746], [45.736412, -111.130464], [45.736382, -111.141719], [45.736442, -111.185149]],
    homes: 2537,
    income: '$98.51k',
    householdSize: '2.55 people',
    cost: 250,
  },
  {
    name: 'Southeast Bozeman',
    color: '#1A1A1A',
    coords: [[45.667566, -110.895068], [45.660248, -110.952746], [45.667468, -110.988965], [45.672206, -111.007934], [45.677283, -111.016688], [45.671693, -111.02148], [45.66377, -111.011363], [45.656586, -111.015489], [45.657006, -111.029136], [45.649434, -111.041769], [45.642209, -111.046988], [45.648256, -111.055146], [45.648293, -111.057464], [45.645936, -111.062807], [45.63463, -111.062644], [45.627592, -111.104179], [45.619408, -111.062773], [45.593165, -111.062502], [45.591178, -111.046668], [45.593707, -111.026973], [45.605083, -111.006179], [45.627504, -111.006668], [45.626742, -110.99257], [45.627394, -110.960364], [45.629585, -110.942058], [45.608865, -110.925665], [45.609945, -110.92427], [45.621391, -110.929231], [45.633188, -110.937628], [45.637194, -110.928229], [45.641275, -110.924796], [45.647295, -110.936694], [45.667566, -110.895068]],
    homes: 2675,
    income: '$128.11k',
    householdSize: '2.62 people',
    cost: 250,
  },
  {
    name: 'Springhill Bridger',
    color: '#2E7D32',
    coords: [[45.787498, -111.082122], [45.802715, -111.069646], [45.80261, -111.046866], [45.795817, -111.040108], [45.787588, -111.030666], [45.764874, -110.988628], [45.713172, -111.003095], [45.717941, -110.955487], [45.727749, -110.938688], [45.748291, -110.936627], [45.749931, -110.899448], [45.76718, -110.881388], [45.779977, -110.885873], [45.791331, -110.900637], [45.810909, -110.894369], [45.834984, -110.904049], [45.858594, -110.881457], [45.871125, -110.844549], [45.869864, -110.837215], [45.886887, -110.831595], [45.888283, -110.830404], [45.869408, -110.811106], [45.87976, -110.789154], [45.870175, -110.793572], [45.851743, -110.817946], [45.830926, -110.879045], [45.788222, -110.8721], [45.777295, -110.855635], [45.769831, -110.808968], [45.763027, -110.832665], [45.751907, -110.854295], [45.709661, -110.817632], [45.680939, -110.803422], [45.663018, -110.798213], [45.59338, -110.797159], [45.58365, -110.798275], [45.597874, -110.819052], [45.608462, -110.836006], [45.613661, -110.854619], [45.645598, -110.879859], [45.639431, -110.913196], [45.645071, -110.929418], [45.667868, -110.893541], [45.660725, -110.952312], [45.666483, -110.981151], [45.67524, -111.009475], [45.702642, -111.005828], [45.702852, -111.024454], [45.702638, -111.039178], [45.707417, -111.044499], [45.718182, -111.065918], [45.730486, -111.067506], [45.739477, -111.069687], [45.753135, -111.067944], [45.766485, -111.080867], [45.787498, -111.082122]],
    homes: 2620,
    income: '$118.59k',
    householdSize: '2.41 people',
    cost: 250,
  },
  {
    name: 'Belgrade',
    color: '#1565C0',
    coords: [[45.809803, -111.259224], [45.794724, -111.252701], [45.787423, -111.247036], [45.782899, -111.238905], [45.787179, -111.234614], [45.78661, -111.224743], [45.782031, -111.210967], [45.772973, -111.206211], [45.766482, -111.210397], [45.758341, -111.219202], [45.745582, -111.211305], [45.743786, -111.206156], [45.743812, -111.197356], [45.743767, -111.164569], [45.757684, -111.16412], [45.763842, -111.174068], [45.765952, -111.180634], [45.765773, -111.185355], [45.772902, -111.200237], [45.784635, -111.20264], [45.78254, -111.188221], [45.789004, -111.180668], [45.79463, -111.179981], [45.801379, -111.186], [45.801753, -111.191579], [45.795769, -111.200913], [45.788771, -111.20592], [45.801577, -111.232185], [45.809803, -111.259224]],
    homes: 2655,
    income: '$104.63k',
    householdSize: '2.76 people',
    cost: 250,
  },
];

function zoneTooltipHtml(zone) {
  const lines = [`<span>${zone.homes.toLocaleString()} homes</span>`];
  if (zone.income) lines.push(`<span>Avg income ${zone.income}</span>`);
  if (zone.householdSize) lines.push(`<span>Avg household ${zone.householdSize}</span>`);
  lines.push(`<span>$${zone.cost} per drop</span>`);
  return `<div class="zone-tooltip"><strong>${zone.name}</strong>${lines.join('')}</div>`;
}

function initZoneMap() {
  const mapEl = document.getElementById('zoneMap');
  if (!mapEl || typeof L === 'undefined') return; // Leaflet failed to load; skip gracefully

  const map = L.map(mapEl, { scrollWheelZoom: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);

  let combinedBounds = null;
  ZONE_INFO.forEach((zone) => {
    const polygon = L.polygon(zone.coords, {
      color: zone.color, weight: 2, fillColor: zone.color, fillOpacity: 0.35,
    }).addTo(map);

    const content = zoneTooltipHtml(zone);
    polygon.bindTooltip(content, { sticky: true, direction: 'top' });
    polygon.bindPopup(content);
    polygon.on('mouseover', () => polygon.setStyle({ fillOpacity: 0.55 }));
    polygon.on('mouseout', () => polygon.setStyle({ fillOpacity: 0.35 }));

    combinedBounds = combinedBounds ? combinedBounds.extend(polygon.getBounds()) : polygon.getBounds();
  });

  if (combinedBounds) map.fitBounds(combinedBounds, { padding: [24, 24] });
}

function renderZoneLegend() {
  const legend = document.getElementById('zoneLegend');
  legend.innerHTML = ZONE_INFO.map((zone) => `
    <div class="zone-legend-item">
      <span class="zone-legend-swatch" style="background:${zone.color}"></span>
      ${zone.name}
    </div>
  `).join('');
}

renderSlotGrid();
populateCategorySelect();
renderFaq();
setupForm();
initZoneMap();
renderZoneLegend();
