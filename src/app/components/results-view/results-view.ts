import {ChangeDetectionStrategy, Component, inject, signal, computed, effect} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {BookingState} from '../../services/booking-state';
import {Trip, SharedCarTrip, CarSeat, DestinationHotel} from '../../models/bus-booking.models';

export interface CardOfferItem {
  id: string;
  offerText: string;
}

@Component({
  selector: 'app-results-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] text-[#1b1b1b] pb-36 font-sans relative overflow-x-hidden">
      
      <!-- ================================================================= -->
      <!-- FULL-PAGE PASTEL PEACH-PINK-LAVENDER GRADIENT BACKDROP            -->
      <!-- (Applied across Bus, Car, and Hotel Result View pages)            -->
      <!-- ================================================================= -->
      <div
        aria-hidden="true"
        class="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd]">
        <div class="w-full h-full bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)]"></div>
      </div>

      <!-- Top Sticky Header (Solid White Background) -->
      <header class="sticky top-0 z-40 bg-white text-[#1b1b1b] border-b border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)] transition-colors">
        <div class="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex items-center justify-between gap-3">
          
          <!-- Left: Back Arrow + Route + Count Subtitle -->
          <div class="flex items-center space-x-3 min-w-0">
            <button
              type="button"
              (click)="state.goToSearch()"
              title="Back to Search"
              class="w-9 h-9 -ml-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[#1b1b1b] flex items-center justify-center cursor-pointer active:scale-90 transition-all shrink-0 shadow-2xs">
              <mat-icon class="text-[22px]">arrow_back</mat-icon>
            </button>

            <div class="min-w-0">
              <div class="flex items-center space-x-1.5 truncate">
                @if (isHotelSearch() || activeTab() === 'hotels') {
                  <span class="text-[17px] sm:text-lg text-[#1b1b1b] truncate font-normal tracking-tight">
                    Hotels in {{ state.destinationCity().name }}
                  </span>
                  <span class="px-2 py-0.5 rounded-full bg-[#e0f2fe] text-[#0284c7] border border-sky-200/60 text-[10px] font-normal shrink-0">
                    70% OFF
                  </span>
                } @else {
                  <span class="text-[17px] sm:text-lg text-[#1b1b1b] truncate font-normal tracking-tight">
                    {{ state.sourceCity().name }}
                  </span>
                  <mat-icon class="text-[18px] text-slate-500 shrink-0">arrow_forward</mat-icon>
                  <span class="text-[17px] sm:text-lg text-[#1b1b1b] truncate font-normal tracking-tight">
                    {{ state.destinationCity().name }}
                  </span>
                }
              </div>

              @if (isHotelSearch() || activeTab() === 'hotels') {
                <div class="text-[13px] text-slate-600 truncate font-normal leading-tight mt-0.5">
                  <span>{{ state.destinationHotels().length }} Verified Transit Hotels</span>
                </div>
              } @else if (isTransportSearch() || activeTab() === 'transport') {
                <div class="text-[13px] text-slate-600 truncate font-normal leading-tight mt-0.5">
                  <span>{{ transportTrips().length }} Express Transport Vehicles</span>
                </div>
              } @else if (activeTab() === 'buses') {
                <div class="text-[13px] text-slate-600 truncate font-normal leading-tight mt-0.5">
                  @if (state.isTripsLoading()) {
                    <span class="inline-block h-3.5 w-24 rounded-md bg-slate-200/80 animate-pulse align-middle"></span>
                  } @else {
                    <span>{{ busTrips().length }} Buses</span>
                  }
                </div>
              } @else {
                <div class="text-[13px] text-slate-600 truncate font-normal leading-tight mt-0.5">
                  <span>{{ carTrips().length }} Cars</span>
                </div>
              }
            </div>
          </div>

          <!-- Right: Date Pill + Day Subtitle Below -->
          <button
            type="button"
            (click)="isModifyOpen.set(!isModifyOpen())"
            title="Change Date or Route"
            class="flex flex-col items-center justify-center cursor-pointer transition-all active:scale-95 shrink-0 group">
            <div
              [class.bg-[#ffe4e6]]="activeTab() === 'buses'"
              [class.text-[#be123c]]="activeTab() === 'buses'"
              [class.border-rose-200/80]="activeTab() === 'buses'"
              [class.bg-[#e0e7ff]]="activeTab() === 'cars'"
              [class.text-[#4338ca]]="activeTab() === 'cars'"
              [class.border-indigo-200/80]="activeTab() === 'cars'"
              [class.bg-[#fae8ff]]="isTransportSearch() || activeTab() === 'transport'"
              [class.text-[#a21caf]]="isTransportSearch() || activeTab() === 'transport'"
              [class.border-fuchsia-200/80]="isTransportSearch() || activeTab() === 'transport'"
              [class.bg-[#e0f2fe]]="isHotelSearch() || activeTab() === 'hotels'"
              [class.text-[#0284c7]]="isHotelSearch() || activeTab() === 'hotels'"
              [class.border-sky-200/80]="isHotelSearch() || activeTab() === 'hotels'"
              class="px-3.5 py-1 rounded-full text-[13px] font-normal leading-tight transition-colors group-hover:opacity-90 border shadow-2xs">
              {{ formattedDateParts().dateStr }}
            </div>
            <span class="text-[12px] text-slate-600 font-normal leading-tight mt-0.5">
              {{ formattedDateParts().dayStr }}
            </span>
          </button>

        </div>

        <!-- Sub-Header: Independent Flows for Bus/Car vs Transport vs Hotel -->
        @if (!isHotelSearch() && !isTransportSearch()) {
          <!-- Flat Switch between Bus and Car (50% / 50%) -->
          <div class="max-w-6xl mx-auto flex items-center border-t border-slate-200/80 bg-white">
            <!-- Bus Switch (50% width) -->
            <button
              type="button"
              (click)="setActiveTab('buses')"
              [class.text-[#e11d48]]="activeTab() === 'buses'"
              [class.border-[#e11d48]]="activeTab() === 'buses'"
              [class.bg-rose-50/40]="activeTab() === 'buses'"
              [class.text-slate-600]="activeTab() !== 'buses'"
              [class.border-transparent]="activeTab() !== 'buses'"
              class="w-1/2 py-2.5 px-3 text-xs sm:text-sm font-normal border-b-2 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-[0.99] text-center">
              <mat-icon class="text-base sm:text-lg">directions_bus</mat-icon>
              <span>Bus</span>
              <span
                [class.bg-[#ffe4e6]]="activeTab() === 'buses'"
                [class.text-[#be123c]]="activeTab() === 'buses'"
                [class.border-rose-200/80]="activeTab() === 'buses'"
                [class.bg-slate-100]="activeTab() !== 'buses'"
                [class.text-slate-600]="activeTab() !== 'buses'"
                class="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-normal transition-colors border border-transparent">
                {{ busTrips().length }}
              </span>
            </button>

            <!-- Car Switch (50% width) -->
            <button
              type="button"
              (click)="setActiveTab('cars')"
              [class.text-[#4f46e5]]="activeTab() === 'cars'"
              [class.border-[#4f46e5]]="activeTab() === 'cars'"
              [class.bg-indigo-50/40]="activeTab() === 'cars'"
              [class.text-slate-600]="activeTab() !== 'cars'"
              [class.border-transparent]="activeTab() !== 'cars'"
              class="w-1/2 py-2.5 px-3 text-xs sm:text-sm font-normal border-b-2 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-[0.99] text-center">
              <mat-icon class="text-base sm:text-lg">directions_car</mat-icon>
              <span>Car</span>
              <span
                [class.bg-[#e0e7ff]]="activeTab() === 'cars'"
                [class.text-[#4338ca]]="activeTab() === 'cars'"
                [class.border-indigo-200/80]="activeTab() === 'cars'"
                [class.bg-slate-100]="activeTab() !== 'cars'"
                [class.text-slate-600]="activeTab() !== 'cars'"
                class="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-normal transition-colors border border-transparent">
                {{ carTrips().length }}
              </span>
            </button>
          </div>
        } @else if (isTransportSearch()) {
          <!-- Independent Transport Sub-Header Filter Tabs -->
          <div class="max-w-6xl mx-auto flex items-center overflow-x-auto scrollbar-none border-t border-slate-200/80 bg-white">
            <button
              type="button"
              (click)="setTransportFilter('all')"
              [class.text-[#a21caf]]="transportFilter() === 'all'"
              [class.border-[#a21caf]]="transportFilter() === 'all'"
              [class.bg-fuchsia-50/40]="transportFilter() === 'all'"
              [class.text-slate-600]="transportFilter() !== 'all'"
              [class.border-transparent]="transportFilter() !== 'all'"
              class="flex-1 min-w-[130px] py-2.5 px-3 text-xs sm:text-sm font-normal border-b-2 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-[0.99] text-center whitespace-nowrap">
              <mat-icon class="text-base sm:text-lg">local_shipping</mat-icon>
              <span>All Transport</span>
              <span
                [class.bg-[#fae8ff]]="transportFilter() === 'all'"
                [class.text-[#a21caf]]="transportFilter() === 'all'"
                [class.bg-slate-100]="transportFilter() !== 'all'"
                [class.text-slate-600]="transportFilter() !== 'all'"
                class="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-normal transition-colors">
                {{ allTransportCount() }}
              </span>
            </button>

            <button
              type="button"
              (click)="setTransportFilter('ac')"
              [class.text-[#a21caf]]="transportFilter() === 'ac'"
              [class.border-[#a21caf]]="transportFilter() === 'ac'"
              [class.bg-fuchsia-50/40]="transportFilter() === 'ac'"
              [class.text-slate-600]="transportFilter() !== 'ac'"
              [class.border-transparent]="transportFilter() !== 'ac'"
              class="flex-1 min-w-[120px] py-2.5 px-3 text-xs sm:text-sm font-normal border-b-2 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-[0.99] text-center whitespace-nowrap">
              <mat-icon class="text-base sm:text-lg">ac_unit</mat-icon>
              <span>AC Cruisers</span>
            </button>

            <button
              type="button"
              (click)="setTransportFilter('cargo')"
              [class.text-[#a21caf]]="transportFilter() === 'cargo'"
              [class.border-[#a21caf]]="transportFilter() === 'cargo'"
              [class.bg-fuchsia-50/40]="transportFilter() === 'cargo'"
              [class.text-slate-600]="transportFilter() !== 'cargo'"
              [class.border-transparent]="transportFilter() !== 'cargo'"
              class="flex-1 min-w-[120px] py-2.5 px-3 text-xs sm:text-sm font-normal border-b-2 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-[0.99] text-center whitespace-nowrap">
              <mat-icon class="text-base sm:text-lg">inventory_2</mat-icon>
              <span>Cargo &amp; Luggage</span>
            </button>

            <button
              type="button"
              (click)="setTransportFilter('rated')"
              [class.text-[#a21caf]]="transportFilter() === 'rated'"
              [class.border-[#a21caf]]="transportFilter() === 'rated'"
              [class.bg-fuchsia-50/40]="transportFilter() === 'rated'"
              [class.text-slate-600]="transportFilter() !== 'rated'"
              [class.border-transparent]="transportFilter() !== 'rated'"
              class="flex-1 min-w-[120px] py-2.5 px-3 text-xs sm:text-sm font-normal border-b-2 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-[0.99] text-center whitespace-nowrap">
              <mat-icon class="text-base sm:text-lg text-amber-500">star</mat-icon>
              <span>Top Rated</span>
            </button>
          </div>
        } @else {
          <!-- Hotel Sub-Header Filter Tabs (Matches Bus/Car Sub-Header Tab Design) -->
          <div class="max-w-6xl mx-auto flex items-center overflow-x-auto scrollbar-none border-t border-slate-200/80 bg-white">
            <button
              type="button"
              (click)="setHotelFilter('all')"
              [class.text-[#0284c7]]="hotelFilter() === 'all'"
              [class.border-[#0284c7]]="hotelFilter() === 'all'"
              [class.bg-sky-50/40]="hotelFilter() === 'all'"
              [class.text-slate-600]="hotelFilter() !== 'all'"
              [class.border-transparent]="hotelFilter() !== 'all'"
              class="flex-1 min-w-[120px] py-2.5 px-3 text-xs sm:text-sm font-normal border-b-2 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-[0.99] text-center whitespace-nowrap">
              <mat-icon class="text-base sm:text-lg">hotel</mat-icon>
              <span>All Hotels</span>
              <span
                [class.bg-[#e0f2fe]]="hotelFilter() === 'all'"
                [class.text-[#0284c7]]="hotelFilter() === 'all'"
                [class.bg-slate-100]="hotelFilter() !== 'all'"
                [class.text-slate-600]="hotelFilter() !== 'all'"
                class="px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-normal transition-colors">
                {{ state.destinationHotels().length }}
              </span>
            </button>

            <button
              type="button"
              (click)="setHotelFilter('rated')"
              [class.text-[#0284c7]]="hotelFilter() === 'rated'"
              [class.border-[#0284c7]]="hotelFilter() === 'rated'"
              [class.bg-sky-50/40]="hotelFilter() === 'rated'"
              [class.text-slate-600]="hotelFilter() !== 'rated'"
              [class.border-transparent]="hotelFilter() !== 'rated'"
              class="flex-1 min-w-[120px] py-2.5 px-3 text-xs sm:text-sm font-normal border-b-2 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-[0.99] text-center whitespace-nowrap">
              <mat-icon class="text-base sm:text-lg text-amber-500">star</mat-icon>
              <span>Top Rated</span>
            </button>

            <button
              type="button"
              (click)="setHotelFilter('budget')"
              [class.text-[#0284c7]]="hotelFilter() === 'budget'"
              [class.border-[#0284c7]]="hotelFilter() === 'budget'"
              [class.bg-sky-50/40]="hotelFilter() === 'budget'"
              [class.text-slate-600]="hotelFilter() !== 'budget'"
              [class.border-transparent]="hotelFilter() !== 'budget'"
              class="flex-1 min-w-[120px] py-2.5 px-3 text-xs sm:text-sm font-normal border-b-2 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-[0.99] text-center whitespace-nowrap">
              <mat-icon class="text-base sm:text-lg">savings</mat-icon>
              <span>Under ₹1,200</span>
            </button>

            <button
              type="button"
              (click)="setHotelFilter('near')"
              [class.text-[#0284c7]]="hotelFilter() === 'near'"
              [class.border-[#0284c7]]="hotelFilter() === 'near'"
              [class.bg-sky-50/40]="hotelFilter() === 'near'"
              [class.text-slate-600]="hotelFilter() !== 'near'"
              [class.border-transparent]="hotelFilter() !== 'near'"
              class="flex-1 min-w-[120px] py-2.5 px-3 text-xs sm:text-sm font-normal border-b-2 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-[0.99] text-center whitespace-nowrap">
              <mat-icon class="text-base sm:text-lg">near_me</mat-icon>
              <span>Near Terminal</span>
            </button>
          </div>
        }

        <!-- Inline Quick Route / Date Modifier Drawer (Matches Home Page Input Box Style) -->
        @if (isModifyOpen()) {
          <div class="border-t border-white/80 bg-white/95 p-3 sm:p-4 animate-slide-up">
            <div class="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs">
              
              <div class="sm:col-span-4 bg-[#fcfcfd] p-2 rounded-[22px] border border-slate-200/90 flex items-center space-x-2">
                <div
                  [class.bg-[#ffe4e6]]="activeTab() === 'buses'"
                  [class.text-[#be123c]]="activeTab() === 'buses'"
                  [class.bg-[#e0e7ff]]="activeTab() === 'cars'"
                  [class.text-[#4338ca]]="activeTab() === 'cars'"
                  [class.bg-[#e0f2fe]]="activeTab() === 'hotels'"
                  [class.text-[#0284c7]]="activeTab() === 'hotels'"
                  class="w-7 h-7 rounded-xl flex items-center justify-center shrink-0">
                  <mat-icon class="text-sm">location_on</mat-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-[9px] font-normal text-slate-400 block uppercase leading-none">Leaving From</span>
                  <select
                    aria-label="Leaving From"
                    (change)="onFromChange($event)"
                    class="w-full bg-transparent border-0 p-0 text-xs font-normal text-slate-800 focus:outline-none cursor-pointer mt-0.5">
                    @for (city of state.cities(); track city.id) {
                      <option [value]="city.id" [selected]="city.id === state.sourceCity().id">
                        {{ city.name }}, {{ city.state }}
                      </option>
                    }
                  </select>
                </div>
              </div>

              <div class="hidden sm:flex sm:col-span-1 justify-center">
                <button
                  type="button"
                  (click)="state.swapCities(); applyModify()"
                  [class.from-[#e11d48]]="activeTab() === 'buses'"
                  [class.via-[#f43f5e]]="activeTab() === 'buses'"
                  [class.to-[#fb923c]]="activeTab() === 'buses'"
                  [class.from-[#4f46e5]]="activeTab() === 'cars'"
                  [class.via-[#6366f1]]="activeTab() === 'cars'"
                  [class.to-[#9333ea]]="activeTab() === 'cars'"
                  [class.from-[#0284c7]]="activeTab() === 'hotels'"
                  [class.via-[#0ea5e9]]="activeTab() === 'hotels'"
                  [class.to-[#38bdf8]]="activeTab() === 'hotels'"
                  class="w-7 h-7 rounded-full bg-gradient-to-br text-white flex items-center justify-center cursor-pointer active:scale-90 transition-all shadow-xs">
                  <mat-icon class="text-xs text-white">swap_horiz</mat-icon>
                </button>
              </div>

              <div class="sm:col-span-4 bg-[#fcfcfd] p-2 rounded-[22px] border border-slate-200/90 flex items-center space-x-2">
                <div class="w-7 h-7 rounded-xl bg-[#ffedd5] text-[#c2410c] flex items-center justify-center shrink-0">
                  <mat-icon class="text-sm">flag</mat-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="text-[9px] font-normal text-slate-400 block uppercase leading-none">Going To</span>
                  <select
                    aria-label="Going To"
                    (change)="onToChange($event)"
                    class="w-full bg-transparent border-0 p-0 text-xs font-normal text-slate-800 focus:outline-none cursor-pointer mt-0.5">
                    @for (city of state.cities(); track city.id) {
                      <option [value]="city.id" [selected]="city.id === state.destinationCity().id">
                        {{ city.name }}, {{ city.state }}
                      </option>
                    }
                  </select>
                </div>
              </div>

              <div class="sm:col-span-3 flex items-center space-x-2">
                <div class="flex-1 bg-[#fcfcfd] p-2 rounded-[22px] border border-slate-200/90 flex items-center space-x-1.5">
                  <div class="w-7 h-7 rounded-xl bg-[#f3e8ff] text-[#7e22ce] flex items-center justify-center shrink-0">
                    <mat-icon class="text-xs">calendar_today</mat-icon>
                  </div>
                  <input
                    type="date"
                    aria-label="Date"
                    [min]="minDateIso()"
                    [max]="maxDateIso()"
                    [value]="state.travelDate()"
                    (change)="onDateChange($event)"
                    class="w-full bg-transparent border-0 p-0 text-xs font-normal text-slate-800 focus:outline-none cursor-pointer" />
                </div>

                <button
                  type="button"
                  (click)="applyModify()"
                  [class.from-[#e11d48]]="activeTab() === 'buses'"
                  [class.via-[#f43f5e]]="activeTab() === 'buses'"
                  [class.to-[#fb923c]]="activeTab() === 'buses'"
                  [class.from-[#4f46e5]]="activeTab() === 'cars'"
                  [class.via-[#6366f1]]="activeTab() === 'cars'"
                  [class.to-[#9333ea]]="activeTab() === 'cars'"
                  [class.from-[#0284c7]]="activeTab() === 'hotels'"
                  [class.via-[#0ea5e9]]="activeTab() === 'hotels'"
                  [class.to-[#38bdf8]]="activeTab() === 'hotels'"
                  class="px-3.5 py-2 bg-gradient-to-r text-white rounded-[22px] font-normal text-xs cursor-pointer active:scale-95 transition-all">
                  Apply
                </button>
              </div>

            </div>
          </div>
        }

      </header>

      <!-- =================================================================== -->
      <!-- TAB 1: BUS RESULTS VIEW (Home Page Bus Design)                      -->
      <!-- =================================================================== -->
      @if (!isHotelSearch() && !isTransportSearch() && activeTab() === 'buses') {
        <main class="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-3.5 sm:pt-5 space-y-4 relative z-10">
          
          @if (activeFilterCount() > 0) {
            <div class="flex items-center justify-between text-xs text-slate-600 px-1">
              <div class="flex items-center space-x-1.5 truncate">
                @if (boardingPointFilter() !== 'all') {
                  <span class="text-[11px] text-slate-600 truncate">
                    Showing trips boarding at <strong class="text-slate-900">{{ boardingPointFilter() }}</strong>
                  </span>
                }
              </div>
              <button
                type="button"
                (click)="resetAllFilters()"
                class="text-rose-600 hover:underline flex items-center space-x-1 cursor-pointer font-normal text-[12px] shrink-0">
                <mat-icon class="text-xs">filter_alt_off</mat-icon>
                <span>Clear {{ activeFilterCount() }} filters</span>
              </button>
            </div>
          }

          <!-- BUSES LIST: Home Page Rounded-[22px] Cards + Skeleton Loader -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
            @if (state.isTripsLoading()) {
              <!-- ========================================================= -->
              <!-- SKELETON LOADING ANIMATION WHILE BUS RESULTS ARE FETCHED  -->
              <!-- ========================================================= -->
              @for (item of skeletonItems; track item) {
                <div
                  aria-busy="true"
                  aria-label="Loading bus trip"
                  class="bg-white rounded-[22px] border border-slate-200/90 result-card-shadow overflow-hidden p-3 sm:p-3.5 animate-pulse">
                  <!-- Top Badge Placeholder -->
                  @if (item % 2 === 1) {
                    <div class="flex justify-end mb-2">
                      <div class="h-4 w-20 rounded-full bg-rose-100/70"></div>
                    </div>
                  }

                  <!-- Row 1: Departure — Arrival Time & Fare Skeleton -->
                  <div class="flex items-start justify-between">
                    <div class="space-y-2">
                      <div class="flex items-center space-x-2">
                        <div class="h-4 sm:h-5 w-14 rounded-md bg-slate-200/90"></div>
                        <div class="h-0.5 w-3 bg-slate-200"></div>
                        <div class="h-4 sm:h-5 w-14 rounded-md bg-slate-200/80"></div>
                      </div>
                      <div class="flex items-center space-x-2">
                        <div class="h-3 w-14 rounded bg-slate-100"></div>
                        <div class="h-1.5 w-1.5 rounded-full bg-slate-200"></div>
                        <div class="h-3 w-20 rounded bg-slate-100"></div>
                      </div>
                    </div>

                    <div class="flex flex-col items-end space-y-1.5 shrink-0">
                      <div class="h-5 sm:h-6 w-16 rounded-md bg-slate-200/90"></div>
                      <div class="h-2.5 w-11 rounded bg-slate-100"></div>
                    </div>
                  </div>

                  <!-- Row 2: Operator Name, Bus Type Subtitle & Two-Tier Rating Badge Skeleton -->
                  <div class="flex items-center justify-between gap-2.5 mt-3.5">
                    <div class="space-y-2 flex-1 min-w-0 pr-3">
                      <div class="flex items-center space-x-2">
                        <div class="h-3.5 sm:h-4 w-40 rounded-md bg-slate-200/90"></div>
                        <div class="h-3.5 w-3.5 rounded bg-slate-200/70 shrink-0"></div>
                      </div>
                      <div class="h-3 w-28 rounded bg-slate-100"></div>
                    </div>

                    <!-- Two-Tier Rating Badge Skeleton -->
                    <div class="rounded-lg p-1 min-w-[44px] border border-slate-200/60 bg-emerald-50/50 space-y-1 shrink-0">
                      <div class="h-4 w-9 mx-auto rounded-[4px] bg-emerald-600/30"></div>
                      <div class="h-2.5 w-7 mx-auto rounded bg-slate-200/80"></div>
                    </div>
                  </div>

                  <!-- Row 3: Lavender Offer Banner Skeleton -->
                  <div class="mt-3 bg-[#f0f3fa] rounded-lg px-2.5 py-1.5 flex items-center space-x-2">
                    <div class="h-3.5 w-3.5 rounded-full bg-indigo-200/80 shrink-0"></div>
                    <div class="h-3 w-48 rounded bg-indigo-100/90"></div>
                  </div>
                </div>
              }
            } @else {
              @if (busTrips().length === 0) {
                <div class="bg-white rounded-[22px] p-10 text-center space-y-3 text-slate-800 result-card-shadow border border-slate-200/90">
                  <div class="w-12 h-12 rounded-2xl bg-[#ffe4e6] text-[#be123c] flex items-center justify-center mx-auto">
                    <mat-icon class="text-2xl text-[#be123c]">directions_bus</mat-icon>
                  </div>
                  <h3 class="text-sm font-normal text-slate-900">No buses matching this filter</h3>
                  <p class="text-xs text-slate-500 max-w-sm mx-auto">Try resetting your filters to see all available buses on this route.</p>
                  <button
                    type="button"
                    (click)="resetAllFilters()"
                    class="px-4 py-2 rounded-[22px] bg-gradient-to-r from-[#e11d48] via-[#f43f5e] to-[#fb923c] text-white text-xs font-normal cursor-pointer active:scale-95 transition-all">
                    Show All Buses
                  </button>
                </div>
              }

              @for (bus of busTrips(); track bus.id; let idx = $index) {
              <div
                (click)="state.selectTrip(bus)"
                role="button"
                tabindex="0"
                (keydown.enter)="state.selectTrip(bus)"
                class="bg-white rounded-[22px] border border-slate-200/90 hover:border-rose-300 result-card-shadow transition-all duration-150 overflow-hidden cursor-pointer"
                [class.border-rose-500]="state.selectedTrip()?.id === bus.id"
                [class.ring-2]="state.selectedTrip()?.id === bus.id"
                [class.ring-rose-500/30]="state.selectedTrip()?.id === bus.id">
                
                <div class="p-3 sm:p-3.5">
                  
                  @if (bus.availableSeatsCount <= 6) {
                    <div class="flex items-center justify-end mb-1.5">
                      <span class="text-[10px] sm:text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                        Only {{ bus.availableSeatsCount }} left
                      </span>
                    </div>
                  }

                  <!-- Departure — Arrival Time & Fare -->
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="flex items-center text-sm sm:text-base font-semibold text-slate-900 leading-tight tracking-tight">
                        <span>{{ bus.departureTime }}</span>
                        <span class="inline-block w-2.5 h-[1.5px] bg-slate-300 mx-1.5"></span>
                        <span class="text-slate-700">{{ bus.arrivalTime }}</span>
                      </div>
                      <div class="text-[11px] text-slate-500 mt-0.5 leading-tight">
                        <span>{{ bus.duration }}</span>
                        <span class="mx-1 text-slate-300">•</span>
                        @if (bus.availableSeatsCount <= 8) {
                          <span class="text-amber-700 font-medium">{{ bus.availableSeatsCount }} Seats</span>
                        } @else {
                          <span>{{ bus.availableSeatsCount }} Seats</span>
                          @if (idx % 2 === 0) {
                            <span class="text-amber-700 ml-1">({{ (idx % 3) + 1 }} Single)</span>
                          }
                        }
                      </div>
                    </div>

                    <div class="text-right shrink-0">
                      <div class="text-base sm:text-lg font-bold text-slate-900 leading-tight tabular-nums">
                        ₹{{ bus.baseFare }}
                      </div>
                      <span class="text-[10px] text-slate-500 block mt-0.5 leading-tight">Onwards</span>
                    </div>
                  </div>

                  <!-- Row 3: Operator Name + GPS Bus Icon, Bus Type Subtitle & Two-Tier Rating Badge -->
                  <div class="flex items-center justify-between gap-2.5 mt-2.5">
                    <div class="min-w-0 pr-1">
                      <div class="flex items-center space-x-1.5">
                        <h3 class="text-xs sm:text-[13px] font-semibold text-slate-800 truncate leading-snug">
                          {{ bus.bus.operatorName }}
                        </h3>
                        <!-- Bus with GPS Location Pin Icon -->
                        <svg class="w-3.5 h-3.5 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="3" y="6" width="11" height="12" rx="2" />
                          <path d="M3 11h11" />
                          <path d="M5.5 18v2" />
                          <path d="M11.5 18v2" />
                          <circle cx="6" cy="15" r="0.8" fill="currentColor" />
                          <circle cx="11" cy="15" r="0.8" fill="currentColor" />
                          <path d="M18 4c-2.2 0-4 1.8-4 4 0 3 4 6.5 4 6.5s4-3.5 4-6.5c0-2.2-1.8-4-4-4z" />
                          <circle cx="18" cy="8" r="1.2" fill="currentColor" />
                        </svg>
                      </div>
                      <div class="text-[11px] text-slate-500 mt-0.5 truncate leading-tight">
                        {{ formatBusSubtitle(bus) }}
                      </div>
                    </div>

                    <!-- Two-Tier Stacked Rating Badge (Compact) -->
                    <div
                      [class.bg-[#dcfce7]]="bus.bus.rating >= 4.0"
                      [class.bg-[#fef3c7]]="bus.bus.rating >= 2.2 && bus.bus.rating < 4.0"
                      [class.bg-[#fee2e2]]="bus.bus.rating < 2.2"
                      class="rounded-lg p-[1.5px] min-w-[42px] text-center shrink-0 border border-slate-200/60">
                      <div
                        [class.bg-[#15803d]]="bus.bus.rating >= 4.0"
                        [class.bg-[#c27803]]="bus.bus.rating >= 2.2 && bus.bus.rating < 4.0"
                        [class.bg-[#dc2626]]="bus.bus.rating < 2.2"
                        class="rounded-[5px] px-1.5 py-0.5 text-white text-[10px] leading-tight flex items-center justify-center space-x-0.5 font-medium">
                        <span class="text-[9px]">★</span>
                        <span>{{ bus.bus.rating.toFixed(1) }}</span>
                      </div>
                      <div class="text-[9px] text-[#1b1b1b] py-0.5 leading-tight tabular-nums font-medium">
                        {{ bus.bus.totalReviews }}
                      </div>
                    </div>
                  </div>

                  <!-- Boarding Points Preview Row -->
                  @if (bus.boardingPoints && bus.boardingPoints.length > 0) {
                    <div class="mt-2 flex items-center justify-between gap-2 text-[11px] bg-slate-50/90 border border-slate-100 rounded-lg px-2.5 py-1">
                      <div class="flex items-center space-x-1.5 min-w-0 truncate">
                        <mat-icon class="text-xs text-rose-600 shrink-0">location_on</mat-icon>
                        <span class="text-slate-500 shrink-0">Pickup:</span>
                        <span class="text-slate-800 font-medium truncate">
                          {{ getMatchedBoardingLabel(bus.boardingPoints) }}
                        </span>
                      </div>
                      <span class="text-[10px] text-slate-400 shrink-0 tabular-nums">
                        {{ bus.boardingPoints.length }} stops
                      </span>
                    </div>
                  }

                  <!-- Row 4: Lavender Offer Banner -->
                  <div class="mt-2 bg-[#f0f3fa] rounded-lg px-2.5 py-1 text-[11px] text-slate-700 leading-snug flex items-center space-x-1.5">
                    <mat-icon class="text-xs text-indigo-600 shrink-0">local_offer</mat-icon>
                    <span class="truncate">{{ getBusOffer(idx) }}</span>
                  </div>

                </div>
              </div>
              }
            }

          </div>

        </main>
      }

      <!-- =================================================================== -->
      <!-- TAB 2: CAR RESULTS VIEW (Home Page Car Design)                      -->
      <!-- =================================================================== -->
      @if (!isHotelSearch() && !isTransportSearch() && activeTab() === 'cars') {
        <main class="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-3.5 sm:pt-5 space-y-4 relative z-10">
          
          @if (activeFilterCount() > 0) {
            <div class="flex items-center justify-end text-xs text-slate-600 px-1">
              <button
                type="button"
                (click)="resetAllFilters()"
                class="text-indigo-600 hover:underline flex items-center space-x-1 cursor-pointer font-normal text-[12px]">
                <mat-icon class="text-xs">filter_alt_off</mat-icon>
                <span>Clear {{ activeFilterCount() }} filters</span>
              </button>
            </div>
          }

          <!-- CARS LIST: Home Page Rounded-[22px] Cards -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">
            
            @if (carTrips().length === 0) {
              <div class="lg:col-span-2 bg-white rounded-[22px] p-10 text-center space-y-3 text-slate-800 result-card-shadow border border-slate-200/90">
                <div class="w-12 h-12 rounded-2xl bg-[#e0e7ff] text-[#4338ca] flex items-center justify-center mx-auto">
                  <mat-icon class="text-2xl text-[#4338ca]">directions_car</mat-icon>
                </div>
                <h3 class="text-sm font-normal text-slate-900">No cars matching this filter</h3>
                <p class="text-xs text-slate-500 max-w-sm mx-auto">Try clearing your vehicle filter to view all available cars and sawari cabs.</p>
                <button
                  type="button"
                  (click)="resetAllFilters()"
                  class="px-4 py-2 rounded-[22px] bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea] text-white text-xs font-normal cursor-pointer active:scale-95 transition-all">
                  Show All Cars
                </button>
              </div>
            }

            @for (car of carTrips(); track car.id; let idx = $index) {
              <div
                (click)="state.selectSharedCarTrip(car)"
                role="button"
                tabindex="0"
                (keydown.enter)="state.selectSharedCarTrip(car)"
                class="bg-white rounded-[22px] border border-slate-200/90 hover:border-indigo-300 result-card-shadow transition-all duration-150 overflow-hidden cursor-pointer"
                [class.border-indigo-500]="state.selectedSharedCarTrip()?.id === car.id"
                [class.ring-2]="state.selectedSharedCarTrip()?.id === car.id"
                [class.ring-indigo-500/30]="state.selectedSharedCarTrip()?.id === car.id">
                
                <div class="p-3 sm:p-3.5">
                  
                  @if (car.availableSeatsCount <= 3) {
                    <div class="flex items-center justify-end mb-1.5">
                      <span class="text-[10px] sm:text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                        Only {{ car.availableSeatsCount }} left
                      </span>
                    </div>
                  }

                  <!-- Departure — Arrival Time & Fare -->
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="flex items-center text-sm sm:text-base font-semibold text-slate-900 leading-tight tracking-tight">
                        <span>{{ car.departureTime }}</span>
                        <span class="inline-block w-2.5 h-[1.5px] bg-slate-300 mx-1.5"></span>
                        <span class="text-slate-700">{{ car.arrivalTime }}</span>
                      </div>
                      <div class="text-[11px] text-slate-500 mt-0.5 leading-tight">
                        <span>{{ car.duration }}</span>
                        <span class="mx-1 text-slate-300">•</span>
                        @if (car.availableSeatsCount <= 4) {
                          <span class="text-amber-700 font-medium">{{ car.availableSeatsCount }} Seats</span>
                        } @else {
                          <span>{{ car.availableSeatsCount }} Seats</span>
                          <span class="text-amber-700 ml-1">(1 Front)</span>
                        }
                      </div>
                    </div>

                    <div class="text-right shrink-0">
                      <div class="text-base sm:text-lg font-bold text-slate-900 leading-tight tabular-nums">
                        ₹{{ car.baseFare }}
                      </div>
                      <span class="text-[10px] text-slate-500 block mt-0.5 leading-tight">Onwards</span>
                    </div>
                  </div>

                  <!-- Row 3: Operator Name + GPS Icon, Car Subtitle & Two-Tier Rating Badge -->
                  <div class="flex items-center justify-between gap-2.5 mt-2.5">
                    <div class="min-w-0 pr-1">
                      <div class="flex items-center space-x-1.5">
                        <h3 class="text-xs sm:text-[13px] font-semibold text-slate-800 truncate leading-snug">
                          {{ car.operatorName }}
                        </h3>
                        <!-- Vehicle with GPS Pin Icon -->
                        <svg class="w-3.5 h-3.5 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="3" y="6" width="11" height="12" rx="2" />
                          <path d="M3 11h11" />
                          <path d="M5.5 18v2" />
                          <path d="M11.5 18v2" />
                          <circle cx="6" cy="15" r="0.8" fill="currentColor" />
                          <circle cx="11" cy="15" r="0.8" fill="currentColor" />
                          <path d="M18 4c-2.2 0-4 1.8-4 4 0 3 4 6.5 4 6.5s4-3.5 4-6.5c0-2.2-1.8-4-4-4z" />
                          <circle cx="18" cy="8" r="1.2" fill="currentColor" />
                        </svg>
                      </div>
                      <div class="text-[11px] text-slate-500 mt-0.5 truncate leading-tight">
                        {{ car.hasAc ? 'AC' : 'Non AC' }} {{ car.vehicleName }} ({{ car.totalSeats }} Seater)
                      </div>
                    </div>

                    <!-- Two-Tier Stacked Rating Badge (Compact) -->
                    <div
                      [class.bg-[#dcfce7]]="car.rating >= 4.0"
                      [class.bg-[#fef3c7]]="car.rating >= 2.2 && car.rating < 4.0"
                      [class.bg-[#fee2e2]]="car.rating < 2.2"
                      class="rounded-lg p-[1.5px] min-w-[42px] text-center shrink-0 border border-slate-200/60">
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

                  <!-- Boarding Points Preview Row -->
                  @if (car.boardingPoints && car.boardingPoints.length > 0) {
                    <div class="mt-2 flex items-center justify-between gap-2 text-[11px] bg-slate-50/90 border border-slate-100 rounded-lg px-2.5 py-1">
                      <div class="flex items-center space-x-1.5 min-w-0 truncate">
                        <mat-icon class="text-xs text-indigo-600 shrink-0">location_on</mat-icon>
                        <span class="text-slate-500 shrink-0">Pickup:</span>
                        <span class="text-slate-800 font-medium truncate">
                          {{ getMatchedBoardingLabel(car.boardingPoints) }}
                        </span>
                      </div>
                      <span class="text-[10px] text-slate-400 shrink-0 tabular-nums">
                        {{ car.boardingPoints.length }} stops
                      </span>
                    </div>
                  }

                  <!-- Row 4: Lavender Offer Banner -->
                  <div class="mt-2 bg-[#f0f3fa] rounded-lg px-2.5 py-1 text-[11px] text-slate-700 leading-snug flex items-center space-x-1.5">
                    <mat-icon class="text-xs text-indigo-600 shrink-0">local_offer</mat-icon>
                    <span class="truncate">{{ getCarOffer(idx) }}</span>
                  </div>

                </div>
              </div>
            }

          </div>

        </main>
      }

      <!-- =================================================================== -->
      <!-- INDEPENDENT TRANSPORT FLOW: EXPRESS TRANSIT & CARGO VEHICLES        -->
      <!-- =================================================================== -->
      @if (isTransportSearch() || (!isHotelSearch() && activeTab() === 'transport')) {
        <main class="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-3.5 sm:pt-5 space-y-4 relative z-10">

          <!-- Transport Dedicated Banner -->
          <div class="bg-white border border-slate-200/90 text-slate-800 rounded-[22px] result-card-shadow p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center space-x-3">
              <div class="w-11 h-11 rounded-2xl bg-[#fae8ff] text-[#a21caf] flex items-center justify-center font-normal shrink-0">
                <mat-icon class="text-lg text-[#a21caf]">local_shipping</mat-icon>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h2 class="text-sm sm:text-base font-normal text-slate-900">
                    Express Transport: {{ state.sourceCity().name }} &rarr; {{ state.destinationCity().name }}
                  </h2>
                  <span class="px-2 py-0.5 bg-gradient-to-r from-[#7e22ce] via-[#a21caf] to-[#db2777] text-white text-[10px] font-normal rounded-full">
                    Cargo + Seats
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 font-normal mt-0.5">
                  Intercity utility cruisers, heavy luggage vans &amp; express passenger-cargo vehicles
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-1.5 self-start sm:self-auto">
              <span class="text-xs font-normal text-[#a21caf] flex items-center space-x-0.5 bg-[#fae8ff]/70 border border-fuchsia-200 px-2.5 py-1 rounded-xl">
                <mat-icon class="text-xs text-[#a21caf]">verified</mat-icon>
                <span>Door-to-Hub</span>
              </span>
            </div>
          </div>

          @if (activeFilterCount() > 0) {
            <div class="flex items-center justify-between text-xs text-slate-600 px-1">
              <div class="flex items-center space-x-1.5 truncate">
                @if (boardingPointFilter() !== 'all') {
                  <span class="text-[11px] text-slate-600 truncate">
                    Showing transport boarding at <strong class="text-slate-900">{{ boardingPointFilter() }}</strong>
                  </span>
                }
              </div>
              <button
                type="button"
                (click)="resetAllFilters()"
                class="text-[#a21caf] hover:underline flex items-center space-x-1 cursor-pointer font-normal text-[12px] shrink-0">
                <mat-icon class="text-xs">filter_alt_off</mat-icon>
                <span>Clear {{ activeFilterCount() }} filters</span>
              </button>
            </div>
          }

          <!-- TRANSPORT LIST: Home Page Rounded-[22px] Cards -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-4">

            @if (transportTrips().length === 0) {
              <div class="lg:col-span-2 bg-white rounded-[22px] p-10 text-center space-y-3 text-slate-800 result-card-shadow border border-slate-200/90">
                <div class="w-12 h-12 rounded-2xl bg-[#fae8ff] text-[#a21caf] flex items-center justify-center mx-auto">
                  <mat-icon class="text-2xl text-[#a21caf]">local_shipping</mat-icon>
                </div>
                <h3 class="text-sm font-normal text-slate-900">No transport vehicles matching this filter</h3>
                <p class="text-xs text-slate-500 max-w-sm mx-auto">Try clearing your filter to view all available transport vehicles and cruisers.</p>
                <button
                  type="button"
                  (click)="resetAllFilters()"
                  class="px-4 py-2 rounded-[22px] bg-gradient-to-r from-[#7e22ce] via-[#a21caf] to-[#db2777] text-white text-xs font-normal cursor-pointer active:scale-95 transition-all">
                  Show All Transport
                </button>
              </div>
            }

            @for (transport of transportTrips(); track transport.id; let idx = $index) {
              <div
                (click)="state.selectTransportTrip(transport)"
                role="button"
                tabindex="0"
                (keydown.enter)="state.selectTransportTrip(transport)"
                class="bg-white rounded-[22px] border border-slate-200/90 hover:border-fuchsia-300 result-card-shadow transition-all duration-150 overflow-hidden cursor-pointer"
                [class.border-fuchsia-500]="state.selectedTransportTrip()?.id === transport.id"
                [class.ring-2]="state.selectedTransportTrip()?.id === transport.id"
                [class.ring-fuchsia-500/30]="state.selectedTransportTrip()?.id === transport.id">

                <div class="p-3 sm:p-3.5">

                  @if (transport.availableSeatsCount <= 3) {
                    <div class="flex items-center justify-end mb-1.5">
                      <span class="text-[10px] sm:text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                        Only {{ transport.availableSeatsCount }} left
                      </span>
                    </div>
                  }

                  <!-- Departure — Arrival Time & Fare -->
                  <div class="flex items-start justify-between">
                    <div>
                      <div class="flex items-center text-sm sm:text-base font-semibold text-slate-900 leading-tight tracking-tight">
                        <span>{{ transport.departureTime }}</span>
                        <span class="inline-block w-2.5 h-[1.5px] bg-slate-300 mx-1.5"></span>
                        <span class="text-slate-700">{{ transport.arrivalTime }}</span>
                      </div>
                      <div class="text-[11px] text-slate-500 mt-0.5 leading-tight">
                        <span>{{ transport.duration }}</span>
                        <span class="mx-1 text-slate-300">•</span>
                        <span>{{ transport.availableSeatsCount }} Seats Available</span>
                        <span class="text-fuchsia-700 ml-1 font-medium">(1 Front + Cargo)</span>
                      </div>
                    </div>

                    <div class="text-right shrink-0">
                      <div class="text-base sm:text-lg font-bold text-slate-900 leading-tight tabular-nums">
                        ₹{{ transport.baseFare }}
                      </div>
                      <span class="text-[10px] text-slate-500 block mt-0.5 leading-tight">Onwards</span>
                    </div>
                  </div>

                  <!-- Row 3: Operator Name + Transport Icon, Vehicle Subtitle & Two-Tier Rating Badge -->
                  <div class="flex items-center justify-between gap-2.5 mt-2.5">
                    <div class="min-w-0 pr-1">
                      <div class="flex items-center space-x-1.5">
                        <h3 class="text-xs sm:text-[13px] font-semibold text-slate-800 truncate leading-snug">
                          {{ transport.operatorName }}
                        </h3>
                        <mat-icon class="text-[15px] text-fuchsia-600 shrink-0 leading-none">local_shipping</mat-icon>
                      </div>
                      <div class="text-[11px] text-slate-500 mt-0.5 truncate leading-tight">
                        {{ transport.hasAc ? 'AC' : 'Non AC' }} {{ transport.vehicleName }} ({{ transport.totalSeats }} Seater)
                      </div>
                    </div>

                    <!-- Two-Tier Stacked Rating Badge (Compact) -->
                    <div
                      [class.bg-[#dcfce7]]="transport.rating >= 4.0"
                      [class.bg-[#fef3c7]]="transport.rating >= 2.2 && transport.rating < 4.0"
                      [class.bg-[#fee2e2]]="transport.rating < 2.2"
                      class="rounded-lg p-[1.5px] min-w-[42px] text-center shrink-0 border border-slate-200/60">
                      <div
                        [class.bg-[#15803d]]="transport.rating >= 4.0"
                        [class.bg-[#c27803]]="transport.rating >= 2.2 && transport.rating < 4.0"
                        [class.bg-[#dc2626]]="transport.rating < 2.2"
                        class="rounded-[5px] px-1.5 py-0.5 text-white text-[10px] leading-tight flex items-center justify-center space-x-0.5 font-medium">
                        <span class="text-[9px]">★</span>
                        <span>{{ transport.rating.toFixed(1) }}</span>
                      </div>
                      <div class="text-[9px] text-[#1b1b1b] py-0.5 leading-tight tabular-nums font-medium">
                        {{ transport.totalReviews }}
                      </div>
                    </div>
                  </div>

                  <!-- Boarding Points Preview Row -->
                  @if (transport.boardingPoints && transport.boardingPoints.length > 0) {
                    <div class="mt-2 flex items-center justify-between gap-2 text-[11px] bg-slate-50/90 border border-slate-100 rounded-lg px-2.5 py-1">
                      <div class="flex items-center space-x-1.5 min-w-0 truncate">
                        <mat-icon class="text-xs text-[#a21caf] shrink-0">location_on</mat-icon>
                        <span class="text-slate-500 shrink-0">Pickup:</span>
                        <span class="text-slate-800 font-medium truncate">
                          {{ getMatchedBoardingLabel(transport.boardingPoints) }}
                        </span>
                      </div>
                      <span class="text-[10px] text-slate-400 shrink-0 tabular-nums">
                        {{ transport.boardingPoints.length }} stops
                      </span>
                    </div>
                  }

                  <!-- Row 4: Fuchsia Offer Banner & Select Seats CTA -->
                  <div class="mt-2.5 flex items-center justify-between gap-2">
                    <div class="bg-fuchsia-50/80 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 leading-snug flex items-center space-x-1.5 min-w-0 flex-1">
                      <mat-icon class="text-xs text-[#a21caf] shrink-0">local_offer</mat-icon>
                      <span class="truncate">{{ transport.offerTag ? transport.offerTag + ' · ' : '' }}{{ getCarOffer(idx) }}</span>
                    </div>
                    <span class="px-3 py-1 rounded-full bg-gradient-to-r from-[#7e22ce] via-[#a21caf] to-[#db2777] text-white text-[11px] font-bold shrink-0 flex items-center space-x-1">
                      <span>Select Seats</span>
                      <mat-icon class="text-[13px] leading-none">arrow_forward</mat-icon>
                    </span>
                  </div>

                </div>
              </div>
            }

          </div>

        </main>
      }

      <!-- =================================================================== -->
      <!-- TAB 3: DESTINATION HOTELS & TRANSIT STAYS (Home Page Hotel Design)  -->
      <!-- =================================================================== -->
      @if (isHotelSearch() || activeTab() === 'hotels') {
        <main class="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-3.5 sm:pt-5 space-y-4 relative z-10">
          
          <!-- Banner -->
          <div class="bg-white border border-slate-200/90 text-slate-800 rounded-[22px] result-card-shadow p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center space-x-3">
              <div class="w-11 h-11 rounded-2xl bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center font-normal shrink-0">
                <mat-icon class="text-lg text-[#0284c7]">hotel</mat-icon>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h2 class="text-sm sm:text-base font-normal text-slate-900">
                    Hotels in {{ state.destinationCity().name }}
                  </h2>
                  <span class="px-2 py-0.5 bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] text-white text-[10px] font-normal rounded-full">
                    Upto 70% Off
                  </span>
                </div>
                <p class="text-[11px] text-slate-500 font-normal mt-0.5">
                  Verified transit hotels near central stands with 2-hour free cancellation
                </p>
              </div>
            </div>

            <div class="flex items-center space-x-1.5 self-start sm:self-auto">
              <span class="text-xs font-normal text-[#0284c7] flex items-center space-x-0.5 bg-[#e0f2fe]/70 border border-sky-200 px-2.5 py-1 rounded-xl">
                <mat-icon class="text-xs text-[#0284c7]">verified</mat-icon>
                <span>Free Cancellation</span>
              </span>
            </div>
          </div>

          <!-- Proximity Location Match Banner from Google Maps -->
          @if (state.hotelUserLocation(); as loc) {
            <div class="px-4 py-2.5 rounded-2xl bg-sky-50 text-sky-900 border border-sky-200/80 flex items-center justify-between text-xs shadow-2xs">
              <div class="flex items-center space-x-2 truncate">
                <mat-icon class="text-sky-700 text-sm shrink-0">my_location</mat-icon>
                <span class="truncate">
                  Sorted by closest to nearest Google Maps location: <strong class="font-bold">{{ loc.areaName }} ({{ loc.cityName }})</strong>
                </span>
              </div>
              <span class="px-2 py-0.5 rounded-full bg-sky-200/80 text-sky-900 text-[10px] font-bold shrink-0 ml-2">
                CLOSEST FIRST
              </span>
            </div>
          }

          <!-- Quick Hotel Filter Chips -->
          <div class="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none text-xs font-normal">
            <button
              type="button"
              (click)="setHotelFilter('all')"
              [class.bg-gradient-to-r]="hotelFilter() === 'all'"
              [class.from-[#0284c7]]="hotelFilter() === 'all'"
              [class.via-[#0ea5e9]]="hotelFilter() === 'all'"
              [class.to-[#38bdf8]]="hotelFilter() === 'all'"
              [class.text-white]="hotelFilter() === 'all'"
              [class.border-sky-500]="hotelFilter() === 'all'"
              [class.bg-white]="hotelFilter() !== 'all'"
              [class.text-slate-700]="hotelFilter() !== 'all'"
              [class.border-slate-200/90]="hotelFilter() !== 'all'"
              class="px-3.5 py-1.5 rounded-[22px] border cursor-pointer shrink-0 transition-all active:scale-95">
              All Hotels ({{ state.destinationHotels().length }})
            </button>
            <button
              type="button"
              (click)="setHotelFilter('rated')"
              [class.bg-gradient-to-r]="hotelFilter() === 'rated'"
              [class.from-[#0284c7]]="hotelFilter() === 'rated'"
              [class.via-[#0ea5e9]]="hotelFilter() === 'rated'"
              [class.to-[#38bdf8]]="hotelFilter() === 'rated'"
              [class.text-white]="hotelFilter() === 'rated'"
              [class.border-sky-500]="hotelFilter() === 'rated'"
              [class.bg-white]="hotelFilter() !== 'rated'"
              [class.text-slate-700]="hotelFilter() !== 'rated'"
              [class.border-slate-200/90]="hotelFilter() !== 'rated'"
              class="px-3.5 py-1.5 rounded-[22px] border cursor-pointer shrink-0 transition-all active:scale-95 flex items-center space-x-1">
              <mat-icon class="text-xs text-amber-500">star</mat-icon>
              <span>Top Rated (4.8+ ★)</span>
            </button>
            <button
              type="button"
              (click)="setHotelFilter('budget')"
              [class.bg-gradient-to-r]="hotelFilter() === 'budget'"
              [class.from-[#0284c7]]="hotelFilter() === 'budget'"
              [class.via-[#0ea5e9]]="hotelFilter() === 'budget'"
              [class.to-[#38bdf8]]="hotelFilter() === 'budget'"
              [class.text-white]="hotelFilter() === 'budget'"
              [class.border-sky-500]="hotelFilter() === 'budget'"
              [class.bg-white]="hotelFilter() !== 'budget'"
              [class.text-slate-700]="hotelFilter() !== 'budget'"
              [class.border-slate-200/90]="hotelFilter() !== 'budget'"
              class="px-3.5 py-1.5 rounded-[22px] border cursor-pointer shrink-0 transition-all active:scale-95">
              Under ₹1,200
            </button>
            <button
              type="button"
              (click)="setHotelFilter('near')"
              [class.bg-gradient-to-r]="hotelFilter() === 'near'"
              [class.from-[#0284c7]]="hotelFilter() === 'near'"
              [class.via-[#0ea5e9]]="hotelFilter() === 'near'"
              [class.to-[#38bdf8]]="hotelFilter() === 'near'"
              [class.text-white]="hotelFilter() === 'near'"
              [class.border-sky-500]="hotelFilter() === 'near'"
              [class.bg-white]="hotelFilter() !== 'near'"
              [class.text-slate-700]="hotelFilter() !== 'near'"
              [class.border-slate-200/90]="hotelFilter() !== 'near'"
              class="px-3.5 py-1.5 rounded-[22px] border cursor-pointer shrink-0 transition-all active:scale-95 flex items-center space-x-1">
              <mat-icon class="text-xs">near_me</mat-icon>
              <span>Near Terminal (&lt; 500m)</span>
            </button>
          </div>

          <!-- Hotel Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            @for (hotel of filteredHotels(); track hotel.id) {
              <div class="bg-white rounded-[22px] border border-slate-200/90 result-card-shadow overflow-hidden flex flex-col justify-between text-slate-800 hover:border-sky-300 transition-all">
                <div class="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    [src]="hotel.imageUrl"
                    [alt]="hotel.name"
                    class="w-full h-full object-cover"
                    referrerpolicy="no-referrer" />
                  <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  <span class="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] text-white font-normal text-[10px]">
                    {{ hotel.tag }}
                  </span>

                  <div class="absolute bottom-2.5 left-3 right-3 text-white">
                    <h3 class="text-sm sm:text-base font-normal truncate leading-tight">{{ hotel.name }}</h3>
                    <p class="text-[11px] text-slate-200 truncate mt-0.5">{{ hotel.location }} · {{ hotel.terminalDistance }}</p>
                  </div>
                </div>

                <div class="p-3.5 flex items-center justify-between gap-2 border-t border-slate-100">
                  <div>
                    <div class="flex items-baseline space-x-1.5">
                      <span class="text-sm sm:text-base font-normal text-slate-900 tabular-nums">₹{{ hotel.discountedPrice }}</span>
                      <span class="text-[11px] text-slate-400 line-through tabular-nums">₹{{ hotel.originalPrice }}</span>
                    </div>
                    <span class="text-[10px] text-slate-500 font-normal">Per Room / Night</span>
                  </div>

                  <button
                    type="button"
                    (click)="openHotelModal(hotel)"
                    class="px-4 py-2 rounded-[22px] bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] text-white font-normal text-xs cursor-pointer active:scale-95 transition-all">
                    Reserve Stay
                  </button>
                </div>
              </div>
            }
          </div>

        </main>
      }

      <!-- Booking Modal for Hotels (Home Page Pastel Header + Hotel Sky-Ocean-Blue Design) -->
      @if (isHotelModalOpen() && selectedHotel(); as hotel) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div class="bg-white rounded-[30px] max-w-sm sm:max-w-md w-full overflow-hidden text-slate-800 animate-slide-up border border-slate-200/90 result-card-shadow">
            
            <!-- Pastel Peach-Pink-Lavender Modal Header -->
            <div class="p-5 bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] border-b border-white/80 relative overflow-hidden">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)] pointer-events-none"></div>
              <div class="relative z-10 flex items-center justify-between gap-3">
                <div class="flex items-center space-x-3 min-w-0">
                  <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <mat-icon class="text-lg text-white">hotel</mat-icon>
                  </div>
                  <div class="min-w-0">
                    <h3 class="text-base font-normal text-slate-900 truncate">{{ hotel.name }}</h3>
                    <span class="text-xs text-slate-600 block truncate">{{ hotel.terminalDistance }} from bus stop</span>
                  </div>
                </div>
                <button
                  type="button"
                  (click)="isHotelModalOpen.set(false)"
                  class="w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-slate-200/80 text-slate-600 flex items-center justify-center cursor-pointer transition-colors shrink-0">
                  <mat-icon class="text-sm">close</mat-icon>
                </button>
              </div>
            </div>

            <div class="p-5 space-y-4">
              <div class="space-y-2.5 text-xs">
                <label for="hotel-guest-name-input" class="block font-normal text-slate-700">Guest Name</label>
                <input
                  id="hotel-guest-name-input"
                  type="text"
                  [value]="hotelGuestName()"
                  (input)="onGuestNameChange($event)"
                  class="w-full px-3.5 py-2.5 rounded-[22px] bg-[#fcfcfd] border border-slate-200/90 text-slate-900 font-normal focus:outline-none focus:border-sky-500" />
                
                <label for="hotel-guest-phone-input" class="block font-normal text-slate-700 pt-1">Phone Number</label>
                <input
                  id="hotel-guest-phone-input"
                  type="tel"
                  [value]="hotelGuestPhone()"
                  (input)="onGuestPhoneChange($event)"
                  class="w-full px-3.5 py-2.5 rounded-[22px] bg-[#fcfcfd] border border-slate-200/90 text-slate-900 font-normal focus:outline-none focus:border-sky-500" />
              </div>

              <div class="pt-3 flex items-center justify-between border-t border-slate-100">
                <div>
                  <span class="text-[10px] text-slate-400 uppercase font-normal block">Total Amount</span>
                  <span class="text-base font-normal text-[#0284c7]">₹{{ hotel.discountedPrice }}</span>
                </div>
                <button
                  type="button"
                  (click)="confirmHotelBooking()"
                  class="px-5 py-2.5 rounded-[22px] bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] text-white font-normal text-xs cursor-pointer active:scale-95 transition-all">
                  Confirm Reservation
                </button>
              </div>
            </div>
          </div>
        </div>
      }


      <!-- Theme-Matched Sticky Footer Filter & Sort Bar (Bus: Rose, Car: Indigo, Transport: Fuchsia) -->
      @if (!isHotelSearch()) {
        <footer
          [class.border-rose-200/80]="activeTab() === 'buses'"
          [class.border-indigo-200/80]="activeTab() === 'cars'"
          [class.border-fuchsia-200/80]="isTransportSearch() || activeTab() === 'transport'"
          class="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t transition-colors">
          <div class="max-w-6xl mx-auto px-2 sm:px-6 flex items-stretch justify-between">
            
            <!-- Horizontally scrollable quick filter chips -->
            <div class="flex-1 flex items-center space-x-2 sm:space-x-2.5 overflow-x-auto py-2.5 px-3 scrollbar-none">
              @if (activeTab() === 'buses' && !isTransportSearch()) {
                
                <!-- Chip 1: AC (Bus Theme - Rose) -->
                <button
                  type="button"
                  (click)="toggleBusFilter('ac')"
                  [class.bg-rose-600]="busFilter() === 'ac'"
                  [class.text-white]="busFilter() === 'ac'"
                  [class.border-rose-600]="busFilter() === 'ac'"
                  [class.bg-rose-50/70]="busFilter() !== 'ac'"
                  [class.text-slate-700]="busFilter() !== 'ac'"
                  [class.border-rose-200/70]="busFilter() !== 'ac'"
                  class="rounded-xl px-3.5 py-1.5 border flex flex-col items-center justify-center shrink-0 min-w-[68px] sm:min-w-[74px] transition-all cursor-pointer active:scale-95 group hover:border-rose-300">
                  <mat-icon [class.text-white]="busFilter() === 'ac'" [class.text-rose-600]="busFilter() !== 'ac'" class="text-lg">ac_unit</mat-icon>
                  <span class="text-[11px] font-normal leading-tight mt-1">AC</span>
                </button>

                <!-- Chip 2: Sleeper (Bus Theme - Rose) -->
                <button
                  type="button"
                  (click)="toggleBusFilter('sleeper')"
                  [class.bg-rose-600]="busFilter() === 'sleeper'"
                  [class.text-white]="busFilter() === 'sleeper'"
                  [class.border-rose-600]="busFilter() === 'sleeper'"
                  [class.bg-rose-50/70]="busFilter() !== 'sleeper'"
                  [class.text-slate-700]="busFilter() !== 'sleeper'"
                  [class.border-rose-200/70]="busFilter() !== 'sleeper'"
                  class="rounded-xl px-3.5 py-1.5 border flex flex-col items-center justify-center shrink-0 min-w-[68px] sm:min-w-[74px] transition-all cursor-pointer active:scale-95 group hover:border-rose-300">
                  <mat-icon [class.text-white]="busFilter() === 'sleeper'" [class.text-rose-600]="busFilter() !== 'sleeper'" class="text-lg">single_bed</mat-icon>
                  <span class="text-[11px] font-normal leading-tight mt-1">Sleeper</span>
                </button>

                <!-- Chip 3: Offers (Bus Theme - Rose) -->
                <button
                  type="button"
                  (click)="toggleBusOffers()"
                  [class.bg-rose-600]="busOnlyOffers()"
                  [class.text-white]="busOnlyOffers()"
                  [class.border-rose-600]="busOnlyOffers()"
                  [class.bg-rose-50/70]="!busOnlyOffers()"
                  [class.text-slate-700]="!busOnlyOffers()"
                  [class.border-rose-200/70]="!busOnlyOffers()"
                  class="rounded-xl px-3.5 py-1.5 border flex flex-col items-center justify-center shrink-0 min-w-[68px] sm:min-w-[74px] transition-all cursor-pointer active:scale-95 group hover:border-rose-300">
                  <mat-icon [class.text-white]="busOnlyOffers()" [class.text-rose-600]="!busOnlyOffers()" class="text-lg">local_fire_department</mat-icon>
                  <span class="text-[11px] font-normal leading-tight mt-1">Offers</span>
                </button>

                <!-- Chip 4: New Buses (Bus Theme - Rose) -->
                <button
                  type="button"
                  (click)="toggleBusNewBuses()"
                  [class.bg-rose-600]="busOnlyNewBuses()"
                  [class.text-white]="busOnlyNewBuses()"
                  [class.border-rose-600]="busOnlyNewBuses()"
                  [class.bg-rose-50/70]="!busOnlyNewBuses()"
                  [class.text-slate-700]="!busOnlyNewBuses()"
                  [class.border-rose-200/70]="!busOnlyNewBuses()"
                  class="rounded-xl px-3.5 py-1.5 border flex flex-col items-center justify-center shrink-0 min-w-[68px] sm:min-w-[74px] transition-all cursor-pointer active:scale-95 group hover:border-rose-300">
                  <mat-icon [class.text-white]="busOnlyNewBuses()" [class.text-rose-600]="!busOnlyNewBuses()" class="text-lg">directions_bus</mat-icon>
                  <span class="text-[11px] font-normal leading-tight mt-1">New Buses</span>
                </button>

                <!-- Chip 5: Seater (Bus Theme - Rose) -->
                <button
                  type="button"
                  (click)="toggleBusFilter('seater')"
                  [class.bg-rose-600]="busFilter() === 'seater'"
                  [class.text-white]="busFilter() === 'seater'"
                  [class.border-rose-600]="busFilter() === 'seater'"
                  [class.bg-rose-50/70]="busFilter() !== 'seater'"
                  [class.text-slate-700]="busFilter() !== 'seater'"
                  [class.border-rose-200/70]="busFilter() !== 'seater'"
                  class="rounded-xl px-3.5 py-1.5 border flex flex-col items-center justify-center shrink-0 min-w-[68px] sm:min-w-[74px] transition-all cursor-pointer active:scale-95 group hover:border-rose-300">
                  <mat-icon [class.text-white]="busFilter() === 'seater'" [class.text-rose-600]="busFilter() !== 'seater'" class="text-lg">event_seat</mat-icon>
                  <span class="text-[11px] font-normal leading-tight mt-1">Seater</span>
                </button>

                <!-- Chip 6: Top Rated (Bus Theme - Rose) -->
                <button
                  type="button"
                  (click)="toggleBusTopRated()"
                  [class.bg-rose-600]="busOnlyTopRated()"
                  [class.text-white]="busOnlyTopRated()"
                  [class.border-rose-600]="busOnlyTopRated()"
                  [class.bg-rose-50/70]="!busOnlyTopRated()"
                  [class.text-slate-700]="!busOnlyTopRated()"
                  [class.border-rose-200/70]="!busOnlyTopRated()"
                  class="rounded-xl px-3.5 py-1.5 border flex flex-col items-center justify-center shrink-0 min-w-[68px] sm:min-w-[74px] transition-all cursor-pointer active:scale-95 group hover:border-rose-300">
                  <mat-icon [class.text-white]="busOnlyTopRated()" [class.text-rose-600]="!busOnlyTopRated()" class="text-lg">star</mat-icon>
                  <span class="text-[11px] font-normal leading-tight mt-1">Top Rated</span>
                </button>

              } @else if (isTransportSearch() || activeTab() === 'transport') {
                <!-- TRANSPORT Quick Filter Chips (Transport Theme - Fuchsia) -->
                <button
                  type="button"
                  (click)="setTransportFilter(transportFilter() === 'ac' ? 'all' : 'ac')"
                  [class.bg-[#a21caf]]="transportFilter() === 'ac'"
                  [class.text-white]="transportFilter() === 'ac'"
                  [class.border-[#a21caf]]="transportFilter() === 'ac'"
                  [class.bg-fuchsia-50/70]="transportFilter() !== 'ac'"
                  [class.text-slate-700]="transportFilter() !== 'ac'"
                  [class.border-fuchsia-200/70]="transportFilter() !== 'ac'"
                  class="rounded-xl px-3.5 py-1.5 border flex flex-col items-center justify-center shrink-0 min-w-[68px] sm:min-w-[74px] transition-all cursor-pointer active:scale-95 group hover:border-fuchsia-300">
                  <mat-icon [class.text-white]="transportFilter() === 'ac'" [class.text-[#a21caf]]="transportFilter() !== 'ac'" class="text-lg">ac_unit</mat-icon>
                  <span class="text-[11px] font-normal leading-tight mt-1">AC Cruiser</span>
                </button>

                <button
                  type="button"
                  (click)="setTransportFilter(transportFilter() === 'cargo' ? 'all' : 'cargo')"
                  [class.bg-[#a21caf]]="transportFilter() === 'cargo'"
                  [class.text-white]="transportFilter() === 'cargo'"
                  [class.border-[#a21caf]]="transportFilter() === 'cargo'"
                  [class.bg-fuchsia-50/70]="transportFilter() !== 'cargo'"
                  [class.text-slate-700]="transportFilter() !== 'cargo'"
                  [class.border-fuchsia-200/70]="transportFilter() !== 'cargo'"
                  class="rounded-xl px-3.5 py-1.5 border flex flex-col items-center justify-center shrink-0 min-w-[68px] sm:min-w-[74px] transition-all cursor-pointer active:scale-95 group hover:border-fuchsia-300">
                  <mat-icon [class.text-white]="transportFilter() === 'cargo'" [class.text-[#a21caf]]="transportFilter() !== 'cargo'" class="text-lg">inventory_2</mat-icon>
                  <span class="text-[11px] font-normal leading-tight mt-1">Cargo Carrier</span>
                </button>

                <button
                  type="button"
                  (click)="setTransportFilter(transportFilter() === 'rated' ? 'all' : 'rated')"
                  [class.bg-[#a21caf]]="transportFilter() === 'rated'"
                  [class.text-white]="transportFilter() === 'rated'"
                  [class.border-[#a21caf]]="transportFilter() === 'rated'"
                  [class.bg-fuchsia-50/70]="transportFilter() !== 'rated'"
                  [class.text-slate-700]="transportFilter() !== 'rated'"
                  [class.border-fuchsia-200/70]="transportFilter() !== 'rated'"
                  class="rounded-xl px-3.5 py-1.5 border flex flex-col items-center justify-center shrink-0 min-w-[68px] sm:min-w-[74px] transition-all cursor-pointer active:scale-95 group hover:border-fuchsia-300">
                  <mat-icon [class.text-white]="transportFilter() === 'rated'" [class.text-[#a21caf]]="transportFilter() !== 'rated'" class="text-lg">star</mat-icon>
                  <span class="text-[11px] font-normal leading-tight mt-1">Top Rated</span>
                </button>
              } @else {
                <!-- CARS Quick Filter Chips (Car Theme - Indigo) -->
                <!-- Chip 1: AC -->
                <button
                  type="button"
                  (click)="toggleCarAc()"
                  [class.bg-indigo-600]="carAcFilter() === 'ac'"
                  [class.text-white]="carAcFilter() === 'ac'"
                  [class.border-indigo-600]="carAcFilter() === 'ac'"
                  [class.bg-indigo-50/70]="carAcFilter() !== 'ac'"
                  [class.text-slate-700]="carAcFilter() !== 'ac'"
                  [class.border-indigo-200/70]="carAcFilter() !== 'ac'"
                  class="rounded-xl px-3.5 py-1.5 border flex flex-col items-center justify-center shrink-0 min-w-[68px] sm:min-w-[74px] transition-all cursor-pointer active:scale-95 group hover:border-indigo-300">
                  <mat-icon [class.text-white]="carAcFilter() === 'ac'" [class.text-indigo-600]="carAcFilter() !== 'ac'" class="text-lg">ac_unit</mat-icon>
                  <span class="text-[11px] font-normal leading-tight mt-1">AC</span>
                </button>

                <!-- Chip 2: Captain Seats -->
                <button
                  type="button"
                  (click)="toggleCarCaptainSeats()"
                  [class.bg-indigo-600]="carCaptainSeats()"
                  [class.text-white]="carCaptainSeats()"
                  [class.border-indigo-600]="carCaptainSeats()"
                  [class.bg-indigo-50/70]="!carCaptainSeats()"
                  [class.text-slate-700]="!carCaptainSeats()"
                  [class.border-indigo-200/70]="!carCaptainSeats()"
                  class="rounded-xl px-3.5 py-1.5 border flex flex-col items-center justify-center shrink-0 min-w-[68px] sm:min-w-[74px] transition-all cursor-pointer active:scale-95 group hover:border-indigo-300">
                  <mat-icon [class.text-white]="carCaptainSeats()" [class.text-indigo-600]="!carCaptainSeats()" class="text-lg">airline_seat_recline_normal</mat-icon>
                  <span class="text-[11px] font-normal leading-tight mt-1">Captain Seat</span>
                </button>

                <!-- Chip 3: Offers -->
                <button
                  type="button"
                  (click)="toggleCarOffers()"
                  [class.bg-indigo-600]="carOnlyOffers()"
                  [class.text-white]="carOnlyOffers()"
                  [class.border-indigo-600]="carOnlyOffers()"
                  [class.bg-indigo-50/70]="!carOnlyOffers()"
                  [class.text-slate-700]="!carOnlyOffers()"
                  [class.border-indigo-200/70]="!carOnlyOffers()"
                  class="rounded-xl px-3.5 py-1.5 border flex flex-col items-center justify-center shrink-0 min-w-[68px] sm:min-w-[74px] transition-all cursor-pointer active:scale-95 group hover:border-indigo-300">
                  <mat-icon [class.text-white]="carOnlyOffers()" [class.text-indigo-600]="!carOnlyOffers()" class="text-lg">local_fire_department</mat-icon>
                  <span class="text-[11px] font-normal leading-tight mt-1">Offers</span>
                </button>

                <!-- Chip 4: SUV / 7-Seater -->
                <button
                  type="button"
                  (click)="toggleCarSuv()"
                  [class.bg-indigo-600]="carModelFilter() === 'scorpio'"
                  [class.text-white]="carModelFilter() === 'scorpio'"
                  [class.border-indigo-600]="carModelFilter() === 'scorpio'"
                  [class.bg-indigo-50/70]="carModelFilter() !== 'scorpio'"
                  [class.text-slate-700]="carModelFilter() !== 'scorpio'"
                  [class.border-indigo-200/70]="carModelFilter() !== 'scorpio'"
                  class="rounded-xl px-3.5 py-1.5 border flex flex-col items-center justify-center shrink-0 min-w-[68px] sm:min-w-[74px] transition-all cursor-pointer active:scale-95 group hover:border-indigo-300">
                  <mat-icon [class.text-white]="carModelFilter() === 'scorpio'" [class.text-indigo-600]="carModelFilter() !== 'scorpio'" class="text-lg">directions_car</mat-icon>
                  <span class="text-[11px] font-normal leading-tight mt-1">SUV / 7-Seat</span>
                </button>

                <!-- Chip 5: Top Rated -->
                <button
                  type="button"
                  (click)="toggleCarTopRated()"
                  [class.bg-indigo-600]="carOnlyTopRated()"
                  [class.text-white]="carOnlyTopRated()"
                  [class.border-indigo-600]="carOnlyTopRated()"
                  [class.bg-indigo-50/70]="!carOnlyTopRated()"
                  [class.text-slate-700]="!carOnlyTopRated()"
                  [class.border-indigo-200/70]="!carOnlyTopRated()"
                  class="rounded-xl px-3.5 py-1.5 border flex flex-col items-center justify-center shrink-0 min-w-[68px] sm:min-w-[74px] transition-all cursor-pointer active:scale-95 group hover:border-indigo-300">
                  <mat-icon [class.text-white]="carOnlyTopRated()" [class.text-indigo-600]="!carOnlyTopRated()" class="text-lg">star</mat-icon>
                  <span class="text-[11px] font-normal leading-tight mt-1">Top Rated</span>
                </button>
              }
            </div>

            <!-- Theme-Matched "Sort & Filters" CTA Button on Right (Bus vs Car vs Transport Gradient) -->
            <button
              type="button"
              (click)="isSortFilterDrawerOpen.set(true)"
              [class.from-[#e11d48]]="activeTab() === 'buses' && !isTransportSearch()"
              [class.via-[#f43f5e]]="activeTab() === 'buses' && !isTransportSearch()"
              [class.to-[#fb923c]]="activeTab() === 'buses' && !isTransportSearch()"
              [class.from-[#4f46e5]]="activeTab() === 'cars' && !isTransportSearch()"
              [class.via-[#6366f1]]="activeTab() === 'cars' && !isTransportSearch()"
              [class.to-[#9333ea]]="activeTab() === 'cars' && !isTransportSearch()"
              [class.from-[#7e22ce]]="isTransportSearch() || activeTab() === 'transport'"
              [class.via-[#a21caf]]="isTransportSearch() || activeTab() === 'transport'"
              [class.to-[#db2777]]="isTransportSearch() || activeTab() === 'transport'"
              class="bg-gradient-to-r active:scale-95 text-white py-2 px-3 sm:px-4 rounded-tl-[22px] flex flex-col items-center justify-center shrink-0 cursor-pointer transition-all min-w-[86px] sm:min-w-[96px] self-stretch">
              <div class="flex items-center space-x-1.5">
                <mat-icon class="text-lg leading-none">tune</mat-icon>
                <span
                  [class.text-[#e11d48]]="activeTab() === 'buses' && !isTransportSearch()"
                  [class.text-[#4f46e5]]="activeTab() === 'cars' && !isTransportSearch()"
                  [class.text-[#a21caf]]="isTransportSearch() || activeTab() === 'transport'"
                  class="w-5 h-5 rounded-full bg-white text-[11px] font-normal flex items-center justify-center leading-none">
                  {{ activeFilterCount() }}
                </span>
              </div>
              <span class="text-[11px] sm:text-xs font-normal mt-1 leading-tight text-white whitespace-nowrap">
                Sort &amp; Filters
              </span>
            </button>

          </div>
        </footer>
      }

      <!-- Sort & Filters Offcanvas / Bottom Sheet Drawer (Home Page Pastel Header + Bus/Car/Transport Gradient Theme) -->
      @if (isSortFilterDrawerOpen()) {
        <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
          <div class="bg-white rounded-t-[30px] sm:rounded-[30px] max-w-lg w-full max-h-[85vh] flex flex-col text-slate-800 animate-slide-up border border-slate-200/90 result-card-shadow overflow-hidden">
            
            <!-- Offcanvas Header with Home Page Pastel Peach-Pink-Lavender Backdrop -->
            <div class="px-5 pt-3 pb-4 border-b border-white/80 bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] relative overflow-hidden shrink-0">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)] pointer-events-none"></div>
              
              <!-- Offcanvas Top Drag Indicator Pill -->
              <div class="relative z-10 w-11 h-1.5 bg-slate-400/40 rounded-full mx-auto mb-2.5 sm:hidden"></div>

              <div class="relative z-10 flex items-center justify-between">
                <div class="flex items-center space-x-2.5">
                  <div
                    [class.from-[#e11d48]]="activeTab() === 'buses' && !isTransportSearch()"
                    [class.via-[#f43f5e]]="activeTab() === 'buses' && !isTransportSearch()"
                    [class.to-[#fb923c]]="activeTab() === 'buses' && !isTransportSearch()"
                    [class.from-[#4f46e5]]="activeTab() === 'cars' && !isTransportSearch()"
                    [class.via-[#6366f1]]="activeTab() === 'cars' && !isTransportSearch()"
                    [class.to-[#9333ea]]="activeTab() === 'cars' && !isTransportSearch()"
                    [class.from-[#7e22ce]]="isTransportSearch() || activeTab() === 'transport'"
                    [class.via-[#a21caf]]="isTransportSearch() || activeTab() === 'transport'"
                    [class.to-[#db2777]]="isTransportSearch() || activeTab() === 'transport'"
                    class="w-9 h-9 rounded-2xl bg-gradient-to-br text-white flex items-center justify-center shadow-xs">
                    <mat-icon class="text-base text-white">tune</mat-icon>
                  </div>
                  <div>
                    <h3 class="text-sm sm:text-base font-normal text-slate-900 leading-tight">Sort &amp; Filters</h3>
                    <span class="text-[11px] text-slate-600 font-normal">
                      {{ state.sourceCity().name }} to {{ state.destinationCity().name }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center space-x-2">
                  <button
                    type="button"
                    (click)="resetAllFilters()"
                    [class.text-[#be123c]]="activeTab() === 'buses' && !isTransportSearch()"
                    [class.text-[#4338ca]]="activeTab() === 'cars' && !isTransportSearch()"
                    [class.text-[#a21caf]]="isTransportSearch() || activeTab() === 'transport'"
                    class="text-xs bg-white/80 hover:bg-white px-2.5 py-1 rounded-full border border-white/90 font-normal cursor-pointer transition-colors">
                    Reset All
                  </button>
                  <button
                    type="button"
                    (click)="isSortFilterDrawerOpen.set(false)"
                    class="w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-slate-200/80 text-slate-600 flex items-center justify-center cursor-pointer transition-colors">
                    <mat-icon class="text-base">close</mat-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- Modal Scrollable Body -->
            <div class="p-4 sm:p-5 overflow-y-auto space-y-5 text-xs font-normal">
              
              <!-- Sort By Section -->
              <div>
                <span class="text-xs uppercase tracking-wider text-slate-400 block mb-2 font-normal">
                  Sort Results By
                </span>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    (click)="setSort(activeTab() === 'buses' ? 'bus' : 'car', 'departure_asc')"
                    [class.bg-[#ffe4e6]]="activeTab() === 'buses' && getSort() === 'departure_asc'"
                    [class.border-rose-400]="activeTab() === 'buses' && getSort() === 'departure_asc'"
                    [class.text-[#be123c]]="activeTab() === 'buses' && getSort() === 'departure_asc'"
                    [class.bg-[#e0e7ff]]="activeTab() === 'cars' && getSort() === 'departure_asc'"
                    [class.border-indigo-400]="activeTab() === 'cars' && getSort() === 'departure_asc'"
                    [class.text-[#4338ca]]="activeTab() === 'cars' && getSort() === 'departure_asc'"
                    [class.bg-[#fcfcfd]]="getSort() !== 'departure_asc'"
                    [class.border-slate-200/90]="getSort() !== 'departure_asc'"
                    class="p-3 rounded-[22px] border text-left transition-all cursor-pointer flex items-center space-x-2">
                    <mat-icon class="text-sm">schedule</mat-icon>
                    <span>Departure: Early First</span>
                  </button>

                  <button
                    type="button"
                    (click)="setSort(activeTab() === 'buses' ? 'bus' : 'car', 'price_asc')"
                    [class.bg-[#ffe4e6]]="activeTab() === 'buses' && getSort() === 'price_asc'"
                    [class.border-rose-400]="activeTab() === 'buses' && getSort() === 'price_asc'"
                    [class.text-[#be123c]]="activeTab() === 'buses' && getSort() === 'price_asc'"
                    [class.bg-[#e0e7ff]]="activeTab() === 'cars' && getSort() === 'price_asc'"
                    [class.border-indigo-400]="activeTab() === 'cars' && getSort() === 'price_asc'"
                    [class.text-[#4338ca]]="activeTab() === 'cars' && getSort() === 'price_asc'"
                    [class.bg-[#fcfcfd]]="getSort() !== 'price_asc'"
                    [class.border-slate-200/90]="getSort() !== 'price_asc'"
                    class="p-3 rounded-[22px] border text-left transition-all cursor-pointer flex items-center space-x-2">
                    <mat-icon class="text-sm">payments</mat-icon>
                    <span>Price: Low to High</span>
                  </button>

                  <button
                    type="button"
                    (click)="setSort(activeTab() === 'buses' ? 'bus' : 'car', 'rating_desc')"
                    [class.bg-[#ffe4e6]]="activeTab() === 'buses' && getSort() === 'rating_desc'"
                    [class.border-rose-400]="activeTab() === 'buses' && getSort() === 'rating_desc'"
                    [class.text-[#be123c]]="activeTab() === 'buses' && getSort() === 'rating_desc'"
                    [class.bg-[#e0e7ff]]="activeTab() === 'cars' && getSort() === 'rating_desc'"
                    [class.border-indigo-400]="activeTab() === 'cars' && getSort() === 'rating_desc'"
                    [class.text-[#4338ca]]="activeTab() === 'cars' && getSort() === 'rating_desc'"
                    [class.bg-[#fcfcfd]]="getSort() !== 'rating_desc'"
                    [class.border-slate-200/90]="getSort() !== 'rating_desc'"
                    class="p-3 rounded-[22px] border text-left transition-all cursor-pointer flex items-center space-x-2">
                    <mat-icon class="text-sm">star</mat-icon>
                    <span>Rating: High to Low</span>
                  </button>

                  <button
                    type="button"
                    (click)="setSort(activeTab() === 'buses' ? 'bus' : 'car', 'departure_desc')"
                    [class.bg-[#ffe4e6]]="activeTab() === 'buses' && getSort() === 'departure_desc'"
                    [class.border-rose-400]="activeTab() === 'buses' && getSort() === 'departure_desc'"
                    [class.text-[#be123c]]="activeTab() === 'buses' && getSort() === 'departure_desc'"
                    [class.bg-[#e0e7ff]]="activeTab() === 'cars' && getSort() === 'departure_desc'"
                    [class.border-indigo-400]="activeTab() === 'cars' && getSort() === 'departure_desc'"
                    [class.text-[#4338ca]]="activeTab() === 'cars' && getSort() === 'departure_desc'"
                    [class.bg-[#fcfcfd]]="getSort() !== 'departure_desc'"
                    [class.border-slate-200/90]="getSort() !== 'departure_desc'"
                    class="p-3 rounded-[22px] border text-left transition-all cursor-pointer flex items-center space-x-2">
                    <mat-icon class="text-sm">nightlight</mat-icon>
                    <span>Departure: Late First</span>
                  </button>
                </div>
              </div>

              <!-- Vehicle / Coach Type Filters -->
              @if (activeTab() === 'buses') {
                <div>
                  <span class="text-xs uppercase tracking-wider text-slate-400 block mb-2 font-normal">
                    Bus Coach Type
                  </span>
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      (click)="busFilter.set('all')"
                      [class.bg-gradient-to-r]="busFilter() === 'all'"
                      [class.from-[#e11d48]]="busFilter() === 'all'"
                      [class.via-[#f43f5e]]="busFilter() === 'all'"
                      [class.to-[#fb923c]]="busFilter() === 'all'"
                      [class.text-white]="busFilter() === 'all'"
                      [class.border-rose-500]="busFilter() === 'all'"
                      [class.bg-[#fcfcfd]]="busFilter() !== 'all'"
                      [class.border-slate-200/90]="busFilter() !== 'all'"
                      class="px-3.5 py-2 rounded-[22px] border text-xs cursor-pointer transition-all">
                      All Buses
                    </button>
                    <button
                      type="button"
                      (click)="busFilter.set('ac')"
                      [class.bg-gradient-to-r]="busFilter() === 'ac'"
                      [class.from-[#e11d48]]="busFilter() === 'ac'"
                      [class.via-[#f43f5e]]="busFilter() === 'ac'"
                      [class.to-[#fb923c]]="busFilter() === 'ac'"
                      [class.text-white]="busFilter() === 'ac'"
                      [class.border-rose-500]="busFilter() === 'ac'"
                      [class.bg-[#fcfcfd]]="busFilter() !== 'ac'"
                      [class.border-slate-200/90]="busFilter() !== 'ac'"
                      class="px-3.5 py-2 rounded-[22px] border text-xs cursor-pointer transition-all">
                      AC Only
                    </button>
                    <button
                      type="button"
                      (click)="busFilter.set('sleeper')"
                      [class.bg-gradient-to-r]="busFilter() === 'sleeper'"
                      [class.from-[#e11d48]]="busFilter() === 'sleeper'"
                      [class.via-[#f43f5e]]="busFilter() === 'sleeper'"
                      [class.to-[#fb923c]]="busFilter() === 'sleeper'"
                      [class.text-white]="busFilter() === 'sleeper'"
                      [class.border-rose-500]="busFilter() === 'sleeper'"
                      [class.bg-[#fcfcfd]]="busFilter() !== 'sleeper'"
                      [class.border-slate-200/90]="busFilter() !== 'sleeper'"
                      class="px-3.5 py-2 rounded-[22px] border text-xs cursor-pointer transition-all">
                      Sleeper Coach
                    </button>
                    <button
                      type="button"
                      (click)="busFilter.set('seater')"
                      [class.bg-gradient-to-r]="busFilter() === 'seater'"
                      [class.from-[#e11d48]]="busFilter() === 'seater'"
                      [class.via-[#f43f5e]]="busFilter() === 'seater'"
                      [class.to-[#fb923c]]="busFilter() === 'seater'"
                      [class.text-white]="busFilter() === 'seater'"
                      [class.border-rose-500]="busFilter() === 'seater'"
                      [class.bg-[#fcfcfd]]="busFilter() !== 'seater'"
                      [class.border-slate-200/90]="busFilter() !== 'seater'"
                      class="px-3.5 py-2 rounded-[22px] border text-xs cursor-pointer transition-all">
                      Seater / Semi-Sleeper
                    </button>
                  </div>
                </div>
              } @else {
                <div>
                  <span class="text-xs uppercase tracking-wider text-slate-400 block mb-2 font-normal">
                    Car Model &amp; Type
                  </span>
                  <div class="flex flex-wrap gap-2">
                    <button
                      type="button"
                      (click)="carModelFilter.set('all')"
                      [class.bg-gradient-to-r]="carModelFilter() === 'all'"
                      [class.from-[#4f46e5]]="carModelFilter() === 'all'"
                      [class.via-[#6366f1]]="carModelFilter() === 'all'"
                      [class.to-[#9333ea]]="carModelFilter() === 'all'"
                      [class.text-white]="carModelFilter() === 'all'"
                      [class.border-indigo-500]="carModelFilter() === 'all'"
                      [class.bg-[#fcfcfd]]="carModelFilter() !== 'all'"
                      [class.border-slate-200/90]="carModelFilter() !== 'all'"
                      class="px-3.5 py-2 rounded-[22px] border text-xs cursor-pointer transition-all">
                      All Cars
                    </button>
                    <button
                      type="button"
                      (click)="carModelFilter.set('scorpio')"
                      [class.bg-gradient-to-r]="carModelFilter() === 'scorpio'"
                      [class.from-[#4f46e5]]="carModelFilter() === 'scorpio'"
                      [class.via-[#6366f1]]="carModelFilter() === 'scorpio'"
                      [class.to-[#9333ea]]="carModelFilter() === 'scorpio'"
                      [class.text-white]="carModelFilter() === 'scorpio'"
                      [class.border-indigo-500]="carModelFilter() === 'scorpio'"
                      [class.bg-[#fcfcfd]]="carModelFilter() !== 'scorpio'"
                      [class.border-slate-200/90]="carModelFilter() !== 'scorpio'"
                      class="px-3.5 py-2 rounded-[22px] border text-xs cursor-pointer transition-all">
                      Mahindra Scorpio S11
                    </button>
                    <button
                      type="button"
                      (click)="carModelFilter.set('bolero')"
                      [class.bg-gradient-to-r]="carModelFilter() === 'bolero'"
                      [class.from-[#4f46e5]]="carModelFilter() === 'bolero'"
                      [class.via-[#6366f1]]="carModelFilter() === 'bolero'"
                      [class.to-[#9333ea]]="carModelFilter() === 'bolero'"
                      [class.text-white]="carModelFilter() === 'bolero'"
                      [class.border-indigo-500]="carModelFilter() === 'bolero'"
                      [class.bg-[#fcfcfd]]="carModelFilter() !== 'bolero'"
                      [class.border-slate-200/90]="carModelFilter() !== 'bolero'"
                      class="px-3.5 py-2 rounded-[22px] border text-xs cursor-pointer transition-all">
                      Mahindra Bolero Maxi
                    </button>
                    <button
                      type="button"
                      (click)="carModelFilter.set('cruiser')"
                      [class.bg-gradient-to-r]="carModelFilter() === 'cruiser'"
                      [class.from-[#4f46e5]]="carModelFilter() === 'cruiser'"
                      [class.via-[#6366f1]]="carModelFilter() === 'cruiser'"
                      [class.to-[#9333ea]]="carModelFilter() === 'cruiser'"
                      [class.text-white]="carModelFilter() === 'cruiser'"
                      [class.border-indigo-500]="carModelFilter() === 'cruiser'"
                      [class.bg-[#fcfcfd]]="carModelFilter() !== 'cruiser'"
                      [class.border-slate-200/90]="carModelFilter() !== 'cruiser'"
                      class="px-3.5 py-2 rounded-[22px] border text-xs cursor-pointer transition-all">
                      Trax Cruiser 12-Seat
                    </button>
                    <button
                      type="button"
                      (click)="carModelFilter.set('ertiga')"
                      [class.bg-gradient-to-r]="carModelFilter() === 'ertiga'"
                      [class.from-[#4f46e5]]="carModelFilter() === 'ertiga'"
                      [class.via-[#6366f1]]="carModelFilter() === 'ertiga'"
                      [class.to-[#9333ea]]="carModelFilter() === 'ertiga'"
                      [class.text-white]="carModelFilter() === 'ertiga'"
                      [class.border-indigo-500]="carModelFilter() === 'ertiga'"
                      [class.bg-[#fcfcfd]]="carModelFilter() !== 'ertiga'"
                      [class.border-slate-200/90]="carModelFilter() !== 'ertiga'"
                      class="px-3.5 py-2 rounded-[22px] border text-xs cursor-pointer transition-all">
                      Maruti Ertiga / Tour
                    </button>
                  </div>
                </div>
              }

              <!-- Departure Time Filters -->
              <div>
                <span class="text-xs uppercase tracking-wider text-slate-400 block mb-2 font-normal">
                  Departure Time
                </span>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    (click)="setTimeFilter('all')"
                    [class.bg-[#ffe4e6]]="activeTab() === 'buses' && departureTimeFilter() === 'all'"
                    [class.border-rose-400]="activeTab() === 'buses' && departureTimeFilter() === 'all'"
                    [class.text-[#be123c]]="activeTab() === 'buses' && departureTimeFilter() === 'all'"
                    [class.bg-[#e0e7ff]]="activeTab() === 'cars' && departureTimeFilter() === 'all'"
                    [class.border-indigo-400]="activeTab() === 'cars' && departureTimeFilter() === 'all'"
                    [class.text-[#4338ca]]="activeTab() === 'cars' && departureTimeFilter() === 'all'"
                    [class.bg-[#fcfcfd]]="departureTimeFilter() !== 'all'"
                    [class.border-slate-200/90]="departureTimeFilter() !== 'all'"
                    class="p-3 rounded-[22px] border text-left transition-all cursor-pointer">
                    <span class="block">Any Time</span>
                    <span class="text-[10px] text-slate-400">All 24 hours</span>
                  </button>
                  <button
                    type="button"
                    (click)="setTimeFilter('morning')"
                    [class.bg-[#ffe4e6]]="activeTab() === 'buses' && departureTimeFilter() === 'morning'"
                    [class.border-rose-400]="activeTab() === 'buses' && departureTimeFilter() === 'morning'"
                    [class.text-[#be123c]]="activeTab() === 'buses' && departureTimeFilter() === 'morning'"
                    [class.bg-[#e0e7ff]]="activeTab() === 'cars' && departureTimeFilter() === 'morning'"
                    [class.border-indigo-400]="activeTab() === 'cars' && departureTimeFilter() === 'morning'"
                    [class.text-[#4338ca]]="activeTab() === 'cars' && departureTimeFilter() === 'morning'"
                    [class.bg-[#fcfcfd]]="departureTimeFilter() !== 'morning'"
                    [class.border-slate-200/90]="departureTimeFilter() !== 'morning'"
                    class="p-3 rounded-[22px] border text-left transition-all cursor-pointer">
                    <span class="block">Morning</span>
                    <span class="text-[10px] text-slate-400">6:00 AM - 12:00 PM</span>
                  </button>
                  <button
                    type="button"
                    (click)="setTimeFilter('afternoon')"
                    [class.bg-[#ffe4e6]]="activeTab() === 'buses' && departureTimeFilter() === 'afternoon'"
                    [class.border-rose-400]="activeTab() === 'buses' && departureTimeFilter() === 'afternoon'"
                    [class.text-[#be123c]]="activeTab() === 'buses' && departureTimeFilter() === 'afternoon'"
                    [class.bg-[#e0e7ff]]="activeTab() === 'cars' && departureTimeFilter() === 'afternoon'"
                    [class.border-indigo-400]="activeTab() === 'cars' && departureTimeFilter() === 'afternoon'"
                    [class.text-[#4338ca]]="activeTab() === 'cars' && departureTimeFilter() === 'afternoon'"
                    [class.bg-[#fcfcfd]]="departureTimeFilter() !== 'afternoon'"
                    [class.border-slate-200/90]="departureTimeFilter() !== 'afternoon'"
                    class="p-3 rounded-[22px] border text-left transition-all cursor-pointer">
                    <span class="block">Afternoon / Evening</span>
                    <span class="text-[10px] text-slate-400">12:00 PM - 6:00 PM</span>
                  </button>
                  <button
                    type="button"
                    (click)="setTimeFilter('night')"
                    [class.bg-[#ffe4e6]]="activeTab() === 'buses' && departureTimeFilter() === 'night'"
                    [class.border-rose-400]="activeTab() === 'buses' && departureTimeFilter() === 'night'"
                    [class.text-[#be123c]]="activeTab() === 'buses' && departureTimeFilter() === 'night'"
                    [class.bg-[#e0e7ff]]="activeTab() === 'cars' && departureTimeFilter() === 'night'"
                    [class.border-indigo-400]="activeTab() === 'cars' && departureTimeFilter() === 'night'"
                    [class.text-[#4338ca]]="activeTab() === 'cars' && departureTimeFilter() === 'night'"
                    [class.bg-[#fcfcfd]]="departureTimeFilter() !== 'night'"
                    [class.border-slate-200/90]="departureTimeFilter() !== 'night'"
                    class="p-3 rounded-[22px] border text-left transition-all cursor-pointer">
                    <span class="block">Night Express</span>
                    <span class="text-[10px] text-slate-400">6:00 PM - 6:00 AM</span>
                  </button>
                </div>
              </div>

              <!-- Boarding / Pickup Point Selection Filter -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs uppercase tracking-wider text-slate-400 block font-normal">
                    Preferred Boarding / Pickup Point ({{ state.sourceCity().name }})
                  </span>
                  @if (boardingPointFilter() !== 'all') {
                    <button
                      type="button"
                      (click)="setBoardingPointFilter('all')"
                      class="text-[11px] text-rose-600 hover:underline cursor-pointer">
                      Reset Pickup
                    </button>
                  }
                </div>

                <!-- Search input for boarding points -->
                <div class="relative mb-2.5">
                  <mat-icon class="text-sm text-slate-400 absolute left-3 top-1/2 -translate-y-1/2">search</mat-icon>
                  <input
                    type="text"
                    placeholder="Search pickup location or landmark..."
                    [value]="boardingSearchQuery()"
                    (input)="onBoardingSearchInput($event)"
                    class="w-full pl-8 pr-3 py-2 rounded-[16px] bg-[#f8fafc] border border-slate-200/90 text-xs text-slate-800 focus:outline-none focus:border-slate-400" />
                </div>

                <div class="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                  <button
                    type="button"
                    (click)="setBoardingPointFilter('all')"
                    [class.bg-gradient-to-r]="boardingPointFilter() === 'all'"
                    [class.from-[#e11d48]]="boardingPointFilter() === 'all' && activeTab() === 'buses'"
                    [class.via-[#f43f5e]]="boardingPointFilter() === 'all' && activeTab() === 'buses'"
                    [class.to-[#fb923c]]="boardingPointFilter() === 'all' && activeTab() === 'buses'"
                    [class.from-[#4f46e5]]="boardingPointFilter() === 'all' && activeTab() !== 'buses'"
                    [class.via-[#6366f1]]="boardingPointFilter() === 'all' && activeTab() !== 'buses'"
                    [class.to-[#9333ea]]="boardingPointFilter() === 'all' && activeTab() !== 'buses'"
                    [class.text-white]="boardingPointFilter() === 'all'"
                    [class.border-transparent]="boardingPointFilter() === 'all'"
                    [class.bg-[#fcfcfd]]="boardingPointFilter() !== 'all'"
                    [class.border-slate-200/90]="boardingPointFilter() !== 'all'"
                    class="px-3.5 py-2 rounded-[22px] border text-xs cursor-pointer transition-all">
                    All Pickup Points
                  </button>

                  @for (bp of filteredDrawerBoardingPoints(); track bp.name) {
                    <button
                      type="button"
                      (click)="toggleBoardingPointFilter(bp.name)"
                      [class.bg-gradient-to-r]="boardingPointFilter() === bp.name"
                      [class.from-[#e11d48]]="boardingPointFilter() === bp.name && activeTab() === 'buses'"
                      [class.via-[#f43f5e]]="boardingPointFilter() === bp.name && activeTab() === 'buses'"
                      [class.to-[#fb923c]]="boardingPointFilter() === bp.name && activeTab() === 'buses'"
                      [class.from-[#4f46e5]]="boardingPointFilter() === bp.name && activeTab() !== 'buses'"
                      [class.via-[#6366f1]]="boardingPointFilter() === bp.name && activeTab() !== 'buses'"
                      [class.to-[#9333ea]]="boardingPointFilter() === bp.name && activeTab() !== 'buses'"
                      [class.text-white]="boardingPointFilter() === bp.name"
                      [class.border-transparent]="boardingPointFilter() === bp.name"
                      [class.bg-[#fcfcfd]]="boardingPointFilter() !== bp.name"
                      [class.border-slate-200/90]="boardingPointFilter() !== bp.name"
                      class="px-3.5 py-2 rounded-[22px] border text-xs cursor-pointer transition-all flex items-center space-x-1.5">
                      <mat-icon class="text-xs">location_on</mat-icon>
                      <span>{{ bp.name }}</span>
                      <span class="text-[10px] opacity-75">({{ bp.count }})</span>
                    </button>
                  }
                </div>
              </div>

            </div>

            <!-- Modal Sticky Action Button -->
            <div class="p-3.5 border-t border-slate-100 bg-white flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                (click)="resetAllFilters()"
                class="px-4 py-2.5 rounded-[22px] border border-slate-200 text-slate-700 font-normal text-xs cursor-pointer hover:bg-slate-50 transition-colors">
                Clear Filters
              </button>
              <button
                type="button"
                (click)="isSortFilterDrawerOpen.set(false)"
                [class.from-[#e11d48]]="activeTab() === 'buses' && !isTransportSearch()"
                [class.via-[#f43f5e]]="activeTab() === 'buses' && !isTransportSearch()"
                [class.to-[#fb923c]]="activeTab() === 'buses' && !isTransportSearch()"
                [class.from-[#4f46e5]]="activeTab() === 'cars' && !isTransportSearch()"
                [class.via-[#6366f1]]="activeTab() === 'cars' && !isTransportSearch()"
                [class.to-[#9333ea]]="activeTab() === 'cars' && !isTransportSearch()"
                [class.from-[#7e22ce]]="isTransportSearch() || activeTab() === 'transport'"
                [class.via-[#a21caf]]="isTransportSearch() || activeTab() === 'transport'"
                [class.to-[#db2777]]="isTransportSearch() || activeTab() === 'transport'"
                class="flex-1 py-2.5 px-4 rounded-[22px] bg-gradient-to-r text-white font-normal text-xs cursor-pointer transition-all active:scale-95 text-center">
                Apply Filters ({{ activeFilterCount() }})
              </button>
            </div>

          </div>
        </div>
      }
    </div>
  `,
})
export class ResultsView {
  readonly state = inject(BookingState);
  readonly isModifyOpen = signal<boolean>(false);
  readonly skeletonItems = [1, 2, 3, 4, 5];
  
  readonly activeTab = signal<'buses' | 'cars' | 'hotels' | 'transport'>('buses');

  readonly isHotelSearch = computed<boolean>(() => {
    return this.state.searchCategory() === 'hotel' || this.state.resultsTargetSection() === 'hotel';
  });

  readonly isTransportSearch = computed<boolean>(() => {
    return this.state.searchCategory() === 'transport' || this.state.resultsTargetSection() === 'transport';
  });

  readonly transportFilter = signal<'all' | 'ac' | 'cargo' | 'rated'>('all');

  readonly allTransportCount = computed<number>(() => {
    const trList = this.state.transportTrips();
    return trList && trList.length > 0 ? trList.length : this.state.sharedCarTrips().length;
  });

  readonly isSortFilterDrawerOpen = signal<boolean>(false);

  // Bus Filters & Sorting
  readonly busFilter = signal<'all' | 'ac' | 'sleeper' | 'seater'>('all');
  readonly busSort = signal<'departure_asc' | 'departure_desc' | 'price_asc' | 'rating_desc'>('departure_asc');
  readonly busOnlyOffers = signal<boolean>(false);
  readonly busOnlyNewBuses = signal<boolean>(false);
  readonly busOnlyTopRated = signal<boolean>(false);
  readonly departureTimeFilter = signal<'all' | 'morning' | 'afternoon' | 'night'>('all');

  // Car Filters & Sorting
  readonly carModelFilter = signal<string>('all');
  readonly carAcFilter = signal<string>('all');
  readonly carSort = signal<'departure_asc' | 'departure_desc' | 'price_asc' | 'rating_desc'>('departure_asc');
  readonly carOnlyOffers = signal<boolean>(false);
  readonly carCaptainSeats = signal<boolean>(false);
  readonly carOnlyTopRated = signal<boolean>(false);

  // Shared Boarding Point / Pickup Location Filter
  readonly boardingPointFilter = signal<string>('all');
  readonly boardingSearchQuery = signal<string>('');

  readonly availableBoardingPoints = computed<{ name: string; count: number; earliestTime: string }[]>(() => {
    const tab = this.activeTab();
    const map = new Map<string, { count: number; earliestTime: string }>();

    if (tab === 'buses') {
      for (const trip of this.state.allTrips()) {
        for (const bp of trip.boardingPoints || []) {
          const loc = (bp.location || '').trim();
          if (!loc) continue;
          const prev = map.get(loc);
          if (!prev) {
            map.set(loc, { count: 1, earliestTime: bp.time || trip.departureTime });
          } else {
            prev.count++;
          }
        }
      }
    } else if (tab === 'cars') {
      for (const car of this.state.sharedCarTrips()) {
        for (const bp of car.boardingPoints || []) {
          const loc = (bp.location || '').trim();
          if (!loc) continue;
          const prev = map.get(loc);
          if (!prev) {
            map.set(loc, { count: 1, earliestTime: bp.time || car.departureTime });
          } else {
            prev.count++;
          }
        }
      }
    } else if (tab === 'transport') {
      const trSource = this.state.transportTrips().length > 0 ? this.state.transportTrips() : this.state.sharedCarTrips();
      for (const tr of trSource) {
        for (const bp of tr.boardingPoints || []) {
          const loc = (bp.location || '').trim();
          if (!loc) continue;
          const prev = map.get(loc);
          if (!prev) {
            map.set(loc, { count: 1, earliestTime: bp.time || tr.departureTime });
          } else {
            prev.count++;
          }
        }
      }
    }

    // Also include popularTerminals of sourceCity if map is empty
    if (map.size === 0) {
      for (const term of this.state.sourceCity().popularTerminals || []) {
        map.set(term, { count: 1, earliestTime: '20:00' });
      }
    }

    return Array.from(map.entries()).map(([name, info]) => ({
      name,
      count: info.count,
      earliestTime: info.earliestTime,
    }));
  });

  readonly filteredDrawerBoardingPoints = computed(() => {
    const q = this.boardingSearchQuery().trim().toLowerCase();
    const all = this.availableBoardingPoints();
    if (!q) return all;
    return all.filter((bp) => bp.name.toLowerCase().includes(q));
  });

  readonly activeBusFilterCount = computed<number>(() => {
    let count = 0;
    if (this.busFilter() !== 'all') count++;
    if (this.busSort() !== 'departure_asc') count++;
    if (this.busOnlyOffers()) count++;
    if (this.busOnlyNewBuses()) count++;
    if (this.busOnlyTopRated()) count++;
    if (this.departureTimeFilter() !== 'all') count++;
    if (this.boardingPointFilter() !== 'all') count++;
    return count;
  });

  readonly activeCarFilterCount = computed<number>(() => {
    let count = 0;
    if (this.carModelFilter() !== 'all') count++;
    if (this.carAcFilter() !== 'all') count++;
    if (this.carSort() !== 'departure_asc') count++;
    if (this.carOnlyOffers()) count++;
    if (this.carCaptainSeats()) count++;
    if (this.carOnlyTopRated()) count++;
    if (this.departureTimeFilter() !== 'all') count++;
    if (this.boardingPointFilter() !== 'all') count++;
    return count;
  });

  readonly activeFilterCount = computed<number>(() => {
    return this.activeTab() === 'buses' ? this.activeBusFilterCount() : this.activeCarFilterCount();
  });

  // Car Selection State
  readonly activeCarTripId = signal<string | null>(null);
  readonly selectedCarSeatIds = signal<string[]>([]);
  readonly selectedCarBoardingPointId = signal<string>('');
  readonly selectedCarDroppingPointId = signal<string>('');

  // Hotel Selection State
  readonly hotelFilter = signal<'all' | 'rated' | 'budget' | 'near'>('all');
  readonly isHotelModalOpen = signal<boolean>(false);
  readonly selectedHotel = signal<DestinationHotel | null>(null);
  readonly hotelGuestName = signal<string>(this.state.currentUser().fullName || 'Rahul Sharma');
  readonly hotelGuestPhone = signal<string>(this.state.currentUser().phone || '+91 98765 43210');

  private readonly busOffers = [
    'Min. 10% off on 3 or more seats',
    'Min. 10% off on 3 or more seats · Save ₹150',
    'Flat 10% off on group bookings (3+ seats)',
    'Min. 10% off on 3 or more seats',
    'Early Bird: Min. 10% off on 2 or more seats',
  ];

  private readonly carOffers = [
    'Min. 10% off on 3 or more seats',
    'Flat 15% off on full cabin booking',
    'Min. 10% off on 3 or more seats',
    'Save ₹100 on 2 or more front/middle seats',
    'Min. 10% off on 3 or more seats',
  ];

  getBusOffer(idx: number): string {
    return this.busOffers[idx % this.busOffers.length];
  }

  getCarOffer(idx: number): string {
    return this.carOffers[idx % this.carOffers.length];
  }

  formatBusSubtitle(bus: Trip): string {
    const acPrefix = bus.bus.hasAc ? 'AC' : 'Non AC';
    if (bus.bus.busType === 'sleeper') {
      return `${acPrefix} Sleeper (2+1)`;
    }
    if (bus.bus.busType === 'volvo_multi_axle') {
      return `Volvo ${acPrefix} Seater (2+2)`;
    }
    if (bus.bus.busType === 'semi_sleeper') {
      return `${acPrefix} Seater / Sleeper (2+1)`;
    }
    return `${acPrefix} Seater (2+2)`;
  }

  readonly busTrips = computed<Trip[]>(() => {
    let list = [...this.state.allTrips()];
    const filter = this.busFilter();
    const sort = this.busSort();

    if (filter === 'ac') {
      list = list.filter((t) => t.bus.hasAc);
    } else if (filter === 'sleeper') {
      list = list.filter((t) => t.bus.busType.includes('sleeper'));
    } else if (filter === 'seater') {
      list = list.filter((t) => t.bus.busType === 'seater' || t.bus.busType === 'semi_sleeper');
    }

    if (this.busOnlyOffers()) {
      list = list.filter((t, idx) => idx % 2 === 0 || t.baseFare <= 900);
    }

    if (this.busOnlyNewBuses()) {
      list = list.filter((t) => t.bus.isLiveTracking);
    }

    if (this.busOnlyTopRated()) {
      list = list.filter((t) => t.bus.rating >= 4.6);
    }

    const timeFilter = this.departureTimeFilter();
    if (timeFilter === 'morning') {
      list = list.filter((t) => {
        const hour = parseInt(t.departureTime.split(':')[0], 10);
        return hour >= 6 && hour < 12;
      });
    } else if (timeFilter === 'afternoon') {
      list = list.filter((t) => {
        const hour = parseInt(t.departureTime.split(':')[0], 10);
        return hour >= 12 && hour < 18;
      });
    } else if (timeFilter === 'night') {
      list = list.filter((t) => {
        const hour = parseInt(t.departureTime.split(':')[0], 10);
        return hour >= 18 || hour < 6;
      });
    }

    const bpFilter = this.boardingPointFilter();
    if (bpFilter !== 'all') {
      const targetBp = bpFilter.toLowerCase();
      list = list.filter((t) =>
        (t.boardingPoints || []).some(
          (bp) =>
            bp.location.toLowerCase().includes(targetBp) ||
            targetBp.includes(bp.location.toLowerCase()),
        ),
      );
    }

    if (sort === 'price_asc') {
      list.sort((a, b) => a.baseFare - b.baseFare);
    } else if (sort === 'rating_desc') {
      list.sort((a, b) => b.bus.rating - a.bus.rating);
    } else if (sort === 'departure_desc') {
      list.sort((a, b) => b.departureTime.localeCompare(a.departureTime));
    } else {
      list.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    return list;
  });

  readonly carTrips = computed<SharedCarTrip[]>(() => {
    let list = [...this.state.sharedCarTrips()];
    const model = this.carModelFilter();
    const ac = this.carAcFilter();
    const sort = this.carSort();

    if (model !== 'all') {
      list = list.filter((c) => c.vehicleModel === model);
    }
    if (ac === 'ac') {
      list = list.filter((c) => c.hasAc);
    }
    if (this.carOnlyOffers()) {
      list = list.filter((c, idx) => idx % 2 === 0 || c.baseFare <= 300);
    }
    if (this.carCaptainSeats()) {
      list = list.filter((c) => c.totalSeats === 7 || c.features.some(f => f.toLowerCase().includes('captain')));
    }
    if (this.carOnlyTopRated()) {
      list = list.filter((c) => c.rating >= 4.8);
    }

    const timeFilter = this.departureTimeFilter();
    if (timeFilter === 'morning') {
      list = list.filter((c) => {
        const hour = parseInt(c.departureTime.split(':')[0], 10);
        return hour >= 6 && hour < 12;
      });
    } else if (timeFilter === 'afternoon') {
      list = list.filter((c) => {
        const hour = parseInt(c.departureTime.split(':')[0], 10);
        return hour >= 12 && hour < 18;
      });
    } else if (timeFilter === 'night') {
      list = list.filter((c) => {
        const hour = parseInt(c.departureTime.split(':')[0], 10);
        return hour >= 18 || hour < 6;
      });
    }

    const bpFilter = this.boardingPointFilter();
    if (bpFilter !== 'all') {
      const targetBp = bpFilter.toLowerCase();
      list = list.filter((c) =>
        (c.boardingPoints || []).some(
          (bp) =>
            bp.location.toLowerCase().includes(targetBp) ||
            targetBp.includes(bp.location.toLowerCase()),
        ),
      );
    }

    if (sort === 'price_asc') {
      list.sort((a, b) => a.baseFare - b.baseFare);
    } else if (sort === 'rating_desc') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'departure_desc') {
      list.sort((a, b) => b.departureTime.localeCompare(a.departureTime));
    } else {
      list.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    return list;
  });

  readonly transportTrips = computed<SharedCarTrip[]>(() => {
    const trList = this.state.transportTrips();
    let list = trList && trList.length > 0 ? [...trList] : [...this.state.sharedCarTrips()];
    const tf = this.transportFilter();
    if (tf === 'ac') {
      list = list.filter((tr) => tr.hasAc);
    } else if (tf === 'cargo') {
      list = list.filter((tr) => tr.totalSeats >= 7 || (tr.features || []).some((f) => f.toLowerCase().includes('luggage') || f.toLowerCase().includes('carrier')));
    } else if (tf === 'rated') {
      list = list.filter((tr) => tr.rating >= 4.7);
    }

    const bpFilter = this.boardingPointFilter();
    if (bpFilter !== 'all') {
      const targetBp = bpFilter.toLowerCase();
      list = list.filter((tr) =>
        (tr.boardingPoints || []).some(
          (bp) =>
            bp.location.toLowerCase().includes(targetBp) ||
            targetBp.includes(bp.location.toLowerCase()),
        ),
      );
    }

    const sort = this.carSort();
    if (sort === 'price_asc') {
      list.sort((a, b) => a.baseFare - b.baseFare);
    } else if (sort === 'rating_desc') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'departure_desc') {
      list.sort((a, b) => b.departureTime.localeCompare(a.departureTime));
    } else {
      list.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }

    return list;
  });

  setTransportFilter(filter: 'all' | 'ac' | 'cargo' | 'rated') {
    this.transportFilter.set(filter);
  }

  readonly lowestBusFare = computed<number>(() => {
    const list = this.busTrips();
    if (!list.length) return 499;
    return Math.min(...list.map((t) => t.baseFare));
  });

  readonly lowestCarFare = computed<number>(() => {
    const list = this.carTrips();
    if (!list.length) return 250;
    return Math.min(...list.map((c) => c.baseFare));
  });

  readonly filteredHotels = computed(() => {
    const list = this.state.destinationHotels();
    const f = this.hotelFilter();
    if (f === 'rated') {
      return list.filter((h) => h.rating >= 4.8);
    }
    if (f === 'budget') {
      return list.filter((h) => h.discountedPrice <= 1200);
    }
    if (f === 'near') {
      return list.filter((h) => h.terminalDistance.includes('250m') || h.terminalDistance.includes('400m'));
    }
    return list;
  });

  readonly formattedDateParts = computed(() => {
    const raw = this.state.travelDate();
    if (!raw) return { dateStr: '18 Oct', dayStr: 'Sun' };
    const dateObj = new Date(raw);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayStr = dayNames[dateObj.getDay()] || 'Sun';
    const dateStr = `${dateObj.getDate()} ${monthNames[dateObj.getMonth()] || 'Oct'}`;
    return { dateStr, dayStr };
  });

  constructor() {
    effect(
      () => {
        const cat = this.state.searchCategory();
        const target = this.state.resultsTargetSection();
        if (target === 'car' || cat === 'car') {
          this.activeTab.set('cars');
        } else if (target === 'transport' || cat === 'transport') {
          this.activeTab.set('transport');
        } else if (target === 'hotel' || cat === 'hotel') {
          this.activeTab.set('hotels');
        } else {
          this.activeTab.set('buses');
        }
      },
      { allowSignalWrites: true }
    );
  }

  setActiveTab(tab: 'buses' | 'cars' | 'hotels' | 'transport') {
    this.activeTab.set(tab);
    if (tab === 'buses') {
      this.state.resultsTargetSection.set('bus');
      this.state.searchCategory.set('bus');
    } else if (tab === 'cars') {
      this.state.resultsTargetSection.set('car');
      this.state.searchCategory.set('car');
    } else if (tab === 'transport') {
      this.state.resultsTargetSection.set('transport');
      this.state.searchCategory.set('transport');
      if (this.state.transportTrips().length === 0) {
        this.state.loadTransportTrips();
      }
    } else {
      this.state.resultsTargetSection.set('hotel');
      this.state.searchCategory.set('hotel');
    }
  }

  onBusSortChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value as 'departure_asc' | 'price_asc' | 'rating_desc';
    this.busSort.set(val);
  }

  onCarSortChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value as 'departure_asc' | 'price_asc' | 'rating_desc';
    this.carSort.set(val);
  }

  toggleCarSeatLayout(trip: SharedCarTrip) {
    if (this.activeCarTripId() === trip.id) {
      this.activeCarTripId.set(null);
      this.selectedCarSeatIds.set([]);
    } else {
      this.activeCarTripId.set(trip.id);
      this.selectedCarSeatIds.set([]);
      if (trip.boardingPoints && trip.boardingPoints.length > 0) {
        this.selectedCarBoardingPointId.set(trip.boardingPoints[0].id);
      }
      if (trip.droppingPoints && trip.droppingPoints.length > 0) {
        this.selectedCarDroppingPointId.set(trip.droppingPoints[0].id);
      }
    }
  }

  toggleCarSeat(trip: SharedCarTrip, seat: CarSeat) {
    if (seat.status === 'booked') return;
    const current = this.selectedCarSeatIds();
    if (current.includes(seat.id)) {
      this.selectedCarSeatIds.set(current.filter((id) => id !== seat.id));
    } else {
      this.selectedCarSeatIds.set([...current, seat.id]);
    }
  }

  isCarSeatSelected(seatId: string): boolean {
    return this.selectedCarSeatIds().includes(seatId);
  }

  getFrontSeats(trip: SharedCarTrip): CarSeat[] {
    return trip.seats.filter((s) => s.row === 'front');
  }

  getMiddleSeats(trip: SharedCarTrip): CarSeat[] {
    return trip.seats.filter((s) => s.row === 'middle');
  }

  getRearSeats(trip: SharedCarTrip): CarSeat[] {
    return trip.seats.filter((s) => s.row === 'rear' || s.row === 'jump');
  }

  getCarSelectedTotal(trip: SharedCarTrip): number {
    return this.selectedCarSeatIds().length * trip.baseFare;
  }

  bookCarSeats(trip: SharedCarTrip) {
    const seatIds = this.selectedCarSeatIds();
    if (seatIds.length === 0) {
      this.state.showToast('Please select at least one seat to proceed', 'warning');
      return;
    }
    const bp = this.selectedCarBoardingPointId() || trip.boardingPoints[0]?.id || '';
    const dp = this.selectedCarDroppingPointId() || trip.droppingPoints[0]?.id || '';
    this.state.bookSharedCarTrip({
      tripId: trip.id,
      seatIds,
      selectedBoardingPointId: bp,
      selectedDroppingPointId: dp,
    }, () => {
      this.activeCarTripId.set(null);
      this.selectedCarSeatIds.set([]);
    });
  }

  setHotelFilter(filter: 'all' | 'rated' | 'budget' | 'near') {
    this.hotelFilter.set(filter);
  }

  openHotelModal(hotel: DestinationHotel) {
    this.state.selectHotelForPassengerInfo(hotel);
  }

  onGuestNameChange(event: Event) {
    this.hotelGuestName.set((event.target as HTMLInputElement).value);
  }

  onGuestPhoneChange(event: Event) {
    this.hotelGuestPhone.set((event.target as HTMLInputElement).value);
  }

  confirmHotelBooking() {
    const hotel = this.selectedHotel();
    if (!hotel) return;
    this.isHotelModalOpen.set(false);
    this.state.bookHotelStay(hotel, {
      name: this.hotelGuestName(),
      phone: this.hotelGuestPhone(),
      checkInDate: this.state.travelDate(),
    });
  }

  onFromChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const city = this.state.cities().find((c) => c.id === select.value);
    if (city) {
      this.state.sourceCity.set(city);
    }
  }

  onToChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const city = this.state.cities().find((c) => c.id === select.value);
    if (city) {
      this.state.destinationCity.set(city);
    }
  }

  readonly minDateIso = computed<string>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  readonly maxDateIso = computed<string>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const months = this.isHotelSearch() || this.activeTab() === 'hotels' ? 6 : 3;
    d.setMonth(d.getMonth() + months);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const min = this.minDateIso();
      const max = this.maxDateIso();
      const clamped = input.value < min ? min : input.value > max ? max : input.value;
      this.state.travelDate.set(clamped);
    }
  }

  applyModify() {
    this.isModifyOpen.set(false);
    this.state.loadTripsFromDb();
    this.state.loadSharedCarTripsFromDb();
    this.state.showToast(`Updated route: ${this.state.sourceCity().name} → ${this.state.destinationCity().name}`, 'info');
  }

  toggleBusFilter(type: 'ac' | 'sleeper' | 'seater') {
    this.busFilter.set(this.busFilter() === type ? 'all' : type);
  }

  toggleBusOffers() {
    this.busOnlyOffers.set(!this.busOnlyOffers());
  }

  toggleBusNewBuses() {
    this.busOnlyNewBuses.set(!this.busOnlyNewBuses());
  }

  toggleBusTopRated() {
    this.busOnlyTopRated.set(!this.busOnlyTopRated());
  }

  toggleCarAc() {
    this.carAcFilter.set(this.carAcFilter() === 'ac' ? 'all' : 'ac');
  }

  toggleCarCaptainSeats() {
    this.carCaptainSeats.set(!this.carCaptainSeats());
  }

  toggleCarOffers() {
    this.carOnlyOffers.set(!this.carOnlyOffers());
  }

  toggleCarSuv() {
    this.carModelFilter.set(this.carModelFilter() === 'scorpio' ? 'all' : 'scorpio');
  }

  toggleCarTopRated() {
    this.carOnlyTopRated.set(!this.carOnlyTopRated());
  }

  setTimeFilter(time: 'all' | 'morning' | 'afternoon' | 'night') {
    this.departureTimeFilter.set(time);
  }

  setSort(type: 'bus' | 'car', sort: 'departure_asc' | 'departure_desc' | 'price_asc' | 'rating_desc') {
    if (type === 'bus') {
      this.busSort.set(sort);
    } else {
      this.carSort.set(sort);
    }
  }

  getSort(): 'departure_asc' | 'departure_desc' | 'price_asc' | 'rating_desc' {
    return this.activeTab() === 'buses' ? this.busSort() : this.carSort();
  }

  resetAllFilters() {
    this.busFilter.set('all');
    this.busSort.set('departure_asc');
    this.busOnlyOffers.set(false);
    this.busOnlyNewBuses.set(false);
    this.busOnlyTopRated.set(false);

    this.carModelFilter.set('all');
    this.carAcFilter.set('all');
    this.carSort.set('departure_asc');
    this.carOnlyOffers.set(false);
    this.carCaptainSeats.set(false);
    this.carOnlyTopRated.set(false);

    this.departureTimeFilter.set('all');
    this.boardingPointFilter.set('all');
    this.boardingSearchQuery.set('');
    this.transportFilter.set('all');
  }

  setBoardingPointFilter(point: string) {
    this.boardingPointFilter.set(point);
  }

  toggleBoardingPointFilter(point: string) {
    this.boardingPointFilter.set(this.boardingPointFilter() === point ? 'all' : point);
  }

  onBoardingSearchInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.boardingSearchQuery.set(val);
  }

  getMatchedBoardingLabel(points: { location: string; time: string; landmark?: string }[]): string {
    if (!points || points.length === 0) return 'Central Stand';
    const selected = this.boardingPointFilter();
    if (selected !== 'all') {
      const match = points.find(
        (p) =>
          p.location.toLowerCase().includes(selected.toLowerCase()) ||
          selected.toLowerCase().includes(p.location.toLowerCase()),
      );
      if (match) {
        return `${match.location} (${match.time})`;
      }
    }
    const firstTwo = points
      .slice(0, 2)
      .map((p) => `${p.location} (${p.time})`)
      .join(', ');
    return points.length > 2 ? `${firstTwo} +${points.length - 2} more` : firstTwo;
  }

}
