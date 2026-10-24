import giftingHtml from './templates/gifting.html?raw';
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
    else if (path === 'cart-and-checkout') {
      link.href = '#';
      link.onclick = (e) => {
        e.preventDefault();
        window.openCartDrawer();
      };
    }
  });

  // Hamper quote selection
  window.prefillInquiry = function(collectionName) {
    const formSection = document.getElementById('bulkOrderForm') || document.getElementById('inquiryForm');
    const noteArea = document.getElementById('flavorPreferences') || document.getElementById('specialRequests');
    if (noteArea) {
      noteArea.value = `Selected Collection Tier: ${collectionName}. Requesting personalized sleeve band and corporate sample box.`;
      noteArea.focus();
    }
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
      formSection.classList.add('ring-2', 'ring-primary');
      setTimeout(() => formSection.classList.remove('ring-2', 'ring-primary'), 2000);
    }
  };

  // Define handleGiftingSubmit globally so onsubmit="handleGiftingSubmit(event)" in gifting.html works
  window.handleGiftingSubmit = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const name = document.getElementById('fullName')?.value || 'Valued Client';
    const company = document.getElementById('companyOccasion')?.value || 'Corporate Gifting';
    const phone = document.getElementById('whatsappNumber')?.value || '';
    const qty = document.getElementById('boxQuantity')?.value || '25+';
    const date = document.getElementById('deliveryDate')?.value || 'Upcoming Event';
    const location = document.getElementById('deliveryLocations')?.value || 'Delhi NCR';
    const notes = document.getElementById('flavorPreferences')?.value || document.getElementById('specialRequests')?.value || 'Bespoke corporate hampers';

    const successBox = document.getElementById('formSuccessMessage');
    if (successBox) {
      successBox.classList.remove('hidden');
    }

    showToast('Corporate Hamper Inquiry Received! Head Baker will contact you shortly.', 'verified', 'Bespoke Wax Seal Samples');
    
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
    }, 800);
  };

  // Bulk inquiry submit
  const form = document.getElementById('bulkOrderForm') || document.querySelector('form');
  if (form) {
    form.onsubmit = window.handleGiftingSubmit;
  }
}
