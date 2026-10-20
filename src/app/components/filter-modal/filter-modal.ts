import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {BookingState, TripFilter} from '../../services/booking-state';

@Component({
  selector: 'app-filter-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (state.isFilterModalOpen()) {
      <div class="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
        <div class="bg-white text-[#1f2937] rounded-[30px] max-w-sm sm:max-w-md w-full shadow-[0_24px_60px_rgba(15,23,42,0.22)] border border-slate-100 overflow-hidden animate-slide-up my-4">
          
          <!-- Home Page Pastel Peach-Pink-Lavender Header -->
          <div class="p-4 border-b border-white/80 flex items-center justify-between bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] relative overflow-hidden">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)] pointer-events-none"></div>
            <div class="relative z-10 flex items-center space-x-2.5">
              <div class="w-8 h-8 rounded-2xl bg-gradient-to-br from-[#e11d48] via-[#f43f5e] to-[#fb923c] text-white flex items-center justify-center font-normal shadow-xs">
                <mat-icon class="text-sm text-white">tune</mat-icon>
              </div>
              <div>
                <h3 class="text-sm font-normal text-slate-900 leading-none">Trip Filters</h3>
                <span class="text-[10px] text-slate-600 font-normal">
                  {{ state.filteredTrips().length }} buses available
                </span>
              </div>
            </div>

            <div class="relative z-10 flex items-center space-x-1.5">
              <button
                type="button"
                (click)="resetFilters()"
                class="text-xs text-[#be123c] bg-white/80 hover:bg-white font-normal px-2.5 py-1 rounded-full border border-white/90 transition-colors cursor-pointer">
                Reset
              </button>
              <button
                type="button"
                (click)="state.isFilterModalOpen.set(false)"
                class="w-7 h-7 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center transition-colors cursor-pointer border border-slate-200/80">
                <mat-icon class="text-sm">close</mat-icon>
              </button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-3.5 sm:p-4 space-y-3.5 max-h-[70vh] overflow-y-auto">
            
            <!-- AC / Non-AC Segment -->
            <div class="space-y-1">
              <span class="block text-[10px] font-normal uppercase tracking-wider text-slate-700">
                Air Conditioning
              </span>
              <div class="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-[14px] text-xs font-normal border border-slate-200/80">
                <button
                  type="button"
                  (click)="setAcFilter(null)"
                  [class]="state.filters().hasAc === null ? 'bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316] text-white' : 'text-slate-700'"
                  class="py-1.5 text-center rounded-[11px] transition-all cursor-pointer">
                  All
                </button>
                <button
                  type="button"
                  (click)="setAcFilter(true)"
                  [class]="state.filters().hasAc === true ? 'bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316] text-white' : 'text-slate-700'"
                  class="py-1.5 text-center rounded-[11px] transition-all cursor-pointer">
                  AC Only
                </button>
                <button
                  type="button"
                  (click)="setAcFilter(false)"
                  [class]="state.filters().hasAc === false ? 'bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316] text-white' : 'text-slate-700'"
                  class="py-1.5 text-center rounded-[11px] transition-all cursor-pointer">
                  Non-AC
                </button>
              </div>
            </div>

            <!-- Bus Coach Type -->
            <div class="space-y-1">
              <span class="block text-[10px] font-normal uppercase tracking-wider text-slate-700">
                Coach Type
              </span>
              <div class="grid grid-cols-3 gap-1 bg-slate-100 p-0.5 rounded-[14px] text-xs font-normal border border-slate-200/80">
                <button
                  type="button"
                  (click)="setBusType('all')"
                  [class]="state.filters().busType === 'all' ? 'bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316] text-white' : 'text-slate-700'"
                  class="py-1.5 text-center rounded-[11px] transition-all cursor-pointer">
                  All
                </button>
                <button
                  type="button"
                  (click)="setBusType('sleeper')"
                  [class]="state.filters().busType === 'sleeper' ? 'bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316] text-white' : 'text-slate-700'"
                  class="py-1.5 text-center rounded-[11px] transition-all cursor-pointer">
                  Sleeper
                </button>
                <button
                  type="button"
                  (click)="setBusType('seater')"
                  [class]="state.filters().busType === 'seater' ? 'bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316] text-white' : 'text-slate-700'"
                  class="py-1.5 text-center rounded-[11px] transition-all cursor-pointer">
                  Seater
                </button>
              </div>
            </div>

            <!-- Departure Time Slots -->
            <div class="space-y-1">
              <span class="block text-[10px] font-normal uppercase tracking-wider text-slate-700">
                Departure Time
              </span>
              <div class="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  (click)="setTimeSlot('morning')"
                  [class]="state.filters().departureTimeSlot === 'morning'
                    ? 'bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316] text-white border-transparent'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'"
                  class="p-2 rounded-[14px] border text-left transition-all cursor-pointer">
                  <div class="flex items-center space-x-1">
                    <mat-icon class="text-xs">wb_sunny</mat-icon>
                    <span class="text-xs font-normal">Morning</span>
                  </div>
                  <span class="text-[10px] block mt-0.5" [class.text-white]="state.filters().departureTimeSlot === 'morning'" [class.text-slate-500]="state.filters().departureTimeSlot !== 'morning'">06:00 - 12:00</span>
                </button>

                <button
                  type="button"
                  (click)="setTimeSlot('afternoon')"
                  [class]="state.filters().departureTimeSlot === 'afternoon'
                    ? 'bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316] text-white border-transparent'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'"
                  class="p-2 rounded-[14px] border text-left transition-all cursor-pointer">
                  <div class="flex items-center space-x-1">
                    <mat-icon class="text-xs">light_mode</mat-icon>
                    <span class="text-xs font-normal">Afternoon</span>
                  </div>
                  <span class="text-[10px] block mt-0.5" [class.text-white]="state.filters().departureTimeSlot === 'afternoon'" [class.text-slate-500]="state.filters().departureTimeSlot !== 'afternoon'">12:00 - 18:00</span>
                </button>

                <button
                  type="button"
                  (click)="setTimeSlot('evening')"
                  [class]="state.filters().departureTimeSlot === 'evening'
                    ? 'bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316] text-white border-transparent'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'"
                  class="p-2 rounded-[14px] border text-left transition-all cursor-pointer">
                  <div class="flex items-center space-x-1">
                    <mat-icon class="text-xs">nights_stay</mat-icon>
                    <span class="text-xs font-normal">Evening</span>
                  </div>
                  <span class="text-[10px] block mt-0.5" [class.text-white]="state.filters().departureTimeSlot === 'evening'" [class.text-slate-500]="state.filters().departureTimeSlot !== 'evening'">18:00 - 23:59</span>
                </button>

                <button
                  type="button"
                  (click)="setTimeSlot('all')"
                  [class]="state.filters().departureTimeSlot === 'all'
                    ? 'bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316] text-white border-transparent'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'"
                  class="p-2 rounded-[14px] border text-left transition-all cursor-pointer">
                  <div class="flex items-center space-x-1">
                    <mat-icon class="text-xs">schedule</mat-icon>
                    <span class="text-xs font-normal">Any Time</span>
                  </div>
                  <span class="text-[10px] block mt-0.5" [class.text-white]="state.filters().departureTimeSlot === 'all'" [class.text-slate-500]="state.filters().departureTimeSlot !== 'all'">All 24 hours</span>
                </button>
              </div>
            </div>

            <!-- Price Slider -->
            <div class="space-y-1">
              <div class="flex justify-between items-center text-xs">
                <span class="text-[10px] font-normal uppercase tracking-wider text-slate-500">Max Fare</span>
                <span class="font-normal text-[#e11d48]">₹{{ state.filters().maxPrice }}</span>
              </div>
              <input
                type="range"
                min="500"
                max="3000"
                step="100"
                [value]="state.filters().maxPrice"
                (input)="onMaxPriceChange($event)"
                class="w-full accent-[#f43f5e] cursor-pointer" />
              <div class="flex justify-between text-[10px] text-slate-400 font-normal">
                <span>₹500</span>
                <span>₹3,000</span>
              </div>
            </div>

            <!-- Operators Dropdown -->
            <div class="space-y-1">
              <label for="filter-operator-select" class="block text-[10px] font-normal uppercase tracking-wider text-slate-500">
                Operator
              </label>
              <select
                id="filter-operator-select"
                (change)="onOperatorChange($event)"
                class="w-full bg-slate-50 border border-slate-200 rounded-[12px] px-2.5 py-1.5 text-xs font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer">
                <option value="all" [selected]="state.filters().operator === 'all'">All Operators</option>
                @for (op of operators; track op) {
                  <option [value]="op" [selected]="state.filters().operator === op">{{ op }}</option>
                }
              </select>
            </div>

          </div>

          <!-- Footer -->
          <div class="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs font-normal text-slate-900">
              {{ state.filteredTrips().length }} Results
            </span>

            <button
              type="button"
              (click)="state.isFilterModalOpen.set(false)"
              class="px-5 py-2 rounded-[14px] bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316] shadow-[0_6px_16px_rgba(244,63,94,0.28)] text-white text-xs font-normal transition-all cursor-pointer active:scale-95">
              Apply Filters
            </button>
          </div>

        </div>
      </div>
    }
  `,
})
export class FilterModal {
  readonly state = inject(BookingState);

  readonly operators = [
    'VRL Travels',
    'SRS Travels',
    'Orange Travels',
    'Kallada Travels',
    'Zingbus Luxe',
    'IntrCity SmartBus',
    'Jabbar Travels',
    'National Travels',
  ];

  setAcFilter(hasAc: boolean | null) {
    this.state.filters.update((f) => ({...f, hasAc}));
  }

  setBusType(busType: TripFilter['busType']) {
    this.state.filters.update((f) => ({...f, busType}));
  }

  setTimeSlot(departureTimeSlot: TripFilter['departureTimeSlot']) {
    this.state.filters.update((f) => ({...f, departureTimeSlot}));
  }

  onMaxPriceChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.state.filters.update((f) => ({...f, maxPrice: +input.value}));
  }

  onOperatorChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.state.filters.update((f) => ({...f, operator: select.value}));
  }

  resetFilters() {
    this.state.resetFilters();
  }
}
