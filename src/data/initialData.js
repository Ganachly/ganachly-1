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
    code: 'ADMIN-GANACHLY-01',
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
  { id: 'dine_in', name: 'Dine-In', fee: 0, tag: 'Table Service', time: '15–20 mins' },
  { id: 'takeaway', name: 'Takeaway', fee: 0, tag: 'Self Pickup', time: '10–15 mins' }
];

export const initialWhispers = [
  {
    id: 'w-1',
    name: 'Aanya Sharma',
    location: 'Faridabad',
    rating: 5,
    comment: 'The 70.5% Belgian couverture brownie melted in my mouth. Truly 100% eggless perfection!',
    date: 'Just now'
  },
  {
    id: 'w-2',
    name: 'Kabir Verma',
    location: 'Gurugram',
    rating: 5,
    comment: 'Ordered for our evening gathering. The brookies were warm, fudgy, and delightfully decadent.',
    date: 'Yesterday'
  },
  {
    id: 'w-3',
    name: 'Rhea Sengupta',
    location: 'South Delhi',
    rating: 5,
    comment: 'The lotus biscoff brownie is out of this world! You can taste the rich, authentic Callebaut chocolate in every bite.',
    date: '2 days ago'
  }
];
