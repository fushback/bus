import {ChangeDetectionStrategy, Component, inject, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {BookingState} from '../../services/booking-state';
import {SharedCarTrip, CarSeat, BoardingPoint, DroppingPoint, VehicleCustomConfig} from '../../models/bus-booking.models';

export type CarDetailSection =
  | 'safety'
  | 'boarding'
  | 'dropping'
  | 'route'
  | 'reviews'
  | 'cancellation'
  | 'datechange';

export interface RenderedCarDeckView {
  deckId: 'lower' | 'middle' | 'upper';
  deckLabel: string;
  aisleAfterCol: number;
  gridRows: number;
  gridCols: number;
  seats: CarSeat[];
  columns: {
    colIndex: number;
    seats: CarSeat[];
  }[];
}

@Component({
  selector: 'app-car-seat-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    @if (state.selectedSharedCarTrip(); as car) {
      <div class="min-h-screen bg-[#f4f5f8] text-[#1b1b1b] pb-48 sm:pb-56 font-sans">
        
        <!-- =============================================================== -->
        <!-- TOP STICKY HEADER (Matches Uploaded Image) -->
        <!-- =============================================================== -->
        <header class="sticky top-0 z-30 bg-white border-b border-slate-200/80">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
            
            <!-- Left: Back Arrow + "Select Seats" + Route Subtitle -->
            <div class="flex items-center space-x-3.5 min-w-0">
              <button
                type="button"
                (click)="state.backToCarResults()"
                title="Back to Car Results"
                class="w-9 h-9 -ml-1.5 rounded-full hover:bg-slate-100 text-[#1b1b1b] flex items-center justify-center cursor-pointer active:scale-90 transition-all shrink-0">
                <mat-icon class="text-[22px]">arrow_back</mat-icon>
              </button>

              <div class="min-w-0">
                <div class="flex items-center space-x-2">
                  <h1 class="text-[17px] sm:text-[18px] text-[#1b1b1b] truncate leading-tight">
                    Select Seats
                  </h1>
                  <span class="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-medium truncate max-w-[180px]">
                    {{ customConfig().layoutModelName || car.vehicleName }} &middot; {{ (customConfig().seatFormat || 'seater') | uppercase }}
                  </span>
                </div>
                <p class="text-[13px] text-[#6b7280] truncate leading-tight mt-0.5">
                  {{ car.operatorName }} &middot; {{ cleanCityName(car.sourceCityName) }} &rarr; {{ cleanCityName(car.destinationCityName) }}
                </p>
              </div>
            </div>

            <!-- Right: Edit in Studio + Share Button -->
            <div class="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                (click)="openInAdminStudio()"
                title="Edit Model, Seat Numbers & Prices in Studio"
                class="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 text-[11px] flex items-center space-x-1 cursor-pointer active:scale-95 transition-all">
                <mat-icon class="text-[15px]">grid_on</mat-icon>
                <span class="hidden sm:inline">Edit in Studio</span>
              </button>
              <button
                type="button"
                (click)="shareCarDetails(car)"
                title="Share Car Details"
                class="w-9 h-9 rounded-full hover:bg-slate-100 text-[#1b1b1b] flex items-center justify-center cursor-pointer active:scale-90 transition-all">
                <mat-icon class="text-[21px]">share</mat-icon>
              </button>
            </div>

          </div>

          <!-- 3-Step Horizontal Stepper Bar (Result View Sub-Header Tab Design) -->
          <div class="max-w-6xl mx-auto flex items-center border-t border-slate-200/80 bg-white">
            <!-- Step 1: Select seats (Active - Car Theme) -->
            <div class="w-1/3 py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-normal border-b-2 border-[#4f46e5] text-[#4f46e5] bg-indigo-50/40 flex items-center justify-center space-x-1.5 text-center truncate">
              <mat-icon class="text-sm sm:text-base shrink-0">event_seat</mat-icon>
              <span class="truncate">1. Select seats</span>
            </div>

            <!-- Step 2: Board/Drop -->
            <button
              type="button"
              (click)="state.goToBoardingDropping()"
              class="w-1/3 py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-normal border-b-2 border-transparent text-slate-600 hover:bg-slate-50/60 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-[0.99] text-center truncate">
              <mat-icon class="text-sm sm:text-base shrink-0">pin_drop</mat-icon>
              <span class="truncate">2. Board/Drop</span>
            </button>

            <!-- Step 3: Passenger Info -->
            <button
              type="button"
              (click)="state.goToPassengerInfo()"
              class="w-1/3 py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-normal border-b-2 border-transparent text-slate-600 hover:bg-slate-50/60 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-[0.99] text-center truncate">
              <mat-icon class="text-sm sm:text-base shrink-0">person</mat-icon>
              <span class="truncate">3. Passenger Info</span>
            </button>
          </div>
        </header>

        <!-- =============================================================== -->
        <!-- MAIN CAR CABIN SEAT SELECTION BODY -->
        <!-- Supports Default SUV Cabin OR Admin-Designed Single/Double/Triple Decker -->
        <!-- =============================================================== -->
        <main class="max-w-6xl mx-auto px-1.5 sm:px-6 lg:px-8 pt-4 pb-8">
          
          <!-- Interactive Map Controls Bar: Vehicle Indicator + Pinch / +/- Zoom Controls -->
          <div class="flex flex-wrap items-center justify-between gap-2 px-2 mb-2.5 max-w-xl mx-auto">
            <div class="flex items-center space-x-1.5 text-[10.5px] text-slate-600">
              <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              <span class="font-semibold text-slate-700">
                {{ renderedCustomDecks().length > 1 ? (renderedCustomDecks().length === 2 ? 'Double Decker Vehicle' : 'Multi Decker Vehicle') : car.vehicleName }}
              </span>
              <span class="hidden sm:inline text-slate-400">&bull; Pinch or use +/- to zoom</span>
            </div>

            <!-- +/- Zoom & Fit Controls Pill -->
            <div class="flex items-center bg-white rounded-xl border border-slate-200/90 p-0.5 result-card-shadow select-none">
              <button
                type="button"
                (click)="zoomOut()"
                [disabled]="zoomLevel() <= 0.7"
                title="Zoom Out"
                aria-label="Zoom Out"
                class="w-7 h-6 rounded-lg hover:bg-slate-100 disabled:opacity-35 text-slate-700 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed active:scale-90 transition-all">
                <mat-icon class="text-[15px] leading-none">remove</mat-icon>
              </button>

              <button
                type="button"
                (click)="resetZoom()"
                title="Reset Zoom to 100%"
                class="px-2 h-6 text-[10px] font-mono text-slate-700 hover:bg-slate-50 rounded-md flex items-center justify-center cursor-pointer tabular-nums min-w-[42px]">
                {{ zoomPercent() }}%
              </button>

              <button
                type="button"
                (click)="zoomIn()"
                [disabled]="zoomLevel() >= 1.5"
                title="Zoom In"
                aria-label="Zoom In"
                class="w-7 h-6 rounded-lg hover:bg-slate-100 disabled:opacity-35 text-slate-700 flex items-center justify-center cursor-pointer disabled:cursor-not-allowed active:scale-90 transition-all">
                <mat-icon class="text-[15px] leading-none">add</mat-icon>
              </button>

              <div class="w-px h-3.5 bg-slate-200 mx-0.5"></div>

              <button
                type="button"
                (click)="fitToScreen()"
                title="Fit Map to Mobile Screen"
                [class.bg-indigo-50]="zoomLevel() < 1"
                [class.text-indigo-600]="zoomLevel() < 1"
                class="px-2 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-[10px] flex items-center space-x-0.5 cursor-pointer active:scale-95 transition-all">
                <mat-icon class="text-[13px] leading-none">fit_screen</mat-icon>
                <span>Fit</span>
              </button>
            </div>
          </div>

          @if (hasCustomAdminDeckLayout()) {
            <!-- ADMIN-DESIGNED MULTI-COLUMN / SINGLE / DOUBLE / TRIPLE DECKER CAR LAYOUT -->
            @let decks = renderedCustomDecks();

            <!-- Horizontal Scroll + Pinch-to-Zoom Container: Centers single/fitting car decks via w-max mx-auto -->
            <div
              (touchstart)="onMapTouchStart($event)"
              (touchmove)="onMapTouchMove($event)"
              (touchend)="onMapTouchEnd($event)"
              (touchcancel)="onMapTouchEnd($event)"
              class="horizontal-scroll-container overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 pb-4 pt-1.5 px-2 w-full">
              <div
                [style.zoom]="zoomLevel()"
                class="flex flex-row items-start justify-center gap-2.5 sm:gap-4 w-max mx-auto px-1">

                @for (deck of decks; track deck.deckId) {
                  <!-- Authentic Top-Down Car / SUV Silhouette Card (Compact borders & aisle to minimize horizontal scroll) -->
                  <div class="relative bg-gradient-to-b from-[#dfe5f2] via-[#eef1f8] to-[#dce2ef] p-1.5 sm:p-2 rounded-t-[44px] rounded-b-[20px] border border-slate-300 shadow-sm shrink-0 w-fit">
                    
                    <!-- Swept-Back Car LED Headlights & Hood Grille Nose -->
                    <div class="absolute top-1.5 left-4 w-3.5 h-1 rounded-full bg-amber-300 border border-amber-400 -rotate-12"></div>
                    <div class="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-slate-400/70"></div>
                    <div class="absolute top-1.5 right-4 w-3.5 h-1 rounded-full bg-amber-300 border border-amber-400 rotate-12"></div>

                    <!-- Exterior Aerodynamic Car Side Mirrors -->
                    <div class="absolute -left-2 top-9 w-1.5 h-3.5 rounded-l-full bg-slate-500 border border-slate-600" title="Left Side Mirror"></div>
                    <div class="absolute -right-2 top-9 w-1.5 h-3.5 rounded-r-full bg-slate-500 border border-slate-600" title="Right Side Mirror"></div>

                    <!-- Front & Rear Car Tires / Wheel Arches -->
                    <div class="absolute -left-[3px] top-14 w-[3px] h-6 rounded-l-full bg-slate-700" title="Front Left Tire"></div>
                    <div class="absolute -right-[3px] top-14 w-[3px] h-6 rounded-r-full bg-slate-700" title="Front Right Tire"></div>
                    <div class="absolute -left-[3px] bottom-9 w-[3px] h-6 rounded-l-full bg-slate-700" title="Rear Left Tire"></div>
                    <div class="absolute -right-[3px] bottom-9 w-[3px] h-6 rounded-r-full bg-slate-700" title="Rear Right Tire"></div>

                    <!-- Inner Car Cabin Boundary -->
                    <div class="bg-white rounded-t-[36px] rounded-b-[15px] px-2 sm:px-2.5 pt-2 pb-2.5 border border-slate-200/90 result-card-shadow flex flex-col items-center w-fit">
                      
                      <!-- Curved Aerodynamic Car Front Windshield Graphic -->
                      <div class="w-full px-1.5 mb-1.5 shrink-0">
                        <svg class="w-full h-4 text-slate-700" viewBox="0 0 200 22" preserveAspectRatio="none" fill="none">
                          <path d="M10 19 C42 2, 158 2, 190 19 L180 20 C152 7, 48 7, 20 20 Z" fill="#e0f2fe" stroke="#64748b" stroke-width="1.2" />
                          <path d="M60 18 L78 10 M140 18 L122 10" stroke="#94a3b8" stroke-width="1" stroke-linecap="round" />
                        </svg>
                      </div>

                      <!-- Top Car Deck Label & Driver Cabin Header -->
                      <div class="flex items-center justify-between w-full px-0.5 pb-1.5 mb-1 border-b border-slate-100 shrink-0 gap-1.5">
                        <div class="flex items-center space-x-1">
                          <span class="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-800 text-white text-[9px] font-semibold tracking-wider uppercase leading-none">
                            {{ deck.deckLabel }}
                          </span>
                          @if (hasAisle(deck)) {
                            <span class="inline-flex items-center px-1 py-0.5 rounded bg-slate-100 text-slate-500 text-[8px] font-mono border border-slate-200/60 leading-none">
                              {{ deck.gridCols }}C
                            </span>
                          }
                        </div>
                        @if (deck.deckId === 'lower' && customConfig().driverPosition !== 'none') {
                          <div class="flex items-center space-x-1 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                            <span class="text-[8px] font-semibold text-slate-500 uppercase leading-none">Front</span>
                            <svg class="w-4 h-4 text-slate-600" viewBox="0 0 36 36" fill="none">
                              <circle cx="18" cy="18" r="14" stroke="currentColor" stroke-width="2.6" />
                              <circle cx="18" cy="18" r="3.2" fill="currentColor" />
                              <path d="M5 15.5C10 14 26 14 31 15.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
                              <path d="M18 19.5V31" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
                            </svg>
                          </div>
                        } @else {
                          <span class="text-[8.5px] text-slate-400 font-mono leading-none">
                            {{ deck.gridRows }}R&times;{{ deck.gridCols }}C
                          </span>
                        }
                      </div>

                      <!-- 2D CSS Grid Container (Snug gaps & compact aisle to minimize horizontal scroll) -->
                      <div
                        class="grid gap-x-1 sm:gap-x-1.5 gap-y-2 pt-0.5 items-stretch justify-items-center justify-center w-fit mx-auto px-0.5"
                        [style.grid-template-rows]="'repeat(' + deck.gridRows + ', minmax(42px, auto))'"
                        [style.grid-template-columns]="getGridTemplateColumns(deck)">

                      <!-- Slim Identifiable Aisle Space in Car/Cab -->
                      @if (hasAisle(deck)) {
                        <div
                          [style.grid-column]="getAisleGridColumn(deck)"
                          [style.grid-row]="'1 / span ' + deck.gridRows"
                          class="w-full h-full min-h-[120px] flex flex-col items-center justify-between py-1 px-0 bg-slate-50/80 border-x border-dashed border-slate-200/90 rounded-xs select-none pointer-events-none relative"
                          title="Walkway Aisle">
                          
                          <div class="flex flex-col items-center pt-0.5">
                            <span class="text-[6px] font-bold text-slate-300 font-mono leading-none">▲</span>
                          </div>

                          <div class="flex flex-col items-center my-auto py-0.5 space-y-1 opacity-70">
                            <div class="w-0.5 h-0.5 rounded-full bg-slate-300"></div>
                            <span class="text-[6.5px] font-bold tracking-[0.15em] text-slate-400 uppercase font-mono [writing-mode:vertical-rl] rotate-180 select-none py-0.5">
                              AISLE
                            </span>
                            <div class="w-0.5 h-0.5 rounded-full bg-slate-300"></div>
                          </div>

                          <div class="flex flex-col items-center pb-0.5">
                            <span class="text-[6px] font-bold text-slate-300 font-mono leading-none">▼</span>
                          </div>
                        </div>
                      }

                      @for (seat of deck.seats; track seat.id) {
                        @if (seat.isReservedSection || seat.seatCategory === 'reserved' || seat.seatCategory === 'toilet' || seat.seatCategory === 'cafeteria' || seat.seatCategory === 'exit_entry') {
                          <div
                            [style.grid-row]="((seat.rowIndex ?? 0) + 1) + ' / span ' + (seat.rowSpan || 1)"
                            [style.grid-column]="getSeatGridColumn(seat, deck)"
                            [class.bg-orange-50]="seat.seatCategory === 'cafeteria'"
                            [class.border-orange-300]="seat.seatCategory === 'cafeteria'"
                            [class.text-orange-800]="seat.seatCategory === 'cafeteria'"
                            [class.bg-sky-50]="seat.seatCategory === 'exit_entry'"
                            [class.border-sky-300]="seat.seatCategory === 'exit_entry'"
                            [class.text-sky-800]="seat.seatCategory === 'exit_entry'"
                            [class.bg-teal-50/90]="seat.seatCategory !== 'cafeteria' && seat.seatCategory !== 'exit_entry'"
                            [class.border-teal-300]="seat.seatCategory !== 'cafeteria' && seat.seatCategory !== 'exit_entry'"
                            [class.text-teal-800]="seat.seatCategory !== 'cafeteria' && seat.seatCategory !== 'exit_entry'"
                            class="w-full h-full min-h-[42px] rounded-lg border border-dashed flex flex-col items-center justify-center p-0.5 select-none">
                            <mat-icon class="text-[15px]">
                              {{ seat.seatCategory === 'cafeteria' ? 'local_cafe' : seat.seatCategory === 'exit_entry' ? 'sensor_door' : 'wc' }}
                            </mat-icon>
                            <span class="text-[8px] font-bold uppercase tracking-tighter text-center leading-tight mt-0.5 break-words max-w-full px-0.5">
                              {{ seat.reservedLabel || (seat.seatCategory === 'cafeteria' ? 'Cafeteria' : seat.seatCategory === 'exit_entry' ? 'Exit / Entry' : seat.seatNumber || 'Toilet') }}
                            </span>
                            @if ((seat.rowSpan || 1) > 1 || (seat.colSpan || 1) > 1) {
                              <span class="text-[7px] opacity-75 font-mono leading-none mt-0.5">
                                {{ seat.rowSpan || 1 }}R&times;{{ seat.colSpan || 1 }}C
                              </span>
                            }
                          </div>
                        } @else {
                          <button
                            type="button"
                            (click)="toggleCarSeat(seat)"
                            [disabled]="seat.status === 'booked' || seat.isDriverSeat || seat.seatCategory === 'driver'"
                            [style.grid-row]="((seat.rowIndex ?? 0) + 1) + ' / span ' + (seat.rowSpan || (seat.seatType === 'sleeper' ? 2 : 1))"
                            [style.grid-column]="getSeatGridColumn(seat, deck)"
                            class="w-full h-full flex flex-col items-center justify-center cursor-pointer disabled:cursor-not-allowed active:scale-95 transition-transform focus:outline-none">
                            @if (seat.isDriverSeat || seat.seatCategory === 'driver') {
                              <div class="w-[32px] sm:w-[35px] h-[32px] sm:h-[35px] rounded-lg bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600">
                                <svg class="w-4.5 h-4.5" viewBox="0 0 36 36" fill="none">
                                  <circle cx="18" cy="18" r="14" stroke="currentColor" stroke-width="2.6" />
                                  <circle cx="18" cy="18" r="3.2" fill="currentColor" />
                                  <path d="M5 15.5C10 14 26 14 31 15.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
                                  <path d="M18 19.5V31" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
                                </svg>
                              </div>
                              <span class="text-[8px] text-slate-500 leading-none mt-0.5">Driver</span>
                            } @else if (seat.seatType === 'sleeper') {
                              @switch (getVisualSeatState(seat, 0, seat.col ?? 0)) {
                                @case ('selected') {
                                  <div class="relative flex items-center justify-center">
                                    <svg class="w-[35px] sm:w-[38px] h-[82px] sm:h-[88px]" viewBox="0 0 44 96" fill="none">
                                      <rect x="3" y="3" width="38" height="88" rx="7" fill="#15803d" stroke="#15803d" stroke-width="1.6" />
                                      <path d="M15 44l4.5 4.5L29.5 38.5" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                                      <rect x="9" y="80" width="26" height="5" rx="2.5" fill="#bbf7d0" />
                                    </svg>
                                    <span class="absolute top-1.5 text-[7.5px] font-bold text-white/95 font-mono leading-none">{{ seat.seatNumber }}</span>
                                  </div>
                                  <span class="text-[9px] sm:text-[10px] text-[#15803d] leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                                }
                                @case ('sold') {
                                  <div class="relative flex items-center justify-center">
                                    <svg class="w-[35px] sm:w-[38px] h-[82px] sm:h-[88px]" viewBox="0 0 44 96" fill="none">
                                      <rect x="3" y="3" width="38" height="88" rx="7" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
                                      <path d="M11 33L33 55M33 33L11 55" stroke="#cbd5e1" stroke-width="1.8" stroke-linecap="round" />
                                      <rect x="9" y="80" width="26" height="5" rx="2.5" fill="#e2e8f0" />
                                    </svg>
                                    <span class="absolute top-1.5 text-[7.5px] text-slate-400 font-mono leading-none">{{ seat.seatNumber }}</span>
                                  </div>
                                  <span class="text-[9px] sm:text-[10px] text-[#9ca3af] leading-none mt-0.5 tracking-tighter">Sold</span>
                                }
                                @case ('handicap') {
                                  <div class="relative flex items-center justify-center">
                                    <svg class="w-[35px] sm:w-[38px] h-[82px] sm:h-[88px] seat-category-pulse" viewBox="0 0 44 96" fill="none">
                                      <rect x="3" y="3" width="38" height="88" rx="7" fill="#fffbeb" stroke="#d97706" stroke-width="1.6" />
                                      <circle cx="22" cy="34" r="2.8" fill="#d97706" />
                                      <path d="M19 40h6v6h4m-10-3a5 5 0 1 0 6 7" stroke="#d97706" stroke-width="1.8" stroke-linecap="round" />
                                      <rect x="9" y="80" width="26" height="5" rx="2.5" fill="#fde68a" />
                                    </svg>
                                    <span class="absolute top-1.5 text-[7.5px] font-bold text-amber-800 font-mono leading-none">{{ seat.seatNumber }}</span>
                                  </div>
                                  <span class="text-[9px] sm:text-[10px] text-[#b45309] leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                                }
                                @case ('old_age') {
                                  <div class="relative flex items-center justify-center">
                                    <svg class="w-[35px] sm:w-[38px] h-[82px] sm:h-[88px] seat-category-pulse" viewBox="0 0 44 96" fill="none">
                                      <rect x="3" y="3" width="38" height="88" rx="7" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1.6" />
                                      <text x="22" y="47" text-anchor="middle" fill="#7c3aed" font-size="8.5" font-weight="700">SR</text>
                                      <rect x="9" y="80" width="26" height="5" rx="2.5" fill="#ddd6fe" />
                                    </svg>
                                    <span class="absolute top-1.5 text-[7.5px] font-bold text-violet-800 font-mono leading-none">{{ seat.seatNumber }}</span>
                                  </div>
                                  <span class="text-[9px] sm:text-[10px] text-violet-700 leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                                }
                                @default {
                                  <div class="relative flex items-center justify-center">
                                    <svg class="w-[35px] sm:w-[38px] h-[82px] sm:h-[88px] seat-available-pulse" viewBox="0 0 44 96" fill="none">
                                      <rect x="3" y="3" width="38" height="88" rx="7" fill="#ffffff" stroke="#15803d" stroke-width="1.6" />
                                      <rect x="9" y="80" width="26" height="5" rx="2.5" fill="#e5e7eb" />
                                    </svg>
                                    <span class="absolute top-1.5 text-[7.5px] font-bold text-emerald-800 font-mono leading-none">{{ seat.seatNumber }}</span>
                                  </div>
                                  <span class="text-[9px] sm:text-[10px] text-[#4b5563] leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                                }
                              }
                            } @else {
                              @switch (getVisualSeatState(seat, 0, seat.col ?? 0)) {
                                @case ('selected') {
                                  <svg class="w-[32px] sm:w-[35px] h-[30px] sm:h-[33px]" viewBox="0 0 40 38" fill="none">
                                    <rect x="6" y="4" width="28" height="26" rx="6" fill="#15803d" stroke="#15803d" stroke-width="1.6" />
                                    <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#15803d" stroke-width="1.8" stroke-linecap="round" />
                                    <path d="M15 17l3.5 3.5L25.5 13.5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                  </svg>
                                  <span class="text-[7.5px] font-bold text-[#15803d] font-mono leading-none mt-0.5">{{ seat.seatNumber }}</span>
                                  <span class="text-[9px] sm:text-[10px] text-[#15803d] leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                                }
                                @case ('sold') {
                                  <svg class="w-[32px] sm:w-[35px] h-[30px] sm:h-[33px] opacity-85" viewBox="0 0 40 38" fill="none">
                                    <rect x="6" y="4" width="28" height="26" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
                                    <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#cbd5e1" stroke-width="1.7" stroke-linecap="round" />
                                    <path d="M14 14l12 10M26 14L14 24" stroke="#cbd5e1" stroke-width="1.6" stroke-linecap="round" />
                                  </svg>
                                  <span class="text-[7.5px] text-slate-400 font-mono leading-none mt-0.5">{{ seat.seatNumber }}</span>
                                  <span class="text-[9px] sm:text-[10px] text-[#9ca3af] leading-none mt-0.5 tracking-tighter">Sold</span>
                                }
                                @case ('male') {
                                  <svg class="w-[32px] sm:w-[35px] h-[30px] sm:h-[33px] seat-category-pulse" viewBox="0 0 40 38" fill="none">
                                    <rect x="6" y="4" width="28" height="26" rx="6" fill="#ffffff" stroke="#2563eb" stroke-width="1.6" />
                                    <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round" />
                                    <circle cx="20" cy="11" r="2.3" fill="#2563eb" />
                                    <rect x="17.5" y="14.5" width="5" height="9" rx="2" fill="#2563eb" />
                                  </svg>
                                  <span class="text-[7.5px] font-bold text-blue-700 font-mono leading-none mt-0.5">{{ seat.seatNumber }}</span>
                                  <span class="text-[9px] sm:text-[10px] text-[#6b7280] leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                                }
                                @case ('female') {
                                  <svg class="w-[32px] sm:w-[35px] h-[30px] sm:h-[33px] seat-category-pulse" viewBox="0 0 40 38" fill="none">
                                    <rect x="6" y="4" width="28" height="26" rx="6" fill="#ffffff" stroke="#db2777" stroke-width="1.6" />
                                    <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#db2777" stroke-width="1.8" stroke-linecap="round" />
                                    <circle cx="20" cy="11" r="2.3" fill="#db2777" />
                                    <path d="M20 14l-3.5 9h7L20 14z" fill="#db2777" />
                                  </svg>
                                  <span class="text-[7.5px] font-bold text-pink-700 font-mono leading-none mt-0.5">{{ seat.seatNumber }}</span>
                                  <span class="text-[9px] sm:text-[10px] text-[#6b7280] leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                                }
                                @case ('handicap') {
                                  <svg class="w-[32px] sm:w-[35px] h-[30px] sm:h-[33px] seat-category-pulse" viewBox="0 0 40 38" fill="none">
                                    <rect x="6" y="4" width="28" height="26" rx="6" fill="#fffbeb" stroke="#d97706" stroke-width="1.6" />
                                    <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#d97706" stroke-width="1.8" stroke-linecap="round" />
                                    <circle cx="20" cy="10" r="2.2" fill="#d97706" />
                                    <path d="M18 14h4v4h3m-7-2a3.5 3.5 0 1 0 4 5" stroke="#d97706" stroke-width="1.6" stroke-linecap="round" />
                                  </svg>
                                  <span class="text-[7.5px] font-bold text-amber-800 font-mono leading-none mt-0.5">{{ seat.seatNumber }}</span>
                                  <span class="text-[9px] sm:text-[10px] text-[#b45309] leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                                }
                                @case ('old_age') {
                                  <svg class="w-[32px] sm:w-[35px] h-[30px] sm:h-[33px] seat-category-pulse" viewBox="0 0 40 38" fill="none">
                                    <rect x="6" y="4" width="28" height="26" rx="6" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1.6" />
                                    <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#7c3aed" stroke-width="1.8" stroke-linecap="round" />
                                    <text x="20" y="20" text-anchor="middle" fill="#7c3aed" font-size="8" font-weight="700">SR</text>
                                  </svg>
                                  <span class="text-[7.5px] font-bold text-violet-800 font-mono leading-none mt-0.5">{{ seat.seatNumber }}</span>
                                  <span class="text-[9px] sm:text-[10px] text-violet-700 leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                                }
                                @default {
                                  <svg class="w-[32px] sm:w-[35px] h-[30px] sm:h-[33px] seat-available-pulse" viewBox="0 0 40 38" fill="none">
                                    <rect x="6" y="4" width="28" height="26" rx="6" fill="#ffffff" stroke="#15803d" stroke-width="1.6" />
                                    <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#15803d" stroke-width="1.8" stroke-linecap="round" />
                                    <text x="20" y="21" text-anchor="middle" fill="#15803d" font-size="9" font-weight="700" font-family="monospace">{{ seat.seatNumber }}</text>
                                  </svg>
                                  <span class="text-[9px] sm:text-[10px] text-[#6b7280] leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                                }
                              }
                            }
                          </button>
                        }
                      }
                    </div>

                      <!-- Car Rear Bumper & Wrap-around Taillights -->
                      <div class="w-full mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between px-1.5 shrink-0 select-none">
                        <div class="flex items-center space-x-1">
                          <div class="w-3 h-1.5 rounded-full bg-rose-500" title="Rear Taillight"></div>
                          <div class="w-1.5 h-1.5 rounded-full bg-amber-400" title="Indicator"></div>
                        </div>
                        <div class="text-[8px] font-mono uppercase tracking-wider text-slate-400">
                          REAR &bull; {{ deck.deckLabel }}
                        </div>
                        <div class="flex items-center space-x-1">
                          <div class="w-1.5 h-1.5 rounded-full bg-amber-400" title="Indicator"></div>
                          <div class="w-3 h-1.5 rounded-full bg-rose-500" title="Rear Taillight"></div>
                        </div>
                      </div>

                    </div>
                  </div>
                }
              </div>
            </div>
          } @else {
            <!-- DEFAULT SUV / CAR CABIN SILHOUETTE CARD (Centered Horizontally & Shaped Like a Car) -->
            <div
              (touchstart)="onMapTouchStart($event)"
              (touchmove)="onMapTouchMove($event)"
              (touchend)="onMapTouchEnd($event)"
              (touchcancel)="onMapTouchEnd($event)"
              class="horizontal-scroll-container overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 pb-3 pt-1 px-2 w-full">
              <div
                [style.zoom]="zoomLevel()"
                class="relative bg-gradient-to-b from-[#dfe5f2] via-[#eef1f8] to-[#dce2ef] p-2 sm:p-2.5 rounded-t-[48px] rounded-b-[22px] border border-slate-300 w-[290px] sm:w-[315px] mx-auto shadow-sm">
              
              <!-- Swept-Back Car LED Headlights & Hood Grille -->
              <div class="absolute top-1.5 left-5 w-4 h-1 rounded-full bg-amber-300 border border-amber-400 -rotate-12"></div>
              <div class="absolute top-1 left-1/2 -translate-x-1/2 w-10 h-0.5 rounded-full bg-slate-400/70"></div>
              <div class="absolute top-1.5 right-5 w-4 h-1 rounded-full bg-amber-300 border border-amber-400 rotate-12"></div>

              <!-- Exterior Car Side Mirrors -->
              <div class="absolute -left-2 top-10 w-1.5 h-4 rounded-l-full bg-slate-500 border border-slate-600" title="Left Side Mirror"></div>
              <div class="absolute -right-2 top-10 w-1.5 h-4 rounded-r-full bg-slate-500 border border-slate-600" title="Right Side Mirror"></div>

              <!-- Front & Rear Car Tires -->
              <div class="absolute -left-[3px] top-16 w-[3px] h-7 rounded-l-full bg-slate-700"></div>
              <div class="absolute -right-[3px] top-16 w-[3px] h-7 rounded-r-full bg-slate-700"></div>
              <div class="absolute -left-[3px] bottom-10 w-[3px] h-7 rounded-l-full bg-slate-700"></div>
              <div class="absolute -right-[3px] bottom-10 w-[3px] h-7 rounded-r-full bg-slate-700"></div>

              <!-- Inner Car Cabin Card -->
              <div class="bg-white rounded-t-[40px] rounded-b-[16px] px-3 sm:px-3.5 pt-2.5 pb-3 result-card-shadow border border-slate-200/90">
                
                <!-- Curved Aerodynamic Car Windshield SVG -->
                <div class="w-full px-2 mb-1.5">
                  <svg class="w-full h-4.5 text-slate-700" viewBox="0 0 200 22" preserveAspectRatio="none" fill="none">
                    <path d="M10 19 C42 2, 158 2, 190 19 L180 20 C152 7, 48 7, 20 20 Z" fill="#e0f2fe" stroke="#64748b" stroke-width="1.2" />
                    <path d="M60 18 L78 10 M140 18 L122 10" stroke="#94a3b8" stroke-width="1" stroke-linecap="round" />
                  </svg>
                </div>

                <!-- Top Row inside Chassis: Car Model & Seat Count Tag + Steering Wheel -->
                <div class="flex items-center justify-between px-1 pb-2 border-b border-slate-100">
                  <div>
                    <span class="inline-block px-2 py-0.5 rounded-full bg-[#f0f2f8] text-[#1b1b1b] text-[10px]">
                      {{ car.vehicleName }}
                    </span>
                    <span class="block text-[10px] text-[#6b7280] mt-0.5 pl-0.5">
                      {{ car.totalSeats }} Seats &middot; {{ car.hasAc ? 'AC' : 'Non AC' }}
                    </span>
                  </div>

                  @if (customConfig().driverPosition !== 'none') {
                    <svg class="w-7 h-7 text-[#9ca3af] shrink-0" viewBox="0 0 36 36" fill="none">
                      <circle cx="18" cy="18" r="14" stroke="currentColor" stroke-width="2.6" />
                      <circle cx="18" cy="18" r="3.2" fill="currentColor" />
                      <path d="M5 15.5C10 14 26 14 31 15.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
                      <path d="M18 19.5V31" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
                    </svg>
                  }
                </div>

                <!-- Inner Bordered Passenger Seat Grid Container -->
                <div class="border border-[#e5e7eb] rounded-[16px] px-3 py-3.5 mt-2 space-y-4">
                  
                  <!-- ROW 1: FRONT CABIN -->
                  <div>
                    <div class="flex items-center justify-between text-[9px] text-[#9ca3af] uppercase tracking-wider mb-1.5 px-1">
                      <span>Front Cabin</span>
                      <span>Driver Side &rarr;</span>
                    </div>
                    <div class="flex items-center justify-between px-1.5">
                      <div class="flex items-center space-x-2.5">
                        @for (seat of getFrontRowSeats(car); track seat.id; let idx = $index) {
                          <button
                            type="button"
                            (click)="toggleCarSeat(seat)"
                            [disabled]="seat.status === 'booked'"
                            class="flex flex-col items-center justify-center cursor-pointer disabled:cursor-not-allowed active:scale-95 transition-transform focus:outline-none">
                            @switch (getVisualSeatState(seat, 0, idx)) {
                              @case ('selected') {
                                <svg class="w-9 h-9" viewBox="0 0 40 38" fill="none">
                                  <rect x="6" y="4" width="28" height="26" rx="6" fill="#15803d" stroke="#15803d" stroke-width="1.6" />
                                  <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#15803d" stroke-width="1.8" stroke-linecap="round" />
                                  <path d="M15 17l3.5 3.5L25.5 13.5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <span class="text-[9.5px] text-[#15803d] leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                              }
                              @case ('sold') {
                                <svg class="w-9 h-9 opacity-80" viewBox="0 0 40 38" fill="none">
                                  <rect x="6" y="4" width="28" height="26" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
                                  <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#cbd5e1" stroke-width="1.7" stroke-linecap="round" />
                                  <path d="M14 14l12 10M26 14L14 24" stroke="#cbd5e1" stroke-width="1.6" stroke-linecap="round" />
                                </svg>
                                <span class="text-[9.5px] text-[#9ca3af] leading-none mt-0.5 tracking-tighter">Sold</span>
                              }
                              @case ('male') {
                                <svg class="w-9 h-9 seat-category-pulse" viewBox="0 0 40 38" fill="none">
                                  <rect x="6" y="4" width="28" height="26" rx="6" fill="#ffffff" stroke="#2563eb" stroke-width="1.6" />
                                  <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round" />
                                  <circle cx="20" cy="11" r="2.3" fill="#2563eb" />
                                  <rect x="17.5" y="14.5" width="5" height="9" rx="2" fill="#2563eb" />
                                </svg>
                                <span class="text-[9.5px] text-[#6b7280] leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                              }
                              @default {
                                <svg class="w-9 h-9 seat-available-pulse" viewBox="0 0 40 38" fill="none">
                                  <rect x="6" y="4" width="28" height="26" rx="6" fill="#ffffff" stroke="#15803d" stroke-width="1.6" />
                                  <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#15803d" stroke-width="1.8" stroke-linecap="round" />
                                </svg>
                                <span class="text-[9.5px] text-[#6b7280] leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                              }
                            }
                          </button>
                        }
                      </div>

                      <!-- Driver Seat Box -->
                      <div class="flex flex-col items-center justify-center opacity-70">
                        <div class="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                          <mat-icon class="text-base">airline_seat_recline_normal</mat-icon>
                        </div>
                        <span class="text-[9px] text-[#9ca3af] leading-none mt-0.5">Driver</span>
                      </div>
                    </div>
                  </div>

                  <!-- ROW 2: MIDDLE ROW -->
                  @if (getMiddleRowSeats(car).length > 0) {
                    <div class="pt-2.5 border-t border-slate-100">
                      <div class="text-[9px] text-[#9ca3af] uppercase tracking-wider mb-1.5 px-1">
                        Middle Row ({{ getMiddleRowSeats(car).length }} Seats)
                      </div>
                      <div class="flex items-center justify-around px-1">
                        @for (seat of getMiddleRowSeats(car); track seat.id; let idx = $index) {
                          <button
                            type="button"
                            (click)="toggleCarSeat(seat)"
                            [disabled]="seat.status === 'booked'"
                            class="flex flex-col items-center justify-center cursor-pointer disabled:cursor-not-allowed active:scale-95 transition-transform focus:outline-none">
                            @switch (getVisualSeatState(seat, 1, idx)) {
                              @case ('selected') {
                                <svg class="w-9 h-9" viewBox="0 0 40 38" fill="none">
                                  <rect x="6" y="4" width="28" height="26" rx="6" fill="#15803d" stroke="#15803d" stroke-width="1.6" />
                                  <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#15803d" stroke-width="1.8" stroke-linecap="round" />
                                  <path d="M15 17l3.5 3.5L25.5 13.5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <span class="text-[9.5px] text-[#15803d] leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                              }
                              @case ('sold') {
                                <svg class="w-9 h-9 opacity-80" viewBox="0 0 40 38" fill="none">
                                  <rect x="6" y="4" width="28" height="26" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
                                  <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#cbd5e1" stroke-width="1.7" stroke-linecap="round" />
                                  <path d="M14 14l12 10M26 14L14 24" stroke="#cbd5e1" stroke-width="1.6" stroke-linecap="round" />
                                </svg>
                                <span class="text-[9.5px] text-[#9ca3af] leading-none mt-0.5 tracking-tighter">Sold</span>
                              }
                              @case ('female') {
                                <svg class="w-9 h-9 seat-category-pulse" viewBox="0 0 40 38" fill="none">
                                  <rect x="6" y="4" width="28" height="26" rx="6" fill="#ffffff" stroke="#db2777" stroke-width="1.6" />
                                  <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#db2777" stroke-width="1.8" stroke-linecap="round" />
                                  <circle cx="20" cy="11" r="2.3" fill="#db2777" />
                                  <path d="M20 14l-3.5 9h7L20 14z" fill="#db2777" />
                                </svg>
                                <span class="text-[9.5px] text-[#6b7280] leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                              }
                              @default {
                                <svg class="w-9 h-9 seat-available-pulse" viewBox="0 0 40 38" fill="none">
                                  <rect x="6" y="4" width="28" height="26" rx="6" fill="#ffffff" stroke="#15803d" stroke-width="1.6" />
                                  <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#15803d" stroke-width="1.8" stroke-linecap="round" />
                                </svg>
                                <span class="text-[9.5px] text-[#6b7280] leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                              }
                            }
                          </button>
                        }
                      </div>
                    </div>
                  }

                  <!-- ROW 3: REAR BENCH -->
                  @if (getRearBenchSeats(car).length > 0) {
                    <div class="pt-2.5 border-t border-slate-100">
                      <div class="text-[9px] text-[#9ca3af] uppercase tracking-wider mb-1.5 px-1">
                        Rear Row ({{ getRearBenchSeats(car).length }} Seats)
                      </div>
                      <div class="flex items-center justify-around px-1">
                        @for (seat of getRearBenchSeats(car); track seat.id; let idx = $index) {
                          <button
                            type="button"
                            (click)="toggleCarSeat(seat)"
                            [disabled]="seat.status === 'booked'"
                            class="flex flex-col items-center justify-center cursor-pointer disabled:cursor-not-allowed active:scale-95 transition-transform focus:outline-none">
                            @switch (getVisualSeatState(seat, 2, idx)) {
                              @case ('selected') {
                                <svg class="w-9 h-9" viewBox="0 0 40 38" fill="none">
                                  <rect x="6" y="4" width="28" height="26" rx="6" fill="#15803d" stroke="#15803d" stroke-width="1.6" />
                                  <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#15803d" stroke-width="1.8" stroke-linecap="round" />
                                  <path d="M15 17l3.5 3.5L25.5 13.5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <span class="text-[9.5px] text-[#15803d] leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                              }
                              @case ('sold') {
                                <svg class="w-9 h-9 opacity-80" viewBox="0 0 40 38" fill="none">
                                  <rect x="6" y="4" width="28" height="26" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
                                  <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#cbd5e1" stroke-width="1.7" stroke-linecap="round" />
                                  <path d="M14 14l12 10M26 14L14 24" stroke="#cbd5e1" stroke-width="1.6" stroke-linecap="round" />
                                </svg>
                                <span class="text-[9.5px] text-[#9ca3af] leading-none mt-0.5 tracking-tighter">Sold</span>
                              }
                              @default {
                                <svg class="w-9 h-9 seat-available-pulse" viewBox="0 0 40 38" fill="none">
                                  <rect x="6" y="4" width="28" height="26" rx="6" fill="#ffffff" stroke="#15803d" stroke-width="1.6" />
                                  <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#15803d" stroke-width="1.8" stroke-linecap="round" />
                                </svg>
                                <span class="text-[9.5px] text-[#6b7280] leading-none mt-0.5 tabular-nums tracking-tighter">₹{{ seat.price }}</span>
                              }
                            }
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>

                <!-- Car Rear Bumper & Taillights -->
                <div class="w-full mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between px-1.5 select-none">
                  <div class="flex items-center space-x-1">
                    <div class="w-3 h-1.5 rounded-full bg-rose-500"></div>
                    <div class="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                  </div>
                  <div class="text-[8px] font-mono uppercase tracking-wider text-slate-400">
                    REAR &bull; {{ car.vehicleName }}
                  </div>
                  <div class="flex items-center space-x-1">
                    <div class="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                    <div class="w-3 h-1.5 rounded-full bg-rose-500"></div>
                  </div>
                </div>

              </div>
            </div>
            </div>
          }

          <!-- =============================================================== -->
          <!-- "KNOW YOUR SEAT TYPES" LEGEND (Redesigned to Match Current Seat Design) -->
          <!-- =============================================================== -->
          <div class="mt-6 max-w-[400px] sm:max-w-[440px] mx-auto">
            <div class="flex items-center justify-center space-x-2 mb-3">
              <span class="h-px w-8 bg-slate-200"></span>
              <h2 class="text-[14px] sm:text-[15px] text-[#1b1b1b] tracking-tight">
                Know your seat types
              </h2>
              <span class="h-px w-8 bg-slate-200"></span>
            </div>

            <div class="bg-white rounded-[20px] border border-slate-200/90 result-card-shadow overflow-hidden">
              <!-- Table Header -->
              <div class="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex items-center justify-between text-[11px] uppercase tracking-wider text-slate-500">
                <span class="flex-1">Seat Status / Category</span>
                @if (hasSeaterSeats()) {
                  <span class="w-16 text-center">Seater</span>
                }
                @if (hasSleeperSeats()) {
                  <span class="w-16 text-center">Sleeper</span>
                }
              </div>

              <!-- Row 1: Available -->
              <div class="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-[12.5px] text-[#374151]">
                <div class="flex-1 pr-2">
                  <div class="text-[#1b1b1b] leading-snug flex items-center space-x-1.5">
                    <span>Available</span>
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  </div>
                  <div class="text-[10.5px] text-slate-400 leading-tight">Open for booking (pulsing)</div>
                </div>
                @if (hasSeaterSeats()) {
                  <div class="w-16 flex flex-col items-center justify-center">
                    <svg class="w-[32px] h-[30px] seat-available-pulse" viewBox="0 0 40 38" fill="none">
                      <rect x="6" y="4" width="28" height="26" rx="6" fill="#ffffff" stroke="#15803d" stroke-width="1.6" />
                      <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#15803d" stroke-width="1.8" stroke-linecap="round" />
                      <text x="20" y="21" text-anchor="middle" fill="#15803d" font-size="9" font-weight="700" font-family="monospace">1A</text>
                    </svg>
                    <span class="text-[8.5px] text-[#4b5563] leading-none mt-0.5 tabular-nums tracking-tighter">₹ Fare</span>
                  </div>
                }
                @if (hasSleeperSeats()) {
                  <div class="w-16 flex flex-col items-center justify-center">
                    <div class="relative flex items-center justify-center">
                      <svg class="w-[26px] h-[54px] seat-available-pulse" viewBox="0 0 44 96" fill="none">
                        <rect x="3" y="3" width="38" height="88" rx="7" fill="#ffffff" stroke="#15803d" stroke-width="1.6" />
                        <rect x="9" y="80" width="26" height="5" rx="2.5" fill="#e5e7eb" />
                      </svg>
                      <span class="absolute top-1 text-[6.5px] font-bold text-emerald-800 font-mono leading-none">U1</span>
                    </div>
                    <span class="text-[8.5px] text-[#4b5563] leading-none mt-0.5 tabular-nums tracking-tighter">₹ Fare</span>
                  </div>
                }
              </div>

              <!-- Row 2: Selected by you -->
              <div class="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-[12.5px] text-[#374151]">
                <div class="flex-1 pr-2">
                  <div class="text-[#15803d] leading-snug">Selected by you</div>
                  <div class="text-[10.5px] text-slate-400 leading-tight">Tap again to deselect</div>
                </div>
                @if (hasSeaterSeats()) {
                  <div class="w-16 flex flex-col items-center justify-center">
                    <svg class="w-[32px] h-[30px]" viewBox="0 0 40 38" fill="none">
                      <rect x="6" y="4" width="28" height="26" rx="6" fill="#15803d" stroke="#15803d" stroke-width="1.6" />
                      <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#15803d" stroke-width="1.8" stroke-linecap="round" />
                      <path d="M15 17l3.5 3.5L25.5 13.5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span class="text-[7.5px] font-bold text-[#15803d] font-mono leading-none mt-0.5">1A</span>
                  </div>
                }
                @if (hasSleeperSeats()) {
                  <div class="w-16 flex flex-col items-center justify-center">
                    <div class="relative flex items-center justify-center">
                      <svg class="w-[26px] h-[54px]" viewBox="0 0 44 96" fill="none">
                        <rect x="3" y="3" width="38" height="88" rx="7" fill="#15803d" stroke="#15803d" stroke-width="1.6" />
                        <path d="M15 44l4.5 4.5L29.5 38.5" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
                        <rect x="9" y="80" width="26" height="5" rx="2.5" fill="#bbf7d0" />
                      </svg>
                      <span class="absolute top-1 text-[6.5px] font-bold text-white/95 font-mono leading-none">U1</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Row 3: Already booked -->
              <div class="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-[12.5px] text-[#374151]">
                <div class="flex-1 pr-2">
                  <div class="text-[#1b1b1b] leading-snug">Already booked</div>
                  <div class="text-[10.5px] text-slate-400 leading-tight">Unavailable / Sold out</div>
                </div>
                @if (hasSeaterSeats()) {
                  <div class="w-16 flex flex-col items-center justify-center">
                    <svg class="w-[32px] h-[30px] opacity-85" viewBox="0 0 40 38" fill="none">
                      <rect x="6" y="4" width="28" height="26" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
                      <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#cbd5e1" stroke-width="1.7" stroke-linecap="round" />
                      <path d="M14 14l12 10M26 14L14 24" stroke="#cbd5e1" stroke-width="1.6" stroke-linecap="round" />
                    </svg>
                    <span class="text-[8.5px] text-[#9ca3af] leading-none mt-0.5 tracking-tighter">Sold</span>
                  </div>
                }
                @if (hasSleeperSeats()) {
                  <div class="w-16 flex flex-col items-center justify-center">
                    <div class="relative flex items-center justify-center">
                      <svg class="w-[26px] h-[54px]" viewBox="0 0 44 96" fill="none">
                        <rect x="3" y="3" width="38" height="88" rx="7" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
                        <path d="M11 33L33 55M33 33L11 55" stroke="#cbd5e1" stroke-width="1.8" stroke-linecap="round" />
                        <rect x="9" y="80" width="26" height="5" rx="2.5" fill="#e2e8f0" />
                      </svg>
                      <span class="absolute top-1 text-[6.5px] text-slate-400 font-mono leading-none">U1</span>
                    </div>
                    <span class="text-[8.5px] text-[#9ca3af] leading-none mt-0.5 tracking-tighter">Sold</span>
                  </div>
                }
              </div>

              <!-- Row 4: Available only for male passenger -->
              <div class="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-[12.5px] text-[#374151]">
                <div class="flex-1 pr-2">
                  <div class="text-[#1b1b1b] leading-snug">Male passenger only</div>
                  <div class="text-[10.5px] text-blue-600/80 leading-tight">Adjacent to male traveller</div>
                </div>
                @if (hasSeaterSeats()) {
                  <div class="w-16 flex flex-col items-center justify-center">
                    <svg class="w-[32px] h-[30px]" viewBox="0 0 40 38" fill="none">
                      <rect x="6" y="4" width="28" height="26" rx="6" fill="#ffffff" stroke="#2563eb" stroke-width="1.6" />
                      <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round" />
                      <circle cx="20" cy="11" r="2.3" fill="#2563eb" />
                      <rect x="17.5" y="14.5" width="5" height="9" rx="2" fill="#2563eb" />
                    </svg>
                    <span class="text-[7.5px] font-bold text-blue-700 font-mono leading-none mt-0.5">1A</span>
                  </div>
                }
                @if (hasSleeperSeats()) {
                  <div class="w-16 flex flex-col items-center justify-center">
                    <div class="relative flex items-center justify-center">
                      <svg class="w-[26px] h-[54px]" viewBox="0 0 44 96" fill="none">
                        <rect x="3" y="3" width="38" height="88" rx="7" fill="#ffffff" stroke="#2563eb" stroke-width="1.6" />
                        <circle cx="22" cy="36" r="3" fill="#2563eb" />
                        <rect x="18.5" y="41" width="7" height="12" rx="2.5" fill="#2563eb" />
                        <rect x="9" y="80" width="26" height="5" rx="2.5" fill="#dbeafe" />
                      </svg>
                      <span class="absolute top-1 text-[6.5px] font-bold text-blue-700 font-mono leading-none">U1</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Row 5: Available only for female passenger -->
              <div class="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-[12.5px] text-[#374151]">
                <div class="flex-1 pr-2">
                  <div class="text-[#1b1b1b] leading-snug">Female passenger only</div>
                  <div class="text-[10.5px] text-pink-600/80 leading-tight">Reserved for women</div>
                </div>
                @if (hasSeaterSeats()) {
                  <div class="w-16 flex flex-col items-center justify-center">
                    <svg class="w-[32px] h-[30px]" viewBox="0 0 40 38" fill="none">
                      <rect x="6" y="4" width="28" height="26" rx="6" fill="#ffffff" stroke="#db2777" stroke-width="1.6" />
                      <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#db2777" stroke-width="1.8" stroke-linecap="round" />
                      <circle cx="20" cy="11" r="2.3" fill="#db2777" />
                      <path d="M20 14l-3.5 9h7L20 14z" fill="#db2777" />
                    </svg>
                    <span class="text-[7.5px] font-bold text-pink-700 font-mono leading-none mt-0.5">1A</span>
                  </div>
                }
                @if (hasSleeperSeats()) {
                  <div class="w-16 flex flex-col items-center justify-center">
                    <div class="relative flex items-center justify-center">
                      <svg class="w-[26px] h-[54px]" viewBox="0 0 44 96" fill="none">
                        <rect x="3" y="3" width="38" height="88" rx="7" fill="#ffffff" stroke="#db2777" stroke-width="1.6" />
                        <circle cx="22" cy="36" r="3" fill="#db2777" />
                        <path d="M22 41l-4.5 12h9L22 41z" fill="#db2777" />
                        <rect x="9" y="80" width="26" height="5" rx="2.5" fill="#fce7f3" />
                      </svg>
                      <span class="absolute top-1 text-[6.5px] font-bold text-pink-700 font-mono leading-none">U1</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Row 6: Physically Handicap Priority Seat -->
              <div class="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-[12.5px] text-[#374151]">
                <div class="flex-1 pr-2">
                  <div class="text-[#1b1b1b] leading-snug">Divyang / Handicap seat</div>
                  <div class="text-[10.5px] text-amber-700/80 leading-tight">Priority accessibility seat</div>
                </div>
                @if (hasSeaterSeats()) {
                  <div class="w-16 flex flex-col items-center justify-center">
                    <svg class="w-[32px] h-[30px]" viewBox="0 0 40 38" fill="none">
                      <rect x="6" y="4" width="28" height="26" rx="6" fill="#fffbeb" stroke="#d97706" stroke-width="1.6" />
                      <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#d97706" stroke-width="1.8" stroke-linecap="round" />
                      <circle cx="20" cy="10" r="2.2" fill="#d97706" />
                      <path d="M18 14h4v4h3m-7-2a3.5 3.5 0 1 0 4 5" stroke="#d97706" stroke-width="1.6" stroke-linecap="round" />
                    </svg>
                    <span class="text-[7.5px] font-bold text-amber-800 font-mono leading-none mt-0.5">1A</span>
                  </div>
                }
                @if (hasSleeperSeats()) {
                  <div class="w-16 flex flex-col items-center justify-center">
                    <div class="relative flex items-center justify-center">
                      <svg class="w-[26px] h-[54px]" viewBox="0 0 44 96" fill="none">
                        <rect x="3" y="3" width="38" height="88" rx="7" fill="#fffbeb" stroke="#d97706" stroke-width="1.6" />
                        <circle cx="22" cy="34" r="2.8" fill="#d97706" />
                        <path d="M19 40h6v6h4m-10-3a5 5 0 1 0 6 7" stroke="#d97706" stroke-width="1.8" stroke-linecap="round" />
                        <rect x="9" y="80" width="26" height="5" rx="2.5" fill="#fde68a" />
                      </svg>
                      <span class="absolute top-1 text-[6.5px] font-bold text-amber-800 font-mono leading-none">U1</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Row 7: Senior Citizen Priority Seat -->
              <div class="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between text-[12.5px] text-[#374151]">
                <div class="flex-1 pr-2">
                  <div class="text-[#1b1b1b] leading-snug">Senior citizen seat (SR)</div>
                  <div class="text-[10.5px] text-violet-600/80 leading-tight">Priority seat for elderly (60+)</div>
                </div>
                @if (hasSeaterSeats()) {
                  <div class="w-16 flex flex-col items-center justify-center">
                    <svg class="w-[32px] h-[30px]" viewBox="0 0 40 38" fill="none">
                      <rect x="6" y="4" width="28" height="26" rx="6" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1.6" />
                      <path d="M3 14v13a6 6 0 0 0 6 6h22a6 6 0 0 0 6-6V14" stroke="#7c3aed" stroke-width="1.8" stroke-linecap="round" />
                      <text x="20" y="20" text-anchor="middle" fill="#7c3aed" font-size="8" font-weight="700">SR</text>
                    </svg>
                    <span class="text-[7.5px] font-bold text-violet-800 font-mono leading-none mt-0.5">1A</span>
                  </div>
                }
                @if (hasSleeperSeats()) {
                  <div class="w-16 flex flex-col items-center justify-center">
                    <div class="relative flex items-center justify-center">
                      <svg class="w-[26px] h-[54px]" viewBox="0 0 44 96" fill="none">
                        <rect x="3" y="3" width="38" height="88" rx="7" fill="#f5f3ff" stroke="#7c3aed" stroke-width="1.6" />
                        <text x="22" y="47" text-anchor="middle" fill="#7c3aed" font-size="8.5" font-weight="700">SR</text>
                        <rect x="9" y="80" width="26" height="5" rx="2.5" fill="#ddd6fe" />
                      </svg>
                      <span class="absolute top-1 text-[6.5px] font-bold text-violet-800 font-mono leading-none">U1</span>
                    </div>
                  </div>
                }
              </div>

              <!-- Row 8: Vehicle Layout Symbols (Driver, Toilet, Cafeteria, Door) -->
              <div class="px-4 py-3 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-600">
                <div class="flex items-center space-x-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200/80">
                  <svg class="w-3.5 h-3.5 text-slate-600" viewBox="0 0 36 36" fill="none">
                    <circle cx="18" cy="18" r="14" stroke="currentColor" stroke-width="2.6" />
                    <circle cx="18" cy="18" r="3.2" fill="currentColor" />
                    <path d="M5 15.5C10 14 26 14 31 15.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
                    <path d="M18 19.5V31" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
                  </svg>
                  <span>Driver</span>
                </div>
                <div class="flex items-center space-x-1 bg-teal-50/90 text-teal-800 px-2 py-1 rounded-lg border border-dashed border-teal-300">
                  <mat-icon class="text-[13px] leading-none">wc</mat-icon>
                  <span>Toilet</span>
                </div>
                <div class="flex items-center space-x-1 bg-orange-50 text-orange-800 px-2 py-1 rounded-lg border border-dashed border-orange-300">
                  <mat-icon class="text-[13px] leading-none">local_cafe</mat-icon>
                  <span>Cafeteria</span>
                </div>
                <div class="flex items-center space-x-1 bg-sky-50 text-sky-800 px-2 py-1 rounded-lg border border-dashed border-sky-300">
                  <mat-icon class="text-[13px] leading-none">sensor_door</mat-icon>
                  <span>Exit / Entry</span>
                </div>
              </div>
            </div>
          </div>

        </main>

        <!-- =============================================================== -->
        <!-- BACKDROP WHEN OFFCANVAS POPUP IS EXPANDED OR DRAGGED UP -->
        <!-- =============================================================== -->
        @if (isOffcanvasActive()) {
          <div
            (click)="collapseOffcanvas()"
            (keydown.escape)="collapseOffcanvas()"
            tabindex="-1"
            aria-hidden="true"
            class="fixed inset-0 z-40 bg-black/45 backdrop-blur-[1px] animate-fade-in cursor-pointer">
          </div>
        }

        <!-- =============================================================== -->
        <!-- BOTTOM OFFCANVAS POPUP / SHEET -->
        <!-- Lower down by default, smooth click/drag up & down -->
        <!-- =============================================================== -->
        <section
          aria-label="Car Details Offcanvas Popup"
          [style.height.px]="dragSheetHeight() ?? (isOffcanvasExpanded() ? expandedHeightPx() : collapsedHeightPx())"
          [class.transition-all]="!isDragging()"
          [class.duration-300]="!isDragging()"
          [class.ease-out]="!isDragging()"
          class="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[30px] offcanvas-shadow border-t border-slate-200/90 flex flex-col overflow-hidden">
          
          <div class="max-w-xl w-full mx-auto flex flex-col h-full overflow-hidden">
            
            <!-- TOP HEADER (Always visible at top of sheet) -->
            <div
              class="px-4 pt-1.5 pb-1.5 shrink-0 border-b border-transparent"
              [class.border-slate-100]="isOffcanvasActive()">
              
              <!-- Draggable Handle Pill with visual hint (Isolated drag gesture) -->
              <div
                (pointerdown)="onDragStart($event)"
                (pointermove)="onDragMove($event)"
                (pointerup)="onDragEnd($event)"
                (pointercancel)="onDragEnd($event)"
                class="flex flex-col items-center justify-center py-1 touch-none select-none cursor-grab active:cursor-grabbing"
                title="Drag or tap to expand car details">
                <div class="w-12 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400 transition-colors"></div>
                <div class="flex items-center space-x-1 mt-1 text-[10px] text-slate-400 font-medium tracking-tight">
                  @if (isOffcanvasActive()) {
                    <mat-icon class="text-[12px] leading-none">keyboard_arrow_down</mat-icon>
                    <span>Drag or tap down to collapse</span>
                  } @else {
                    <mat-icon class="text-[12px] leading-none">keyboard_arrow_up</mat-icon>
                    <span>{{ state.selectedCarSeatIds().length > 0 ? 'Drag up for car details' : 'Car info & policies • Drag or tap' }}</span>
                  }
                </div>
              </div>

              <!-- COLLAPSED PEEK CONTENT (When NOT expanded and NOT dragged up) -->
              @if (!isOffcanvasActive()) {
                @if (state.selectedCarSeatIds().length > 0) {
                  <!-- DYNAMIC REAL-TIME PRICE SUMMARY BAR (Collapsed Bottom Bar) -->
                  <div class="pt-0.5 pb-1.5 space-y-1.5 animate-fade-in">
                    <!-- Interactive Selected Car Seat Chips Strip (Tap × to remove seat in real-time) -->
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5 flex-1">
                        @for (s of getSelectedSeatsList(car); track s.id) {
                          <button
                            type="button"
                            (click)="toggleCarSeat(s); $event.stopPropagation()"
                            class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10.5px] shrink-0 cursor-pointer hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-colors animate-scale-in"
                            title="Remove seat {{ s.seatNumber }}">
                            <span class="font-mono font-bold">{{ s.seatNumber }}</span>
                            <span class="text-emerald-700/80 tabular-nums">₹{{ s.price || car.baseFare }}</span>
                            <mat-icon class="text-[11px] leading-none opacity-75">close</mat-icon>
                          </button>
                        }
                      </div>
                      @if (state.selectedCarSeatIds().length > 1) {
                        <button
                          type="button"
                          (click)="clearSelectedCarSeats(); $event.stopPropagation()"
                          class="text-[10px] text-[#4338ca] hover:opacity-85 px-2.5 py-0.5 rounded-full bg-[#e0e7ff] border border-indigo-200/80 shrink-0 cursor-pointer">
                          Clear all
                        </button>
                      }
                    </div>

                    <!-- Inline Expandable Fare Breakup Drawer -->
                    @if (showFareBreakup()) {
                      <div class="px-3 py-2 rounded-[22px] bg-slate-50 border border-slate-200/80 text-[11px] space-y-1 animate-fade-in">
                        <div class="flex items-center justify-between text-slate-600">
                          <span>Selected Seats ({{ selectedSeatNumbers(car) }})</span>
                          <span class="tabular-nums text-slate-800">₹{{ getSelectedTotal(car) }}</span>
                        </div>
                        <div class="flex items-center justify-between text-slate-600">
                          <span>Toll &amp; State Taxes</span>
                          <span class="text-emerald-700">Included</span>
                        </div>
                      </div>
                    }

                    <!-- Main Real-Time Price Summary & CTA Row -->
                    <div class="flex items-center justify-between gap-3">
                      <div class="min-w-0 flex-1">
                        <div class="flex items-center space-x-1.5">
                          <span class="px-2 py-0.5 rounded-full bg-[#e0e7ff] text-[#4338ca] text-[10px] font-bold tabular-nums">
                            {{ state.selectedCarSeatIds().length }} {{ state.selectedCarSeatIds().length === 1 ? 'Seat' : 'Seats' }}
                          </span>
                          <button
                            type="button"
                            (click)="toggleFareBreakup(); $event.stopPropagation()"
                            class="text-[10.5px] text-[#4f46e5] hover:underline flex items-center space-x-0.5 cursor-pointer">
                            <span>{{ showFareBreakup() ? 'Hide breakup' : 'Fare breakup' }}</span>
                            <mat-icon class="text-[12px] leading-none">{{ showFareBreakup() ? 'expand_more' : 'expand_less' }}</mat-icon>
                          </button>
                        </div>
                        <div class="flex items-baseline space-x-1.5 mt-0.5">
                          <span class="text-lg sm:text-xl font-bold text-slate-900 leading-tight tabular-nums animate-scale-in">
                            ₹{{ getSelectedTotal(car) }}
                          </span>
                          <span class="text-[10px] text-slate-400">
                            (All-inclusive cab fare)
                          </span>
                        </div>
                      </div>

                      <!-- Car Theme Primary CTA Button -->
                      <button
                        type="button"
                        (click)="state.goToBoardingDropping(); $event.stopPropagation()"
                        class="px-4 sm:px-5 py-2.5 rounded-[22px] bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea] hover:opacity-95 text-white text-xs sm:text-sm font-semibold cursor-pointer active:scale-95 transition-all flex items-center space-x-1.5 shrink-0 shadow-xs">
                        <span>Select Boarding &amp; Dropping</span>
                        <mat-icon class="text-base sm:text-lg text-white">arrow_forward</mat-icon>
                      </button>
                    </div>
                  </div>
                } @else {
                  <!-- Collapsed Peek with Operator Info + Live Starting Fare Prompt -->
                  <div class="flex items-center justify-between gap-2.5 pt-1 pb-1">
                    <div class="min-w-0">
                      <div class="flex items-center space-x-2">
                        <h3 class="text-xs sm:text-[13px] font-semibold text-slate-800 truncate">
                          {{ car.operatorName }}
                        </h3>
                        <span class="text-[11px] text-slate-500 shrink-0">
                          {{ car.departureTime }} - {{ car.arrivalTime }} &middot; {{ car.vehicleName }}
                        </span>
                      </div>
                      <div class="flex items-center space-x-1.5 mt-0.5 text-[10.5px] text-emerald-700">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>Tap any available seat above &bull; Fares from <strong>₹{{ car.baseFare }}</strong></span>
                      </div>
                    </div>

                    <div class="flex items-center space-x-2 shrink-0">
                      <!-- Compact Rating Pill -->
                      <span class="px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[11px] font-medium flex items-center space-x-0.5">
                        <span class="text-[9px]">★</span>
                        <span>{{ car.rating.toFixed(1) }}</span>
                      </span>
                      <button
                        type="button"
                        (click)="toggleOffcanvas(); $event.stopPropagation()"
                        class="px-3 py-1 rounded-[22px] bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea] text-white text-[11px] font-semibold flex items-center space-x-0.5 cursor-pointer active:scale-95 transition-all">
                        <span>Details</span>
                        <mat-icon class="text-xs text-white">expand_less</mat-icon>
                      </button>
                    </div>
                  </div>
                }

                <!-- Peek Reason-to-Explore Offcanvas Teaser (Car Theme Button) -->
                <button
                  type="button"
                  (click)="openOffcanvas(); $event.stopPropagation()"
                  class="mt-1 w-full text-left px-3 py-1.5 rounded-[22px] bg-gradient-to-r from-[#fde6cf]/55 via-[#fae1ef]/55 to-[#dfe7fd]/55 border border-indigo-200/80 hover:border-indigo-300 flex items-center justify-between gap-2 cursor-pointer transition-all active:scale-[0.99] select-none">
                  <div class="flex items-center space-x-2 min-w-0 truncate">
                    <span class="w-4.5 h-4.5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-[9px] shrink-0 font-bold">
                      ★
                    </span>
                    <div class="min-w-0 truncate text-[11px] text-slate-800">
                      <span class="font-bold text-amber-900">tripReward: Free Ride</span>
                      <span class="text-slate-400 mx-1">&bull;</span>
                      <span class="text-slate-600 font-medium">Safety Guarantee, Route Stops &amp; Free Cancellation</span>
                    </div>
                  </div>
                  <div class="flex items-center space-x-0.5 shrink-0 text-[10px] font-semibold text-white bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea] px-2.5 py-0.5 rounded-full shadow-2xs">
                    <span>Explore</span>
                    <mat-icon class="text-xs leading-none text-white">expand_less</mat-icon>
                  </div>
                </button>
              }
            </div>

            <!-- EXPANDED CONTENT (Visible when expanded or dragged up) -->
            @if (isOffcanvasActive()) {
              <div class="flex-1 overflow-y-auto px-4 py-2 space-y-3 select-text">
                
                <!-- tripReward Banner -->
                <button
                  type="button"
                  (click)="state.isCouponModalOpen.set(true)"
                  class="w-full px-3.5 py-2 rounded-[22px] bg-gradient-to-r from-[#fde6cf]/65 via-[#fae1ef]/65 to-[#dfe7fd]/65 border border-indigo-200/70 flex items-center justify-between gap-2 cursor-pointer active:scale-[0.99] transition-transform">
                  <div class="flex items-center space-x-2">
                    <span class="w-5 h-5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center text-[10px] shrink-0 font-bold">
                      ★
                    </span>
                    <span class="text-xs font-semibold text-amber-900 tracking-tight">tripReward</span>
                  </div>
                  <div class="flex items-center space-x-1 text-[11px] text-slate-800">
                    <span>Take 4 trips to get a <strong>free ticket</strong></span>
                    <mat-icon class="text-sm text-[#4f46e5] leading-none">chevron_right</mat-icon>
                  </div>
                </button>

                <!-- Operator Row with Rating -->
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <h2 class="text-base sm:text-lg font-bold text-slate-900 truncate leading-tight">
                      {{ car.operatorName }}
                    </h2>
                    <p class="text-xs text-slate-500 mt-0.5 leading-tight truncate">
                      {{ car.departureTime }} - {{ car.arrivalTime }} &middot; {{ formattedTravelDate() }} &middot; {{ car.vehicleName }}
                    </p>
                  </div>

                  <!-- Two-Tier Rating Badge -->
                  <div
                    [class.bg-[#dcfce7]]="car.rating >= 4.0"
                    [class.bg-[#fef3c7]]="car.rating >= 2.2 && car.rating < 4.0"
                    [class.bg-[#fee2e2]]="car.rating < 2.2"
                    class="rounded-lg p-[1.5px] min-w-[44px] text-center shrink-0 border border-slate-200/60">
                    <div
                      [class.bg-[#15803d]]="car.rating >= 4.0"
                      [class.bg-[#c27803]]="car.rating >= 2.2 && car.rating < 4.0"
                      [class.bg-[#dc2626]]="car.rating < 2.2"
                      class="rounded-[5px] px-1.5 py-0.5 text-white text-[10px] leading-tight flex items-center justify-center space-x-0.5 font-medium">
                      <span class="text-[9px]">★</span>
                      <span>{{ car.rating.toFixed(1) }}</span>
                    </div>
                    <div class="text-[9px] text-[#1b1b1b] py-0.5 leading-tight tabular-nums font-medium">
                      {{ car.totalReviews }}
                    </div>
                  </div>
                </div>

            <!-- 7 Horizontal Cards Row (Car Button Theme: Indigo-to-Purple Gradient + Rounded-[22px]) -->
            <div class="py-1 flex items-center space-x-2 overflow-x-auto scrollbar-none shrink-0 border-b border-slate-100">
              
              <button
                type="button"
                (click)="openSection('safety')"
                [class.bg-gradient-to-r]="activeSection() === 'safety'"
                [class.from-[#4f46e5]]="activeSection() === 'safety'"
                [class.via-[#6366f1]]="activeSection() === 'safety'"
                [class.to-[#9333ea]]="activeSection() === 'safety'"
                [class.border-indigo-400/50]="activeSection() === 'safety'"
                [class.shadow-xs]="activeSection() === 'safety'"
                [class.bg-[#fcfcfd]]="activeSection() !== 'safety'"
                [class.hover:bg-indigo-50/50]="activeSection() !== 'safety'"
                [class.border-slate-200/90]="activeSection() !== 'safety'"
                class="rounded-[22px] px-3.5 py-2 min-w-[122px] text-left shrink-0 cursor-pointer transition-all border active:scale-95">
                <span
                  class="text-xs font-semibold block leading-snug"
                  [class.text-white]="activeSection() === 'safety'"
                  [class.text-slate-900]="activeSection() !== 'safety'">
                  Car Safety
                </span>
                <span
                  class="text-[10px] block leading-tight mt-0.5"
                  [class.text-white/90]="activeSection() === 'safety'"
                  [class.text-slate-500]="activeSection() !== 'safety'">
                  {{ customConfig().safetyBadgeText }}
                </span>
              </button>

              <button
                type="button"
                (click)="openSection('boarding')"
                [class.bg-gradient-to-r]="activeSection() === 'boarding'"
                [class.from-[#4f46e5]]="activeSection() === 'boarding'"
                [class.via-[#6366f1]]="activeSection() === 'boarding'"
                [class.to-[#9333ea]]="activeSection() === 'boarding'"
                [class.border-indigo-400/50]="activeSection() === 'boarding'"
                [class.shadow-xs]="activeSection() === 'boarding'"
                [class.bg-[#fcfcfd]]="activeSection() !== 'boarding'"
                [class.hover:bg-indigo-50/50]="activeSection() !== 'boarding'"
                [class.border-slate-200/90]="activeSection() !== 'boarding'"
                class="rounded-[22px] px-3.5 py-2 min-w-[128px] text-left shrink-0 cursor-pointer transition-all border active:scale-95">
                <span
                  class="text-xs font-semibold block leading-snug"
                  [class.text-white]="activeSection() === 'boarding'"
                  [class.text-slate-900]="activeSection() !== 'boarding'">
                  Boarding Points
                </span>
                <span
                  class="text-[10px] block leading-tight mt-0.5"
                  [class.text-white/90]="activeSection() === 'boarding'"
                  [class.text-slate-500]="activeSection() !== 'boarding'">
                  {{ customConfig().boardingPoints.length }} Pickup Stands
                </span>
              </button>

              <button
                type="button"
                (click)="openSection('dropping')"
                [class.bg-gradient-to-r]="activeSection() === 'dropping'"
                [class.from-[#4f46e5]]="activeSection() === 'dropping'"
                [class.via-[#6366f1]]="activeSection() === 'dropping'"
                [class.to-[#9333ea]]="activeSection() === 'dropping'"
                [class.border-indigo-400/50]="activeSection() === 'dropping'"
                [class.shadow-xs]="activeSection() === 'dropping'"
                [class.bg-[#fcfcfd]]="activeSection() !== 'dropping'"
                [class.hover:bg-indigo-50/50]="activeSection() !== 'dropping'"
                [class.border-slate-200/90]="activeSection() !== 'dropping'"
                class="rounded-[22px] px-3.5 py-2 min-w-[128px] text-left shrink-0 cursor-pointer transition-all border active:scale-95">
                <span
                  class="text-xs font-semibold block leading-snug"
                  [class.text-white]="activeSection() === 'dropping'"
                  [class.text-slate-900]="activeSection() !== 'dropping'">
                  Dropping Points
                </span>
                <span
                  class="text-[10px] block leading-tight mt-0.5"
                  [class.text-white/90]="activeSection() === 'dropping'"
                  [class.text-slate-500]="activeSection() !== 'dropping'">
                  {{ customConfig().droppingPoints.length }} Drop Stands
                </span>
              </button>

              <button
                type="button"
                (click)="openSection('route')"
                [class.bg-gradient-to-r]="activeSection() === 'route'"
                [class.from-[#4f46e5]]="activeSection() === 'route'"
                [class.via-[#6366f1]]="activeSection() === 'route'"
                [class.to-[#9333ea]]="activeSection() === 'route'"
                [class.border-indigo-400/50]="activeSection() === 'route'"
                [class.shadow-xs]="activeSection() === 'route'"
                [class.bg-[#fcfcfd]]="activeSection() !== 'route'"
                [class.hover:bg-indigo-50/50]="activeSection() !== 'route'"
                [class.border-slate-200/90]="activeSection() !== 'route'"
                class="rounded-[22px] px-3.5 py-2 min-w-[118px] text-left shrink-0 cursor-pointer transition-all border active:scale-95">
                <span
                  class="text-xs font-semibold block leading-snug"
                  [class.text-white]="activeSection() === 'route'"
                  [class.text-slate-900]="activeSection() !== 'route'">
                  Car Route
                </span>
                <span
                  class="text-[10px] block leading-tight mt-0.5"
                  [class.text-white/90]="activeSection() === 'route'"
                  [class.text-slate-500]="activeSection() !== 'route'">
                  {{ car.duration }} Direct
                </span>
              </button>

              <button
                type="button"
                (click)="openSection('reviews')"
                [class.bg-gradient-to-r]="activeSection() === 'reviews'"
                [class.from-[#4f46e5]]="activeSection() === 'reviews'"
                [class.via-[#6366f1]]="activeSection() === 'reviews'"
                [class.to-[#9333ea]]="activeSection() === 'reviews'"
                [class.border-indigo-400/50]="activeSection() === 'reviews'"
                [class.shadow-xs]="activeSection() === 'reviews'"
                [class.bg-[#fcfcfd]]="activeSection() !== 'reviews'"
                [class.hover:bg-indigo-50/50]="activeSection() !== 'reviews'"
                [class.border-slate-200/90]="activeSection() !== 'reviews'"
                class="rounded-[22px] px-3.5 py-2 min-w-[118px] text-left shrink-0 cursor-pointer transition-all border active:scale-95">
                <span
                  class="text-xs font-semibold block leading-snug"
                  [class.text-white]="activeSection() === 'reviews'"
                  [class.text-slate-900]="activeSection() !== 'reviews'">
                  Reviews
                </span>
                <span
                  class="text-[10px] block leading-tight mt-0.5"
                  [class.text-white/90]="activeSection() === 'reviews'"
                  [class.text-slate-500]="activeSection() !== 'reviews'">
                  {{ customConfig().reviews.length }} Featured
                </span>
              </button>

              <button
                type="button"
                (click)="openSection('cancellation')"
                [class.bg-gradient-to-r]="activeSection() === 'cancellation'"
                [class.from-[#4f46e5]]="activeSection() === 'cancellation'"
                [class.via-[#6366f1]]="activeSection() === 'cancellation'"
                [class.to-[#9333ea]]="activeSection() === 'cancellation'"
                [class.border-indigo-400/50]="activeSection() === 'cancellation'"
                [class.shadow-xs]="activeSection() === 'cancellation'"
                [class.bg-[#fcfcfd]]="activeSection() !== 'cancellation'"
                [class.hover:bg-indigo-50/50]="activeSection() !== 'cancellation'"
                [class.border-slate-200/90]="activeSection() !== 'cancellation'"
                class="rounded-[22px] px-3.5 py-2 min-w-[128px] text-left shrink-0 cursor-pointer transition-all border active:scale-95">
                <span
                  class="text-xs font-semibold block leading-snug"
                  [class.text-white]="activeSection() === 'cancellation'"
                  [class.text-slate-900]="activeSection() !== 'cancellation'">
                  Cancellation
                </span>
                <span
                  class="text-[10px] block leading-tight mt-0.5"
                  [class.text-white/90]="activeSection() === 'cancellation'"
                  [class.text-slate-500]="activeSection() !== 'cancellation'">
                  {{ customConfig().cancellationSlabs[0]?.ruleText || 'Up to 90% Refund' }}
                </span>
              </button>

              <button
                type="button"
                (click)="openSection('datechange')"
                [class.bg-gradient-to-r]="activeSection() === 'datechange'"
                [class.from-[#4f46e5]]="activeSection() === 'datechange'"
                [class.via-[#6366f1]]="activeSection() === 'datechange'"
                [class.to-[#9333ea]]="activeSection() === 'datechange'"
                [class.border-indigo-400/50]="activeSection() === 'datechange'"
                [class.shadow-xs]="activeSection() === 'datechange'"
                [class.bg-[#fcfcfd]]="activeSection() !== 'datechange'"
                [class.hover:bg-indigo-50/50]="activeSection() !== 'datechange'"
                [class.border-slate-200/90]="activeSection() !== 'datechange'"
                class="rounded-[22px] px-3.5 py-2 min-w-[128px] text-left shrink-0 cursor-pointer transition-all border active:scale-95">
                <span
                  class="text-xs font-semibold block leading-snug"
                  [class.text-white]="activeSection() === 'datechange'"
                  [class.text-slate-900]="activeSection() !== 'datechange'">
                  Date Change
                </span>
                <span
                  class="text-[10px] block leading-tight mt-0.5"
                  [class.text-white/90]="activeSection() === 'datechange'"
                  [class.text-slate-500]="activeSection() !== 'datechange'">
                  {{ customConfig().dateChangeSlabs[0]?.ruleText || 'Free Reschedule' }}
                </span>
              </button>

            </div>

            <!-- Scrollable Offcanvas Details Content -->
            <div class="space-y-6 text-xs py-2">
                
                <!-- 1. CAR SAFETY DETAILS HIGHLIGHT -->
                @if (activeSection() === 'safety') {
                  <div class="space-y-3 animate-fade-in">
                    <div class="bg-[#eef4ff] rounded-2xl p-4 border border-blue-200/60 flex items-start space-x-3">
                      <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <mat-icon class="text-xl text-white">verified_user</mat-icon>
                      </div>
                      <div>
                        <h3 class="text-sm text-[#1b1b1b]">{{ customConfig().safetyHeadline }}</h3>
                        <p class="text-[12px] text-[#4b5563] mt-0.5">
                          {{ customConfig().safetyDescription }}
                        </p>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      @for (item of customConfig().safetyItems; track item.id) {
                        <div class="p-3 rounded-xl border border-slate-200 flex items-start space-x-2.5">
                          <mat-icon class="text-base text-blue-600 shrink-0">{{ item.icon || 'verified_user' }}</mat-icon>
                          <div>
                            <span class="text-xs text-[#1b1b1b] block">{{ item.title }}</span>
                            <span class="text-[11px] text-[#6b7280]">{{ item.subtitle }}</span>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- 2. BOARDING POINTS -->
                @if (activeSection() === 'boarding') {
                  <div class="space-y-2.5 animate-fade-in">
                    <div class="flex items-center justify-between">
                      <h3 class="text-sm text-[#1b1b1b]">Boarding Points in {{ cleanCityName(car.sourceCityName) }}</h3>
                      <span class="text-[11px] text-[#6b7280]">Tap to select pickup stand</span>
                    </div>

                    @for (bp of customConfig().boardingPoints; track bp.id) {
                      <div
                        (click)="selectBoardingPoint(bp)"
                        (keydown.enter)="selectBoardingPoint(bp)"
                        role="button"
                        tabindex="0"
                        [class.border-indigo-500]="state.selectedBoardingPoint()?.id === bp.id"
                        [class.bg-indigo-50/40]="state.selectedBoardingPoint()?.id === bp.id"
                        [class.border-slate-200]="state.selectedBoardingPoint()?.id !== bp.id"
                        class="p-3.5 rounded-[22px] border flex items-start justify-between gap-3 cursor-pointer transition-all">
                        <div class="flex items-start space-x-3">
                          <div class="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea] text-white text-xs font-semibold tabular-nums shrink-0">
                            {{ bp.time }}
                          </div>
                          <div>
                            <div class="text-[13px] text-[#1b1b1b]">{{ bp.location }}</div>
                            <div class="text-[11px] text-[#6b7280] mt-0.5">Landmark: {{ bp.landmark }}</div>
                          </div>
                        </div>
                        <mat-icon
                          [class.text-indigo-600]="state.selectedBoardingPoint()?.id === bp.id"
                          [class.text-slate-300]="state.selectedBoardingPoint()?.id !== bp.id"
                          class="text-lg shrink-0">
                          {{ state.selectedBoardingPoint()?.id === bp.id ? 'radio_button_checked' : 'radio_button_unchecked' }}
                        </mat-icon>
                      </div>
                    }
                  </div>
                }

                <!-- 3. DROPPING POINTS -->
                @if (activeSection() === 'dropping') {
                  <div class="space-y-2.5 animate-fade-in">
                    <div class="flex items-center justify-between">
                      <h3 class="text-sm text-[#1b1b1b]">Dropping Points in {{ cleanCityName(car.destinationCityName) }}</h3>
                      <span class="text-[11px] text-[#6b7280]">Tap to select drop stand</span>
                    </div>

                    @for (dp of customConfig().droppingPoints; track dp.id) {
                      <div
                        (click)="selectDroppingPoint(dp)"
                        (keydown.enter)="selectDroppingPoint(dp)"
                        role="button"
                        tabindex="0"
                        [class.border-indigo-500]="state.selectedDroppingPoint()?.id === dp.id"
                        [class.bg-indigo-50/40]="state.selectedDroppingPoint()?.id === dp.id"
                        [class.border-slate-200]="state.selectedDroppingPoint()?.id !== dp.id"
                        class="p-3.5 rounded-[22px] border flex items-start justify-between gap-3 cursor-pointer transition-all">
                        <div class="flex items-start space-x-3">
                          <div class="px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea] text-white text-xs font-semibold tabular-nums shrink-0">
                            {{ dp.time }}
                          </div>
                          <div>
                            <div class="text-[13px] text-[#1b1b1b]">{{ dp.location }}</div>
                            <div class="text-[11px] text-[#6b7280] mt-0.5">Landmark: {{ dp.landmark }}</div>
                          </div>
                        </div>
                        <mat-icon
                          [class.text-indigo-600]="state.selectedDroppingPoint()?.id === dp.id"
                          [class.text-slate-300]="state.selectedDroppingPoint()?.id !== dp.id"
                          class="text-lg shrink-0">
                          {{ state.selectedDroppingPoint()?.id === dp.id ? 'radio_button_checked' : 'radio_button_unchecked' }}
                        </mat-icon>
                      </div>
                    }
                  </div>
                }

                <!-- 4. CAR ROUTE & HIGHWAY TIMELINE -->
                @if (activeSection() === 'route') {
                  <div class="space-y-3 animate-fade-in">
                    <div class="flex items-center justify-between">
                      <div>
                        <h3 class="text-sm text-[#1b1b1b]">Car Route &amp; Highway Stops</h3>
                        <p class="text-[11px] text-[#6b7280]">{{ cleanCityName(car.sourceCityName) }} &rarr; {{ cleanCityName(car.destinationCityName) }} ({{ car.duration }})</p>
                      </div>
                      <span class="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px]">
                        Direct Cab
                      </span>
                    </div>

                    <div class="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                      @for (stop of customConfig().routeStops; track stop.id) {
                        <div class="relative">
                          <span
                            [class.bg-indigo-600]="stop.type === 'departure'"
                            [class.bg-amber-500]="stop.type === 'stop'"
                            [class.bg-blue-600]="stop.type === 'toll'"
                            [class.bg-emerald-600]="stop.type === 'arrival'"
                            class="w-3 h-3 rounded-full border-2 border-white absolute -left-[19px] top-1">
                          </span>
                          <div class="text-[13px] text-[#1b1b1b]">{{ stop.time }} &middot; {{ stop.title }}</div>
                          <div class="text-[11px] text-[#6b7280]">{{ stop.subtitle }}</div>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- 5. PASSENGER REVIEWS -->
                @if (activeSection() === 'reviews') {
                  <div class="space-y-3.5 animate-fade-in">
                    <div class="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80 flex items-center justify-between">
                      <div>
                        <span class="text-sm text-[#1b1b1b] block">Verified Rider Ratings</span>
                        <span class="text-[11px] text-[#6b7280]">Based on {{ car.totalReviews }} shared cab trips</span>
                      </div>
                      <div class="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-sm flex items-center space-x-1">
                        <span>★</span>
                        <span>{{ car.rating.toFixed(1) }} / 5</span>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2">
                      <div class="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                        <span class="text-[#6b7280]">Punctuality</span>
                        <span class="text-[#1b1b1b]">{{ customConfig().reviewMetrics.punctuality.toFixed(1) }} ★</span>
                      </div>
                      <div class="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                        <span class="text-[#6b7280]">Cabin Comfort</span>
                        <span class="text-[#1b1b1b]">{{ customConfig().reviewMetrics.cleanliness.toFixed(1) }} ★</span>
                      </div>
                      <div class="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                        <span class="text-[#6b7280]">Driver Politeness</span>
                        <span class="text-[#1b1b1b]">{{ customConfig().reviewMetrics.staffBehavior.toFixed(1) }} ★</span>
                      </div>
                      <div class="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                        <span class="text-[#6b7280]">Driving Safety</span>
                        <span class="text-[#1b1b1b]">{{ customConfig().reviewMetrics.drivingSafety.toFixed(1) }} ★</span>
                      </div>
                    </div>

                    <div class="space-y-2">
                      @for (rev of customConfig().reviews; track rev.id) {
                        <div class="p-3 rounded-xl border border-slate-200 space-y-1">
                          <div class="flex items-center justify-between">
                            <span class="text-xs text-[#1b1b1b]">{{ rev.author }} &middot; {{ rev.tag }}</span>
                            <span class="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">★ {{ rev.rating.toFixed(1) }}</span>
                          </div>
                          <p class="text-[11px] text-[#6b7280]">
                            {{ rev.comment }}
                          </p>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- 6. CANCELLATION POLICY -->
                @if (activeSection() === 'cancellation') {
                  <div class="space-y-3 animate-fade-in">
                    <div>
                      <h3 class="text-sm text-[#1b1b1b]">Cancellation Policy</h3>
                      <p class="text-[11px] text-[#6b7280]">Refund is calculated based on scheduled departure time ({{ car.departureTime }})</p>
                    </div>

                    <div class="rounded-2xl border border-slate-200 overflow-hidden">
                      <div class="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-[11px] text-[#6b7280] uppercase">
                        <span>Time Before Departure</span>
                        <span>Refund / Deduction</span>
                      </div>
                      @for (slab of customConfig().cancellationSlabs; track slab.id) {
                        <div class="px-4 py-3 border-b last:border-b-0 border-slate-100 flex items-center justify-between">
                          <span class="text-[#1b1b1b]">{{ slab.windowLabel }}</span>
                          <span
                            [class.text-emerald-700]="slab.tone === 'positive'"
                            [class.text-amber-700]="slab.tone === 'warning'"
                            [class.text-rose-600]="slab.tone === 'danger'">
                            {{ slab.ruleText }}
                          </span>
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- 7. DATE CHANGE POLICY -->
                @if (activeSection() === 'datechange') {
                  <div class="space-y-3 animate-fade-in">
                    <div>
                      <h3 class="text-sm text-[#1b1b1b]">Date Change Policy</h3>
                      <p class="text-[11px] text-[#6b7280]">Switch to another departure slot or travel date seamlessly</p>
                    </div>

                    <div class="rounded-2xl border border-slate-200 overflow-hidden">
                      <div class="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-[11px] text-[#6b7280] uppercase">
                        <span>Reschedule Window</span>
                        <span>Date Change Fee</span>
                      </div>
                      @for (slab of customConfig().dateChangeSlabs; track slab.id) {
                        <div class="px-4 py-3 border-b last:border-b-0 border-slate-100 flex items-center justify-between">
                          <span class="text-[#1b1b1b]">{{ slab.windowLabel }}</span>
                          <span
                            [class.text-emerald-700]="slab.tone === 'positive'"
                            [class.text-amber-700]="slab.tone === 'warning'"
                            [class.text-rose-600]="slab.tone === 'danger'">
                            {{ slab.ruleText }}
                          </span>
                        </div>
                      }
                    </div>
                  </div>
                }

              </div>
            </div>
          }

          <!-- =========================================================== -->
          <!-- STICKY SELECTED SEATS DYNAMIC PRICE SUMMARY BAR (When expanded and 1+ Car Seats Selected) -->
          <!-- =========================================================== -->
          @if (state.selectedCarSeatIds().length > 0 && isOffcanvasActive()) {
            <div class="px-4 py-2.5 bg-white border-t border-slate-200 space-y-2 shrink-0 animate-fade-in">
              <!-- Selected Car Seat Pills in Expanded Sheet Footer -->
              <div class="flex items-center justify-between gap-2">
                <div class="flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5 flex-1">
                  @for (s of getSelectedSeatsList(car); track s.id) {
                    <button
                      type="button"
                      (click)="toggleCarSeat(s); $event.stopPropagation()"
                      class="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-[10.5px] shrink-0 cursor-pointer hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 transition-colors animate-scale-in">
                      <span class="font-mono font-bold">{{ s.seatNumber }}</span>
                      <span class="text-emerald-700/80 tabular-nums">₹{{ s.price || car.baseFare }}</span>
                      <mat-icon class="text-[11px] leading-none opacity-75">close</mat-icon>
                    </button>
                  }
                </div>
                @if (state.selectedCarSeatIds().length > 1) {
                  <button
                    type="button"
                    (click)="clearSelectedCarSeats(); $event.stopPropagation()"
                    class="text-[10px] text-[#4338ca] hover:opacity-85 px-2.5 py-0.5 rounded-full bg-[#e0e7ff] border border-indigo-200/80 shrink-0 cursor-pointer">
                    Clear all
                  </button>
                }
              </div>

              <div class="flex items-center justify-between gap-3">
                <div>
                  <div class="text-[11px] text-[#6b7280]">
                    {{ state.selectedCarSeatIds().length }} {{ state.selectedCarSeatIds().length === 1 ? 'Seat' : 'Seats' }} &middot; <span class="text-slate-900 font-semibold">{{ selectedSeatNumbers(car) }}</span>
                  </div>
                  <div class="text-[18px] text-slate-900 font-bold leading-tight tabular-nums">
                    ₹{{ getSelectedTotal(car) }}
                  </div>
                </div>

                <!-- Car Theme Primary CTA Button -->
                <button
                  type="button"
                  (click)="state.goToBoardingDropping()"
                  class="px-5 sm:px-6 py-2.5 rounded-[22px] bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea] hover:opacity-95 text-white text-[13px] sm:text-[14px] font-semibold cursor-pointer active:scale-95 transition-all flex items-center space-x-1.5 shadow-xs">
                  <span>Select Boarding &amp; Dropping</span>
                  <mat-icon class="text-base text-white">arrow_forward</mat-icon>
                </button>
              </div>
            </div>
          }

          </div>
        </section>

      </div>
    }
  `,
})
export class CarSeatLayout {
  readonly state = inject(BookingState);

  readonly zoomLevel = signal<number>(1);
  readonly isPinching = signal<boolean>(false);
  private pinchStartDist = 0;
  private pinchStartZoom = 1;

  readonly zoomPercent = computed(() => Math.round(this.zoomLevel() * 100));

  zoomIn() {
    this.zoomLevel.update((z) => Math.min(1.5, Math.round((z + 0.15) * 100) / 100));
  }

  zoomOut() {
    this.zoomLevel.update((z) => Math.max(0.7, Math.round((z - 0.15) * 100) / 100));
  }

  resetZoom() {
    this.zoomLevel.set(1);
  }

  fitToScreen() {
    this.zoomLevel.update((z) => (z < 0.95 ? 1 : 0.8));
  }

  onMapTouchStart(event: TouchEvent) {
    if (event.touches.length === 2) {
      this.isPinching.set(true);
      this.pinchStartDist = Math.hypot(
        event.touches[0].clientX - event.touches[1].clientX,
        event.touches[0].clientY - event.touches[1].clientY,
      );
      this.pinchStartZoom = this.zoomLevel();
    }
  }

  onMapTouchMove(event: TouchEvent) {
    if (!this.isPinching() || event.touches.length !== 2 || this.pinchStartDist <= 0) return;
    if (event.cancelable) {
      event.preventDefault();
    }
    const dist = Math.hypot(
      event.touches[0].clientX - event.touches[1].clientX,
      event.touches[0].clientY - event.touches[1].clientY,
    );
    const ratio = dist / this.pinchStartDist;
    const next = Math.min(1.5, Math.max(0.7, Math.round(this.pinchStartZoom * ratio * 20) / 20));
    this.zoomLevel.set(next);
  }

  onMapTouchEnd(event: TouchEvent) {
    if (event.touches.length < 2) {
      this.isPinching.set(false);
      this.pinchStartDist = 0;
    }
  }

  readonly hasSeaterSeats = computed(() => {
    const decks = this.renderedCustomDecks();
    if (decks.length > 0) {
      return decks.some((d) => d.seats.some((s) => s.seatType !== 'sleeper'));
    }
    return true;
  });

  readonly hasSleeperSeats = computed(() => {
    const decks = this.renderedCustomDecks();
    return decks.some((d) => d.seats.some((s) => s.seatType === 'sleeper'));
  });

  readonly isOffcanvasExpanded = signal<boolean>(false);
  readonly showFareBreakup = signal<boolean>(false);
  readonly isDragging = signal<boolean>(false);
  readonly dragSheetHeight = signal<number | null>(null);
  private dragStartY = 0;
  private dragInitialHeight = 0;

  readonly collapsedHeightPx = computed(() => {
    if (this.state.selectedCarSeatIds().length > 0) {
      return this.showFareBreakup() ? 242 : 196;
    }
    return 142;
  });

  toggleFareBreakup() {
    this.showFareBreakup.update((v) => !v);
  }

  clearSelectedCarSeats() {
    this.state.selectedCarSeatIds.set([]);
    this.showFareBreakup.set(false);
  }

  expandedHeightPx(): number {
    if (typeof window !== 'undefined' && window.innerHeight) {
      return Math.min(Math.round(window.innerHeight * 0.82), 620);
    }
    return 560;
  }

  readonly isOffcanvasActive = computed(() => {
    return this.isOffcanvasExpanded() || (this.dragSheetHeight() !== null && this.dragSheetHeight()! > (this.collapsedHeightPx() + 30));
  });

  readonly activeSection = signal<CarDetailSection>('safety');

  readonly sectionTabs: { id: CarDetailSection; label: string }[] = [
    { id: 'safety', label: 'Car Safety' },
    { id: 'boarding', label: 'Boarding Points' },
    { id: 'dropping', label: 'Dropping Points' },
    { id: 'route', label: 'Car Route' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'cancellation', label: 'Cancellation Policy' },
    { id: 'datechange', label: 'Date Change Policy' },
  ];

  readonly customConfig = computed<VehicleCustomConfig>(() => {
    const car = this.state.selectedSharedCarTrip();
    if (!car) {
      return {
        targetType: 'car',
        targetId: '',
        deckCount: 1,
        driverPosition: 'right',
        decks: [],
        safetyBadgeText: 'Enhanced',
        safetyHeadline: 'Enhanced Car Safety Shield',
        safetyDescription: '',
        safetyItems: [],
        boardingPoints: [],
        droppingPoints: [],
        routeStops: [],
        reviewMetrics: { punctuality: 4.8, cleanliness: 4.7, staffBehavior: 4.9, drivingSafety: 4.8 },
        reviews: [],
        cancellationSlabs: [],
        dateChangeSlabs: [],
      };
    }
    return this.state.getEffectiveConfigForCar(car);
  });

  readonly hasCustomAdminDeckLayout = computed(() => {
    return this.renderedCustomDecks().length > 0;
  });

  readonly renderedCustomDecks = computed<RenderedCarDeckView[]>(() => {
    const car = this.state.selectedSharedCarTrip();
    if (!car) return [];
    const cfg = this.customConfig();
    const liveSeats =
      car.seats && car.seats.length > 0 && car.seats.some((s) => s.col !== undefined)
        ? car.seats
        : this.state.buildCarSeatsFromCustomConfig(car.id, car.baseFare, cfg);

    const deckOrder: ('lower' | 'middle' | 'upper')[] =
      cfg.deckCount === 1
        ? ['lower']
        : cfg.deckCount === 3
          ? ['lower', 'middle', 'upper']
          : ['lower', 'upper'];

    const deckLabels: Record<'lower' | 'middle' | 'upper', string> = {
      lower: 'Lower deck',
      middle: 'Middle deck',
      upper: 'Upper deck',
    };

    const result: RenderedCarDeckView[] = [];
    for (const deckId of deckOrder) {
      const deckSeats = liveSeats.filter((s) => (s.deck || 'lower') === deckId);
      if (deckSeats.length === 0) continue;
      const colIndices = Array.from(new Set(deckSeats.map((s) => s.col ?? 0))).sort((a, b) => a - b);
      const cfgDeck = cfg.decks.find((d) => d.deckId === deckId);
      const aisleAfterCol = cfgDeck ? cfgDeck.aisleAfterCol : -1;

      const maxRowFromSeats =
        deckSeats.reduce(
          (acc, s) =>
            Math.max(acc, (s.rowIndex ?? 0) + (s.rowSpan || (s.seatType === 'sleeper' ? 2 : 1)) - 1),
          0,
        ) + 1;
      const maxColFromSeats =
        deckSeats.reduce((acc, s) => Math.max(acc, (s.col ?? 0) + (s.colSpan || 1) - 1), 0) + 1;

      const gridRows = Math.max(cfgDeck?.gridRows || 0, maxRowFromSeats, 1);
      const gridCols = Math.max(cfgDeck?.gridCols || 0, maxColFromSeats, 1);

      result.push({
        deckId,
        deckLabel: cfgDeck?.deckLabel || deckLabels[deckId],
        aisleAfterCol,
        gridRows,
        gridCols,
        seats: [...deckSeats].sort((a, b) => (a.rowIndex ?? 0) - (b.rowIndex ?? 0) || (a.col ?? 0) - (b.col ?? 0)),
        columns: colIndices.map((colIndex) => ({
          colIndex,
          seats: deckSeats.filter((s) => (s.col ?? 0) === colIndex),
        })),
      });
    }
    return result;
  });

  readonly formattedTravelDate = computed(() => {
    const raw = this.state.travelDate();
    if (!raw) return 'Sun, 18 Oct';
    const d = new Date(raw);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()] || 'Sun'}, ${d.getDate()} ${months[d.getMonth()] || 'Oct'}`;
  });

  cleanCityName(name: string): string {
    return (name || '').split('(')[0].trim();
  }

  getFrontRowSeats(car: SharedCarTrip): CarSeat[] {
    return (car.seats || []).filter((s) => s.row === 'front');
  }

  getMiddleRowSeats(car: SharedCarTrip): CarSeat[] {
    return (car.seats || []).filter((s) => s.row === 'middle');
  }

  getRearBenchSeats(car: SharedCarTrip): CarSeat[] {
    return (car.seats || []).filter((s) => s.row === 'rear' || s.row === 'jump');
  }

  isSeatSelected(seatId: string): boolean {
    return this.state.selectedCarSeatIds().includes(seatId);
  }

  toggleCarSeat(seat: CarSeat) {
    if (seat.isDriverSeat || seat.seatCategory === 'driver') {
      this.state.showToast('This is the Driver seat and cannot be booked by passengers.', 'info');
      return;
    }
    if (seat.isReservedSection || seat.seatCategory === 'reserved' || seat.seatCategory === 'toilet' || seat.seatCategory === 'cafeteria' || seat.seatCategory === 'exit_entry') {
      this.state.showToast(`${seat.reservedLabel || seat.seatNumber || 'Facility section'} is not a bookable passenger seat.`, 'info');
      return;
    }
    if (seat.status === 'booked') return;
    const current = this.state.selectedCarSeatIds();
    if (current.includes(seat.id)) {
      this.state.selectedCarSeatIds.set(current.filter((id) => id !== seat.id));
    } else {
      this.state.selectedCarSeatIds.set([...current, seat.id]);
    }
  }

  getVisualSeatState(
    seat: CarSeat,
    rowGroupIndex?: number,
    colIndex?: number,
  ): 'selected' | 'sold' | 'male' | 'female' | 'handicap' | 'old_age' | 'available' {
    if (this.isSeatSelected(seat.id)) {
      return 'selected';
    }
    if (seat.status === 'booked' || seat.status === 'locked') {
      return 'sold';
    }
    if (seat.isHandicapReserved || seat.seatCategory === 'handicap') {
      return 'handicap';
    }
    if (seat.isOldAgeReserved || seat.seatCategory === 'old_age') {
      return 'old_age';
    }
    if (seat.isLadiesReserved || seat.seatCategory === 'female') {
      return 'female';
    }
    if (seat.isMaleReserved || seat.seatCategory === 'male') {
      return 'male';
    }
    if (rowGroupIndex === -99 && colIndex === -99) {
      return 'available';
    }
    return 'available';
  }

  hasAisle(deck: RenderedCarDeckView): boolean {
    return deck.aisleAfterCol >= 0 && deck.aisleAfterCol < deck.gridCols - 1;
  }

  getGridTemplateColumns(deck: RenderedCarDeckView): string {
    const isSleeper = deck.seats.some((s) => s.seatType === 'sleeper');
    const colSize = isSleeper ? 'minmax(36px, 41px)' : 'minmax(33px, 38px)';
    if (this.hasAisle(deck)) {
      const leftCols = deck.aisleAfterCol + 1;
      const rightCols = deck.gridCols - leftCols;
      // Compact aisle in between while keeping seat sizes full and clear
      return `repeat(${leftCols}, ${colSize}) minmax(13px, 17px) repeat(${rightCols}, ${colSize})`;
    }
    return `repeat(${deck.gridCols}, ${colSize})`;
  }

  getSeatGridColumn(seat: CarSeat, deck: RenderedCarDeckView): string {
    const colSpan = seat.colSpan || 1;
    const col = seat.col ?? 0;
    if (!this.hasAisle(deck)) {
      return `${col + 1} / span ${colSpan}`;
    }
    if (colSpan >= deck.gridCols) {
      return `1 / span ${deck.gridCols + 1}`;
    }
    const startCol = col <= deck.aisleAfterCol ? col + 1 : col + 2;
    return `${startCol} / span ${colSpan}`;
  }

  getAisleGridColumn(deck: RenderedCarDeckView): number {
    return deck.aisleAfterCol + 2;
  }

  getAllCarSeats(car: SharedCarTrip): CarSeat[] {
    const customDecks = this.renderedCustomDecks();
    if (customDecks.length > 0) {
      return customDecks.flatMap((d) => d.seats);
    }
    return car.seats || [];
  }

  getSelectedSeatsList(car: SharedCarTrip): CarSeat[] {
    const ids = this.state.selectedCarSeatIds();
    return this.getAllCarSeats(car).filter((s) => ids.includes(s.id));
  }

  selectedSeatNumbers(car: SharedCarTrip): string {
    return this.getSelectedSeatsList(car)
      .map((s) => s.seatNumber)
      .join(', ');
  }

  getSelectedTotal(car: SharedCarTrip): number {
    return this.getSelectedSeatsList(car).reduce(
      (sum, s) => sum + (s.price || car.baseFare),
      0,
    );
  }

  confirmAndBookCar(car: SharedCarTrip) {
    const seatIds = this.state.selectedCarSeatIds();
    if (seatIds.length === 0) {
      this.state.showToast('Please select at least one seat to proceed', 'warning');
      return;
    }
    const bp = this.state.selectedBoardingPoint()?.id || car.boardingPoints[0]?.id || '';
    const dp = this.state.selectedDroppingPoint()?.id || car.droppingPoints[0]?.id || '';
    this.state.bookSharedCarTrip(
      {
        tripId: car.id,
        seatIds,
        selectedBoardingPointId: bp,
        selectedDroppingPointId: dp,
      },
      () => {
        this.state.selectedSharedCarTrip.set(null);
        this.state.selectedCarSeatIds.set([]);
      },
    );
  }

  onDragStart(event: PointerEvent) {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    this.isDragging.set(true);
    this.dragStartY = event.clientY;
    const initialH = this.isOffcanvasExpanded()
      ? this.expandedHeightPx()
      : this.collapsedHeightPx();
    this.dragInitialHeight = initialH;
    this.dragSheetHeight.set(initialH);
    try {
      (event.currentTarget as HTMLElement)?.setPointerCapture(event.pointerId);
    } catch {
      void 0;
    }
  }

  onDragMove(event: PointerEvent) {
    if (!this.isDragging()) return;
    const deltaY = event.clientY - this.dragStartY;
    const targetH = this.dragInitialHeight - deltaY;
    const minH = this.collapsedHeightPx();
    const maxH = this.expandedHeightPx();
    const clamped = Math.max(minH, Math.min(maxH, targetH));
    this.dragSheetHeight.set(clamped);
  }

  onDragEnd(event: PointerEvent) {
    if (!this.isDragging()) return;
    this.isDragging.set(false);
    const deltaY = event.clientY - this.dragStartY;
    const currentH = this.dragSheetHeight() ?? this.dragInitialHeight;
    this.dragSheetHeight.set(null);
    try {
      (event.currentTarget as HTMLElement)?.releasePointerCapture(event.pointerId);
    } catch {
      void 0;
    }

    if (Math.abs(deltaY) < 8) {
      this.toggleOffcanvas();
      return;
    }

    if (deltaY < -35) {
      this.isOffcanvasExpanded.set(true);
    } else if (deltaY > 35) {
      this.isOffcanvasExpanded.set(false);
    } else {
      const mid = (this.collapsedHeightPx() + this.expandedHeightPx()) / 2;
      this.isOffcanvasExpanded.set(currentH > mid);
    }
  }

  collapseOffcanvas() {
    this.isOffcanvasExpanded.set(false);
    this.dragSheetHeight.set(null);
  }

  openOffcanvas() {
    this.isOffcanvasExpanded.set(true);
    this.dragSheetHeight.set(null);
  }

  toggleOffcanvas() {
    this.isOffcanvasExpanded.set(!this.isOffcanvasExpanded());
    this.dragSheetHeight.set(null);
  }

  openSection(section: CarDetailSection) {
    this.activeSection.set(section);
    this.isOffcanvasExpanded.set(true);
  }

  selectBoardingPoint(bp: BoardingPoint) {
    this.state.selectedBoardingPoint.set(bp);
    this.state.showToast(`Boarding point set to ${bp.location} (${bp.time})`, 'info');
  }

  selectDroppingPoint(dp: DroppingPoint) {
    this.state.selectedDroppingPoint.set(dp);
    this.state.showToast(`Dropping point set to ${dp.location} (${dp.time})`, 'info');
  }

  shareCarDetails(car: SharedCarTrip) {
    this.state.showToast(
      `Shared ${car.operatorName} - ${car.vehicleName} (${this.cleanCityName(car.sourceCityName)} → ${this.cleanCityName(car.destinationCityName)})`,
      'success',
    );
  }

  openInAdminStudio() {
    this.state.currentTab.set('admin');
  }
}
