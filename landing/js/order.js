const API_BASE = window.INTIZOM_API_URL || 'http://localhost:3000/api';
const PRICE_PER_UNIT = 70000;

// Update price summary
const quantityEl = document.getElementById('quantity');
const totalPriceEl = document.getElementById('totalPrice');

function updatePrice() {
  const qty = parseInt(quantityEl?.value || '1', 10);
  if (totalPriceEl) {
    totalPriceEl.textContent = `${(qty * PRICE_PER_UNIT).toLocaleString('uz-UZ')} so'm`;
  }
}

quantityEl?.addEventListener('change', updatePrice);
updatePrice();

// Validation helpers
function showError(id, msg) {
  const el = document.getElementById(id);
  const input = document.getElementById(id.replace('err-', ''));
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
  if (input) input.classList.add('error');
}

function clearError(id) {
  const el = document.getElementById(id);
  const input = document.getElementById(id.replace('err-', ''));
  if (el) el.classList.add('hidden');
  if (input) input.classList.remove('error');
}

function clearAllErrors() {
  ['err-name', 'err-phone', 'err-region', 'err-address'].forEach(clearError);
  const formError = document.getElementById('formError');
  if (formError) formError.classList.add('hidden');
}

function validatePhone(val) {
  return /^\+998[0-9]{9}$/.test(val.replace(/\s/g, ''));
}

function validate(data) {
  let valid = true;
  if (!data.customerName.trim()) { showError('err-name', 'Ism va familiyani kiriting'); valid = false; }
  if (!data.customerPhone.trim()) { showError('err-phone', '+998 formatida kiriting'); valid = false; }
  else if (!validatePhone(data.customerPhone)) { showError('err-phone', '+998 formatida kiriting (masalan: +998901234567)'); valid = false; }
  if (!data.region.trim()) { showError('err-region', 'Shahar yoki tumanni kiriting'); valid = false; }
  if (!data.address.trim()) { showError('err-address', 'To\'liq manzilni kiriting'); valid = false; }
  return valid;
}

// Phone format helper
const phoneInput = document.getElementById('customerPhone');
if (phoneInput) {
  phoneInput.addEventListener('input', () => {
    let v = phoneInput.value.replace(/[^\d+]/g, '');
    if (v && !v.startsWith('+')) v = '+' + v;
    phoneInput.value = v;
  });
}

// Form submit
const form = document.getElementById('orderForm');
const submitBtn = document.getElementById('submitBtn');
const submitText = document.getElementById('submitText');
const submitSpinner = document.getElementById('submitSpinner');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAllErrors();

  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'naqd';
  const data = {
    customerName: document.getElementById('customerName')?.value || '',
    customerPhone: (document.getElementById('customerPhone')?.value || '').replace(/\s/g, ''),
    region: document.getElementById('region')?.value || '',
    address: document.getElementById('address')?.value || '',
    quantity: parseInt(quantityEl?.value || '1', 10),
    paymentMethod,
    note: document.getElementById('note')?.value || '',
  };

  if (!validate(data)) return;

  // Loading state
  submitBtn.disabled = true;
  submitText.textContent = 'Yuborilmoqda...';
  submitSpinner.classList.remove('hidden');

  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Server xatosi');
    }

    const result = await res.json();
    if (result.orderNumber) {
      sessionStorage.setItem('orderNumber', result.orderNumber);
    }
    window.location.href = 'success.html';
  } catch (err) {
    const formError = document.getElementById('formError');
    if (formError) {
      formError.textContent = `Xatolik: ${err.message}. Iltimos qayta urinib ko'ring.`;
      formError.classList.remove('hidden');
    }
    submitBtn.disabled = false;
    submitText.textContent = 'Buyurtma berish';
    submitSpinner.classList.add('hidden');
  }
});
