import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {BookingState, TripFilter} from '../../services/booking-state';
import {SeatLayout} from '../seat-layout/seat-layout';

@Component({
  selector: 'app-trip-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, SeatLayout],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] relative overflow-x-hidden py-3 px-2 sm:px-4">
      
      <!-- ================================================================= -->
      <!-- FULL-PAGE PASTEL PEACH-PINK-LAVENDER GRADIENT BACKDROP            -->
      <!-- ================================================================= -->
      <div
        aria-hidden="true"
        class="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd]">
        <div class="w-full h-full bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)]"></div>
      </div>

      <div class="max-w-6xl mx-auto space-y-2.5 sm:space-y-3 relative z-10">
      
      <!-- Top Action & Filter Toolbar -->
      <div class="bg-white rounded-[22px] p-2.5 sm:p-3 border border-slate-200/90 result-card-shadow flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap text-slate-800">
        
        <!-- Results Counter & Route -->
        <div class="flex items-center space-x-1.5">
          <span class="text-xs font-normal text-slate-900">
            {{ state.filteredTrips().length }} Buses
          </span>
          <span class="text-slate-300">·</span>
          <span class="text-[11px] sm:text-xs text-slate-500 truncate max-w-[140px] sm:max-w-xs font-normal">
            {{ state.sourceCity().code }} → {{ state.destinationCity().code }}
          </span>
        </div>

        <!-- Toolbar Controls: Quick Chips + Sort + Filter Popup Trigger -->
        <div class="flex items-center space-x-1.5 text-xs">
          
          <!-- Quick Filter Chips -->
          <button
            type="button"
            (click)="toggleQuickAc()"
            [class.bg-gradient-to-r]="state.filters().hasAc === true"
            [class.from-[#e11d48]]="state.filters().hasAc === true"
            [class.via-[#f43f5e]]="state.filters().hasAc === true"
            [class.to-[#fb923c]]="state.filters().hasAc === true"
            [class.text-white]="state.filters().hasAc === true"
            [class.bg-slate-100]="state.filters().hasAc !== true"
            [class.text-slate-700]="state.filters().hasAc !== true"
            class="px-3 py-1 rounded-[22px] transition-all cursor-pointer active:scale-95 text-[11px] font-normal">
            AC
          </button>
          <button
            type="button"
            (click)="toggleQuickSleeper()"
            [class.bg-gradient-to-r]="state.filters().busType === 'sleeper'"
            [class.from-[#e11d48]]="state.filters().busType === 'sleeper'"
            [class.via-[#f43f5e]]="state.filters().busType === 'sleeper'"
            [class.to-[#fb923c]]="state.filters().busType === 'sleeper'"
            [class.text-white]="state.filters().busType === 'sleeper'"
            [class.bg-slate-100]="state.filters().busType !== 'sleeper'"
            [class.text-slate-700]="state.filters().busType !== 'sleeper'"
            class="px-3 py-1 rounded-[22px] transition-all cursor-pointer active:scale-95 text-[11px] font-normal">
            Sleeper
          </button>

          <!-- Sort Select -->
          <select
            aria-label="Sort trips"
            (change)="onSortChange($event)"
            class="bg-slate-100 rounded-[22px] px-2.5 py-1 text-[11px] font-normal text-slate-700 focus:outline-none cursor-pointer [&>option]:bg-white [&>option]:text-slate-800">
            <option value="departure_asc" [selected]="state.filters().sortBy === 'departure_asc'">Earliest</option>
            <option value="price_asc" [selected]="state.filters().sortBy === 'price_asc'">Cheapest</option>
            <option value="rating_desc" [selected]="state.filters().sortBy === 'rating_desc'">Top Rated</option>
          </select>

          <!-- Filter Popup Trigger Button -->
          <button
            type="button"
            (click)="state.isFilterModalOpen.set(true)"
            class="flex items-center space-x-1 px-3 py-1 rounded-[22px] bg-gradient-to-r from-[#e11d48] via-[#f43f5e] to-[#fb923c] text-white text-[11px] font-normal transition-all cursor-pointer active:scale-95 shrink-0">
            <mat-icon class="text-xs text-white">tune</mat-icon>
            <span class="text-white">Filters</span>
            @if (state.activeFilterCount() > 0) {
              <span class="w-3.5 h-3.5 rounded-full bg-white text-[#e11d48] flex items-center justify-center text-[9px]">
                {{ state.activeFilterCount() }}
              </span>
            }
          </button>

        </div>

      </div>

      <!-- Bus Trip Cards Grid: 2 TILES PER ROW -->
      <div class="grid grid-cols-2 gap-2 sm:gap-3.5">
        
        @if (state.filteredTrips().length === 0) {
          <div class="col-span-2 bg-white rounded-[22px] p-8 text-center space-y-2 text-slate-800 border border-slate-200/90 result-card-shadow">
            <mat-icon class="text-2xl text-rose-600">directions_bus</mat-icon>
            <h3 class="text-xs font-normal text-slate-800">No buses matching your filters</h3>
            <button
              type="button"
              (click)="resetFilters()"
              class="px-4 py-1.5 rounded-[22px] bg-gradient-to-r from-[#e11d48] via-[#f43f5e] to-[#fb923c] text-white text-xs font-normal cursor-pointer active:scale-95 transition-all">
              Reset Filters
            </button>
          </div>
        }

        @for (trip of state.filteredTrips(); track trip.id) {
          <div
            class="bg-white rounded-[22px] transition-all duration-200 border border-slate-200/90 result-card-shadow overflow-hidden flex flex-col justify-between text-slate-800 hover:border-rose-300"
            [class.col-span-2]="state.selectedTrip()?.id === trip.id"
            [class.ring-1]="state.selectedTrip()?.id === trip.id"
            [class.ring-rose-600]="state.selectedTrip()?.id === trip.id"
            [class.border-rose-600]="state.selectedTrip()?.id === trip.id">
            
            <!-- Horizontal 2-Column Layout Utilizing Right-Side Space -->
            <div class="p-2.5 sm:p-3 flex items-stretch justify-between gap-2.5 sm:gap-3">
              
              <!-- Left & Center Column: Operator, Route Timeline, Specs -->
              <div class="flex-1 min-w-0 flex flex-col justify-between space-y-1.5">
                
                <!-- Line 1: Operator & Rating -->
                <div class="flex items-center justify-between gap-1.5">
                  <div class="flex items-center space-x-1 min-w-0">
                    <h3 class="text-xs sm:text-sm font-normal text-slate-900 uppercase truncate tracking-tight">
                      {{ trip.bus.operatorName }}
                    </h3>
                    <mat-icon class="text-xs text-rose-600 shrink-0" title="Live Tracking Available">location_on</mat-icon>
                  </div>

                  <div class="bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[10px] font-normal flex items-center space-x-0.5 leading-none shrink-0">
                    <span class="text-[8px]">★</span>
                    <span>{{ trip.bus.rating }}</span>
                  </div>
                </div>

                <!-- Line 2: Horizontal Route Timeline -->
                <div class="bg-[#fcfcfd] rounded-2xl px-2.5 py-1.5 border border-slate-200/80 flex items-center justify-between gap-2">
                  <div>
                    <div class="text-xs sm:text-sm font-normal text-slate-900 leading-none tabular-nums">{{ trip.departureTime }}</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">{{ state.sourceCity().code }}</div>
                  </div>

                  <div class="flex flex-col items-center px-1 shrink-0">
                    <span class="text-[9px] text-slate-500 font-normal leading-none">{{ trip.duration }}</span>
                    <div class="w-8 sm:w-12 h-[1px] bg-slate-300 relative my-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-rose-500 absolute -top-[2px] right-0"></span>
                    </div>
                    <span class="text-[9px] text-emerald-700 font-normal leading-none">{{ trip.availableSeatsCount }} Left</span>
                  </div>

                  <div class="text-right">
                    <div class="text-xs sm:text-sm font-normal text-slate-900 leading-none tabular-nums">{{ trip.arrivalTime }}</div>
                    <div class="text-[10px] text-slate-500 mt-0.5">{{ state.destinationCity().code }}</div>
                  </div>
                </div>

                <!-- Line 3: Bus Specs & Score -->
                <div class="flex items-center justify-between gap-2 text-[10px] text-slate-500">
                  <span class="truncate">
                    {{ trip.bus.hasAc ? 'A/C' : 'Non-A/C' }} {{ trip.bus.busType === 'sleeper' ? 'Sleeper (2+1)' : 'Seater (2+2)' }}
                  </span>
                  <span class="text-slate-400 shrink-0">{{ trip.bus.totalReviews || 854 }} ratings</span>
                </div>

              </div>

              <!-- Right Column: Price & Select Seats CTA -->
              <div class="shrink-0 pl-2.5 sm:pl-3 border-l border-slate-100 flex flex-col items-end justify-between min-w-[96px] sm:min-w-[110px]">
                <div class="text-right">
                  <span class="text-[9px] uppercase text-slate-400 block leading-none">Onwards</span>
                  <div class="text-base sm:text-lg font-normal text-slate-900 leading-tight tabular-nums mt-0.5">
                    ₹{{ trip.baseFare }}
                  </div>
                </div>

                <button
                  type="button"
                  (click)="$event.stopPropagation(); state.selectTrip(trip)"
                  [class.bg-slate-900]="state.selectedTrip()?.id === trip.id"
                  [class.bg-gradient-to-r]="state.selectedTrip()?.id !== trip.id"
                  [class.from-[#e11d48]]="state.selectedTrip()?.id !== trip.id"
                  [class.via-[#f43f5e]]="state.selectedTrip()?.id !== trip.id"
                  [class.to-[#fb923c]]="state.selectedTrip()?.id !== trip.id"
                  class="w-full py-1.5 px-2.5 rounded-[22px] text-[11px] font-normal transition-all flex items-center justify-center space-x-1 cursor-pointer active:scale-95 text-white hover:opacity-90">
                  <mat-icon class="text-xs text-white">event_seat</mat-icon>
                  <span>{{ state.selectedTrip()?.id === trip.id ? 'Hide' : 'Seats' }}</span>
                </button>
              </div>

            </div>

            <!-- Expanded Seat Layout Engine inside this trip -->
            @if (state.selectedTrip()?.id === trip.id) {
              <div class="bg-slate-50 p-2.5 sm:p-4 border-t border-slate-100 animate-fade-in">
                <app-seat-layout />
              </div>
            }

          </div>
        }

      </div>

      </div>
    </div>
  `,
})
export class TripList {
  readonly state = inject(BookingState);

  toggleQuickAc(): void {
    const current = this.state.filters().hasAc;
    this.state.updateFilters({hasAc: current ? null : true});
  }

  toggleQuickSleeper(): void {
    const current = this.state.filters().busType;
    this.state.updateFilters({busType: current === 'sleeper' ? 'all' : 'sleeper'});
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as TripFilter['sortBy'];
    this.state.updateFilters({sortBy: value});
  }

  resetFilters(): void {
    this.state.resetFilters();
  }
}
