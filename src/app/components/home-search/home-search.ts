import {ChangeDetectionStrategy, Component, ElementRef, inject, signal, computed, viewChild, effect} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {BookingState} from '../../services/booking-state';
import {City} from '../../models/bus-booking.models';
import {CitySearch} from '../city-search/city-search';
import {DatePicker} from '../date-picker/date-picker';

@Component({
  selector: 'app-home-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, CitySearch, DatePicker],
  template: `
    <div class="max-w-md mx-auto min-h-screen bg-[#f8fafc] text-slate-800 pb-28 flex flex-col relative font-sans overflow-x-hidden">
      
      <!-- Invisible Backdrop to close Profile Dropdown when open -->
      @if (isProfileDropdownOpen()) {
        <div
          (click)="closeProfileDropdown()"
          aria-hidden="true"
          class="fixed inset-0 z-30">
        </div>
      }

      <!-- ================================================================= -->
      <!-- PASTEL PEACH-PINK-LAVENDER GRADIENT BACKDROP                      -->
      <!-- (From top of home page down to half of the search div)            -->
      <!-- ================================================================= -->
      <div
        aria-hidden="true"
        class="absolute top-0 left-0 right-0 h-[270px] rounded-none pointer-events-none z-0 overflow-hidden bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd]">
        <div class="w-full h-full bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)]"></div>
      </div>

      <!-- ================================================================= -->
      <!-- ALL 3 RECTANGULAR TABS IN 12-COLUMN GRID (4 COLUMNS EACH)         -->
      <!-- Top-Center: Floating Yellow Star-Circle Tag (55% Out / 45% In)    -->
      <!-- Middle: Category Icon | Bottom: Singular Name (Bus, Car, Hotel)   -->
      <!-- ================================================================= -->
      <div class="px-3.5 pt-6 pb-2 relative z-20 w-full">
        <div class="grid grid-cols-12 gap-1.5 sm:gap-2.5 items-stretch w-full">

          <!-- ============================================================= -->
          <!-- TAB 1: BUS (3 Columns, Equal Height, Theme Border Radius)     -->
          <!-- ============================================================= -->
          <button
            type="button"
            (click)="selectCategory('bus')"
            [class.bg-gradient-to-b]="selectedCategory() === 'bus'"
            [class.from-[#e11d48]]="selectedCategory() === 'bus'"
            [class.via-[#f43f5e]]="selectedCategory() === 'bus'"
            [class.to-[#fb923c]]="selectedCategory() === 'bus'"
            [class.text-white]="selectedCategory() === 'bus'"
            [class.shadow-md]="selectedCategory() === 'bus'"
            [class.bg-white]="selectedCategory() !== 'bus'"
            [class.text-slate-800]="selectedCategory() !== 'bus'"
            [class.shadow-sm]="selectedCategory() !== 'bus'"
            class="relative overflow-visible col-span-3 h-full min-h-[82px] px-1 sm:px-2 pt-4 pb-2 rounded-[18px] flex flex-col items-center justify-between text-center cursor-pointer transition-all active:scale-95">

            <!-- Top-Center Yellow Star-Circle Tag (55% Outside / 45% Inside) -->
            <div
              class="
                absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[52%] z-20
                w-9 h-9 rounded-full
                bg-gradient-to-b from-[#fef08a] via-[#facc15] to-[#eab308]
                shadow-[0_3px_8px_rgba(234,179,8,0.4)]
                flex flex-col items-center justify-center p-0.5
              ">
              <div class="w-full h-full rounded-full flex flex-col items-center justify-center leading-none">
                <span class="text-[8px] font-black text-[#422006] tracking-tighter leading-none">₹300</span>
                <span class="text-[6.5px] font-extrabold text-[#713f12] uppercase tracking-wider leading-none mt-0.5">OFF</span>
              </div>
            </div>

            <!-- Middle: Bus Icon -->
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors mt-0.5"
              [class.bg-white/20]="selectedCategory() === 'bus'"
              [class.text-white]="selectedCategory() === 'bus'"
              [class.bg-[#ffe4e6]]="selectedCategory() !== 'bus'"
              [class.text-[#be123c]]="selectedCategory() !== 'bus'">
              <mat-icon class="text-[20px] leading-none">directions_bus</mat-icon>
            </div>

            <!-- Bottom: Singular Category Name -->
            <span class="text-[12px] sm:text-[12.5px] font-extrabold tracking-tight leading-tight mt-1 truncate w-full">
              Bus
            </span>
          </button>

          <!-- ============================================================= -->
          <!-- TAB 2: CAR (3 Columns, Equal Height, Theme Border Radius)     -->
          <!-- ============================================================= -->
          <button
            type="button"
            (click)="selectCategory('cars')"
            [class.bg-gradient-to-b]="selectedCategory() === 'cars'"
            [class.from-[#4f46e5]]="selectedCategory() === 'cars'"
            [class.via-[#6366f1]]="selectedCategory() === 'cars'"
            [class.to-[#9333ea]]="selectedCategory() === 'cars'"
            [class.text-white]="selectedCategory() === 'cars'"
            [class.shadow-md]="selectedCategory() === 'cars'"
            [class.bg-white]="selectedCategory() !== 'cars'"
            [class.text-slate-800]="selectedCategory() !== 'cars'"
            [class.shadow-sm]="selectedCategory() !== 'cars'"
            class="relative overflow-visible col-span-3 h-full min-h-[82px] px-1 sm:px-2 pt-4 pb-2 rounded-[18px] flex flex-col items-center justify-between text-center cursor-pointer transition-all active:scale-95">

            <!-- Top-Center Yellow Star-Circle Tag (55% Outside / 45% Inside) -->
            <div
              class="
                absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[52%] z-20
                w-9 h-9 rounded-full
                bg-gradient-to-b from-[#fef08a] via-[#facc15] to-[#eab308]
                shadow-[0_3px_8px_rgba(234,179,8,0.4)]
                flex flex-col items-center justify-center p-0.5
              ">
              <div class="w-full h-full rounded-full flex flex-col items-center justify-center leading-none">
                <span class="text-[7px] font-black text-[#422006] uppercase tracking-tighter leading-none">Door</span>
                <span class="text-[7px] font-extrabold text-[#713f12] uppercase tracking-tighter leading-none mt-0.5">Step</span>
              </div>
            </div>

            <!-- Middle: Car Icon -->
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors mt-0.5"
              [class.bg-white/20]="selectedCategory() === 'cars'"
              [class.text-white]="selectedCategory() === 'cars'"
              [class.bg-[#e0e7ff]]="selectedCategory() !== 'cars'"
              [class.text-[#4338ca]]="selectedCategory() !== 'cars'">
              <mat-icon class="text-[20px] leading-none">directions_car</mat-icon>
            </div>

            <!-- Bottom: Singular Category Name -->
            <span class="text-[12px] sm:text-[12.5px] font-extrabold tracking-tight leading-tight mt-1 truncate w-full">
              Car
            </span>
          </button>

          <!-- ============================================================= -->
          <!-- TAB 3: TRANSPORT (3 Columns, Equal Height, Theme Border Radius) -->
          <!-- ============================================================= -->
          <button
            type="button"
            (click)="selectCategory('transport')"
            [class.bg-gradient-to-b]="selectedCategory() === 'transport'"
            [class.from-[#7e22ce]]="selectedCategory() === 'transport'"
            [class.via-[#a21caf]]="selectedCategory() === 'transport'"
            [class.to-[#db2777]]="selectedCategory() === 'transport'"
            [class.text-white]="selectedCategory() === 'transport'"
            [class.shadow-md]="selectedCategory() === 'transport'"
            [class.bg-white]="selectedCategory() !== 'transport'"
            [class.text-slate-800]="selectedCategory() !== 'transport'"
            [class.shadow-sm]="selectedCategory() !== 'transport'"
            class="relative overflow-visible col-span-3 h-full min-h-[82px] px-1 sm:px-2 pt-4 pb-2 rounded-[18px] flex flex-col items-center justify-between text-center cursor-pointer transition-all active:scale-95">

            <!-- Top-Center Yellow Star-Circle Tag (55% Outside / 45% Inside) -->
            <div
              class="
                absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[52%] z-20
                w-9 h-9 rounded-full
                bg-gradient-to-b from-[#fef08a] via-[#facc15] to-[#eab308]
                shadow-[0_3px_8px_rgba(234,179,8,0.4)]
                flex flex-col items-center justify-center p-0.5
              ">
              <div class="w-full h-full rounded-full flex flex-col items-center justify-center leading-none">
                <span class="text-[8px] font-black text-[#422006] tracking-tighter leading-none">₹500</span>
                <span class="text-[6.5px] font-extrabold text-[#713f12] uppercase tracking-wider leading-none mt-0.5">OFF</span>
              </div>
            </div>

            <!-- Middle: Transport Icon -->
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors mt-0.5"
              [class.bg-white/20]="selectedCategory() === 'transport'"
              [class.text-white]="selectedCategory() === 'transport'"
              [class.bg-[#fae8ff]]="selectedCategory() !== 'transport'"
              [class.text-[#a21caf]]="selectedCategory() !== 'transport'">
              <mat-icon class="text-[20px] leading-none">local_shipping</mat-icon>
            </div>

            <!-- Bottom: Singular Category Name -->
            <span class="text-[12px] sm:text-[12.5px] font-extrabold tracking-tight leading-tight mt-1 truncate w-full">
              Transport
            </span>
          </button>

          <!-- ============================================================= -->
          <!-- TAB 4: HOTEL (3 Columns, Equal Height, Theme Border Radius)   -->
          <!-- ============================================================= -->
          <button
            type="button"
            (click)="selectCategory('hotel')"
            [class.bg-gradient-to-b]="selectedCategory() === 'hotel'"
            [class.from-[#0284c7]]="selectedCategory() === 'hotel'"
            [class.via-[#0ea5e9]]="selectedCategory() === 'hotel'"
            [class.to-[#38bdf8]]="selectedCategory() === 'hotel'"
            [class.text-white]="selectedCategory() === 'hotel'"
            [class.shadow-md]="selectedCategory() === 'hotel'"
            [class.bg-white]="selectedCategory() !== 'hotel'"
            [class.text-slate-800]="selectedCategory() !== 'hotel'"
            [class.shadow-sm]="selectedCategory() !== 'hotel'"
            class="relative overflow-visible col-span-3 h-full min-h-[82px] px-1 sm:px-2 pt-4 pb-2 rounded-[18px] flex flex-col items-center justify-between text-center cursor-pointer transition-all active:scale-95">

            <!-- Top-Center Yellow Star-Circle Tag (55% Outside / 45% Inside) -->
            <div
              class="
                absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[52%] z-20
                w-9 h-9 rounded-full
                bg-gradient-to-b from-[#fef08a] via-[#facc15] to-[#eab308]
                shadow-[0_3px_8px_rgba(234,179,8,0.4)]
                flex flex-col items-center justify-center p-0.5
              ">
              <div class="w-full h-full rounded-full flex flex-col items-center justify-center leading-none">
                <span class="text-[6.5px] font-extrabold text-[#713f12] uppercase tracking-wider leading-none">Save</span>
                <span class="text-[8.5px] font-black text-[#422006] tracking-tighter leading-none mt-0.5">70%</span>
              </div>
            </div>

            <!-- Middle: Hotel Icon -->
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors mt-0.5"
              [class.bg-white/20]="selectedCategory() === 'hotel'"
              [class.text-white]="selectedCategory() === 'hotel'"
              [class.bg-[#e0f2fe]]="selectedCategory() !== 'hotel'"
              [class.text-[#0284c7]]="selectedCategory() !== 'hotel'">
              <mat-icon class="text-[20px] leading-none">hotel</mat-icon>
            </div>

            <!-- Bottom: Singular Category Name -->
            <span class="text-[12px] sm:text-[12.5px] font-extrabold tracking-tight leading-tight mt-1 truncate w-full">
              Hotel
            </span>
          </button>

        </div>
      </div>

      <!-- Main Body Container (Overlapping the Gradient Backdrop) -->
      <div class="px-3.5 pt-0.5 space-y-3.5 flex-1 relative z-10">

        <!-- =============================================================== -->
        <!-- UNIFIED MAIN SEARCH CARD (Bus, Car & Hotel Search Inputs + CTA) -->
        <!-- =============================================================== -->
        <div class="bg-white rounded-[24px] result-card-shadow overflow-hidden">

          <!-- SEARCH INPUT BOXES & PRIMARY GRADIENT CTA -->
          <div class="p-3 space-y-2 relative">
            
            @if (selectedCategory() === 'hotel') {
              <!-- ========================================================= -->
              <!-- HOTEL TAB INPUT BOXES (Sky-Ocean-Blue Theme)              -->
              <!-- ========================================================= -->

              <!-- Box 1: HOTEL CITY / LOCATION -->
              <div
                role="button"
                tabindex="0"
                (click)="openCitySearch('hotel')"
                (keydown.enter)="openCitySearch('hotel')"
                class="rounded-[18px] bg-[#f4f6f9] hover:bg-[#eef2f6] px-3 py-2 flex items-center space-x-3 relative cursor-pointer transition-colors">
                <div class="w-10 h-10 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0 transition-colors">
                  <mat-icon class="text-[20px]">hotel</mat-icon>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.06em] block leading-tight">
                      CITY, AREA OR PROPERTY
                    </span>
                    <button
                      type="button"
                      (click)="$event.stopPropagation(); state.detectCurrentLocation()"
                      class="flex items-center space-x-1 text-[11px] font-semibold text-[#0284c7] hover:opacity-80 cursor-pointer leading-tight">
                      <mat-icon class="text-[14px] leading-none" [class.animate-spin]="state.isLocating()">gps_fixed</mat-icon>
                      <span>Near me</span>
                    </button>
                  </div>

                  <div class="relative flex items-center justify-between mt-0.5">
                    <div class="pr-6 truncate leading-snug">
                      <span class="text-[15px] sm:text-[16px] font-bold text-slate-900">
                        {{ hotelLocationDisplay() }}
                      </span>
                    </div>
                    <mat-icon class="text-slate-500 text-base pointer-events-none absolute right-0">expand_more</mat-icon>
                  </div>
                </div>
              </div>

              <!-- Box 2: CHECK-IN & CHECK-OUT DATES -->
              <div class="grid grid-cols-2 gap-2">
                <div
                  role="button"
                  tabindex="0"
                  (click)="openHotelDateOffcanvas('checkin')"
                  (keydown.enter)="openHotelDateOffcanvas('checkin')"
                  class="rounded-[18px] bg-[#f4f6f9] hover:bg-[#eef2f6] px-3 py-2 flex items-center space-x-2.5 cursor-pointer transition-colors">
                  <div class="w-9 h-9 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
                    <mat-icon class="text-[18px]">calendar_today</mat-icon>
                  </div>
                  <div class="min-w-0 flex-1">
                    <span class="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider block leading-tight">
                      CHECK-IN
                    </span>
                    <span class="text-[13.5px] font-bold text-slate-900 block truncate mt-0.5">
                      {{ formattedHotelCheckIn() }}
                    </span>
                  </div>
                </div>

                <div
                  role="button"
                  tabindex="0"
                  (click)="openHotelDateOffcanvas('checkout')"
                  (keydown.enter)="openHotelDateOffcanvas('checkout')"
                  class="rounded-[18px] bg-[#f4f6f9] hover:bg-[#eef2f6] px-3 py-2 flex items-center space-x-2.5 cursor-pointer transition-colors">
                  <div class="w-9 h-9 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
                    <mat-icon class="text-[18px]">event_available</mat-icon>
                  </div>
                  <div class="min-w-0 flex-1">
                    <span class="text-[9.5px] font-semibold text-slate-400 uppercase tracking-wider block leading-tight">
                      CHECK-OUT ({{ hotelNightsCount() }}N)
                    </span>
                    <span class="text-[13.5px] font-bold text-slate-900 block truncate mt-0.5">
                      {{ formattedHotelCheckOut() }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Box 3: ROOMS & GUESTS -->
              <div
                role="button"
                tabindex="0"
                (click)="openHotelGuestsOffcanvas()"
                (keydown.enter)="openHotelGuestsOffcanvas()"
                class="rounded-[18px] bg-[#f4f6f9] hover:bg-[#eef2f6] px-3 py-2 flex items-center justify-between gap-2.5 cursor-pointer transition-all">
                <div class="flex items-center space-x-3 min-w-0">
                  <div class="w-10 h-10 rounded-xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
                    <mat-icon class="text-[20px]">group</mat-icon>
                  </div>
                  <div class="min-w-0">
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.06em] block leading-tight">
                      ROOMS &amp; GUESTS
                    </span>
                    <span class="text-[14px] sm:text-[15px] font-bold text-slate-900 block truncate leading-snug mt-0.5">
                      {{ formattedRoomsGuestsSummary() }}
                    </span>
                  </div>
                </div>
                <mat-icon class="text-slate-500 text-base shrink-0">expand_more</mat-icon>
              </div>

              <!-- Primary Hotel Search CTA Button -->
              <div class="pt-0.5">
                <button
                  type="button"
                  (click)="onSearchHotelClick()"
                  class="w-full py-3 px-4 rounded-[16px] bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] hover:opacity-95 active:scale-[0.99] text-white text-[16px] font-bold transition-all cursor-pointer flex items-center justify-center space-x-2">
                  <mat-icon class="text-[20px] text-white">hotel</mat-icon>
                  <span>Search Hotels</span>
                  <mat-icon class="text-[20px] text-white">arrow_forward</mat-icon>
                </button>
              </div>

            } @else {
              <!-- ========================================================= -->
              <!-- BUS, CAR & TRANSPORT INPUT BOXES (Unified Search Style)   -->
              <!-- ========================================================= -->

              <!-- Box 1: LEAVING FROM (Opens CitySearch Component) -->
              <div
                role="button"
                tabindex="0"
                (click)="openCitySearch('from')"
                (keydown.enter)="openCitySearch('from')"
                class="rounded-[18px] bg-[#f4f6f9] hover:bg-[#eef2f6] px-3 py-2 flex items-center space-x-3 relative cursor-pointer transition-colors">
                <div
                  class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                  [class.bg-[#ffe4e6]]="selectedCategory() === 'bus'"
                  [class.text-[#be123c]]="selectedCategory() === 'bus'"
                  [class.bg-[#e0e7ff]]="selectedCategory() === 'cars'"
                  [class.text-[#4338ca]]="selectedCategory() === 'cars'"
                  [class.bg-[#fae8ff]]="selectedCategory() === 'transport'"
                  [class.text-[#a21caf]]="selectedCategory() === 'transport'">
                  <mat-icon class="text-[20px]">
                    {{ selectedCategory() === 'cars' ? 'directions_car' : selectedCategory() === 'transport' ? 'local_shipping' : 'directions_bus' }}
                  </mat-icon>
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.06em] block leading-tight">
                      LEAVING FROM
                    </span>
                    <button
                      type="button"
                      (click)="$event.stopPropagation(); state.detectCurrentLocation()"
                      [class.text-[#e11d48]]="selectedCategory() === 'bus'"
                      [class.text-[#4338ca]]="selectedCategory() === 'cars'"
                      [class.text-[#a21caf]]="selectedCategory() === 'transport'"
                      class="flex items-center space-x-1 text-[11px] font-semibold hover:opacity-80 cursor-pointer leading-tight">
                      <mat-icon class="text-[14px] leading-none" [class.animate-spin]="state.isLocating()">gps_fixed</mat-icon>
                      <span>Current</span>
                    </button>
                  </div>

                  <div class="relative flex items-center justify-between mt-0.5">
                    <div class="pr-6 truncate leading-snug">
                      <span class="text-[15px] sm:text-[16px] font-bold text-slate-900">
                        {{ state.sourceCity().name }}
                      </span>
                      @if (state.sourceCity().state) {
                        <span class="text-[12px] font-medium text-slate-500 ml-0.5">
                          , {{ state.sourceCity().state }}
                        </span>
                      }
                    </div>
                    <mat-icon class="text-slate-500 text-base pointer-events-none absolute right-0">expand_more</mat-icon>
                  </div>
                </div>
              </div>

              <!-- Floating White Swap Button (Shifted left into comfortable space on right side, rotates 180 deg on click) -->
              <button
                type="button"
                (click)="$event.stopPropagation(); onSwapCities()"
                title="Swap Leaving From and Going To"
                [style.transform]="'rotate(' + flipRotation() + 'deg)'"
                class="absolute right-9 top-[56px] z-10 w-9 h-9 rounded-full bg-white hover:bg-slate-50 text-slate-800 shadow-md flex items-center justify-center active:scale-90 transition-transform duration-500 ease-in-out cursor-pointer">
                <mat-icon class="text-[18px] text-slate-800">swap_vert</mat-icon>
              </button>

              <!-- Box 2: GOING TO (Opens CitySearch Component) -->
              <div
                role="button"
                tabindex="0"
                (click)="openCitySearch('to')"
                (keydown.enter)="openCitySearch('to')"
                class="rounded-[18px] bg-[#f4f6f9] hover:bg-[#eef2f6] px-3 py-2 flex items-center space-x-3 cursor-pointer transition-colors">
                <div class="w-10 h-10 rounded-xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center shrink-0">
                  <mat-icon class="text-[20px]">flag</mat-icon>
                </div>

                <div class="flex-1 min-w-0">
                  <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.06em] block leading-tight">
                    GOING TO
                  </span>
                  <div class="relative flex items-center justify-between mt-0.5">
                    <div class="pr-8 truncate leading-snug">
                      <span class="text-[15px] sm:text-[16px] font-bold text-slate-900">
                        {{ state.destinationCity().name }}
                      </span>
                      @if (state.destinationCity().state) {
                        <span class="text-[12px] font-medium text-slate-500 ml-0.5">
                          , {{ state.destinationCity().state }}
                        </span>
                      }
                    </div>
                    <mat-icon class="text-slate-500 text-base pointer-events-none absolute right-1">expand_more</mat-icon>
                  </div>
                </div>
              </div>

              <!-- Box 3: DATE OF JOURNEY (Left Calendar DatePicker + Horizontally Scrollable Dates) -->
              <div class="rounded-[18px] bg-[#f4f6f9] px-2.5 py-2 flex items-center gap-2">
                <!-- Left-hand Calendar Option (Opens DatePicker Component) -->
                <button
                  type="button"
                  (click)="openDatePicker()"
                  aria-label="Open Date of Journey Picker"
                  [class.bg-[#ffe4e6]]="selectedCategory() === 'bus'"
                  [class.text-[#be123c]]="selectedCategory() === 'bus'"
                  [class.bg-[#e0e7ff]]="selectedCategory() === 'cars'"
                  [class.text-[#4338ca]]="selectedCategory() === 'cars'"
                  [class.bg-[#fae8ff]]="selectedCategory() === 'transport'"
                  [class.text-[#a21caf]]="selectedCategory() === 'transport'"
                  class="w-12 h-[48px] rounded-xl flex flex-col items-center justify-center shrink-0 cursor-pointer active:scale-95 transition-all">
                  <mat-icon class="text-[19px] leading-none">calendar_month</mat-icon>
                  <span class="text-[9px] font-extrabold uppercase tracking-wider mt-0.5 leading-none">
                    {{ selectedMonthShort() }}
                  </span>
                </button>

                <!-- Horizontally Scrollable Date Pills (To & Fro: -10 Days to +10 Days around Selected Date) -->
                <div
                  #dateScrollContainer
                  class="relative flex items-center space-x-1.5 overflow-x-auto scrollbar-none py-0.5 flex-1 min-w-0">
                  @for (d of scrollableDates(); track d.iso) {
                    <button
                      type="button"
                      [attr.data-selected-date]="d.iso === state.travelDate() ? 'true' : null"
                      (click)="selectDate(d.iso)"
                      [class.bg-gradient-to-b]="d.iso === state.travelDate()"
                      [class.from-[#e11d48]]="d.iso === state.travelDate() && selectedCategory() === 'bus'"
                      [class.via-[#f43f5e]]="d.iso === state.travelDate() && selectedCategory() === 'bus'"
                      [class.to-[#fb923c]]="d.iso === state.travelDate() && selectedCategory() === 'bus'"
                      [class.from-[#4f46e5]]="d.iso === state.travelDate() && selectedCategory() === 'cars'"
                      [class.via-[#6366f1]]="d.iso === state.travelDate() && selectedCategory() === 'cars'"
                      [class.to-[#9333ea]]="d.iso === state.travelDate() && selectedCategory() === 'cars'"
                      [class.from-[#7e22ce]]="d.iso === state.travelDate() && selectedCategory() === 'transport'"
                      [class.via-[#a21caf]]="d.iso === state.travelDate() && selectedCategory() === 'transport'"
                      [class.to-[#db2777]]="d.iso === state.travelDate() && selectedCategory() === 'transport'"
                      [class.text-white]="d.iso === state.travelDate()"
                      [class.shadow-sm]="d.iso === state.travelDate()"
                      [class.bg-white]="d.iso !== state.travelDate()"
                      [class.text-slate-800]="d.iso !== state.travelDate()"
                      class="min-w-[50px] h-[48px] px-1.5 rounded-xl flex items-center justify-center gap-1 shrink-0 transition-all cursor-pointer active:scale-95">
                      <span
                        class="text-[7.5px] font-bold uppercase tracking-wider leading-none [writing-mode:vertical-rl] rotate-180 select-none"
                        [class.text-white/75]="d.iso === state.travelDate()"
                        [class.text-slate-400]="d.iso !== state.travelDate()">
                        {{ d.monthShort }}
                      </span>
                      <div class="flex flex-col items-center justify-center leading-none">
                        <span class="text-[13.5px] font-extrabold leading-none tabular-nums">
                          {{ d.dayNum }}
                        </span>
                        <span
                          class="text-[8.5px] font-semibold leading-none mt-1"
                          [class.text-white/90]="d.iso === state.travelDate()"
                          [class.text-slate-400]="d.iso !== state.travelDate()">
                          {{ d.dayName }}
                        </span>
                      </div>
                    </button>
                  }
                </div>
              </div>

              <!-- Box 4: BOOKING FOR WOMEN (Only in Bus Search Section) -->
              @if (selectedCategory() === 'bus') {
                <div
                  (click)="toggleBookingForWomen()"
                  [class.bg-[#fff1f2]]="state.bookingForWomen()"
                  [class.bg-[#f4f6f9]]="!state.bookingForWomen()"
                  class="rounded-[18px] px-3 py-2 flex items-center justify-between gap-2.5 cursor-pointer transition-all">
                  <div class="flex items-center space-x-3 min-w-0">
                    <div class="w-10 h-10 rounded-xl bg-[#ffe4e6] text-[#e11d48] flex items-center justify-center shrink-0">
                      <mat-icon class="text-[20px]">female</mat-icon>
                    </div>
                    <div class="min-w-0">
                      <span class="text-[14px] font-bold text-slate-900 block leading-tight">
                        Booking for women
                      </span>
                      <span class="text-[10.5px] font-medium text-[#e11d48] block mt-0.5 leading-none">
                        Know more
                      </span>
                    </div>
                  </div>

                  <!-- Toggle Switch -->
                  <button
                    type="button"
                    role="switch"
                    aria-label="Booking for women"
                    [attr.aria-checked]="state.bookingForWomen()"
                    (click)="$event.stopPropagation(); toggleBookingForWomen()"
                    [class.bg-gradient-to-r]="state.bookingForWomen()"
                    [class.from-[#e11d48]]="state.bookingForWomen()"
                    [class.via-[#f43f5e]]="state.bookingForWomen()"
                    [class.to-[#fb923c]]="state.bookingForWomen()"
                    [class.bg-slate-200]="!state.bookingForWomen()"
                    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none">
                    <span
                      [class.translate-x-5]="state.bookingForWomen()"
                      [class.translate-x-0]="!state.bookingForWomen()"
                      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out">
                    </span>
                  </button>
                </div>
              }

              <!-- Primary Search CTA Button (Bus vs Cars vs Transport Gradient) -->
              <div class="pt-0.5">
                @if (selectedCategory() === 'cars') {
                  <button
                    type="button"
                    (click)="onSearchCarClick()"
                    class="w-full py-3 px-4 rounded-[16px] bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea] hover:opacity-95 active:scale-[0.99] text-white text-[16px] font-bold transition-all cursor-pointer flex items-center justify-center space-x-2">
                    <mat-icon class="text-[20px] text-white">directions_car</mat-icon>
                    <span>Search Cars</span>
                    <mat-icon class="text-[20px] text-white">arrow_forward</mat-icon>
                  </button>
                } @else if (selectedCategory() === 'transport') {
                  <button
                    type="button"
                    (click)="onSearchTransportClick()"
                    class="w-full py-3 px-4 rounded-[16px] bg-gradient-to-r from-[#7e22ce] via-[#a21caf] to-[#db2777] hover:opacity-95 active:scale-[0.99] text-white text-[16px] font-bold transition-all cursor-pointer flex items-center justify-center space-x-2">
                    <mat-icon class="text-[20px] text-white">local_shipping</mat-icon>
                    <span>Search Transport</span>
                    <mat-icon class="text-[20px] text-white">arrow_forward</mat-icon>
                  </button>
                } @else {
                  <button
                    type="button"
                    (click)="onSearchBusClick()"
                    class="w-full py-3 px-4 rounded-[16px] bg-gradient-to-r from-[#e11d48] via-[#f43f5e] to-[#fb923c] hover:opacity-95 active:scale-[0.99] text-white text-[16px] font-bold transition-all cursor-pointer flex items-center justify-center space-x-2">
                    <mat-icon class="text-[20px] text-white">directions_bus</mat-icon>
                    <span>Search Buses</span>
                    <mat-icon class="text-[20px] text-white">arrow_forward</mat-icon>
                  </button>
                }
              </div>
            }

          </div>

        </div>

        <!-- =============================================================== -->
        <!-- POPULAR SEARCH ROUTES (Outside Search Div, Horizontally Scrollable) -->
        <!-- =============================================================== -->
        <div class="px-1 py-1 flex items-center space-x-2.5 overflow-x-auto scrollbar-none -mx-3.5 px-3.5">
          <div class="flex items-center space-x-2 shrink-0">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="text-[12.5px] font-semibold text-slate-500">
              Popular from {{ state.sourceCity().name }}:
            </span>
          </div>

          <div class="flex items-center space-x-2 shrink-0">
            @for (dest of state.popularRoutesFromLocation(); track dest.id) {
              <button
                type="button"
                (click)="quickRouteTo(dest)"
                class="px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 shadow-2xs text-[12px] flex items-center space-x-1.5 shrink-0 cursor-pointer transition-all active:scale-95">
                <span class="font-bold text-slate-800">{{ state.sourceCity().code }}</span>
                <span class="text-slate-400">&rarr;</span>
                <span class="font-bold text-slate-800">{{ dest.code }}</span>
                <span class="text-slate-400">({{ dest.name }})</span>
              </button>
            }
          </div>
        </div>

        <!-- =============================================================== -->
        <!-- TRIP SAVINGS • 2026 / TRENDING TRAVEL DEALS SECTION             -->
        <!-- =============================================================== -->
        <div class="pt-1 space-y-3">
          <div class="flex items-end justify-between px-1">
            <div>
              <div class="text-[11.5px] font-bold tracking-[0.08em] text-[#e11d48] uppercase">
                TRIP SAVINGS &bull; 2026
              </div>
              <h2 class="text-[22px] font-extrabold text-slate-900 tracking-tight leading-tight mt-0.5">
                Trending Travel Deals
              </h2>
            </div>

            <button
              type="button"
              (click)="state.isCouponModalOpen.set(true)"
              class="text-[13px] font-bold text-[#e11d48] hover:opacity-80 flex items-center space-x-1 cursor-pointer pb-0.5">
              <span>View All Coupons</span>
              <mat-icon class="text-[18px] leading-none">arrow_forward</mat-icon>
            </button>
          </div>

          <!-- Horizontal Offers Scroll Container -->
          <div class="flex items-stretch space-x-3 overflow-x-auto pb-2 -mx-3.5 px-3.5 scrollbar-none">
            
            <!-- Offer Card 1: First Bus Booking -->
            <div class="min-w-[260px] max-w-[260px] bg-white rounded-2xl overflow-hidden result-card-shadow flex flex-col justify-between transition-all">
              <div class="relative h-28 w-full bg-slate-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80"
                  alt="RedBus Luxury Bus"
                  class="w-full h-full object-cover"
                  referrerpolicy="no-referrer" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#e11d48] text-white font-semibold text-[10px]">
                  Save ₹300
                </span>
                <span class="absolute bottom-2 left-2.5 text-white text-xs font-bold">
                  First Booking Offer
                </span>
              </div>
              <div class="p-3 flex flex-col justify-between flex-1 space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10.5px] font-mono bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-800">
                    FIRST300
                  </span>
                  <span class="text-[10.5px] text-slate-400">Min booking ₹500</span>
                </div>
                <button
                  type="button"
                  (click)="applyPromo('FIRST300', 300)"
                  class="w-full py-2 rounded-xl bg-[#e11d48] hover:bg-rose-700 active:scale-95 text-white text-xs font-semibold cursor-pointer transition-all text-center">
                  Apply Code
                </button>
              </div>
            </div>

            <!-- Offer Card 2: Volvo Sleeper Discount -->
            <div class="min-w-[260px] max-w-[260px] bg-white rounded-2xl overflow-hidden result-card-shadow flex flex-col justify-between transition-all">
              <div class="relative h-28 w-full bg-slate-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&auto=format&fit=crop&q=80"
                  alt="Luxury Sleeper Coach"
                  class="w-full h-full object-cover"
                  referrerpolicy="no-referrer" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-indigo-600 text-white font-semibold text-[10px]">
                  Flat 20% OFF
                </span>
                <span class="absolute bottom-2 left-2.5 text-white text-xs font-bold">
                  Volvo AC Sleeper
                </span>
              </div>
              <div class="p-3 flex flex-col justify-between flex-1 space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10.5px] font-mono bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-800">
                    SLEEPWELL
                  </span>
                  <span class="text-[10.5px] text-slate-400">AC Sleeper routes</span>
                </div>
                <button
                  type="button"
                  (click)="applyPromo('SLEEPWELL', 200)"
                  class="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold cursor-pointer transition-all text-center">
                  Apply Code
                </button>
              </div>
            </div>

            <!-- Offer Card 3: Shared Cab Doorstep -->
            <div class="min-w-[260px] max-w-[260px] bg-white rounded-2xl overflow-hidden result-card-shadow flex flex-col justify-between transition-all">
              <div class="relative h-28 w-full bg-slate-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80"
                  alt="Car & Cab Rental"
                  class="w-full h-full object-cover"
                  referrerpolicy="no-referrer" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-amber-500 text-white font-semibold text-[10px]">
                  ₹150 OFF
                </span>
                <span class="absolute bottom-2 left-2.5 text-white text-xs font-bold">
                  Shared Cabs &amp; Outstation
                </span>
              </div>
              <div class="p-3 flex flex-col justify-between flex-1 space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10.5px] font-mono bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-800">
                    SAWARI150
                  </span>
                  <span class="text-[10.5px] text-slate-400">On cab bookings</span>
                </div>
                <button
                  type="button"
                  (click)="applyPromo('SAWARI150', 150)"
                  class="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-semibold cursor-pointer transition-all text-center">
                  Apply Code
                </button>
              </div>
            </div>

            <!-- Offer Card 4: Express Transport -->
            <div class="min-w-[260px] max-w-[260px] bg-white rounded-2xl overflow-hidden result-card-shadow flex flex-col justify-between transition-all">
              <div class="relative h-28 w-full bg-slate-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80"
                  alt="Express Transport"
                  class="w-full h-full object-cover"
                  referrerpolicy="no-referrer" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-gradient-to-r from-[#7e22ce] to-[#db2777] text-white font-semibold text-[10px]">
                  Save 70%
                </span>
                <span class="absolute bottom-2 left-2.5 text-white text-xs font-bold">
                  Express Transport &amp; Logistics
                </span>
              </div>
              <div class="p-3 flex flex-col justify-between flex-1 space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-[10.5px] font-mono bg-slate-100 px-2 py-0.5 rounded-md font-bold text-slate-800">
                    MOVE70
                  </span>
                  <span class="text-[10.5px] text-slate-400">Intercity transport</span>
                </div>
                <button
                  type="button"
                  (click)="applyPromo('MOVE70', 250)"
                  class="w-full py-2 rounded-xl bg-gradient-to-r from-[#7e22ce] via-[#a21caf] to-[#db2777] hover:opacity-95 active:scale-95 text-white text-xs font-semibold cursor-pointer transition-all text-center">
                  Apply Code
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- =============================================================== -->
      <!-- BOTTOM NAVIGATION BAR (Home, Booking, Offer, Help, Profile)     -->
      <!-- =============================================================== -->
      <nav class="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md shadow-[0_-4px_20px_rgba(15,23,42,0.06)] py-2.5 px-2 flex items-center justify-around z-40 text-slate-500">
        
        <!-- 1. Home -->
        <button
          type="button"
          (click)="onHomeNavClick()"
          [class.text-[#e11d48]]="selectedCategory() === 'bus'"
          [class.text-[#4f46e5]]="selectedCategory() === 'cars'"
          [class.text-[#0284c7]]="selectedCategory() === 'hotel'"
          [class.text-[#a21caf]]="selectedCategory() === 'transport'"
          class="flex-1 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95">
          <mat-icon
            [class.text-[#e11d48]]="selectedCategory() === 'bus'"
            [class.text-[#4f46e5]]="selectedCategory() === 'cars'"
            [class.text-[#0284c7]]="selectedCategory() === 'hotel'"
            [class.text-[#a21caf]]="selectedCategory() === 'transport'"
            class="text-[21px] leading-none">
            home
          </mat-icon>
          <span class="text-[10.5px] mt-1 font-semibold">Home</span>
        </button>

        <!-- 2. Booking -->
        <button
          type="button"
          (click)="state.currentTab.set('tickets'); closeProfileDropdown()"
          class="flex-1 flex flex-col items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer relative transition-all active:scale-95">
          <mat-icon class="text-[21px] leading-none">confirmation_number</mat-icon>
          <span class="text-[10.5px] font-medium mt-1">Booking</span>
          @if (state.userBookings().length > 0) {
            <span
              [class.from-[#e11d48]]="selectedCategory() === 'bus'"
              [class.to-[#fb923c]]="selectedCategory() === 'bus'"
              [class.from-[#4f46e5]]="selectedCategory() === 'cars'"
              [class.to-[#9333ea]]="selectedCategory() === 'cars'"
              [class.from-[#0284c7]]="selectedCategory() === 'hotel'"
              [class.to-[#38bdf8]]="selectedCategory() === 'hotel'"
              [class.from-[#7e22ce]]="selectedCategory() === 'transport'"
              [class.to-[#db2777]]="selectedCategory() === 'transport'"
              class="w-4 h-4 rounded-full bg-gradient-to-r text-white text-[9.5px] font-bold flex items-center justify-center absolute -top-1 right-3">
              {{ state.userBookings().length }}
            </span>
          }
        </button>

        <!-- 3. Offer -->
        <button
          type="button"
          (click)="state.isCouponModalOpen.set(true); closeProfileDropdown()"
          [class.text-[#e11d48]]="state.isCouponModalOpen() && selectedCategory() === 'bus'"
          [class.text-[#4f46e5]]="state.isCouponModalOpen() && selectedCategory() === 'cars'"
          [class.text-[#0284c7]]="state.isCouponModalOpen() && selectedCategory() === 'hotel'"
          [class.text-[#a21caf]]="state.isCouponModalOpen() && selectedCategory() === 'transport'"
          class="flex-1 flex flex-col items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer transition-all active:scale-95">
          <mat-icon class="text-[21px] leading-none">local_offer</mat-icon>
          <span class="text-[10.5px] font-medium mt-1">Offer</span>
        </button>

        <!-- 4. Help -->
        <button
          type="button"
          (click)="openHelpOffcanvas()"
          [class.text-[#e11d48]]="isHelpOffcanvasOpen() && selectedCategory() === 'bus'"
          [class.text-[#4f46e5]]="isHelpOffcanvasOpen() && selectedCategory() === 'cars'"
          [class.text-[#0284c7]]="isHelpOffcanvasOpen() && selectedCategory() === 'hotel'"
          [class.text-[#a21caf]]="isHelpOffcanvasOpen() && selectedCategory() === 'transport'"
          class="flex-1 flex flex-col items-center justify-center text-slate-500 hover:text-slate-900 cursor-pointer transition-all active:scale-95">
          <mat-icon class="text-[21px] leading-none">support_agent</mat-icon>
          <span class="text-[10.5px] font-medium mt-1">Help</span>
        </button>

        <!-- 5. Profile -->
        <div class="relative flex-1 flex flex-col items-center justify-center">
          <button
            type="button"
            (click)="toggleProfileDropdown()"
            aria-label="User Profile Menu"
            [attr.aria-expanded]="isProfileDropdownOpen()"
            class="flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 focus:outline-none">
            <div
              [class.from-[#e11d48]]="selectedCategory() === 'bus'"
              [class.via-[#f43f5e]]="selectedCategory() === 'bus'"
              [class.to-[#fb923c]]="selectedCategory() === 'bus'"
              [class.from-[#4f46e5]]="selectedCategory() === 'cars'"
              [class.via-[#6366f1]]="selectedCategory() === 'cars'"
              [class.to-[#9333ea]]="selectedCategory() === 'cars'"
              [class.from-[#0284c7]]="selectedCategory() === 'hotel'"
              [class.via-[#0ea5e9]]="selectedCategory() === 'hotel'"
              [class.to-[#38bdf8]]="selectedCategory() === 'hotel'"
              [class.from-[#7e22ce]]="selectedCategory() === 'transport'"
              [class.via-[#a21caf]]="selectedCategory() === 'transport'"
              [class.to-[#db2777]]="selectedCategory() === 'transport'"
              [class.ring-2]="isProfileDropdownOpen()"
              [class.ring-rose-500/30]="isProfileDropdownOpen() && selectedCategory() === 'bus'"
              [class.ring-indigo-500/30]="isProfileDropdownOpen() && selectedCategory() === 'cars'"
              [class.ring-sky-500/30]="isProfileDropdownOpen() && selectedCategory() === 'hotel'"
              [class.ring-fuchsia-500/30]="isProfileDropdownOpen() && selectedCategory() === 'transport'"
              class="w-6 h-6 rounded-full p-[1.5px] bg-gradient-to-r relative shadow-sm transition-transform">
              <img
                [src]="profileAvatarUrl()"
                [alt]="state.currentUser().fullName"
                class="w-full h-full rounded-full object-cover bg-slate-100"
                referrerpolicy="no-referrer" />
              <span class="w-2 h-2 rounded-full bg-sky-500 absolute -bottom-0.5 -right-0.5"></span>
            </div>
            <span
              class="text-[10.5px] font-medium mt-0.5 transition-colors"
              [class.text-[#e11d48]]="isProfileDropdownOpen() && selectedCategory() === 'bus'"
              [class.text-[#4f46e5]]="isProfileDropdownOpen() && selectedCategory() === 'cars'"
              [class.text-[#0284c7]]="isProfileDropdownOpen() && selectedCategory() === 'hotel'"
              [class.text-[#a21caf]]="isProfileDropdownOpen() && selectedCategory() === 'transport'"
              [class.font-semibold]="isProfileDropdownOpen()"
              [class.text-slate-500]="!isProfileDropdownOpen()">
              Profile
            </span>
          </button>

          <!-- Upward Theme-Designed Profile Dropdown Menu (Home Page Pastel & Category Theme) -->
          @if (isProfileDropdownOpen()) {
            <div class="absolute bottom-full right-0 mb-3.5 w-76 bg-white rounded-[30px] result-card-shadow overflow-hidden z-50 animate-scale-in text-left">
              
              <!-- Home Page Pastel Peach-Pink-Lavender User Header -->
              <div class="p-4 bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] text-slate-900 relative overflow-hidden">
                <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)] pointer-events-none"></div>
                <div class="relative z-10 flex items-center space-x-3">
                  <div
                    [class.from-[#e11d48]]="selectedCategory() === 'bus'"
                    [class.via-[#f43f5e]]="selectedCategory() === 'bus'"
                    [class.to-[#fb923c]]="selectedCategory() === 'bus'"
                    [class.from-[#4f46e5]]="selectedCategory() === 'cars'"
                    [class.via-[#6366f1]]="selectedCategory() === 'cars'"
                    [class.to-[#9333ea]]="selectedCategory() === 'cars'"
                    [class.from-[#0284c7]]="selectedCategory() === 'hotel'"
                    [class.via-[#0ea5e9]]="selectedCategory() === 'hotel'"
                    [class.to-[#38bdf8]]="selectedCategory() === 'hotel'"
                    [class.from-[#7e22ce]]="selectedCategory() === 'transport'"
                    [class.via-[#a21caf]]="selectedCategory() === 'transport'"
                    [class.to-[#db2777]]="selectedCategory() === 'transport'"
                    class="w-11 h-11 rounded-full p-[2px] bg-gradient-to-r shrink-0 shadow-xs">
                    <img
                      [src]="profileAvatarUrl()"
                      [alt]="state.currentUser().fullName"
                      class="w-full h-full rounded-full object-cover bg-white"
                      referrerpolicy="no-referrer" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center space-x-1.5">
                      <span class="text-[13.5px] font-extrabold text-slate-900 truncate">
                        {{ state.currentUser().fullName }}
                      </span>
                      <span class="px-2 py-0.5 rounded-full bg-white/90 text-[#0284c7] text-[9px] font-bold uppercase tracking-wider shrink-0">
                        Verified
                      </span>
                    </div>
                    <div class="text-[11px] text-slate-600 truncate mt-0.5">
                      {{ state.currentUser().email }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick Wallet Card Strip (Rounded-[22px]) -->
              <div class="px-3 pt-3 pb-1">
                <button
                  type="button"
                  (click)="showWalletInfo(); closeProfileDropdown()"
                  class="w-full px-3.5 py-2.5 rounded-[22px] bg-[#f4f6f9] hover:bg-[#eef2f6] flex items-center justify-between text-xs cursor-pointer transition-colors active:scale-[0.99]">
                  <span class="flex items-center space-x-2.5 text-slate-800 font-semibold">
                    <span class="w-8 h-8 rounded-2xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center">
                      <mat-icon class="text-[18px] leading-none">account_balance_wallet</mat-icon>
                    </span>
                    <span>redBus Wallet</span>
                  </span>
                  <span class="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] text-white font-bold text-[11px] tabular-nums">
                    ₹{{ state.walletBalance() }}
                  </span>
                </button>
              </div>

              <!-- Theme-Styled Dropdown Navigation Items (Rounded-[22px]) -->
              <div class="p-2.5 space-y-1 text-xs text-slate-700">
                <button
                  type="button"
                  (click)="state.currentTab.set('tickets'); closeProfileDropdown()"
                  class="w-full px-3 py-2 rounded-[22px] flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
                  <span class="flex items-center space-x-2.5">
                    <span class="w-8 h-8 rounded-2xl bg-[#ffe4e6] text-[#be123c] flex items-center justify-center shrink-0">
                      <mat-icon class="text-[18px] leading-none">confirmation_number</mat-icon>
                    </span>
                    <span class="font-semibold text-slate-800">My Tickets</span>
                  </span>
                  <span class="px-2 py-0.5 rounded-full bg-[#ffe4e6] text-[#be123c] text-[10px] font-bold">
                    {{ state.userBookings().length }}
                  </span>
                </button>

                <button
                  type="button"
                  (click)="state.isCouponModalOpen.set(true); closeProfileDropdown()"
                  class="w-full px-3 py-2 rounded-[22px] flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
                  <span class="flex items-center space-x-2.5">
                    <span class="w-8 h-8 rounded-2xl bg-[#fef3c7] text-[#b45309] flex items-center justify-center shrink-0">
                      <mat-icon class="text-[18px] leading-none">local_offer</mat-icon>
                    </span>
                    <span class="font-semibold text-slate-800">Coupons &amp; Deals</span>
                  </span>
                  <mat-icon class="text-sm text-slate-400">chevron_right</mat-icon>
                </button>

                <button
                  type="button"
                  (click)="openAdminPage(); closeProfileDropdown()"
                  class="w-full px-3 py-2 rounded-[22px] flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors">
                  <span class="flex items-center space-x-2.5">
                    <span class="w-8 h-8 rounded-2xl bg-[#e0e7ff] text-[#4338ca] flex items-center justify-center shrink-0">
                      <mat-icon class="text-[18px] leading-none">admin_panel_settings</mat-icon>
                    </span>
                    <span class="font-semibold text-slate-800">Admin Control Center</span>
                  </span>
                  <mat-icon class="text-sm text-slate-400">chevron_right</mat-icon>
                </button>

                <div class="pt-1.5">
                  <button
                    type="button"
                    (click)="state.isAuthModalOpen.set(true); closeProfileDropdown()"
                    [class.from-[#e11d48]]="selectedCategory() === 'bus'"
                    [class.via-[#f43f5e]]="selectedCategory() === 'bus'"
                    [class.to-[#fb923c]]="selectedCategory() === 'bus'"
                    [class.from-[#4f46e5]]="selectedCategory() === 'cars'"
                    [class.via-[#6366f1]]="selectedCategory() === 'cars'"
                    [class.to-[#9333ea]]="selectedCategory() === 'cars'"
                    [class.from-[#0284c7]]="selectedCategory() === 'hotel'"
                    [class.via-[#0ea5e9]]="selectedCategory() === 'hotel'"
                    [class.to-[#38bdf8]]="selectedCategory() === 'hotel'"
                    [class.from-[#7e22ce]]="selectedCategory() === 'transport'"
                    [class.via-[#a21caf]]="selectedCategory() === 'transport'"
                    [class.to-[#db2777]]="selectedCategory() === 'transport'"
                    class="w-full px-3.5 py-2.5 rounded-[22px] flex items-center justify-between bg-gradient-to-r text-white cursor-pointer transition-all active:scale-[0.99] font-bold">
                    <span class="flex items-center space-x-2.5">
                      <span class="w-7 h-7 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                        <mat-icon class="text-[17px] leading-none text-white">manage_accounts</mat-icon>
                      </span>
                      <span>Switch / Edit Account</span>
                    </span>
                    <mat-icon class="text-sm text-white">login</mat-icon>
                  </button>
                </div>
              </div>

            </div>
          }
        </div>
      </nav>

      <!-- =============================================================== -->
      <!-- CITY SEARCH OFFCANVAS (For From, To & Hotel City)               -->
      <!-- =============================================================== -->
      @if (activeCitySearchMode(); as mode) {
        <app-city-search
          [mode]="mode"
          [category]="selectedCategory()"
          (closed)="closeCitySearch()">
        </app-city-search>
      }

      <!-- =============================================================== -->
      <!-- JOURNEY DATE PICKER OFFCANVAS (For Bus & Car)                   -->
      <!-- =============================================================== -->
      @if (isDatePickerOpen()) {
        <app-date-picker
          [selectedDate]="state.travelDate()"
          [category]="selectedCategory()"
          (dateSelected)="selectDate($event)"
          (closed)="closeDatePicker()">
        </app-date-picker>
      }

      <!-- =============================================================== -->
      <!-- HOTEL CHECK-IN / CHECK-OUT RANGE OFFCANVAS (Unified Theme)      -->
      <!-- =============================================================== -->
      @if (isHotelDateOffcanvasOpen()) {
        <div
          class="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans animate-fade-in"
          (click)="closeHotelDateOffcanvas()">
          <div
            class="bg-white w-full max-w-md h-[90vh] sm:h-[85vh] rounded-t-[30px] sm:rounded-[30px] flex flex-col overflow-hidden result-card-shadow text-[#1b1b1b] animate-slide-up"
            (click)="$event.stopPropagation()">
            
            <!-- Pastel Peach-Pink-Lavender Offcanvas Header (Matches Date Offcanvas Theme) -->
            <div
              class="px-5 pt-3.5 pb-4 bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] relative overflow-hidden shrink-0">
              <div
                class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)] pointer-events-none"></div>

              <!-- Top Drag Pill on Mobile -->
              <div class="relative z-10 w-11 h-1.5 bg-slate-400/40 rounded-full mx-auto mb-2.5 sm:hidden"></div>

              <div class="relative z-10 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-2xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0 shadow-2xs">
                    <mat-icon class="text-[22px] leading-none">calendar_month</mat-icon>
                  </div>
                  <div>
                    <div class="flex items-center space-x-2">
                      <h3 class="text-[16px] font-extrabold text-slate-900 leading-tight">
                        {{ hotelDateSelectionFocus() === 'checkout' ? 'Select Check-out Date' : 'Select Check-in Date' }}
                      </h3>
                      <span class="px-2 py-0.5 rounded-full bg-sky-100/80 text-[#0284c7] text-[9.5px] font-bold uppercase tracking-wide">
                        Up to 6M
                      </span>
                    </div>
                    <p class="text-[12px] text-slate-600 font-medium mt-0.5">
                      {{ formatIsoShortDisplay(tempHotelCheckInDate()) || 'Check-in' }} &rarr; {{ hotelHourlyStay() ? 'Hourly Stay' : (formatIsoShortDisplay(tempHotelCheckOutDate()) || 'Select Check-out') }}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="closeHotelDateOffcanvas()"
                  aria-label="Close hotel calendar"
                  class="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center cursor-pointer transition-colors shadow-2xs">
                  <mat-icon class="text-[18px] leading-none">close</mat-icon>
                </button>
              </div>
            </div>

            <!-- Weekday Sticky Header Row -->
            <div class="px-4 py-2.5 grid grid-cols-7 text-center bg-[#f8fafc] shrink-0">
              @for (wd of hotelWeekDays; track wd) {
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {{ wd }}
                </span>
              }
            </div>

            <!-- Vertically Scrollable Multi-Month Calendar (Now through +6 Months) -->
            <div class="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-none">
              @for (monthBlock of hotelCalendarMonths(); track monthBlock.monthKey) {
                <div>
                  <h4 class="text-[15.5px] font-extrabold text-slate-900 text-center my-3 tracking-tight">
                    {{ monthBlock.monthLabel }}
                  </h4>

                  <div class="grid grid-cols-7 gap-y-1.5 text-center">
                    @for (cell of monthBlock.cells; track cell.iso) {
                      @if (!cell.isCurrentMonth) {
                        <div class="h-10"></div>
                      } @else {
                        <div class="relative h-10 flex items-center justify-center">
                          <!-- Continuous Range Background Strip (Hotel Sky Tint) -->
                          @if (cell.isInRange) {
                            <div class="absolute inset-y-0.5 inset-x-0 bg-[#e0f2fe]/90 pointer-events-none"></div>
                          }
                          @if (cell.isCheckIn && tempHotelCheckOutDate() && tempHotelCheckInDate() !== tempHotelCheckOutDate()) {
                            <div class="absolute inset-y-0.5 right-0 w-1/2 bg-[#e0f2fe]/90 pointer-events-none"></div>
                          }
                          @if (cell.isCheckOut && tempHotelCheckInDate() && tempHotelCheckInDate() !== tempHotelCheckOutDate()) {
                            <div class="absolute inset-y-0.5 left-0 w-1/2 bg-[#e0f2fe]/90 pointer-events-none"></div>
                          }

                          <button
                            type="button"
                            [disabled]="cell.isDisabled"
                            (click)="onHotelCalendarDayClick(cell)"
                            [class.text-slate-300]="cell.isDisabled"
                            [class.cursor-not-allowed]="cell.isDisabled"
                            [class.cursor-pointer]="!cell.isDisabled"
                            [class.bg-gradient-to-b]="cell.isCheckIn || cell.isCheckOut"
                            [class.from-[#0284c7]]="cell.isCheckIn || cell.isCheckOut"
                            [class.via-[#0ea5e9]]="cell.isCheckIn || cell.isCheckOut"
                            [class.to-[#38bdf8]]="cell.isCheckIn || cell.isCheckOut"
                            [class.text-white]="cell.isCheckIn || cell.isCheckOut"
                            [class.font-bold]="cell.isCheckIn || cell.isCheckOut || cell.isInRange"
                            [class.rounded-2xl]="cell.isCheckIn || cell.isCheckOut"
                            [class.shadow-sm]="cell.isCheckIn || cell.isCheckOut"
                            [class.text-[#0369a1]]="cell.isInRange && !cell.isCheckIn && !cell.isCheckOut"
                            [class.text-slate-900]="!cell.isDisabled && !cell.isCheckIn && !cell.isCheckOut && !cell.isInRange"
                            [class.hover:bg-sky-50]="!cell.isDisabled && !cell.isCheckIn && !cell.isCheckOut && !cell.isInRange"
                            class="relative z-10 w-full h-10 flex items-center justify-center text-[14px] font-semibold transition-colors rounded-2xl">
                            <span class="tabular-nums">{{ cell.dayNumber }}</span>
                          </button>
                        </div>
                      }
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Bottom Sticky Footer (Hourly Stay + Borderless Check-in/Check-out Boxes + Clear / Select) -->
            <div class="bg-white px-4 pt-3 pb-4 space-y-3 shadow-[0_-4px_20px_rgba(15,23,42,0.06)] shrink-0">
              <!-- Row 1: Book hourly stay toggle -->
              <div class="px-3.5 py-2.5 rounded-2xl bg-[#f4f6f9] flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <mat-icon class="text-[19px] text-[#0284c7] leading-none">schedule</mat-icon>
                  <span class="text-[13.5px] font-bold text-slate-800">Book hourly stay</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  [attr.aria-checked]="hotelHourlyStay()"
                  (click)="toggleHotelHourlyStay()"
                  [class.bg-[#0284c7]]="hotelHourlyStay()"
                  [class.bg-slate-300]="!hotelHourlyStay()"
                  class="w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer flex items-center">
                  <span
                    [class.translate-x-5]="hotelHourlyStay()"
                    [class.translate-x-0]="!hotelHourlyStay()"
                    class="w-5 h-5 rounded-full bg-white shadow-xs transition-transform block">
                  </span>
                </button>
              </div>

              <!-- Row 2: Borderless Check-in date & Check-out date boxes -->
              <div class="grid grid-cols-2 gap-2.5">
                <!-- Check-in date box -->
                <button
                  type="button"
                  (click)="hotelDateSelectionFocus.set('checkin')"
                  [class.bg-[#e0f2fe]/80]="hotelDateSelectionFocus() === 'checkin'"
                  [class.bg-[#f4f6f9]]="hotelDateSelectionFocus() !== 'checkin'"
                  class="rounded-2xl px-3.5 py-2.5 text-left cursor-pointer transition-all">
                  <span
                    [class.text-[#0284c7]]="hotelDateSelectionFocus() === 'checkin'"
                    [class.text-slate-400]="hotelDateSelectionFocus() !== 'checkin'"
                    class="text-[10px] font-bold uppercase tracking-wider block leading-none">
                    Check-in date
                  </span>
                  <span class="text-[14px] font-bold text-slate-900 block truncate mt-1">
                    {{ formatIsoShortDisplay(tempHotelCheckInDate()) || 'Select date' }}
                  </span>
                </button>

                <!-- Check-out date box -->
                <button
                  type="button"
                  (click)="hotelDateSelectionFocus.set('checkout')"
                  [class.bg-[#e0f2fe]/80]="hotelDateSelectionFocus() === 'checkout'"
                  [class.bg-[#f4f6f9]]="hotelDateSelectionFocus() !== 'checkout'"
                  class="rounded-2xl px-3.5 py-2.5 text-left cursor-pointer transition-all">
                  <span
                    [class.text-[#0284c7]]="hotelDateSelectionFocus() === 'checkout'"
                    [class.text-slate-400]="hotelDateSelectionFocus() !== 'checkout'"
                    class="text-[10px] font-bold uppercase tracking-wider block leading-none">
                    Check-out date
                  </span>
                  <span class="text-[14px] font-bold text-slate-900 block truncate mt-1">
                    {{ hotelHourlyStay() ? formatIsoShortDisplay(tempHotelCheckInDate()) + ' (Hourly)' : (formatIsoShortDisplay(tempHotelCheckOutDate()) || 'Select date') }}
                  </span>
                </button>
              </div>

              <!-- Row 3: Clear & Select Action Buttons -->
              <div class="flex items-center justify-between gap-3">
                <button
                  type="button"
                  (click)="clearHotelDates()"
                  class="px-7 py-3 rounded-2xl bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0284c7] text-[14.5px] font-bold cursor-pointer transition-all active:scale-95">
                  Clear
                </button>

                <button
                  type="button"
                  (click)="confirmHotelDates()"
                  class="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] hover:opacity-95 text-white text-[14.5px] font-bold shadow-sm cursor-pointer transition-all active:scale-95">
                  Select
                </button>
              </div>
            </div>

          </div>
        </div>
      }

      <!-- =============================================================== -->
      <!-- SELECT ROOMS AND GUESTS OFFCANVAS (Unified Theme & Borderless)  -->
      <!-- =============================================================== -->
      @if (isHotelGuestsOffcanvasOpen()) {
        <div
          class="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans animate-fade-in"
          (click)="closeHotelGuestsOffcanvas()">
          <div
            class="bg-white w-full max-w-md rounded-t-[30px] sm:rounded-[30px] overflow-hidden result-card-shadow text-[#1b1b1b] animate-slide-up flex flex-col max-h-[90vh]"
            (click)="$event.stopPropagation()">
            
            <!-- Pastel Peach-Pink-Lavender Offcanvas Header (Matches Date Offcanvas Theme) -->
            <div
              class="px-5 pt-3.5 pb-4 bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] relative overflow-hidden shrink-0">
              <div
                class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)] pointer-events-none"></div>

              <!-- Top Drag Pill on Mobile -->
              <div class="relative z-10 w-11 h-1.5 bg-slate-400/40 rounded-full mx-auto mb-2.5 sm:hidden"></div>

              <div class="relative z-10 flex items-center justify-between">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-2xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0 shadow-2xs">
                    <mat-icon class="text-[22px] leading-none">king_bed</mat-icon>
                  </div>
                  <div>
                    <div class="flex items-center space-x-2">
                      <h3 class="text-[16px] font-extrabold text-slate-900 leading-tight">
                        Select Rooms and Guests
                      </h3>
                      <span class="px-2 py-0.5 rounded-full bg-sky-100/80 text-[#0284c7] text-[9.5px] font-bold uppercase tracking-wide">
                        Hotel Stay
                      </span>
                    </div>
                    <p class="text-[12px] text-slate-600 font-medium mt-0.5">
                      {{ formattedRoomsGuestsSummary() }}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="closeHotelGuestsOffcanvas()"
                  aria-label="Close Select Rooms and Guests"
                  class="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center cursor-pointer transition-colors shadow-2xs">
                  <mat-icon class="text-[18px] leading-none">close</mat-icon>
                </button>
              </div>
            </div>

            <!-- Scrollable Form Body -->
            <div class="p-5 space-y-4 overflow-y-auto">
              <!-- Rooms Row -->
              <div class="flex items-center justify-between">
                <span class="text-[16.5px] font-bold text-slate-900">Rooms</span>
                <div class="relative w-[104px]">
                  <select
                    aria-label="Number of Rooms"
                    [value]="hotelRooms()"
                    (change)="onHotelRoomsSelect($event)"
                    class="w-full appearance-none rounded-2xl border-0 bg-[#f4f6f9] hover:bg-[#eef2f6] pl-4 pr-9 py-2.5 text-[16px] font-bold text-slate-900 focus:outline-none cursor-pointer tabular-nums">
                    @for (n of roomCountOptions; track n) {
                      <option [value]="n" [selected]="n === hotelRooms()">{{ padTwoDigits(n) }}</option>
                    }
                  </select>
                  <mat-icon class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#0284c7] text-[20px]">
                    expand_more
                  </mat-icon>
                </div>
              </div>

              <!-- Adults Row -->
              <div class="flex items-center justify-between">
                <span class="text-[16.5px] font-bold text-slate-900">Adults</span>
                <div class="relative w-[104px]">
                  <select
                    aria-label="Number of Adults"
                    [value]="hotelAdults()"
                    (change)="onHotelAdultsSelect($event)"
                    class="w-full appearance-none rounded-2xl border-0 bg-[#f4f6f9] hover:bg-[#eef2f6] pl-4 pr-9 py-2.5 text-[16px] font-bold text-slate-900 focus:outline-none cursor-pointer tabular-nums">
                    @for (n of adultCountOptions; track n) {
                      <option [value]="n" [selected]="n === hotelAdults()">{{ padTwoDigits(n) }}</option>
                    }
                  </select>
                  <mat-icon class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#0284c7] text-[20px]">
                    expand_more
                  </mat-icon>
                </div>
              </div>

              <!-- Children Row -->
              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="text-[16.5px] font-bold text-slate-900 block leading-tight">Children</span>
                    <span class="text-[12.5px] text-slate-500 block mt-0.5">0 - 17 Years old</span>
                  </div>
                  <div class="relative w-[104px]">
                    <select
                      aria-label="Number of Children"
                      [value]="hotelChildren()"
                      (change)="onHotelChildrenSelect($event)"
                      class="w-full appearance-none rounded-2xl border-0 bg-[#f4f6f9] hover:bg-[#eef2f6] pl-4 pr-9 py-2.5 text-[16px] font-bold text-slate-900 focus:outline-none cursor-pointer tabular-nums">
                      @for (n of childrenCountOptions; track n) {
                        <option [value]="n" [selected]="n === hotelChildren()">{{ padTwoDigits(n) }}</option>
                      }
                    </select>
                    <mat-icon class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#0284c7] text-[20px]">
                      expand_more
                    </mat-icon>
                  </div>
                </div>

                <p class="text-[12.5px] text-slate-500 leading-snug">
                  Please provide right number of children along with their right age for best options and prices.
                </p>
              </div>

              <!-- Number of Pets Row -->
              <div class="flex items-center justify-between pt-0.5">
                <span class="text-[16.5px] font-bold text-slate-900">Number of Pets</span>
                <div class="relative w-[104px]">
                  <select
                    aria-label="Number of Pets"
                    [value]="hotelPets()"
                    (change)="onHotelPetsSelect($event)"
                    class="w-full appearance-none rounded-2xl border-0 bg-[#f4f6f9] hover:bg-[#eef2f6] pl-4 pr-9 py-2.5 text-[16px] font-bold text-slate-900 focus:outline-none cursor-pointer tabular-nums">
                    @for (n of petCountOptions; track n) {
                      <option [value]="n" [selected]="n === hotelPets()">{{ padTwoDigits(n) }}</option>
                    }
                  </select>
                  <mat-icon class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#0284c7] text-[20px]">
                    expand_more
                  </mat-icon>
                </div>
              </div>

              <!-- Who's Travelling? Card (Borderless) -->
              <div class="rounded-2xl p-4 bg-[#f4f6f9] space-y-3">
                <div>
                  <h4 class="text-[16px] font-extrabold text-slate-900 leading-tight">
                    Who’s Travelling?
                  </h4>
                  <p class="text-[12.5px] text-slate-600 mt-1 leading-snug">
                    Select all that apply to see the most relevant stays for your trip
                  </p>
                </div>

                <div class="flex flex-wrap items-center gap-2 pt-0.5">
                  @for (tag of whosTravellingOptions; track tag) {
                    <button
                      type="button"
                      (click)="toggleWhosTravelling(tag)"
                      [class.bg-[#e0f2fe]]="isWhosTravellingSelected(tag)"
                      [class.text-[#0284c7]]="isWhosTravellingSelected(tag)"
                      [class.font-bold]="isWhosTravellingSelected(tag)"
                      [class.bg-white]="!isWhosTravellingSelected(tag)"
                      [class.text-slate-800]="!isWhosTravellingSelected(tag)"
                      [class.font-semibold]="!isWhosTravellingSelected(tag)"
                      class="px-4 py-2 rounded-xl text-[13.5px] shadow-2xs cursor-pointer transition-all active:scale-95">
                      {{ tag }}
                    </button>
                  }
                </div>
              </div>

              <!-- Primary DONE Button (Hotel Sky-Ocean-Blue Theme) -->
              <button
                type="button"
                (click)="closeHotelGuestsOffcanvas()"
                class="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] hover:opacity-95 active:scale-[0.99] text-white text-[15px] font-extrabold uppercase tracking-wide shadow-sm cursor-pointer transition-all">
                DONE
              </button>
            </div>

          </div>
        </div>
      }

      <!-- =============================================================== -->
      <!-- HELP & SUPPORT OFFCANVAS (Unified Home Page Offcanvas Theme)    -->
      <!-- =============================================================== -->
      @if (isHelpOffcanvasOpen()) {
        <div
          class="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans animate-fade-in"
          (click)="closeHelpOffcanvas()">
          <div
            class="bg-white rounded-t-[30px] sm:rounded-[30px] w-full max-w-md overflow-hidden shadow-[0_-10px_40px_rgba(15,23,42,0.16)] sm:shadow-[0_24px_60px_rgba(15,23,42,0.22)] flex flex-col max-h-[90vh]"
            (click)="$event.stopPropagation()">

            <!-- Top Drag Handle Pill (Mobile) -->
            <div class="pt-2.5 pb-1 flex justify-center sm:hidden bg-[#fde6cf]/40">
              <div class="w-10 h-1 rounded-full bg-slate-400/50"></div>
            </div>

            <!-- Home Page Pastel Peach-Pink-Lavender Header -->
            <div class="px-5 py-4 bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] text-[#0f172a] flex items-center justify-between relative overflow-hidden shrink-0">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)] pointer-events-none"></div>
              <div class="relative z-10 flex items-center space-x-3">
                <div
                  class="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs text-white"
                  [class]="selectedCategory() === 'cars'
                    ? 'bg-gradient-to-br from-[#4f46e5] via-[#6366f1] to-[#9333ea]'
                    : selectedCategory() === 'hotel'
                      ? 'bg-gradient-to-br from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]'
                      : selectedCategory() === 'transport'
                        ? 'bg-gradient-to-br from-[#7e22ce] via-[#a21caf] to-[#db2777]'
                        : 'bg-gradient-to-br from-[#e11d48] via-[#f43f5e] to-[#fb923c]'">
                  <mat-icon class="text-[20px] leading-none text-white">support_agent</mat-icon>
                </div>
                <div>
                  <span class="text-[10px] font-bold uppercase tracking-widest text-slate-600 block">
                    24×7 Customer Care
                  </span>
                  <h3 class="text-base font-extrabold tracking-tight text-slate-900">
                    Help &amp; Support
                  </h3>
                </div>
              </div>
              <button
                type="button"
                (click)="closeHelpOffcanvas()"
                aria-label="Close help offcanvas"
                class="relative z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-slate-700 cursor-pointer active:scale-90 transition-all shadow-2xs">
                <mat-icon class="text-[18px] leading-none">close</mat-icon>
              </button>
            </div>

            <!-- Scrollable Help Body -->
            <div class="p-4 overflow-y-auto space-y-3.5 bg-white">
              <!-- Quick Contact Strip -->
              <div class="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  (click)="triggerHelpAction('Live Chat Agent connected! How can we help with your trip?')"
                  class="p-3 rounded-[22px] bg-[#f4f6f9] hover:bg-[#eef2f6] flex items-center space-x-2.5 text-left cursor-pointer transition-all active:scale-95">
                  <div
                    class="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0"
                    [class.bg-[#ffe4e6]]="selectedCategory() === 'bus'"
                    [class.text-[#be123c]]="selectedCategory() === 'bus'"
                    [class.bg-[#e0e7ff]]="selectedCategory() === 'cars'"
                    [class.text-[#4338ca]]="selectedCategory() === 'cars'"
                    [class.bg-[#e0f2fe]]="selectedCategory() === 'hotel'"
                    [class.text-[#0284c7]]="selectedCategory() === 'hotel'"
                    [class.bg-[#fae8ff]]="selectedCategory() === 'transport'"
                    [class.text-[#a21caf]]="selectedCategory() === 'transport'">
                    <mat-icon class="text-[18px] leading-none">chat</mat-icon>
                  </div>
                  <div>
                    <div class="text-xs font-extrabold text-slate-900">Live Chat</div>
                    <div class="text-[10px] text-slate-500">Wait time &lt; 1 min</div>
                  </div>
                </button>

                <button
                  type="button"
                  (click)="triggerHelpAction('Calling 24x7 Priority Helpline: 1800-120-7332')"
                  class="p-3 rounded-[22px] bg-[#f4f6f9] hover:bg-[#eef2f6] flex items-center space-x-2.5 text-left cursor-pointer transition-all active:scale-95">
                  <div class="w-9 h-9 rounded-2xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0">
                    <mat-icon class="text-[18px] leading-none">call</mat-icon>
                  </div>
                  <div>
                    <div class="text-xs font-extrabold text-slate-900">24×7 Helpline</div>
                    <div class="text-[10px] text-slate-500">Toll-free priority</div>
                  </div>
                </button>
              </div>

              <!-- Common Help Topics -->
              <div class="space-y-2">
                <div class="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 px-1">
                  Quick Assistance Topics
                </div>

                <button
                  type="button"
                  (click)="state.currentTab.set('tickets'); closeHelpOffcanvas()"
                  class="w-full p-3.5 rounded-[22px] bg-[#f4f6f9] hover:bg-[#eef2f6] flex items-center justify-between text-left cursor-pointer transition-all active:scale-[0.99]">
                  <div class="flex items-center space-x-3">
                    <div class="w-9 h-9 rounded-2xl bg-white text-slate-700 flex items-center justify-center shadow-2xs shrink-0">
                      <mat-icon class="text-[18px] leading-none">confirmation_number</mat-icon>
                    </div>
                    <div>
                      <div class="text-xs font-bold text-slate-900">Manage or Cancel Booking</div>
                      <div class="text-[11px] text-slate-500">Instant refund &amp; e-ticket download</div>
                    </div>
                  </div>
                  <mat-icon class="text-sm text-slate-400">chevron_right</mat-icon>
                </button>

                <button
                  type="button"
                  (click)="triggerHelpAction('Refund status: All eligible cancellations are refunded within 15 minutes to redBus Wallet or source account.')"
                  class="w-full p-3.5 rounded-[22px] bg-[#f4f6f9] hover:bg-[#eef2f6] flex items-center justify-between text-left cursor-pointer transition-all active:scale-[0.99]">
                  <div class="flex items-center space-x-3">
                    <div class="w-9 h-9 rounded-2xl bg-white text-slate-700 flex items-center justify-center shadow-2xs shrink-0">
                      <mat-icon class="text-[18px] leading-none">currency_rupee</mat-icon>
                    </div>
                    <div>
                      <div class="text-xs font-bold text-slate-900">Refund &amp; Payment Queries</div>
                      <div class="text-[11px] text-slate-500">Track refund status or failed transactions</div>
                    </div>
                  </div>
                  <mat-icon class="text-sm text-slate-400">chevron_right</mat-icon>
                </button>

                <button
                  type="button"
                  (click)="triggerHelpAction('Boarding point & live tracking details are shared via SMS & WhatsApp 2 hours before departure.')"
                  class="w-full p-3.5 rounded-[22px] bg-[#f4f6f9] hover:bg-[#eef2f6] flex items-center justify-between text-left cursor-pointer transition-all active:scale-[0.99]">
                  <div class="flex items-center space-x-3">
                    <div class="w-9 h-9 rounded-2xl bg-white text-slate-700 flex items-center justify-center shadow-2xs shrink-0">
                      <mat-icon class="text-[18px] leading-none">location_on</mat-icon>
                    </div>
                    <div>
                      <div class="text-xs font-bold text-slate-900">Bus, Cab &amp; Transport Help</div>
                      <div class="text-[11px] text-slate-500">Boarding point, driver contact &amp; transport pickup</div>
                    </div>
                  </div>
                  <mat-icon class="text-sm text-slate-400">chevron_right</mat-icon>
                </button>

                <button
                  type="button"
                  (click)="state.isCouponModalOpen.set(true); closeHelpOffcanvas()"
                  class="w-full p-3.5 rounded-[22px] bg-[#f4f6f9] hover:bg-[#eef2f6] flex items-center justify-between text-left cursor-pointer transition-all active:scale-[0.99]">
                  <div class="flex items-center space-x-3">
                    <div class="w-9 h-9 rounded-2xl bg-white text-slate-700 flex items-center justify-center shadow-2xs shrink-0">
                      <mat-icon class="text-[18px] leading-none">local_offer</mat-icon>
                    </div>
                    <div>
                      <div class="text-xs font-bold text-slate-900">Offers, Promo Codes &amp; Wallet</div>
                      <div class="text-[11px] text-slate-500">How to apply discounts on Bus, Car &amp; Transport</div>
                    </div>
                  </div>
                  <mat-icon class="text-sm text-slate-400">chevron_right</mat-icon>
                </button>
              </div>
            </div>

            <!-- Footer Action -->
            <div class="px-5 py-3.5 bg-[#f1f5f9] flex items-center justify-between shrink-0">
              <span class="text-[11px] text-slate-500 font-medium">
                Available 24×7 across India
              </span>
              <button
                type="button"
                (click)="closeHelpOffcanvas()"
                [class]="selectedCategory() === 'cars'
                  ? 'bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea]'
                  : selectedCategory() === 'hotel'
                    ? 'bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]'
                    : selectedCategory() === 'transport'
                      ? 'bg-gradient-to-r from-[#7e22ce] via-[#a21caf] to-[#db2777]'
                      : 'bg-gradient-to-r from-[#e11d48] via-[#f43f5e] to-[#fb923c]'"
                class="px-5 py-2 rounded-full text-xs font-bold text-white shadow-xs cursor-pointer active:scale-95 transition-all">
                Done
              </button>
            </div>

          </div>
        </div>
      }
    </div>
  `,
})
export class HomeSearch {
  readonly state = inject(BookingState);
  readonly selectedCategory = signal<'bus' | 'cars' | 'train' | 'hotel' | 'flight' | 'transport'>(
    this.state.searchCategory() === 'car'
      ? 'cars'
      : this.state.searchCategory() === 'hotel'
      ? 'hotel'
      : this.state.searchCategory() === 'transport'
      ? 'transport'
      : 'bus'
  );
  readonly flightCabinClass = signal<'Economy' | 'Premium Economy' | 'Business'>('Economy');
  readonly isProfileDropdownOpen = signal<boolean>(false);
  readonly isHelpOffcanvasOpen = signal<boolean>(false);
  readonly activeCitySearchMode = signal<'from' | 'to' | 'hotel' | null>(null);
  readonly isDatePickerOpen = signal<boolean>(false);
  readonly flipRotation = signal<number>(0);
  readonly dateScrollContainer = viewChild<ElementRef<HTMLElement>>('dateScrollContainer');

