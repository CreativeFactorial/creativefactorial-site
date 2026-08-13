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

function renderZoneCheckboxes(categoryName) {
  const container = document.getElementById('zoneCheckboxes');
  const cat = CATEGORIES.find((c) => c.category === categoryName);
  if (!cat) {
    container.innerHTML = '<p class="field-hint">Select a category first</p>';
    return;
  }
  container.innerHTML = ZONES.map((zoneName) => {
    const taken = cat.zones[zoneName] === 'TAKEN';
    const label = taken ? `${zoneName} (waitlist)` : zoneName;
    return `<label class="checkbox-field"><input type="checkbox" name="zone" value="${zoneName}"> ${label}</label>`;
  }).join('');
}

function selectCategory(name) {
  document.getElementById('categorySelect').value = name;
  renderZoneCheckboxes(name);
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
  const zoneError = document.getElementById('zoneError');

  form.category.addEventListener('change', () => renderZoneCheckboxes(form.category.value));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const checkedZones = form.querySelectorAll('input[name="zone"]:checked');
    if (checkedZones.length === 0) {
      zoneError.hidden = false;
      zoneError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    zoneError.hidden = true;

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
      submitBtn.textContent = 'Apply for a spot';
      alert('Something went wrong submitting your application. Please try again or call/email us directly.');
    }
  });
}

// Simplified general-area shapes for each zone (not precise USPS route
// boundaries). Homes/cost sourced from each zone's EDDM order summary;
// income/household size only captured for West Bozeman's PDF export.
const ZONE_INFO = [
  {
    name: 'West Bozeman',
    color: '#E8590C',
    coords: [[45.690, -111.115], [45.693, -111.075], [45.678, -111.058], [45.660, -111.062], [45.655, -111.095], [45.665, -111.120]],
    homes: 2537,
    income: '$90.65k',
    householdSize: '2.59 people',
    cost: 250,
  },
  {
    name: 'Southeast Bozeman',
    color: '#1A1A1A',
    coords: [[45.680, -111.010], [45.690, -110.985], [45.675, -110.965], [45.655, -110.975], [45.648, -111.005], [45.662, -111.020]],
    homes: 2675,
    income: '$128.11k',
    householdSize: '2.62 people',
    cost: 250,
  },
  {
    name: 'Springhill Bridger',
    color: '#2E7D32',
    coords: [[45.715, -111.045], [45.740, -111.020], [45.775, -110.980], [45.790, -110.950], [45.770, -110.945], [45.735, -110.985], [45.705, -111.015]],
    homes: 2620,
    income: '$118.59k',
    householdSize: '2.41 people',
    cost: 250,
  },
  {
    name: 'Belgrade',
    color: '#1565C0',
    coords: [[45.795, -111.205], [45.800, -111.165], [45.780, -111.145], [45.760, -111.155], [45.755, -111.190], [45.770, -111.210]],
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
renderZoneCheckboxes('');
renderFaq();
setupForm();
initZoneMap();
renderZoneLegend();
