export function renderStorefrontFooter() {
  return `
    <footer class="w-full bg-espresso-panel mt-space-3xl border-t border-primary/15">
      <div class="max-w-[1280px] mx-auto px-margin md:px-margin-desktop py-space-2xl">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-xl">
          
          <div class="space-y-space-md">
            <div class="flex items-center gap-space-sm">
              <span class="font-brittany text-3xl sm:text-4xl text-primary tracking-normal leading-normal pb-1 inline-block select-none">Ganachly</span>
            </div>
            <p class="font-editorial-quote text-[16px] leading-relaxed text-on-surface-variant italic">
              Faridabad's luxury patisserie. Things baked with love with pure 70% dark Belgian couverture. 100% eggless, zero preservatives.
            </p>
            <div class="flex items-center gap-space-xs text-gold-cream">
              <span class="material-symbols-outlined text-[16px] text-primary">verified</span>
              <span class="font-body-sm text-body-sm tracking-wide">FSSAI Central Lic: 13324999000015</span>
            </div>
          </div>

          <div class="space-y-space-md">
            <h4 class="font-headline-sm text-headline-sm text-primary tracking-wide uppercase">Fresh Menu</h4>
            <ul class="space-y-space-xs font-body-md text-body-md text-on-surface-variant">
              <li class="hover:text-gold-cream transition-colors"><a href="#/menu">Signature Fudgy Brownies</a></li>
              <li class="hover:text-gold-cream transition-colors"><a href="#/menu">The Brookie Collection</a></li>
              <li class="hover:text-gold-cream transition-colors"><a href="#/menu">Artisan Stuffed Cookies</a></li>
              <li class="hover:text-gold-cream transition-colors"><a href="#/menu">Velvet Ganache Spirals</a></li>
              <li class="hover:text-gold-cream transition-colors"><a href="#/menu">Rich Hot Chocolate Mix</a></li>
            </ul>
          </div>

          <div class="space-y-space-md">
            <h4 class="font-headline-sm text-headline-sm text-primary tracking-wide uppercase">Patisserie & Gifting</h4>
            <ul class="space-y-space-xs font-body-md text-body-md text-on-surface-variant">
              <li class="hover:text-gold-cream transition-colors"><a href="#/story">Founder Hardik's Story</a></li>
              <li class="hover:text-gold-cream transition-colors"><a href="#/gifting">Bespoke Corporate Hampers</a></li>
              <li class="hover:text-gold-cream transition-colors"><a href="#/gifting">Broken Bar Sleeve Boxes</a></li>
              <li class="hover:text-gold-cream transition-colors"><a href="#/admin">Admin Backoffice</a></li>
            </ul>
          </div>

          <div class="space-y-space-md">
            <h4 class="font-headline-sm text-headline-sm text-primary tracking-wide uppercase">Direct WhatsApp Order</h4>
            <p class="font-body-md text-body-md text-on-surface-variant">
              Connect directly with the head baker for customized date night assortments and event orders.
            </p>
            <a class="inline-flex items-center gap-space-xs bg-whatsapp-green text-surface-container-lowest font-label-action text-label-action px-space-md py-space-sm rounded-xl hover:opacity-95 transition-opacity" 
              href="https://wa.me/919810757880?text=Hello%20Chef%20Hardik,%20I%20would%20like%20to%20order%20from%20Ganachly" rel="noopener noreferrer" target="_blank">
              <span class="material-symbols-outlined text-[20px]">chat</span>
              WhatsApp Quick Order
            </a>
            <div class="pt-space-xs text-on-surface-variant font-body-sm text-body-sm">
              <p class="tracking-wider">Instagram: <span class="text-gold-cream">@ganachly</span></p>
              <p class="tracking-wider">Sector 77, Faridabad, Haryana</p>
            </div>
          </div>

        </div>

        <div class="mt-space-2xl pt-space-md border-t border-primary/10 flex flex-col md:flex-row items-center justify-between gap-space-sm text-on-surface-variant font-body-sm text-body-sm">
          <p>© 2025 Ganachly Luxury Patisserie. All rights reserved. Handcrafted fresh confectionery.</p>
          <p class="font-editorial-eyebrow text-editorial-eyebrow text-gold-cream">
            THINGS BAKED WITH LOVE • 100% EGGLESS • PURE COUVERTURE
          </p>
        </div>
      </div>
    </footer>
  `;
}