  constructor() {
    effect(() => {
      // Track selected date, category, and computed date window so the selected date centers in the strip
      this.state.travelDate();
      this.selectedCategory();
      this.scrollableDates();
      this.scrollSelectedDateIntoView();
    });
  }

  // Hotel Search State (Check-in, Check-out, Hourly Stay, Rooms, Adults, Children, Pets, Who's Travelling)
  readonly isHotelDateOffcanvasOpen = signal<boolean>(false);
  readonly hotelDateSelectionFocus = signal<'checkin' | 'checkout'>('checkin');
  readonly hotelHourlyStay = signal<boolean>(false);
  readonly hotelCheckOutDate = signal<string>(this.computeDefaultCheckOutIso(this.state.travelDate(), 2));
  readonly tempHotelCheckInDate = signal<string>(this.state.travelDate());
  readonly tempHotelCheckOutDate = signal<string>(this.computeDefaultCheckOutIso(this.state.travelDate(), 2));

  readonly isHotelGuestsOffcanvasOpen = signal<boolean>(false);
  readonly hotelRooms = signal<number>(1);
  readonly hotelAdults = signal<number>(2);
  readonly hotelChildren = signal<number>(0);
  readonly hotelPets = signal<number>(0);
  readonly hotelWhosTravelling = signal<string[]>([]);

