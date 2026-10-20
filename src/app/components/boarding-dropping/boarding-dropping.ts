import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {BookingState} from '../../services/booking-state';
import {BoardingPoint, DroppingPoint, Trip, SharedCarTrip} from '../../models/bus-booking.models';

@Component({
  selector: 'app-boarding-dropping',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] text-[#1b1b1b] pb-28 font-sans relative overflow-x-hidden">
      
      <!-- =============================================================== -->
      <!-- FULL-PAGE PASTEL PEACH-PINK-LAVENDER GRADIENT BACKDROP          -->
      <!-- =============================================================== -->
      <div
        aria-hidden="true"
        class="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-br from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd]">
        <div class="w-full h-full bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.7),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.6),_transparent_60%),radial-gradient(circle_at_85%_80%,_rgba(199,210,254,0.7),_transparent_55%)]"></div>
      </div>

      <!-- =============================================================== -->
      <!-- TOP STICKY HEADER WITH 3-STEP BAR (Solid White Background)      -->
      <!-- =============================================================== -->
      <header class="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2.5 flex items-center justify-between gap-3">
          
          <!-- Left: Back Arrow + Title + Route Subtitle -->
          <div class="flex items-center space-x-3.5 min-w-0">
            <button
              type="button"
              (click)="state.backToSeatSelection()"
              title="Back to Seat Selection"
              class="w-9 h-9 -ml-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-[#1b1b1b] border border-slate-200/80 shadow-2xs flex items-center justify-center cursor-pointer active:scale-90 transition-all shrink-0">
              <mat-icon class="text-[22px]">arrow_back</mat-icon>
            </button>

            <div class="min-w-0">
              <h1 class="text-[17px] sm:text-[18px] text-[#1b1b1b] truncate leading-tight">
                Select boarding &amp; dropping points
              </h1>
              <p class="text-[13px] text-[#6b7280] truncate leading-tight mt-0.5">
                {{ sourceCityName() }} &rarr; {{ destinationCityName() }}
              </p>
            </div>
          </div>

          <!-- Flow Mode Badge (Bus vs Car vs Transport) -->
          <div
            [class.bg-[#ffe4e6]]="state.activeBookingMode() !== 'car' && state.activeBookingMode() !== 'transport'"
            [class.text-[#be123c]]="state.activeBookingMode() !== 'car' && state.activeBookingMode() !== 'transport'"
            [class.bg-[#e0e7ff]]="state.activeBookingMode() === 'car'"
            [class.text-[#4338ca]]="state.activeBookingMode() === 'car'"
            [class.bg-[#fae8ff]]="state.activeBookingMode() === 'transport'"
            [class.text-[#a21caf]]="state.activeBookingMode() === 'transport'"
            class="w-9 h-9 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0">
            <mat-icon class="text-[18px]">{{ state.activeBookingMode() === 'car' ? 'directions_car' : state.activeBookingMode() === 'transport' ? 'local_shipping' : 'directions_bus' }}</mat-icon>
          </div>

        </div>

        <!-- 3-Step Horizontal Stepper Bar (Result View Sub-Header Tab Design) -->
        <div class="max-w-5xl mx-auto flex items-center border-t border-slate-200/80 bg-white">
          <!-- Step 1: Select seats -->
          <button
            type="button"
            (click)="state.backToSeatSelection()"
            class="w-1/3 py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-normal border-b-2 border-transparent text-slate-600 hover:bg-slate-50/60 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-[0.99] text-center truncate">
            <mat-icon class="text-sm sm:text-base shrink-0">event_seat</mat-icon>
            <span class="truncate">1. Select seats</span>
          </button>

          <!-- Step 2: Board/Drop point (Active - Bus, Car, or Transport Theme) -->
          <div
            [class.text-[#e11d48]]="state.activeBookingMode() !== 'car' && state.activeBookingMode() !== 'transport'"
            [class.border-[#e11d48]]="state.activeBookingMode() !== 'car' && state.activeBookingMode() !== 'transport'"
            [class.bg-rose-50/40]="state.activeBookingMode() !== 'car' && state.activeBookingMode() !== 'transport'"
            [class.text-[#4f46e5]]="state.activeBookingMode() === 'car'"
            [class.border-[#4f46e5]]="state.activeBookingMode() === 'car'"
            [class.bg-indigo-50/40]="state.activeBookingMode() === 'car'"
            [class.text-[#a21caf]]="state.activeBookingMode() === 'transport'"
            [class.border-[#a21caf]]="state.activeBookingMode() === 'transport'"
            [class.bg-fuchsia-50/40]="state.activeBookingMode() === 'transport'"
            class="w-1/3 py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-normal border-b-2 flex items-center justify-center space-x-1.5 text-center truncate">
            <mat-icon class="text-sm sm:text-base shrink-0">pin_drop</mat-icon>
            <span class="truncate">2. Board/Drop</span>
          </div>

          <!-- Step 3: Passenger Info -->
          <button
            type="button"
            (click)="proceedToPassengerInfo()"
            class="w-1/3 py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-normal border-b-2 border-transparent text-slate-600 hover:bg-slate-50/60 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-[0.99] text-center truncate">
            <mat-icon class="text-sm sm:text-base shrink-0">person</mat-icon>
            <span class="truncate">3. Passenger Info</span>
          </button>
        </div>
      </header>

      <!-- =============================================================== -->
      <!-- MAIN CONTENT: SINGLE TABBED BOARDING & DROPPING CARD            -->
      <!-- =============================================================== -->
      <main class="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 relative z-10">
        
        <section
          aria-label="Boarding and Dropping points"
          class="bg-white rounded-[22px] border border-slate-200/90 result-card-shadow overflow-hidden">
          
          <!-- =========================================================== -->
          <!-- TWO-TAB HEADER BAR (Result View 2-Tab Design) -->
          <!-- Left Tab: Boarding points (50%) | Right Tab: Dropping points (50%) -->
          <!-- =========================================================== -->
          <div class="flex items-center border-b border-slate-200/80 bg-white">
            
            <!-- Tab 1: Boarding points (50% width) -->
            <button
              type="button"
              (click)="activeTab.set('boarding')"
              [class.text-[#e11d48]]="activeTab() === 'boarding' && state.activeBookingMode() !== 'car'"
              [class.border-[#e11d48]]="activeTab() === 'boarding' && state.activeBookingMode() !== 'car'"
              [class.bg-rose-50/40]="activeTab() === 'boarding' && state.activeBookingMode() !== 'car'"
              [class.text-[#4f46e5]]="activeTab() === 'boarding' && state.activeBookingMode() === 'car'"
              [class.border-[#4f46e5]]="activeTab() === 'boarding' && state.activeBookingMode() === 'car'"
              [class.bg-indigo-50/40]="activeTab() === 'boarding' && state.activeBookingMode() === 'car'"
              [class.text-slate-600]="activeTab() !== 'boarding'"
              [class.border-transparent]="activeTab() !== 'boarding'"
              class="w-1/2 py-2.5 px-3 text-xs sm:text-sm font-normal border-b-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.99] text-center">
              <div class="flex items-center justify-center space-x-2">
                <mat-icon class="text-base sm:text-lg">trip_origin</mat-icon>
                <span>Boarding points</span>
                <span
                  [class.bg-[#ffe4e6]]="activeTab() === 'boarding' && state.activeBookingMode() !== 'car'"
                  [class.text-[#be123c]]="activeTab() === 'boarding' && state.activeBookingMode() !== 'car'"
                  [class.border-rose-200/80]="activeTab() === 'boarding' && state.activeBookingMode() !== 'car'"
                  [class.bg-[#e0e7ff]]="activeTab() === 'boarding' && state.activeBookingMode() === 'car'"
                  [class.text-[#4338ca]]="activeTab() === 'boarding' && state.activeBookingMode() === 'car'"
                  [class.border-indigo-200/80]="activeTab() === 'boarding' && state.activeBookingMode() === 'car'"
                  [class.bg-slate-100]="activeTab() !== 'boarding'"
                  [class.text-slate-600]="activeTab() !== 'boarding'"
                  class="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-normal transition-colors border border-transparent">
                  {{ allBoardingPoints().length }}
                </span>
              </div>
              <span class="text-[11px] text-slate-500 truncate max-w-full mt-0.5">
                {{ state.selectedBoardingPoint()?.location || 'Select Boarding Point' }}
              </span>
            </button>

            <!-- Tab 2: Dropping points (50% width) -->
            <button
              type="button"
              (click)="activeTab.set('dropping')"
              [class.text-[#e11d48]]="activeTab() === 'dropping' && state.activeBookingMode() !== 'car'"
              [class.border-[#e11d48]]="activeTab() === 'dropping' && state.activeBookingMode() !== 'car'"
              [class.bg-rose-50/40]="activeTab() === 'dropping' && state.activeBookingMode() !== 'car'"
              [class.text-[#4f46e5]]="activeTab() === 'dropping' && state.activeBookingMode() === 'car'"
              [class.border-[#4f46e5]]="activeTab() === 'dropping' && state.activeBookingMode() === 'car'"
              [class.bg-indigo-50/40]="activeTab() === 'dropping' && state.activeBookingMode() === 'car'"
              [class.text-slate-600]="activeTab() !== 'dropping'"
              [class.border-transparent]="activeTab() !== 'dropping'"
              class="w-1/2 py-2.5 px-3 text-xs sm:text-sm font-normal border-b-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.99] text-center">
              <div class="flex items-center justify-center space-x-2">
                <mat-icon class="text-base sm:text-lg">location_on</mat-icon>
                <span>Dropping points</span>
                <span
                  [class.bg-[#ffe4e6]]="activeTab() === 'dropping' && state.activeBookingMode() !== 'car'"
                  [class.text-[#be123c]]="activeTab() === 'dropping' && state.activeBookingMode() !== 'car'"
                  [class.border-rose-200/80]="activeTab() === 'dropping' && state.activeBookingMode() !== 'car'"
                  [class.bg-[#e0e7ff]]="activeTab() === 'dropping' && state.activeBookingMode() === 'car'"
                  [class.text-[#4338ca]]="activeTab() === 'dropping' && state.activeBookingMode() === 'car'"
                  [class.border-indigo-200/80]="activeTab() === 'dropping' && state.activeBookingMode() === 'car'"
                  [class.bg-slate-100]="activeTab() !== 'dropping'"
                  [class.text-slate-600]="activeTab() !== 'dropping'"
                  class="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-normal transition-colors border border-transparent">
                  {{ allDroppingPoints().length }}
                </span>
              </div>
              <span class="text-[11px] text-slate-500 truncate max-w-full mt-0.5">
                {{ state.selectedDroppingPoint()?.location || 'Select Dropping Point' }}
              </span>
            </button>

          </div>

          <!-- =========================================================== -->
          <!-- TAB 1 CONTENT: BOARDING POINTS LIST -->
          <!-- Selecting an option automatically switches to Dropping tab -->
          <!-- =========================================================== -->
          @if (activeTab() === 'boarding') {
            <div class="divide-y divide-[#e5e7eb]">
              @for (bp of allBoardingPoints(); track bp.id) {
                @let isSelected = state.selectedBoardingPoint()?.id === bp.id;

                <div
                  (click)="onSelectBoardingPoint(bp)"
                  (keydown.enter)="onSelectBoardingPoint(bp)"
                  role="radio"
                  [attr.aria-checked]="isSelected"
                  tabindex="0"
                  [class.bg-[#fff8f8]]="isSelected && state.activeBookingMode() !== 'car'"
                  [class.bg-indigo-50/60]="isSelected && state.activeBookingMode() === 'car'"
                  class="px-5 py-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors select-none">
                  
                  <!-- Left: Time & Date -->
                  <div class="w-[58px] shrink-0 pt-0.5">
                    <div class="text-[15px] text-[#1b1b1b] tabular-nums leading-snug">
                      {{ bp.time }}
                    </div>
                    <div class="text-[11px] text-[#6b7280] leading-tight mt-0.5">
                      {{ shortDateLabel() }}
                    </div>
                  </div>

                  <!-- Middle: Location Name & Landmark / Address -->
                  <div class="flex-1 min-w-0">
                    <div class="text-[15px] text-[#1b1b1b] leading-snug">
                      {{ bp.location }}
                    </div>
                    <div class="text-[13px] text-[#6b7280] mt-0.5 leading-snug">
                      {{ bp.landmark || 'Main Boarding Point' }}
                    </div>
                  </div>

                  <!-- Right: Radio Button Circle -->
                  <div class="shrink-0 pt-1">
                    <div
                      [class.border-[#e11d48]]="isSelected && state.activeBookingMode() !== 'car'"
                      [class.border-[#4f46e5]]="isSelected && state.activeBookingMode() === 'car'"
                      [class.border-[#4b5563]]="!isSelected"
                      class="w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center transition-colors">
                      @if (isSelected) {
                        <div
                          [class.bg-[#e11d48]]="state.activeBookingMode() !== 'car'"
                          [class.bg-[#4f46e5]]="state.activeBookingMode() === 'car'"
                          class="w-2.5 h-2.5 rounded-full">
                        </div>
                      }
                    </div>
                  </div>

                </div>
              }
            </div>
          } @else {
            <!-- =========================================================== -->
            <!-- TAB 2 CONTENT: DROPPING POINTS LIST -->
            <!-- Selecting an option automatically navigates to Passenger Info -->
            <!-- =========================================================== -->
            <div class="divide-y divide-[#e5e7eb]">
              @for (dp of allDroppingPoints(); track dp.id) {
                @let isSelected = state.selectedDroppingPoint()?.id === dp.id;

                <div
                  (click)="onSelectDroppingPoint(dp)"
                  (keydown.enter)="onSelectDroppingPoint(dp)"
                  role="radio"
                  [attr.aria-checked]="isSelected"
                  tabindex="0"
                  [class.bg-[#fff8f8]]="isSelected && state.activeBookingMode() !== 'car'"
                  [class.bg-indigo-50/60]="isSelected && state.activeBookingMode() === 'car'"
                  class="px-5 py-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors select-none">
                  
                  <!-- Left: Time & Date -->
                  <div class="w-[58px] shrink-0 pt-0.5">
                    <div class="text-[15px] text-[#1b1b1b] tabular-nums leading-snug">
                      {{ dp.time }}
                    </div>
                    <div class="text-[11px] text-[#6b7280] leading-tight mt-0.5">
                      {{ shortDateLabel() }}
                    </div>
                  </div>

                  <!-- Middle: Location Name & Landmark / Address -->
                  <div class="flex-1 min-w-0">
                    <div class="text-[15px] text-[#1b1b1b] leading-snug">
                      {{ dp.location }}
                    </div>
                    <div class="text-[13px] text-[#6b7280] mt-0.5 leading-snug">
                      {{ dp.landmark || 'Main Dropping Point' }}
                    </div>
                  </div>

                  <!-- Right: Radio Button Circle -->
                  <div class="shrink-0 pt-1">
                    <div
                      [class.border-[#e11d48]]="isSelected && state.activeBookingMode() !== 'car'"
                      [class.border-[#4f46e5]]="isSelected && state.activeBookingMode() === 'car'"
                      [class.border-[#4b5563]]="!isSelected"
                      class="w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center transition-colors">
                      @if (isSelected) {
                        <div
                          [class.bg-[#e11d48]]="state.activeBookingMode() !== 'car'"
                          [class.bg-[#4f46e5]]="state.activeBookingMode() === 'car'"
                          class="w-2.5 h-2.5 rounded-full">
                        </div>
                      }
                    </div>
                  </div>

                </div>
              }
            </div>
          }

        </section>

      </main>

    </div>
  `,
})
export class BoardingDropping {
  readonly state = inject(BookingState);

  // Active tab: starts on 'boarding' (or 'dropping' if boarding is already selected and dropping is not)
  readonly activeTab = signal<'boarding' | 'dropping'>('boarding');

  readonly activeTrip = computed<Trip | null>(() =>
    this.state.activeBookingMode() === 'bus' ? this.state.selectedTrip() : null,
  );
  readonly activeCar = computed<SharedCarTrip | null>(() =>
    this.state.activeBookingMode() === 'car' ? this.state.selectedSharedCarTrip() : null,
  );
  readonly activeTransport = computed<SharedCarTrip | null>(() =>
    this.state.activeBookingMode() === 'transport' ? this.state.selectedTransportTrip() : null,
  );

  readonly sourceCityName = computed(() => {
    return (
      this.activeTrip()?.sourceCityName ||
      this.activeCar()?.sourceCityName ||
      this.activeTransport()?.sourceCityName ||
      this.state.sourceCity().name ||
      'Origin City'
    );
  });

  readonly destinationCityName = computed(() => {
    return (
      this.activeTrip()?.destinationCityName ||
      this.activeCar()?.destinationCityName ||
      this.activeTransport()?.destinationCityName ||
      this.state.destinationCity().name ||
      'Destination City'
    );
  });

  readonly shortDateLabel = computed(() => {
    const dStr = this.activeTrip()?.date || this.activeCar()?.date || this.activeTransport()?.date || this.state.travelDate();
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    } catch {
      return '';
    }
  });

  readonly allBoardingPoints = computed<BoardingPoint[]>(() => {
    const t = this.activeTrip();
    if (t && t.boardingPoints?.length) {
      return t.boardingPoints;
    }
    const c = this.activeCar();
    if (c && c.boardingPoints?.length) {
      return c.boardingPoints;
    }
    const tr = this.activeTransport();
    if (tr && tr.boardingPoints?.length) {
      return tr.boardingPoints;
    }
    const src = this.sourceCityName();
    return [
      { id: 'bp-def-1', time: '21:00', location: `${src} Central Bus Terminal`, landmark: 'Opp. Railway Station Gate 1' },
      { id: 'bp-def-2', time: '21:35', location: `${src} Ring Road Junction`, landmark: 'Near Metro Pillar 24' },
      { id: 'bp-def-3', time: '22:10', location: `${src} Highway Toll Plaza`, landmark: 'Customer Waiting Lounge' },
    ];
  });

  readonly allDroppingPoints = computed<DroppingPoint[]>(() => {
    const t = this.activeTrip();
    if (t && t.droppingPoints?.length) {
      return t.droppingPoints;
    }
    const c = this.activeCar();
    if (c && c.droppingPoints?.length) {
      return c.droppingPoints;
    }
    const tr = this.activeTransport();
    if (tr && tr.droppingPoints?.length) {
      return tr.droppingPoints;
    }
    const dst = this.destinationCityName();
    return [
      { id: 'dp-def-1', time: '05:30', location: `${dst} Airport Bypass Toll`, landmark: 'Exit Flyover Circle' },
      { id: 'dp-def-2', time: '06:15', location: `${dst} Central Metro Station`, landmark: 'Pillar 1042 Gate 2' },
      { id: 'dp-def-3', time: '07:00', location: `${dst} Main Bus Complex`, landmark: 'Platform 5 Arrival Bay' },
    ];
  });

  onSelectBoardingPoint(bp: BoardingPoint) {
    this.state.selectBoardingPoint(bp);
    // Automatically move to Dropping points tab once a boarding point is selected
    this.activeTab.set('dropping');
  }

  onSelectDroppingPoint(dp: DroppingPoint) {
    this.state.selectDroppingPoint(dp);
    // If boarding point wasn't chosen yet, switch to boarding tab; otherwise go straight to Passenger Info page
    if (!this.state.selectedBoardingPoint()) {
      this.activeTab.set('boarding');
      this.state.showToast('Please select a Boarding Point', 'warning');
      return;
    }
    this.state.goToPassengerInfo();
  }

  proceedToPassengerInfo() {
    if (!this.state.selectedBoardingPoint()) {
      this.activeTab.set('boarding');
      this.state.showToast('Please select a Boarding Point', 'warning');
      return;
    }
    if (!this.state.selectedDroppingPoint()) {
      this.activeTab.set('dropping');
      this.state.showToast('Please select a Dropping Point', 'warning');
      return;
    }
    this.state.goToPassengerInfo();
  }
}
