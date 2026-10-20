import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {BookingState} from '../../services/booking-state';

@Component({
  selector: 'app-checkout-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (state.isCheckoutOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
        
        <div class="bg-white text-[#1f2937] rounded-[30px] max-w-lg w-full shadow-[0_24px_60px_rgba(15,23,42,0.22)] border border-slate-100 overflow-hidden animate-slide-up my-4">
          
          <!-- Home Page Pastel Peach-Pink-Lavender Modal Header -->
          <div class="p-4 border-b border-white/80 flex items-center justify-between bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] relative overflow-hidden">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)] pointer-events-none"></div>
            <div class="relative z-10">
              <div
                class="flex items-center space-x-1.5 text-[10px] font-normal uppercase tracking-wider"
                [class.text-[#4338ca]]="state.activeBookingMode() === 'car'"
                [class.text-[#e11d48]]="state.activeBookingMode() !== 'car'">
                <span>Checkout</span>
                <span class="text-slate-400">·</span>
                <span class="text-slate-700 font-mono">Lock: {{ formatCountdown(state.holdCountdownSeconds()) }}</span>
              </div>
              <h3 class="text-sm sm:text-base font-normal text-slate-900 mt-0.5">Passenger Details &amp; Payment</h3>
            </div>

            <button
              type="button"
              (click)="state.isCheckoutOpen.set(false)"
              class="relative z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center transition-colors cursor-pointer border border-slate-200/80">
              <mat-icon class="text-sm">close</mat-icon>
            </button>
          </div>

          <div class="p-3.5 sm:p-4 space-y-3.5 max-h-[72vh] overflow-y-auto">
            
            <!-- Boarding & Dropping Points Selected Summary -->
            <div class="bg-slate-50 p-3 rounded-[16px] border border-slate-200/80 space-y-2">
              <div class="flex items-center justify-between pb-1 border-b border-slate-200 text-xs">
                <span class="text-[10px] font-semibold text-slate-700 uppercase tracking-wider flex items-center space-x-1">
                  <mat-icon
                    class="text-xs"
                    [class.text-[#4338ca]]="state.activeBookingMode() === 'car'"
                    [class.text-[#e11d48]]="state.activeBookingMode() !== 'car'">place</mat-icon>
                  <span>Selected Pickup & Drop Points</span>
                </span>
                <button
                  type="button"
                  (click)="state.goToBoardingDropping(); state.isCheckoutOpen.set(false)"
                  [class.text-[#4338ca]]="state.activeBookingMode() === 'car'"
                  [class.text-[#e11d48]]="state.activeBookingMode() !== 'car'"
                  class="text-[11px] font-medium cursor-pointer underline flex items-center space-x-0.5">
                  <mat-icon class="text-xs">edit_location_alt</mat-icon>
                  <span>Change Stops</span>
                </button>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <!-- Boarding Preview -->
                <div class="p-2 rounded-[12px] bg-white border border-slate-200">
                  <span class="text-[9px] uppercase font-bold text-[#047857] block">Boarding / Pickup</span>
                  <p class="font-medium text-slate-900 truncate mt-0.5">
                    {{ state.selectedBoardingPoint()?.location || 'Pickup not selected' }}
                  </p>
                  <p class="text-[11px] text-slate-500 font-mono mt-0.5">
                    Time: {{ state.selectedBoardingPoint()?.time || '--:--' }}
                  </p>
                </div>

                <!-- Dropping Preview -->
                <div class="p-2 rounded-[12px] bg-white border border-slate-200">
                  <span
                    class="text-[9px] uppercase font-bold block"
                    [class.text-[#4338ca]]="state.activeBookingMode() === 'car'"
                    [class.text-[#e11d48]]="state.activeBookingMode() !== 'car'">Dropping / Destination</span>
                  <p class="font-medium text-slate-900 truncate mt-0.5">
                    {{ state.selectedDroppingPoint()?.location || 'Drop not selected' }}
                  </p>
                  <p class="text-[11px] text-slate-500 font-mono mt-0.5">
                    Time: {{ state.selectedDroppingPoint()?.time || '--:--' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Passengers Information Form -->
            <div class="space-y-2">
              <h4 class="text-[11px] font-normal uppercase tracking-wider text-slate-700">
                Passengers ({{ state.passengers().length }})
              </h4>

              @for (p of state.passengers(); track p.seatId; let idx = $index) {
                <div class="p-2.5 rounded-[16px] border border-slate-200/80 bg-slate-50 space-y-1.5 text-slate-800">
                  <div class="flex items-center justify-between pb-1 border-b border-slate-200 text-xs">
                    <span
                      class="font-normal text-[11px]"
                      [class.text-[#4338ca]]="state.activeBookingMode() === 'car'"
                      [class.text-[#e11d48]]="state.activeBookingMode() !== 'car'">
                      Berth {{ p.seatNumber }} · ₹{{ p.fare }}
                    </span>
                    <span class="text-slate-400 text-[10px] font-normal">Passenger {{ idx + 1 }}</span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-12 gap-1.5 text-xs">
                    <div class="sm:col-span-6 space-y-0.5">
                      <label [for]="'p-name-' + idx" class="block text-[9px] font-normal text-slate-500 uppercase">Full Name</label>
                      <input
                        [id]="'p-name-' + idx"
                        type="text"
                        aria-label="Passenger Full Name"
                        [value]="p.name"
                        (input)="onNameInput(idx, $event)"
                        placeholder="e.g. Rahul Sharma"
                        class="w-full bg-white border border-slate-200 rounded-[10px] px-2 py-1 text-xs font-normal text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" />
                    </div>

                    <div class="sm:col-span-3 space-y-0.5">
                      <label [for]="'p-age-' + idx" class="block text-[9px] font-normal text-slate-500 uppercase">Age</label>
                      <input
                        [id]="'p-age-' + idx"
                        type="number"
                        aria-label="Passenger Age"
                        min="1"
                        max="120"
                        [value]="p.age"
                        (input)="onAgeInput(idx, $event)"
                        class="w-full bg-white border border-slate-200 rounded-[10px] px-2 py-1 text-xs font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500" />
                    </div>

                    <div class="sm:col-span-3 space-y-0.5">
                      <label [for]="'p-gender-' + idx" class="block text-[9px] font-normal text-slate-500 uppercase">Gender</label>
                      <select
                        [id]="'p-gender-' + idx"
                        aria-label="Passenger Gender"
                        (change)="onGenderChange(idx, $event)"
                        class="w-full bg-white border border-slate-200 rounded-[10px] px-2 py-1 text-xs font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer">
                        <option value="male" [selected]="p.gender === 'male'">Male</option>
                        <option value="female" [selected]="p.gender === 'female'">Female</option>
                        <option value="other" [selected]="p.gender === 'other'">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              }
            </div>

            <!-- Payment Method Selection -->
            <div class="space-y-1.5">
              <h4 class="text-[11px] font-normal uppercase tracking-wider text-slate-700">
                Payment Option
              </h4>

              <div class="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  (click)="selectedPaymentMethod.set('UPI')"
                  [class]="selectedPaymentMethod() === 'UPI'
                    ? (state.activeBookingMode() === 'car'
                        ? 'bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7] text-white border-transparent'
                        : 'bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316] text-white border-transparent')
                    : 'bg-slate-50 text-slate-700 border-slate-200'"
                  class="p-2 rounded-[14px] border text-center transition-all cursor-pointer active:scale-95">
                  <mat-icon class="text-base">qr_code_2</mat-icon>
                  <div class="text-[11px] font-normal">UPI</div>
                </button>

                <button
                  type="button"
                  (click)="selectedPaymentMethod.set('Card')"
                  [class]="selectedPaymentMethod() === 'Card'
                    ? (state.activeBookingMode() === 'car'
                        ? 'bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7] text-white border-transparent'
                        : 'bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316] text-white border-transparent')
                    : 'bg-slate-50 text-slate-700 border-slate-200'"
                  class="p-2 rounded-[14px] border text-center transition-all cursor-pointer active:scale-95">
                  <mat-icon class="text-base">credit_card</mat-icon>
                  <div class="text-[11px] font-normal">Card</div>
                </button>

                <button
                  type="button"
                  (click)="selectedPaymentMethod.set('NetBanking')"
                  [class]="selectedPaymentMethod() === 'NetBanking'
                    ? (state.activeBookingMode() === 'car'
                        ? 'bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7] text-white border-transparent'
                        : 'bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316] text-white border-transparent')
                    : 'bg-slate-50 text-slate-700 border-slate-200'"
                  class="p-2 rounded-[14px] border text-center transition-all cursor-pointer active:scale-95">
                  <mat-icon class="text-base">account_balance</mat-icon>
                  <div class="text-[11px] font-normal">NetBanking</div>
                </button>
              </div>
            </div>

            <!-- Fare Breakdown Summary with Coupon integration -->
            <div class="bg-slate-50 rounded-[16px] p-2.5 border border-slate-200/80 space-y-1.5 text-xs text-slate-800">
              <div class="flex justify-between items-center text-slate-600 text-[11px]">
                <span>Base Fare ({{ state.selectedSeats().length }} Berths)</span>
                <span class="font-normal text-slate-900 tabular-nums">₹{{ state.totalBasePrice() }}</span>
              </div>
              <div class="flex justify-between items-center text-slate-600 text-[11px]">
                <span>GST Tax (5%)</span>
                <span class="font-normal text-slate-900 tabular-nums">₹{{ state.gstTax() }}</span>
              </div>

              <!-- Coupon Row -->
              @if (state.appliedCoupon(); as c) {
                <div class="flex justify-between items-center text-white bg-gradient-to-r from-[#10b981] to-[#14b8a6] px-2.5 py-1.5 rounded-[12px] text-[11px] font-normal">
                  <div class="flex items-center space-x-1.5">
                    <mat-icon class="text-xs text-white">local_offer</mat-icon>
                    <span class="text-white font-normal">Coupon Applied ({{ c.code }})</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <span class="font-normal tabular-nums text-white">-₹{{ c.discount }}</span>
                    <button
                      type="button"
                      (click)="state.removeCoupon()"
                      class="text-[9px] text-white/90 underline font-normal cursor-pointer hover:text-white">
                      Remove
                    </button>
                  </div>
                </div>
              } @else {
                <div class="flex justify-between items-center pt-1 border-t border-slate-200 text-[11px]">
                  <span class="text-slate-600 font-normal">Have a coupon code?</span>
                  <button
                    type="button"
                    (click)="state.isCouponModalOpen.set(true)"
                    [class.text-[#4338ca]]="state.activeBookingMode() === 'car'"
                    [class.text-[#e11d48]]="state.activeBookingMode() !== 'car'"
                    class="font-normal flex items-center space-x-1 cursor-pointer">
                    <mat-icon class="text-xs">local_offer</mat-icon>
                    <span>Select Coupon</span>
                  </button>
                </div>
              }

              <div class="pt-1.5 border-t border-slate-200 flex justify-between items-center text-xs font-normal text-slate-900">
                <span>Total Amount:</span>
                <span
                  class="text-base font-normal tabular-nums"
                  [class.text-[#4338ca]]="state.activeBookingMode() === 'car'"
                  [class.text-[#e11d48]]="state.activeBookingMode() !== 'car'">₹{{ state.finalPayable() }}</span>
              </div>
            </div>

          </div>

          <!-- Modal Footer CTA -->
          <div class="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              (click)="state.isCheckoutOpen.set(false)"
              class="px-3.5 py-2 text-xs font-normal text-slate-600 hover:text-slate-900 transition-colors cursor-pointer rounded-[12px] hover:bg-slate-100">
              Back
            </button>

            <!-- Pay Button -->
            <button
              type="button"
              (click)="processPayment()"
              [disabled]="isProcessing()"
              [class]="state.activeBookingMode() === 'car'
                ? 'bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7] shadow-[0_6px_16px_rgba(99,102,241,0.28)]'
                : 'bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316] shadow-[0_6px_16px_rgba(244,63,94,0.28)]'"
              class="px-5 py-2 rounded-[14px] text-white font-normal text-xs flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50 active:scale-95">
              @if (isProcessing()) {
                <mat-icon class="text-xs animate-spin text-white">refresh</mat-icon>
                <span class="text-white font-normal">Processing...</span>
              } @else {
                <mat-icon class="text-xs text-white">lock</mat-icon>
                <span class="text-white font-normal">Pay ₹{{ state.finalPayable() }}</span>
              }
            </button>
          </div>

        </div>

      </div>
    }
  `,
})
export class CheckoutModal {
  readonly state = inject(BookingState);
  readonly selectedPaymentMethod = signal<'UPI' | 'Card' | 'NetBanking'>('UPI');
  readonly isProcessing = signal<boolean>(false);

  formatCountdown(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  onBoardingChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    const trip = this.state.selectedTrip();
    if (trip) {
      const bp = trip.boardingPoints.find((b) => b.id === val);
      if (bp) this.state.selectedBoardingPoint.set(bp);
    }
  }

  onDroppingChange(e: Event) {
    const val = (e.target as HTMLSelectElement).value;
    const trip = this.state.selectedTrip();
    if (trip) {
      const dp = trip.droppingPoints.find((d) => d.id === val);
      if (dp) this.state.selectedDroppingPoint.set(dp);
    }
  }

  onNameInput(idx: number, e: Event) {
    const name = (e.target as HTMLInputElement).value;
    this.state.passengers.update((list) => {
      const copy = [...list];
      if (copy[idx]) copy[idx] = { ...copy[idx], name };
      return copy;
    });
  }

  onAgeInput(idx: number, e: Event) {
    const age = parseInt((e.target as HTMLInputElement).value, 10) || 0;
    this.state.passengers.update((list) => {
      const copy = [...list];
      if (copy[idx]) copy[idx] = { ...copy[idx], age };
      return copy;
    });
  }

  onGenderChange(idx: number, e: Event) {
    const gender = (e.target as HTMLSelectElement).value as 'male' | 'female' | 'other';
    this.state.passengers.update((list) => {
      const copy = [...list];
      if (copy[idx]) copy[idx] = { ...copy[idx], gender };
      return copy;
    });
  }

  processPayment() {
    this.isProcessing.set(true);
    setTimeout(() => {
      this.state.confirmBooking();
      this.isProcessing.set(false);
    }, 1200);
  }
}