  readonly hotelGuests = computed<number>(() => this.hotelAdults() + this.hotelChildren());

  readonly roomCountOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  readonly adultCountOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
  readonly childrenCountOptions = [0, 1, 2, 3, 4, 5, 6];
  readonly petCountOptions = [0, 1, 2, 3, 4];
  readonly whosTravellingOptions = ['All Women', 'All Men', 'Includes Elderly'];
  readonly hotelWeekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  readonly profileAvatarUrl = computed(() => {
    const name = encodeURIComponent(this.state.currentUser().fullName || 'Rahul Sharma');
    return `https://ui-avatars.com/api/?name=${name}&background=ffe4e6&color=be123c&bold=true&size=128`;
  });

  readonly formattedDateDisplay = computed(() => {
    const raw = this.state.travelDate();
    if (!raw) return 'Fri, 9 Oct';
    const dateObj = new Date(raw);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = dayNames[dateObj.getDay()] || 'Fri';
    const d = dateObj.getDate();
    const month = monthNames[dateObj.getMonth()] || 'Oct';
    return `${day}, ${d} ${month}`;
  });

  readonly selectedMonthShort = computed(() => {
    const raw = this.state.travelDate();
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    if (!raw) return 'OCT';
    const parts = raw.split('-').map(Number);
    if (parts.length === 3 && !isNaN(parts[1])) {
      return monthNames[(parts[1] - 1 + 12) % 12] || 'OCT';
    }
    const d = new Date(raw);
    return monthNames[d.getMonth()] || 'OCT';
  });

