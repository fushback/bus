import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {BookingState} from '../../services/booking-state';
import {City} from '../../models/bus-booking.models';

@Component({
  selector: 'app-search-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 relative z-20 space-y-2">
      
      <!-- Unified Compact Search Card (Matches Car Page Controls Exactly) -->
      <div class="bg-white rounded-2xl p-2.5 sm:p-3 border border-slate-200/80 space-y-2 relative z-20 text-slate-800">
        <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          
          <!-- From City Input / Dropdown -->
          <div class="md:col-span-4 bg-slate-50/80 hover:bg-slate-100/80 p-1.5 sm:p-2 rounded-xl border border-slate-200 flex items-center space-x-2 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 focus-within:bg-white">
            <mat-icon class="text-blue-600 text-base leading-none">location_on</mat-icon>
            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-0.5">
                <label for="bus-from-select" class="text-[9px] font-normal text-slate-500 uppercase tracking-wider block leading-none">Leaving From</label>
                <button
                  type="button"
                  (click)="state.detectCurrentLocation()"
                  [title]="state.locationDetected() ? 'Current Location Active' : 'Detect Current Location'"
                  class="text-[9px] text-blue-600 hover:underline flex items-center space-x-0.5 font-normal cursor-pointer">
                  <mat-icon class="text-[10px]" [class.animate-spin]="state.isLocating()">my_location</mat-icon>
                  <span>{{ state.locationDetected() ? 'Current' : 'Detect' }}</span>
                </button>
              </div>
              <select
                id="bus-from-select"
                aria-label="Leaving From"
                (change)="onSourceChange($event)"
                class="w-full bg-transparent border-0 p-0 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none cursor-pointer truncate">
                @for (city of state.cities(); track city.id) {
                  <option [value]="city.id" [selected]="city.id === state.sourceCity().id">
                    {{ city.name }}, {{ city.state }}
                  </option>
                }
              </select>
            </div>
          </div>

          <!-- Swap Route Button -->
          <div class="hidden md:flex md:col-span-1 justify-center">
            <button
              type="button"
              (click)="state.swapCities()"
              title="Swap From and To"
              class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white border border-slate-200 hover:border-slate-300 flex items-center justify-center text-slate-600 hover:text-blue-600 active:scale-90 transition-all cursor-pointer group">
              <mat-icon class="text-base group-hover:rotate-180 transition-transform duration-300">swap_horiz</mat-icon>
            </button>
          </div>

          <!-- To City Input / Dropdown -->
          <div class="md:col-span-4 bg-slate-50/80 hover:bg-slate-100/80 p-1.5 sm:p-2 rounded-xl border border-slate-200 flex items-center space-x-2 transition-all focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 focus-within:bg-white">
            <mat-icon class="text-rose-500 text-base leading-none">flag</mat-icon>
            <div class="flex-1 min-w-0">
              <label for="bus-to-select" class="text-[9px] font-normal text-slate-500 uppercase tracking-wider block leading-none mb-0.5">Going To</label>
              <select
                id="bus-to-select"
                aria-label="Going To"
                (change)="onDestChange($event)"
                class="w-full bg-transparent border-0 p-0 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none cursor-pointer truncate">
                @for (city of state.cities(); track city.id) {
                  <option [value]="city.id" [selected]="city.id === state.destinationCity().id">
                    {{ city.name }}, {{ city.state }}
                  </option>
                }
              </select>
            </div>
          </div>

          <!-- Date & Search Action -->
          <div class="md:col-span-3 flex items-center space-x-1.5">
            <div class="flex-1 bg-slate-50/80 p-1.5 sm:p-2 rounded-xl border border-slate-200 flex items-center space-x-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 focus-within:bg-white transition-all">
              <mat-icon class="text-amber-500 text-sm leading-none">calendar_today</mat-icon>
              <div class="flex-1 min-w-0">
                <label for="bus-date-input" class="text-[9px] font-normal text-slate-500 uppercase tracking-wider block leading-none mb-0.5">Date</label>
                <input
                  id="bus-date-input"
                  type="date"
                  aria-label="Travel Date"
                  [value]="state.travelDate()"
                  (change)="onDateChange($event)"
                  class="w-full bg-transparent border-0 p-0 text-xs font-normal text-slate-800 focus:outline-none cursor-pointer" />
              </div>
            </div>

            <!-- Search Buses Button -->
            <button
              type="button"
              (click)="searchBuses()"
              class="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-normal px-3 py-2 rounded-xl transition-all flex items-center justify-center cursor-pointer shrink-0 h-9 sm:h-10"
              title="Search Buses">
              <mat-icon class="text-sm text-white">search</mat-icon>
            </button>
          </div>

        </div>

        <!-- Clean Routes & Coupon Trigger Strip -->
        <div class="pt-1.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-600">
          
          <div class="flex items-center space-x-1.5 overflow-x-auto py-0.5">
            <span class="text-[10px] font-normal text-slate-500 uppercase tracking-wider shrink-0">Popular:</span>
            @for (dest of state.popularRoutesFromLocation(); track dest.id) {
              <button
                type="button"
                (click)="setRouteTo(dest)"
                class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-normal shrink-0 transition-colors cursor-pointer text-[11px] flex items-center space-x-1">
                <span>{{ state.sourceCity().code }}</span>
                <span class="text-slate-400">→</span>
                <span>{{ dest.code }}</span>
              </button>
            }
          </div>

          <!-- Coupon Popup Trigger Button -->
          <button
            type="button"
            (click)="state.isCouponModalOpen.set(true)"
            class="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-normal border border-amber-200 transition-all cursor-pointer active:scale-95 text-[11px] shrink-0">
            <mat-icon class="text-xs text-amber-600">local_offer</mat-icon>
            <span>Offers & Coupons</span>
            @if (state.appliedCoupon(); as c) {
              <span class="bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-normal">
                -₹{{ c.discount }}
              </span>
            }
          </button>

        </div>
      </div>

    </div>
  `,
})
export class SearchBar {
  readonly state = inject(BookingState);

  onSourceChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    const city = this.state.cities().find((c) => c.id === val);
    if (city) {
      this.state.sourceCity.set(city);
      this.state.searchTrips();
    }
  }

  onDestChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    const city = this.state.cities().find((c) => c.id === val);
    if (city) {
      this.state.destinationCity.set(city);
      this.state.searchTrips();
    }
  }

  onDateChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    if (val) {
      this.state.travelDate.set(val);
      this.state.searchTrips();
    }
  }

  setRouteTo(dest: City) {
    this.state.destinationCity.set(dest);
    this.state.searchTrips();
    this.state.showToast(`Route selected: ${this.state.sourceCity().name} → ${dest.name}`, 'info');
  }

  setRoute(srcId: string, dstId: string) {
    const src = this.state.cities().find((c) => c.id === srcId);
    const dst = this.state.cities().find((c) => c.id === dstId);
    if (src && dst) {
      this.state.sourceCity.set(src);
      this.state.destinationCity.set(dst);
      this.state.searchTrips();
    }
  }

  searchBuses() {
    this.state.searchTrips();
    this.state.showToast('Updated bus schedules for your journey', 'info');
  }
}
