import giftingHtml from './templates/gifting.html?raw';
import { store } from '../state/store.js';
import { showToast } from '../components/toast.js';

export function renderGiftingPage() {
  return giftingHtml;
}

export function attachGiftingPageEvents() {
  const container = document.querySelector('main');
  if (!container) return;

  container.querySelectorAll('a[data-path]').forEach(link => {
    const path = link.getAttribute('data-path');
    if (path === 'menu') link.href = '#/menu';
    else if (path === 'our-story') link.href = '#/story';
    else if (path === 'gifting-and-bulk') link.href = '#/gifting';
    else if (path === 'cart-and-checkout') link.href = '#/menu';
  });

  // Hamper quote selection
  window.prefillInquiry = function(collectionName) {
    const formSection = document.getElementById('bulkOrderForm') || document.getElementById('inquiryForm');
    const noteArea = document.getElementById('flavorPreferences') || document.getElementById('specialRequests');
    if (noteArea) {
      noteArea.value = `Selected Collection Tier: ${collectionName}. Requesting personalized sleeve band and sample box.`;
      noteArea.focus();
    }
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
      formSection.classList.add('ring-2', 'ring-primary');
      setTimeout(() => formSection.classList.remove('ring-2', 'ring-primary'), 2000);
    }
  };

  // Define handleGiftingSubmit globally so onsubmit="handleGiftingSubmit(event)" in gifting.html works
  window.handleGiftingSubmit = async function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const name = document.getElementById('fullName')?.value?.trim() || 'Valued Client';
    const company = document.getElementById('companyOccasion')?.value?.trim() || 'Corporate / Event';
    const phone = document.getElementById('whatsappNumber')?.value?.trim() || '';
    const qty = document.getElementById('boxQuantity')?.value || '25+';
    const date = document.getElementById('deliveryDate')?.value || 'Upcoming Event';
    const location = document.getElementById('deliveryLocations')?.value?.trim() || 'Faridabad / NCR';
    const notes = document.getElementById('flavorPreferences')?.value?.trim() || document.getElementById('specialRequests')?.value?.trim() || 'Bespoke corporate hampers';

    // Persist gifting request to local state & Firebase Cloud Firestore
    const giftingRequest = {
      id: `GIFT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      fullName: name,
      companyOccasion: company,
      whatsappNumber: phone,
      boxQuantity: qty,
      deliveryDate: date,
      deliveryLocations: location,
      flavorPreferences: notes,
      status: 'New',
      createdAt: Date.now(),
      submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
    };

    try {
      await store.addGiftingRequest(giftingRequest);
    } catch (err) {
      console.warn('Error saving gifting request to store:', err);
    }

    const successBox = document.getElementById('formSuccessMessage');
    if (successBox) {
      successBox.classList.remove('hidden');
    }

    showToast('Corporate Hamper Inquiry Saved & Logged! Opening WhatsApp...', 'verified', 'Bespoke Order Request');
    
    const textMessage = `*Ganachly Bulk Gifting Inquiry*\n\n` +
      `• *Name:* ${name}\n` +
      `• *Event / Company:* ${company}\n` +
      `• *Phone:* ${phone}\n` +
      `• *Est. Quantity:* ${qty} Boxes\n` +
      `• *Required Date:* ${date}\n` +
      `• *Locations:* ${location}\n` +
      `• *Preferences:* ${notes}\n\n` +
      `Please share the catalogue and quotation.`;

    setTimeout(() => {
      window.open(`https://wa.me/919810757880?text=${encodeURIComponent(textMessage)}`, '_blank');
    }, 700);
  };

  // Bulk inquiry submit
  const form = document.getElementById('bulkOrderForm') || document.querySelector('form');
  if (form) {
    form.onsubmit = window.handleGiftingSubmit;
  }
}