  readonly scrollableDates = computed(() => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const selectedIso = this.state.travelDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 3);
    maxDate.setHours(0, 0, 0, 0);

    // Clamp selected date within [today, today + 3 months]
    let selectedDate = new Date(today);
    if (selectedIso) {
      const [y, m, d] = selectedIso.split('-').map(Number);
      if (y && m && d) {
        const parsed = new Date(y, m - 1, d);
        parsed.setHours(0, 0, 0, 0);
        if (parsed.getTime() < today.getTime()) {
          selectedDate = new Date(today);
        } else if (parsed.getTime() > maxDate.getTime()) {
          selectedDate = new Date(maxDate);
        } else {
          selectedDate = parsed;
        }
      }
    }

    // Back 10 days from selected date, clamped to never be before today
    const back10Date = new Date(selectedDate);
    back10Date.setDate(selectedDate.getDate() - 10);
    back10Date.setHours(0, 0, 0, 0);
    const startDate = back10Date.getTime() < today.getTime() ? new Date(today) : back10Date;

    // Next 10 days from selected date, clamped to never exceed 3 months from today
    const next10Date = new Date(selectedDate);
    next10Date.setDate(selectedDate.getDate() + 10);
    next10Date.setHours(0, 0, 0, 0);
    const endDate = next10Date.getTime() > maxDate.getTime() ? new Date(maxDate) : next10Date;

