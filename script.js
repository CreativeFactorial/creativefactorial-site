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

function populateZoneSelect(categoryName) {
  const zoneSelect = document.getElementById('zoneSelect');
  const cat = CATEGORIES.find((c) => c.category === categoryName);
  zoneSelect.innerHTML = '<option value="">Select a zone</option>';
  ZONES.forEach((zoneName) => {
    const taken = cat && cat.zones[zoneName] === 'TAKEN';
    const opt = document.createElement('option');
    opt.value = zoneName;
    opt.textContent = taken ? `${zoneName} (waitlist)` : zoneName;
    zoneSelect.appendChild(opt);
  });
}

function selectCategory(name) {
  document.getElementById('categorySelect').value = name;
  populateZoneSelect(name);
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
  const confirmation = document.getElementById('confirmation');
  const heading = document.getElementById('confirmationHeading');
  const message = document.getElementById('confirmationMessage');
  const submitBtn = document.getElementById('submitBtn');

  form.category.addEventListener('change', () => populateZoneSelect(form.category.value));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const categoryName = form.category.value;
    const zoneName = form.zone.value;
    const cat = CATEGORIES.find((c) => c.category === categoryName);
    const isTaken = !!(cat && cat.zones[zoneName] === 'TAKEN');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error('Form submission failed');

      heading.textContent = isTaken ? "You're on the waitlist." : 'Thank you.';
      message.textContent = isTaken
        ? `That category is currently spoken for in ${zoneName}. You are on the waitlist and we will reach out the moment the zone opens.`
        : 'Thank you. We will confirm your zone and the next steps within one business day.';

      form.hidden = true;
      confirmation.hidden = false;
      confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Apply for a spot';
      alert('Something went wrong submitting your application. Please try again or call/email us directly.');
    }
  });
}

renderSlotGrid();
populateCategorySelect();
populateZoneSelect('');
renderFaq();
setupForm();
