export const initialProducts = [];

export const defaultGuestUser = {
  id: 'guest@ganachly.com',
  code: 'GUEST-PATRON',
  name: 'Guest Patron',
  title: 'Delhi NCR Connoisseur',
  role: 'customer',
  avatar: '🍫',
  badgeClass: 'bg-secondary text-espresso-deep',
  phone: '',
  zone: 'Faridabad',
  address: '',
  description: 'Storefront Guest'
};

export const initialPersonas = [
  {
    id: 'hardikkush987@gmail.com',
    code: 'ADMIN-ATELIER-01',
    name: 'Hardik',
    title: 'Master Patissier & Founder',
    role: 'admin',
    avatar: '👨‍🍳',
    badgeClass: 'bg-primary text-espresso-deep',
    phone: '+91 98110 00192',
    zone: 'Faridabad Central Kitchen',
    description: 'Full master access: Live Batches, Dispatch Console, Catalog Manager & Couverture Stocks Vault.'
  }
];

export const initialOrders = [];

export const initialInventory = [];

export const initialBatches = [];

export const initialDeliveryZones = [
  { id: 'fbd', name: 'Faridabad (All Sectors & Neharpar)', fee: 0, tag: 'Free Express Delivery', time: '40–60 mins' },
  { id: 'ggn', name: 'Gurugram (Cyber City, Golf Course, Sohna Rd)', fee: 120, tag: 'Express Courier', time: '60–85 mins' },
  { id: 'sdel', name: 'South & Central Delhi (GK, Defence Colony, CP)', fee: 100, tag: 'Evening Runner', time: '50–70 mins' },
  { id: 'noida', name: 'Noida & Greater Noida (Sec 18 to 137)', fee: 110, tag: 'Express Courier', time: '55–75 mins' },
  { id: 'wdel', name: 'West & North Delhi (Punjabi Bagh, Rohini)', fee: 120, tag: 'Late Night Express', time: '70–90 mins' },
  { id: 'gzb', name: 'Ghaziabad & Indirapuram', fee: 120, tag: 'Evening Runner', time: '65–85 mins' }
];