    const list: {iso: string; dayNum: string; dayName: string; monthShort: string}[] = [];
    const cur = new Date(startDate);
    while (cur.getTime() <= endDate.getTime()) {
      const yyyy = cur.getFullYear();
      const mm = String(cur.getMonth() + 1).padStart(2, '0');
      const dd = String(cur.getDate()).padStart(2, '0');
      list.push({
        iso: `${yyyy}-${mm}-${dd}`,
        dayNum: dd,
        dayName: dayNames[cur.getDay()] || 'Mon',
        monthShort: monthNames[cur.getMonth()] || 'OCT',
      });
      cur.setDate(cur.getDate() + 1);
    }
    return list;
  });

  private scrollSelectedDateIntoView(smooth = true) {
    if (typeof window === 'undefined') return;
    requestAnimationFrame(() => {
      const container = this.dateScrollContainer()?.nativeElement;
      if (!container) return;
      const selectedEl = container.querySelector<HTMLElement>('[data-selected-date="true"]');
      if (!selectedEl) return;
      const targetScrollLeft =
        selectedEl.offsetLeft - container.clientWidth / 2 + selectedEl.offsetWidth / 2;
      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: smooth ? 'smooth' : 'auto',
      });
    });
  }

  private clampIsoDateForCategory(isoDate: string, category: 'bus' | 'cars' | 'train' | 'hotel' | 'flight' | 'transport'): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxMonths = category === 'hotel' || category === 'flight' ? 6 : 3;
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + maxMonths);

    const [y, m, d] = (isoDate || '').split('-').map(Number);
    let target = today;
    if (y && m && d) {
      const parsed = new Date(y, m - 1, d);
      parsed.setHours(0, 0, 0, 0);
      if (parsed.getTime() < today.getTime()) {
        target = today;
      } else if (parsed.getTime() > maxDate.getTime()) {
        target = maxDate;
      } else {
        target = parsed;
      }
    }
    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  readonly isTodaySelected = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.state.travelDate() === today;
  });

  readonly isTomorrowSelected = computed(() => {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    return this.state.travelDate() === tmr.toISOString().split('T')[0];
  });

  selectDate(isoDate: string) {
    const validIso = this.clampIsoDateForCategory(isoDate, this.selectedCategory());
    this.state.travelDate.set(validIso);
    this.isDatePickerOpen.set(false);
  }

  openCitySearch(mode: 'from' | 'to' | 'hotel') {
    this.activeCitySearchMode.set(mode);
  }

  closeCitySearch() {
    this.activeCitySearchMode.set(null);
  }

  openDatePicker() {
    this.isDatePickerOpen.set(true);
  }

  closeDatePicker() {
    this.isDatePickerOpen.set(false);
  }

  toggleBookingForWomen() {
    const nextVal = !this.state.bookingForWomen();
    this.state.bookingForWomen.set(nextVal);
    if (nextVal) {
      this.state.showToast('Booking for Women enabled: Showing women-friendly & priority seats', 'info');
    }
  }

  toggleProfileDropdown() {
    this.isHelpOffcanvasOpen.set(false);
    this.isProfileDropdownOpen.update((v) => !v);
  }

  closeProfileDropdown() {
    this.isProfileDropdownOpen.set(false);
  }

  openHelpOffcanvas() {
    this.isProfileDropdownOpen.set(false);
    this.isHelpOffcanvasOpen.set(true);
  }

  closeHelpOffcanvas() {
    this.isHelpOffcanvasOpen.set(false);
  }

  triggerHelpAction(message: string) {
    this.state.showToast(message, 'info');
    this.isHelpOffcanvasOpen.set(false);
  }

  readonly hotelLocationDisplay = computed<string>(() => {
    if (this.state.hotelCustomSearchLocation()) {
      return this.state.hotelCustomSearchLocation();
    }
    const city = this.state.destinationCity();
    if (!city) return 'Bengaluru, Karnataka';
    return city.state ? `${city.name}, ${city.state}` : city.name;
  });

  onSwapCities() {
    this.flipRotation.update((deg) => deg + 180);
    this.state.swapCities();
  }

  readonly formattedHotelCheckIn = computed<string>(() => {
    return this.formatIsoShortDisplay(this.state.travelDate()) || 'Select Date';
  });

  readonly formattedHotelCheckOut = computed<string>(() => {
    if (this.hotelHourlyStay()) {
      return `${this.formatIsoShortDisplay(this.state.travelDate())}`;
    }
    return this.formatIsoShortDisplay(this.hotelCheckOutDate()) || 'Select Date';
  });

  readonly hotelNightsCount = computed<number>(() => {
    const inIso = this.state.travelDate();
    const outIso = this.hotelCheckOutDate();
    const inDate = this.parseIsoToDate(inIso);
    const outDate = this.parseIsoToDate(outIso);
    if (!inDate || !outDate) return 1;
    const diff = Math.round((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  });

  readonly formattedRoomsGuestsSummary = computed<string>(() => {
    const r = this.padTwoDigits(this.hotelRooms());
    const a = this.padTwoDigits(this.hotelAdults());
    const c = this.padTwoDigits(this.hotelChildren());
    const roomLabel = this.hotelRooms() === 1 ? 'Room' : 'Rooms';
    const adultLabel = this.hotelAdults() === 1 ? 'Adult' : 'Adults';
    let summary = `${r} ${roomLabel}, ${a} ${adultLabel}`;
    if (this.hotelChildren() > 0) {
      summary += `, ${c} ${this.hotelChildren() === 1 ? 'Child' : 'Children'}`;
    } else {
      summary += `, 00 Children`;
    }
    if (this.hotelPets() > 0) {
      summary += `, ${this.padTwoDigits(this.hotelPets())} ${this.hotelPets() === 1 ? 'Pet' : 'Pets'}`;
    }
    return summary;
  });

  readonly hotelCalendarMonths = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date(today);
    maxDate.setMonth(maxDate.getMonth() + 6);

    const checkInIso = this.tempHotelCheckInDate();
    const checkOutIso = this.tempHotelCheckOutDate();
    const checkInDate = this.parseIsoToDate(checkInIso);
    const checkOutDate = this.parseIsoToDate(checkOutIso);

    const fullMonths = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    const startMonthIndex = today.getFullYear() * 12 + today.getMonth();
    const endMonthIndex = maxDate.getFullYear() * 12 + maxDate.getMonth();

    const blocks: {
      monthKey: string;
      monthLabel: string;
      cells: {
        iso: string;
        dayNumber: number;
        isCurrentMonth: boolean;
        isDisabled: boolean;
        isCheckIn: boolean;
        isCheckOut: boolean;
        isInRange: boolean;
      }[];
    }[] = [];

    for (let idx = startMonthIndex; idx <= endMonthIndex; idx++) {
      const year = Math.floor(idx / 12);
      const month = idx % 12;
      const firstDay = new Date(year, month, 1);
      const startWeekday = firstDay.getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const cells: {
        iso: string;
        dayNumber: number;
        isCurrentMonth: boolean;
        isDisabled: boolean;
        isCheckIn: boolean;
        isCheckOut: boolean;
        isInRange: boolean;
      }[] = [];

      for (let i = 0; i < startWeekday; i++) {
        cells.push({
          iso: `empty-${year}-${month}-${i}`,
          dayNumber: 0,
          isCurrentMonth: false,
          isDisabled: true,
          isCheckIn: false,
          isCheckOut: false,
          isInRange: false,
        });
      }

      for (let d = 1; d <= daysInMonth; d++) {
        const cur = new Date(year, month, d);
        cur.setHours(0, 0, 0, 0);
        const iso = this.formatDateToIso(cur);
        const isDisabled = cur.getTime() < today.getTime() || cur.getTime() > maxDate.getTime();
        const isCheckIn = !!checkInIso && iso === checkInIso;
        const isCheckOut = !this.hotelHourlyStay() && !!checkOutIso && iso === checkOutIso;
        const isInRange =
          !this.hotelHourlyStay() &&
          !!checkInDate &&
          !!checkOutDate &&
          cur.getTime() > checkInDate.getTime() &&
          cur.getTime() < checkOutDate.getTime();

        cells.push({
          iso,
          dayNumber: d,
          isCurrentMonth: true,
          isDisabled,
          isCheckIn,
          isCheckOut,
          isInRange,
        });
      }

      blocks.push({
        monthKey: `${year}-${month}`,
        monthLabel: `${fullMonths[month]} ${year}`,
        cells,
      });
    }

    return blocks;
  });

  openHotelDateOffcanvas(focus: 'checkin' | 'checkout') {
    const validCheckIn = this.clampIsoDateForCategory(this.state.travelDate(), 'hotel');
    this.state.travelDate.set(validCheckIn);

    let validCheckOut = this.clampIsoDateForCategory(this.hotelCheckOutDate(), 'hotel');
    if (validCheckOut <= validCheckIn) {
      validCheckOut = this.computeDefaultCheckOutIso(validCheckIn, 1);
      this.hotelCheckOutDate.set(validCheckOut);
    }

    this.tempHotelCheckInDate.set(validCheckIn);
    this.tempHotelCheckOutDate.set(validCheckOut);
    this.hotelDateSelectionFocus.set(focus);
    this.isHotelDateOffcanvasOpen.set(true);
  }

  closeHotelDateOffcanvas() {
    this.isHotelDateOffcanvasOpen.set(false);
  }

  onHotelCalendarDayClick(cell: {iso: string; isDisabled: boolean; isCurrentMonth: boolean}) {
    if (cell.isDisabled || !cell.isCurrentMonth) return;

    if (this.hotelHourlyStay()) {
      this.tempHotelCheckInDate.set(cell.iso);
      this.tempHotelCheckOutDate.set(cell.iso);
      return;
    }

    const currentCheckIn = this.tempHotelCheckInDate();
    const currentCheckOut = this.tempHotelCheckOutDate();

    if (
      this.hotelDateSelectionFocus() === 'checkin' ||
      !currentCheckIn ||
      (currentCheckIn && currentCheckOut && currentCheckIn !== currentCheckOut)
    ) {
      this.tempHotelCheckInDate.set(cell.iso);
      this.tempHotelCheckOutDate.set('');
      this.hotelDateSelectionFocus.set('checkout');
    } else {
      if (cell.iso <= currentCheckIn) {
        this.tempHotelCheckInDate.set(cell.iso);
        this.tempHotelCheckOutDate.set('');
        this.hotelDateSelectionFocus.set('checkout');
      } else {
        this.tempHotelCheckOutDate.set(cell.iso);
        this.hotelDateSelectionFocus.set('checkin');
      }
    }
  }

  toggleHotelHourlyStay() {
    const next = !this.hotelHourlyStay();
    this.hotelHourlyStay.set(next);
    if (next && this.tempHotelCheckInDate()) {
      this.tempHotelCheckOutDate.set(this.tempHotelCheckInDate());
    } else if (!next && this.tempHotelCheckInDate()) {
      this.tempHotelCheckOutDate.set(this.computeDefaultCheckOutIso(this.tempHotelCheckInDate(), 1));
    }
  }

  clearHotelDates() {
    const todayIso = this.clampIsoDateForCategory(new Date().toISOString().split('T')[0], 'hotel');
    this.tempHotelCheckInDate.set(todayIso);
    this.tempHotelCheckOutDate.set(this.computeDefaultCheckOutIso(todayIso, 1));
    this.hotelDateSelectionFocus.set('checkin');
  }

  confirmHotelDates() {
    const inIso = this.clampIsoDateForCategory(
      this.tempHotelCheckInDate() || this.state.travelDate(),
      'hotel'
    );
    this.state.travelDate.set(inIso);

    if (this.hotelHourlyStay()) {
      this.hotelCheckOutDate.set(inIso);
    } else {
      let outIso = this.tempHotelCheckOutDate();
      if (!outIso || outIso <= inIso) {
        outIso = this.computeDefaultCheckOutIso(inIso, 1);
      }
      this.hotelCheckOutDate.set(this.clampIsoDateForCategory(outIso, 'hotel'));
    }
    this.isHotelDateOffcanvasOpen.set(false);
  }

  openHotelGuestsOffcanvas() {
    this.isHotelGuestsOffcanvasOpen.set(true);
  }

  closeHotelGuestsOffcanvas() {
    this.isHotelGuestsOffcanvasOpen.set(false);
  }

  onHotelRoomsSelect(event: Event) {
    const val = parseInt((event.target as HTMLSelectElement).value, 10);
    if (!isNaN(val) && val >= 1) {
      this.hotelRooms.set(val);
    }
  }

  onHotelAdultsSelect(event: Event) {
    const val = parseInt((event.target as HTMLSelectElement).value, 10);
    if (!isNaN(val) && val >= 1) {
      this.hotelAdults.set(val);
    }
  }

  onHotelChildrenSelect(event: Event) {
    const val = parseInt((event.target as HTMLSelectElement).value, 10);
    if (!isNaN(val) && val >= 0) {
      this.hotelChildren.set(val);
    }
  }

  onHotelPetsSelect(event: Event) {
    const val = parseInt((event.target as HTMLSelectElement).value, 10);
    if (!isNaN(val) && val >= 0) {
      this.hotelPets.set(val);
    }
  }

  toggleWhosTravelling(tag: string) {
    const current = this.hotelWhosTravelling();
    if (current.includes(tag)) {
      this.hotelWhosTravelling.set(current.filter((t) => t !== tag));
    } else {
      this.hotelWhosTravelling.set([...current, tag]);
    }
  }

  isWhosTravellingSelected(tag: string): boolean {
    return this.hotelWhosTravelling().includes(tag);
  }

  padTwoDigits(n: number): string {
    return String(n).padStart(2, '0');
  }

  formatIsoShortDisplay(iso: string): string {
    const dt = this.parseIsoToDate(iso);
    if (!dt) return '';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[dt.getDay()]}, ${dt.getDate()} ${months[dt.getMonth()]}`;
  }

  private parseIsoToDate(iso: string): Date | null {
    if (!iso) return null;
    const [y, m, d] = iso.split('-').map(Number);
    if (!y || !m || !d) return null;
    const dt = new Date(y, m - 1, d);
    dt.setHours(0, 0, 0, 0);
    return dt;
  }

  private formatDateToIso(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private computeDefaultCheckOutIso(checkInIso: string, addDays = 2): string {
    const base = this.parseIsoToDate(checkInIso) || new Date();
    base.setHours(0, 0, 0, 0);
    const out = new Date(base);
    out.setDate(base.getDate() + addDays);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxHotel = new Date(today);
    maxHotel.setMonth(maxHotel.getMonth() + 6);
    if (out.getTime() > maxHotel.getTime()) {
      return this.formatDateToIso(maxHotel);
    }
    return this.formatDateToIso(out);
  }

  selectCategory(category: 'bus' | 'cars' | 'train' | 'hotel' | 'flight' | 'transport') {
    this.selectedCategory.set(category);
    // Ensure selected travel date respects the category's allowed window (3M for bus/car/transport, 6M for hotel/flight)
    const clamped = this.clampIsoDateForCategory(this.state.travelDate(), category);
    if (clamped !== this.state.travelDate()) {
      this.state.travelDate.set(clamped);
    }
    if (category === 'hotel' && this.hotelCheckOutDate() <= clamped) {
      this.hotelCheckOutDate.set(this.computeDefaultCheckOutIso(clamped, 2));
    }
    if (category === 'cars') {
      this.state.searchCategory.set('car');
      this.state.resultsTargetSection.set('car');
    } else if (category === 'hotel') {
      this.state.searchCategory.set('hotel');
      this.state.resultsTargetSection.set('hotel');
    } else if (category === 'transport') {
      this.state.searchCategory.set('transport');
      this.state.resultsTargetSection.set('transport');
    } else if (category === 'flight') {
      this.state.searchCategory.set('flight');
      this.state.resultsTargetSection.set('flight');
    } else {
      this.state.searchCategory.set('bus');
      this.state.resultsTargetSection.set('bus');
    }
  }

  onFromCityChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const city = this.state.cities().find((c) => c.id === select.value);
    if (city) {
      this.state.sourceCity.set(city);
    }
  }

  onToCityChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const city = this.state.cities().find((c) => c.id === select.value);
    if (city) {
      this.state.destinationCity.set(city);
    }
  }

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      this.state.travelDate.set(this.clampIsoDateForCategory(input.value, this.selectedCategory()));
    }
  }

  openAdminPage() {
    this.state.currentTab.set('admin');
  }

  quickRouteTo(dest: City) {
    this.state.destinationCity.set(dest);
    this.state.showToast(`Selected route: ${this.state.sourceCity().name} → ${dest.name}`, 'info');
    this.onSearchRideClick();
  }

  applyPromo(code: string, discount: number) {
    this.state.appliedCoupon.set({
      code,
      discount,
      title: `${code} Applied: ₹${discount} discount`,
    });
    this.state.showToast(`Promo ${code} applied! You save ₹${discount}.`, 'success');
  }

  onSearchRideClick() {
    const cat = this.selectedCategory();
    if (cat === 'cars') {
      this.onSearchCarClick();
    } else if (cat === 'hotel') {
      this.onSearchHotelClick();
    } else if (cat === 'transport') {
      this.onSearchTransportClick();
    } else if (cat === 'flight') {
      this.onSearchFlightClick();
    } else {
      this.onSearchBusClick();
    }
  }

  onSearchBusClick() {
    this.selectedCategory.set('bus');
    this.state.searchOnlyBus();
  }

  onSearchCarClick() {
    this.selectedCategory.set('cars');
    this.state.searchOnlyCar();
  }

  onSearchHotelClick() {
    this.selectedCategory.set('hotel');
    this.state.searchOnlyHotel();
  }

  onSearchTransportClick() {
    this.selectedCategory.set('transport');
    this.state.searchOnlyTransport();
  }

  onSearchFlightClick() {
    this.selectedCategory.set('flight');
    this.state.searchOnlyFlight();
  }

  toggleFlightCabinClass() {
    const current = this.flightCabinClass();
    if (current === 'Economy') {
      this.flightCabinClass.set('Premium Economy');
      this.state.showToast('Selected: Premium Economy Class', 'info');
    } else if (current === 'Premium Economy') {
      this.flightCabinClass.set('Business');
      this.state.showToast('Selected: Business Class', 'info');
    } else {
      this.flightCabinClass.set('Economy');
      this.state.showToast('Selected: Economy Class', 'info');
    }
  }

  showWalletInfo() {
    this.state.showToast('Wallet Balance: ₹' + this.state.walletBalance() + ' • Usable on all bus, cab and hotel bookings!', 'info');
  }

  onHomeNavClick() {
    this.state.goToSearch();
    this.state.currentTab.set('booking');
  }
}
