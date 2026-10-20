import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {BookingState} from '../../services/booking-state';

@Component({
  selector: 'app-coupon-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (state.isCouponModalOpen()) {
      <div
        class="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans animate-fade-in"
        (click)="closeModal()">
        <div 
          class="bg-white text-[#1b1b1b] rounded-t-[30px] sm:rounded-[30px] max-w-md w-full result-card-shadow overflow-hidden animate-slide-up"
          (click)="$event.stopPropagation()"
        >
          <!-- Pastel Peach-Pink-Lavender Offcanvas Header (Matches Date Offcanvas Theme) -->
          <div class="px-5 pt-3.5 pb-4 bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] relative overflow-hidden">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)] pointer-events-none"></div>

            <!-- Top Drag Pill on Mobile -->
            <div class="relative z-10 w-11 h-1.5 bg-slate-400/40 rounded-full mx-auto mb-2.5 sm:hidden"></div>

            <div class="relative z-10 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                  [class]="state.activeBookingMode() === 'car' || state.searchCategory() === 'car'
                    ? 'bg-[#e0e7ff] text-[#4338ca]'
                    : state.searchCategory() === 'hotel'
                      ? 'bg-[#e0f2fe] text-[#0284c7]'
                      : state.activeBookingMode() === 'transport' || state.searchCategory() === 'transport'
                        ? 'bg-[#fae8ff] text-[#a21caf]'
                        : 'bg-[#ffe4e6] text-[#be123c]'">
                  <mat-icon class="text-[22px] leading-none">local_offer</mat-icon>
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <h3 class="text-[16px] font-extrabold text-slate-900 leading-tight">
                      Special Offers &amp; Coupons
                    </h3>
                    <span
                      [class]="state.activeBookingMode() === 'car' || state.searchCategory() === 'car'
                        ? 'bg-indigo-100/80 text-[#4338ca]'
                        : state.searchCategory() === 'hotel'
                          ? 'bg-sky-100/80 text-[#0284c7]'
                          : state.activeBookingMode() === 'transport' || state.searchCategory() === 'transport'
                            ? 'bg-fuchsia-100/80 text-[#a21caf]'
                            : 'bg-rose-100/80 text-[#be123c]'"
                      class="px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wide">
                      Verified
                    </span>
                  </div>
                  <p class="text-[12px] text-slate-600 font-medium mt-0.5">
                    Save extra on your trip
                  </p>
                </div>
              </div>

              <button 
                type="button" 
                (click)="closeModal()"
                aria-label="Close coupons"
                class="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              >
                <mat-icon class="text-[18px] leading-none">close</mat-icon>
              </button>
            </div>
          </div>

          <!-- Coupon Input (Borderless) -->
          <div class="px-5 pt-4 pb-2 bg-white">
            <div class="flex gap-2">
              <input 
                type="text" 
                [value]="manualCode()" 
                (input)="manualCode.set($any($event.target).value.toUpperCase())"
                placeholder="Enter promo code" 
                class="flex-1 uppercase px-4 py-2.5 rounded-2xl bg-[#f4f6f9] text-slate-800 placeholder-slate-400 border-0 focus:outline-none text-sm font-bold"
              />
              <button 
                type="button" 
                (click)="applyManualCode()"
                [disabled]="!manualCode().trim()"
                [class]="state.activeBookingMode() === 'car' || state.searchCategory() === 'car'
                  ? 'bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea]'
                  : state.searchCategory() === 'hotel'
                    ? 'bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]'
                    : state.activeBookingMode() === 'transport' || state.searchCategory() === 'transport'
                      ? 'bg-gradient-to-r from-[#7e22ce] via-[#a21caf] to-[#db2777]'
                      : 'bg-gradient-to-r from-[#e11d48] via-[#f43f5e] to-[#fb923c]'"
                class="px-5 py-2.5 rounded-2xl text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
              >
                Apply
              </button>
            </div>
            @if (errorMessage()) {
              <p class="text-rose-500 text-xs mt-2 flex items-center gap-1 font-medium">
                <mat-icon class="text-sm">error</mat-icon>
                {{ errorMessage() }}
              </p>
            }
          </div>

          <!-- Available Coupons List -->
          <div class="p-5 max-h-96 overflow-y-auto space-y-2.5 custom-scrollbar">
            <h4 class="text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">Available Offers</h4>
            
            @for (coupon of availableCoupons; track coupon.code) {
              <div 
                class="rounded-2xl p-4 transition-all relative overflow-hidden bg-[#f4f6f9] hover:bg-[#eef2f6] text-slate-800"
                [class.ring-2]="state.appliedCoupon()?.code === coupon.code"
                [class.ring-[#10b981]]="state.appliedCoupon()?.code === coupon.code"
              >
                <div class="flex items-start justify-between gap-3">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span
                        class="inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold tracking-wider"
                        [class]="state.activeBookingMode() === 'car' || state.searchCategory() === 'car'
                          ? 'bg-[#e0e7ff] text-[#4338ca]'
                          : state.searchCategory() === 'hotel'
                            ? 'bg-[#e0f2fe] text-[#0284c7]'
                            : state.activeBookingMode() === 'transport' || state.searchCategory() === 'transport'
                              ? 'bg-[#fae8ff] text-[#a21caf]'
                              : 'bg-[#ffe4e6] text-[#e11d48]'">
                        {{ coupon.code }}
                      </span>
                      <span class="text-xs text-slate-500 font-semibold">{{ coupon.badge }}</span>
                    </div>
                    <p class="text-sm font-bold text-slate-900">{{ coupon.title }}</p>
                    <p class="text-xs text-slate-600">{{ coupon.desc }}</p>
                  </div>

                  <button 
                    type="button" 
                    (click)="applyCoupon(coupon)"
                    class="shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
                    [class]="state.appliedCoupon()?.code === coupon.code
                      ? 'bg-[#10b981] text-white cursor-default'
                      : state.activeBookingMode() === 'car' || state.searchCategory() === 'car'
                        ? 'bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea] text-white shadow-xs'
                        : state.searchCategory() === 'hotel'
                          ? 'bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] text-white shadow-xs'
                          : state.activeBookingMode() === 'transport' || state.searchCategory() === 'transport'
                            ? 'bg-gradient-to-r from-[#7e22ce] via-[#a21caf] to-[#db2777] text-white shadow-xs'
                            : 'bg-gradient-to-r from-[#e11d48] via-[#f43f5e] to-[#fb923c] text-white shadow-xs'"
                  >
                    {{ state.appliedCoupon()?.code === coupon.code ? 'Applied' : 'Apply' }}
                  </button>
                </div>
              </div>
            }
          </div>

          <!-- Footer -->
          <div class="px-5 pb-4 pt-1 bg-white flex justify-end">
            <button 
              type="button" 
              (click)="closeModal()"
              class="px-5 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer rounded-xl bg-[#f4f6f9] hover:bg-slate-200/70"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(216, 78, 85, 0.3);
      border-radius: 4px;
    }
  `]
})
export class CouponModal {
  readonly state = inject(BookingState);
  readonly manualCode = signal('');
  readonly errorMessage = signal('');

  readonly defaultCoupons = [
    {
      code: 'FIRST50',
      title: 'Flat ₹50 Instant Discount',
      desc: 'Valid on your first booking with us. Min fare ₹300.',
      badge: 'POPULAR',
      discount: 50,
    },
    {
      code: 'SUPER200',
      title: 'Save up to ₹200 on Luxury Coaches',
      desc: 'Applicable on BharatBenz, Volvo & Scania buses.',
      badge: 'SPECIAL',
      discount: 150,
    },
    {
      code: 'WEEKEND100',
      title: '₹100 Off on Weekend Getaways',
      desc: 'Valid on Friday, Saturday & Sunday journeys.',
      badge: 'WEEKEND',
      discount: 100,
    },
    {
      code: 'RETURN25',
      title: 'Flat ₹75 Off on Round Trips',
      desc: 'Book return journey together and save more.',
      badge: 'SAVER',
      discount: 75,
    },
  ];

  get availableCoupons() {
    const dbList = this.state.availableCoupons();
    return dbList.length > 0 ? dbList : this.defaultCoupons;
  }

  closeModal(): void {
    this.errorMessage.set('');
    this.manualCode.set('');
    this.state.isCouponModalOpen.set(false);
  }

  applyCoupon(coupon: {code: string; title: string; discount: number}): void {
    this.state.applyCoupon(coupon);
    this.closeModal();
  }

  applyManualCode(): void {
    const code = this.manualCode().trim();
    if (!code) return;
    const found = this.availableCoupons.find((c) => c.code.toLowerCase() === code.toLowerCase());
    if (found) {
      this.applyCoupon(found);
    } else {
      this.state.applyCoupon(code);
    }
  }
}

