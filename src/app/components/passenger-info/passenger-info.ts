import {ChangeDetectionStrategy, Component, computed, inject, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {BookingState} from '../../services/booking-state';
import {Trip, SharedCarTrip, DestinationHotel} from '../../models/bus-booking.models';

@Component({
  selector: 'app-passenger-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] text-[#1b1b1b] pb-28 font-sans relative overflow-x-hidden">
      
      <!-- =============================================================== -->
      <!-- FULL-PAGE PASTEL PEACH-PINK-LAVENDER GRADIENT BACKDROP          -->
      <!-- (Applied across Bus, Car, and Hotel Passenger Info pages)       -->
      <!-- =============================================================== -->
      <div
        aria-hidden="true"
        class="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-br from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd]">
        <div class="w-full h-full bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.7),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.6),_transparent_60%),radial-gradient(circle_at_85%_80%,_rgba(199,210,254,0.7),_transparent_55%)]"></div>
      </div>

      <!-- =============================================================== -->
      <!-- TOP STICKY HEADER (Solid White Background + Sub-Header Tabs)    -->
      <!-- =============================================================== -->
      <header class="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)]">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2.5 flex items-center justify-between gap-3">
          
          <!-- Left: Back Arrow + Title + Route Subtitle -->
          <div class="flex items-center space-x-3.5 min-w-0">
            <button
              type="button"
              (click)="onBackClick()"
              title="Back"
              class="w-9 h-9 -ml-1.5 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[#1b1b1b] flex items-center justify-center cursor-pointer active:scale-90 transition-all shrink-0 shadow-2xs">
              <mat-icon class="text-[22px]">arrow_back</mat-icon>
            </button>

            <div class="min-w-0">
              <h1 class="text-[17px] sm:text-[18px] text-[#1b1b1b] truncate leading-tight">
                {{ state.activeBookingMode() === 'hotel' ? 'Guest & Stay Information' : 'Passenger Information' }}
              </h1>
              <p class="text-[13px] text-[#6b7280] truncate leading-tight mt-0.5">
                @if (activeHotel(); as hotel) {
                  {{ hotel.name }} &middot; {{ destinationCityName() }}
                } @else {
                  {{ sourceCityName() }} &rarr; {{ destinationCityName() }}
                }
              </p>
            </div>
          </div>

          <!-- Right: Mode Icon Badge (Bus vs Car vs Hotel vs Transport) -->
          <div
            [class.bg-[#ffe4e6]]="state.activeBookingMode() === 'bus' || !state.activeBookingMode()"
            [class.text-[#be123c]]="state.activeBookingMode() === 'bus' || !state.activeBookingMode()"
            [class.bg-[#e0e7ff]]="state.activeBookingMode() === 'car'"
            [class.text-[#4338ca]]="state.activeBookingMode() === 'car'"
            [class.bg-[#e0f2fe]]="state.activeBookingMode() === 'hotel'"
            [class.text-[#0284c7]]="state.activeBookingMode() === 'hotel'"
            [class.bg-[#fae8ff]]="state.activeBookingMode() === 'transport'"
            [class.text-[#a21caf]]="state.activeBookingMode() === 'transport'"
            class="w-9 h-9 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-center shrink-0">
            <mat-icon class="text-[18px]">
              {{ state.activeBookingMode() === 'car' ? 'directions_car' : state.activeBookingMode() === 'hotel' ? 'hotel' : state.activeBookingMode() === 'transport' ? 'local_shipping' : 'directions_bus' }}
            </mat-icon>
          </div>

        </div>

        <!-- Horizontal Stepper Bar (Result View Sub-Header Tab Design) -->
        @if (state.activeBookingMode() === 'hotel') {
          <div class="max-w-5xl mx-auto flex items-center border-t border-slate-200/80 bg-white">
            <!-- Step 1: Select Hotel -->
            <button
              type="button"
              (click)="state.backToResults()"
              class="w-1/2 py-2.5 px-3 text-xs sm:text-sm font-normal border-b-2 border-transparent text-slate-600 hover:bg-slate-50/60 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-[0.99] text-center truncate">
              <mat-icon class="text-base sm:text-lg shrink-0">hotel</mat-icon>
              <span class="truncate">1. Select Hotel</span>
            </button>

            <!-- Step 2: Guest & Payment Info (Active - Hotel Theme) -->
            <div class="w-1/2 py-2.5 px-3 text-xs sm:text-sm font-normal border-b-2 border-[#0284c7] text-[#0284c7] bg-sky-50/40 flex items-center justify-center space-x-2 text-center truncate">
              <mat-icon class="text-base sm:text-lg shrink-0">person</mat-icon>
              <span class="truncate">2. Guest Info</span>
            </div>
          </div>
        } @else {
          <div class="max-w-5xl mx-auto flex items-center border-t border-slate-200/80 bg-white">
            <!-- Step 1: Select seats -->
            <button
              type="button"
              (click)="state.backToSeatSelection()"
              class="w-1/3 py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-normal border-b-2 border-transparent text-slate-600 hover:bg-slate-50/60 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-[0.99] text-center truncate">
              <mat-icon class="text-sm sm:text-base shrink-0">event_seat</mat-icon>
              <span class="truncate">1. Select seats</span>
            </button>

            <!-- Step 2: Board/Drop point -->
            <button
              type="button"
              (click)="state.goToBoardingDropping()"
              class="w-1/3 py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-normal border-b-2 border-transparent text-slate-600 hover:bg-slate-50/60 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-[0.99] text-center truncate">
              <mat-icon class="text-sm sm:text-base shrink-0">pin_drop</mat-icon>
              <span class="truncate">2. Board/Drop</span>
            </button>

            <!-- Step 3: Passenger Info (Active - Bus, Car, or Transport Theme) -->
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
              <mat-icon class="text-sm sm:text-base shrink-0">person</mat-icon>
              <span class="truncate">3. Passenger Info</span>
            </div>
          </div>
        }
      </header>

      <!-- =============================================================== -->
      <!-- MAIN CONTENT: PASSENGER & CONTACT DETAILS CARDS                 -->
      <!-- =============================================================== -->
      <main class="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 space-y-4 relative z-10">
        
        <!-- ============================================================= -->
        <!-- CARD 1: SELECTED TRIP / STAY & BOARDING/DROPPING SUMMARY      -->
        <!-- ============================================================= -->
        <section
          aria-label="Trip and Boarding Dropping Summary"
          class="bg-white rounded-[22px] border border-slate-200/90 result-card-shadow p-5 space-y-4">
          
          <!-- Operator / Hotel & Date Header Row -->
          <div class="flex items-start justify-between gap-3 pb-3.5 border-b border-[#e5e7eb]">
            <div>
              <h2 class="text-[16px] text-[#1b1b1b] leading-snug">
                {{ operatorName() }}
              </h2>
              <p class="text-[12px] text-[#6b7280] mt-0.5">
                {{ vehicleSubtitle() }}
              </p>
            </div>

            <div class="text-right shrink-0">
              <div class="text-[13px] text-[#1b1b1b] tabular-nums">
                {{ formattedDate() }}
              </div>
              <div class="text-[12px] text-[#6b7280] mt-0.5">
                @if (activeHotel()) {
                  1 Room &middot; 2 Guests
                } @else {
                  {{ selectedSeatCount() }} {{ selectedSeatCount() === 1 ? 'Seat' : 'Seats' }} ({{ selectedSeatNumbers() }})
                }
              </div>
            </div>
          </div>

          @if (activeHotel(); as hotel) {
            <!-- Hotel Location & Check-In Summary -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div class="p-3.5 rounded-[22px] bg-[#fcfcfd] border border-slate-200/90">
                <span class="text-[11px] uppercase tracking-wider text-[#0284c7] block">
                  Hotel Location
                </span>
                <div class="text-[14px] text-[#1b1b1b] mt-1 leading-snug">
                  {{ hotel.location }}
                </div>
                <div class="text-[12px] text-[#6b7280] mt-0.5">
                  {{ hotel.terminalDistance }}
                </div>
              </div>

              <div class="p-3.5 rounded-[22px] bg-[#fcfcfd] border border-slate-200/90">
                <span class="text-[11px] uppercase tracking-wider text-[#0284c7] block">
                  Stay Highlights
                </span>
                <div class="text-[14px] text-[#1b1b1b] mt-1 leading-snug">
                  {{ hotel.tag }}
                </div>
                <div class="text-[12px] text-[#6b7280] mt-0.5">
                  Free Early Check-In &middot; Instant Confirmation
                </div>
              </div>
            </div>
          } @else {
            <!-- Boarding & Dropping Two-Column Summary -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <!-- Boarding Box -->
              <div class="p-3.5 rounded-[22px] bg-[#fcfcfd] border border-slate-200/90 flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <span class="text-[11px] uppercase tracking-wider text-[#6b7280] block">
                    Boarding Point
                  </span>
                  <div class="text-[14px] text-[#1b1b1b] truncate mt-1">
                    {{ state.selectedBoardingPoint()?.location || 'Not selected' }}
                  </div>
                  <div class="text-[12px] text-[#6b7280] tabular-nums mt-0.5">
                    {{ state.selectedBoardingPoint()?.time || '--:--' }} &middot; {{ sourceCityName() }}
                  </div>
                </div>
                <button
                  type="button"
                  (click)="state.goToBoardingDropping()"
                  [class.text-[#e11d48]]="state.activeBookingMode() !== 'car'"
                  [class.text-[#4f46e5]]="state.activeBookingMode() === 'car'"
                  class="text-[12px] hover:underline cursor-pointer shrink-0">
                  Change
                </button>
              </div>

              <!-- Dropping Box -->
              <div class="p-3.5 rounded-[22px] bg-[#fcfcfd] border border-slate-200/90 flex items-start justify-between gap-2">
                <div class="min-w-0">
                  <span class="text-[11px] uppercase tracking-wider text-[#6b7280] block">
                    Dropping Point
                  </span>
                  <div class="text-[14px] text-[#1b1b1b] truncate mt-1">
                    {{ state.selectedDroppingPoint()?.location || 'Not selected' }}
                  </div>
                  <div class="text-[12px] text-[#6b7280] tabular-nums mt-0.5">
                    {{ state.selectedDroppingPoint()?.time || '--:--' }} &middot; {{ destinationCityName() }}
                  </div>
                </div>
                <button
                  type="button"
                  (click)="state.goToBoardingDropping()"
                  [class.text-[#e11d48]]="state.activeBookingMode() !== 'car'"
                  [class.text-[#4f46e5]]="state.activeBookingMode() === 'car'"
                  class="text-[12px] hover:underline cursor-pointer shrink-0">
                  Change
                </button>
              </div>
            </div>
          }

        </section>

        <!-- ============================================================= -->
        <!-- CARD 2: PASSENGER / GUEST DETAILS FORM CARD                   -->
        <!-- ============================================================= -->
        <section
          aria-label="Passenger details"
          class="bg-white rounded-[22px] border border-slate-200/90 result-card-shadow p-5 space-y-4">
          
          <div class="flex items-center justify-between pb-3 border-b border-[#e5e7eb]">
            <div>
              <h2 class="text-[16px] text-[#1b1b1b] leading-snug">
                {{ activeHotel() ? 'Guest Details' : 'Passenger Details' }}
              </h2>
              <p class="text-[12px] text-[#6b7280] mt-0.5">
                {{ activeHotel() ? 'Enter primary guest details for hotel check-in' : 'Enter details exactly as on government ID proof' }}
              </p>
            </div>
            <span class="text-[12px] text-[#6b7280]">
              {{ state.passengers().length }} {{ activeHotel() ? 'Room' : state.passengers().length === 1 ? 'Passenger' : 'Passengers' }}
            </span>
          </div>

          <div class="space-y-4">
            @for (p of state.passengers(); track p.seatId; let idx = $index) {
              <div class="p-4 rounded-[22px] bg-[#fcfcfd] border border-slate-200/90 space-y-3.5">
                
                <!-- Passenger Header: Number + Seat Badge + Fare -->
                <div class="flex items-center justify-between pb-2.5 border-b border-[#e5e7eb]">
                  <div class="flex items-center space-x-2">
                    <span class="text-[14px] text-[#1b1b1b]">
                      {{ activeHotel() ? 'Primary Guest' : 'Passenger ' + (idx + 1) }}
                    </span>
                    <span
                      [class.bg-[#ffe4e6]]="state.activeBookingMode() === 'bus' || !state.activeBookingMode()"
                      [class.text-[#be123c]]="state.activeBookingMode() === 'bus' || !state.activeBookingMode()"
                      [class.bg-[#e0e7ff]]="state.activeBookingMode() === 'car'"
                      [class.text-[#4338ca]]="state.activeBookingMode() === 'car'"
                      [class.bg-[#e0f2fe]]="state.activeBookingMode() === 'hotel'"
                      [class.text-[#0284c7]]="state.activeBookingMode() === 'hotel'"
                      [class.bg-[#fae8ff]]="state.activeBookingMode() === 'transport'"
                      [class.text-[#a21caf]]="state.activeBookingMode() === 'transport'"
                      class="px-2.5 py-0.5 rounded-md text-[12px]">
                      {{ activeHotel() ? p.seatNumber : 'Seat ' + p.seatNumber }}
                    </span>
                  </div>
                  <span class="text-[13px] text-[#1b1b1b] tabular-nums">
                    ₹{{ formatPrice(p.fare) }}
                  </span>
                </div>

                <!-- Full Name Input -->
                <div>
                  <label [for]="'p-name-' + idx" class="block text-[12px] text-[#6b7280] mb-1">
                    Full Name
                  </label>
                  <input
                    [id]="'p-name-' + idx"
                    type="text"
                    [value]="p.name"
                    (input)="onNameInput(idx, $event)"
                    placeholder="Enter passenger full name"
                    [class.focus:border-[#e11d48]]="state.activeBookingMode() === 'bus' || !state.activeBookingMode()"
                    [class.focus:border-[#4f46e5]]="state.activeBookingMode() === 'car'"
                    [class.focus:border-[#0284c7]]="state.activeBookingMode() === 'hotel'"
                    [class.focus:border-[#7e22ce]]="state.activeBookingMode() === 'transport'"
                    class="w-full rounded-[22px] bg-[#fcfcfd] border border-slate-200/90 px-3.5 py-2.5 text-[14px] text-[#1b1b1b] placeholder-[#9ca3af] focus:outline-none transition-colors" />
                </div>

                <!-- Age & Gender Row -->
                <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  
                  <!-- Age Input -->
                  <div class="sm:col-span-4">
                    <label [for]="'p-age-' + idx" class="block text-[12px] text-[#6b7280] mb-1">
                      Age (Years)
                    </label>
                    <input
                      [id]="'p-age-' + idx"
                      type="number"
                      min="1"
                      max="120"
                      [value]="p.age"
                      (input)="onAgeInput(idx, $event)"
                      placeholder="Age"
                      [class.focus:border-[#e11d48]]="state.activeBookingMode() === 'bus' || !state.activeBookingMode()"
                      [class.focus:border-[#4f46e5]]="state.activeBookingMode() === 'car'"
                      [class.focus:border-[#0284c7]]="state.activeBookingMode() === 'hotel'"
                      [class.focus:border-[#7e22ce]]="state.activeBookingMode() === 'transport'"
                      class="w-full rounded-[22px] bg-[#fcfcfd] border border-slate-200/90 px-3.5 py-2.5 text-[14px] text-[#1b1b1b] placeholder-[#9ca3af] focus:outline-none transition-colors tabular-nums" />
                  </div>

                  <!-- Gender Selector Pills -->
                  <div class="sm:col-span-8">
                    <span class="block text-[12px] text-[#6b7280] mb-1">
                      Gender
                    </span>
                    <div class="grid grid-cols-2 gap-2.5">
                      <!-- Male Pill -->
                      <button
                        type="button"
                        (click)="setGender(idx, 'male')"
                        [class.border-[#e11d48]]="p.gender === 'male' && (state.activeBookingMode() === 'bus' || !state.activeBookingMode())"
                        [class.bg-[#fff8f8]]="p.gender === 'male' && (state.activeBookingMode() === 'bus' || !state.activeBookingMode())"
                        [class.border-[#4f46e5]]="p.gender === 'male' && state.activeBookingMode() === 'car'"
                        [class.bg-indigo-50/60]="p.gender === 'male' && state.activeBookingMode() === 'car'"
                        [class.border-[#0284c7]]="p.gender === 'male' && state.activeBookingMode() === 'hotel'"
                        [class.bg-sky-50/60]="p.gender === 'male' && state.activeBookingMode() === 'hotel'"
                        [class.border-[#7e22ce]]="p.gender === 'male' && state.activeBookingMode() === 'transport'"
                        [class.bg-fuchsia-50/60]="p.gender === 'male' && state.activeBookingMode() === 'transport'"
                        [class.border-slate-200/90]="p.gender !== 'male'"
                        [class.bg-[#fcfcfd]]="p.gender !== 'male'"
                        class="px-3.5 py-2.5 rounded-[22px] border flex items-center justify-between cursor-pointer transition-colors">
                        <span class="text-[14px] text-[#1b1b1b]">Male</span>
                        <span
                          [class.border-[#e11d48]]="p.gender === 'male' && (state.activeBookingMode() === 'bus' || !state.activeBookingMode())"
                          [class.border-[#4f46e5]]="p.gender === 'male' && state.activeBookingMode() === 'car'"
                          [class.border-[#0284c7]]="p.gender === 'male' && state.activeBookingMode() === 'hotel'"
                          [class.border-[#7e22ce]]="p.gender === 'male' && state.activeBookingMode() === 'transport'"
                          [class.border-[#6b7280]]="p.gender !== 'male'"
                          class="w-4 h-4 rounded-full border-2 flex items-center justify-center">
                          @if (p.gender === 'male') {
                            <span
                              [class.bg-[#e11d48]]="state.activeBookingMode() === 'bus' || !state.activeBookingMode()"
                              [class.bg-[#4f46e5]]="state.activeBookingMode() === 'car'"
                              [class.bg-[#0284c7]]="state.activeBookingMode() === 'hotel'"
                              [class.bg-[#7e22ce]]="state.activeBookingMode() === 'transport'"
                              class="w-2 h-2 rounded-full">
                            </span>
                          }
                        </span>
                      </button>

                      <!-- Female Pill -->
                      <button
                        type="button"
                        (click)="setGender(idx, 'female')"
                        [class.border-[#e11d48]]="p.gender === 'female' && (state.activeBookingMode() === 'bus' || !state.activeBookingMode())"
                        [class.bg-[#fff8f8]]="p.gender === 'female' && (state.activeBookingMode() === 'bus' || !state.activeBookingMode())"
                        [class.border-[#4f46e5]]="p.gender === 'female' && state.activeBookingMode() === 'car'"
                        [class.bg-indigo-50/60]="p.gender === 'female' && state.activeBookingMode() === 'car'"
                        [class.border-[#0284c7]]="p.gender === 'female' && state.activeBookingMode() === 'hotel'"
                        [class.bg-sky-50/60]="p.gender === 'female' && state.activeBookingMode() === 'hotel'"
                        [class.border-[#7e22ce]]="p.gender === 'female' && state.activeBookingMode() === 'transport'"
                        [class.bg-fuchsia-50/60]="p.gender === 'female' && state.activeBookingMode() === 'transport'"
                        [class.border-slate-200/90]="p.gender !== 'female'"
                        [class.bg-[#fcfcfd]]="p.gender !== 'female'"
                        class="px-3.5 py-2.5 rounded-[22px] border flex items-center justify-between cursor-pointer transition-colors">
                        <span class="text-[14px] text-[#1b1b1b]">Female</span>
                        <span
                          [class.border-[#e11d48]]="p.gender === 'female' && (state.activeBookingMode() === 'bus' || !state.activeBookingMode())"
                          [class.border-[#4f46e5]]="p.gender === 'female' && state.activeBookingMode() === 'car'"
                          [class.border-[#0284c7]]="p.gender === 'female' && state.activeBookingMode() === 'hotel'"
                          [class.border-[#7e22ce]]="p.gender === 'female' && state.activeBookingMode() === 'transport'"
                          [class.border-[#6b7280]]="p.gender !== 'female'"
                          class="w-4 h-4 rounded-full border-2 flex items-center justify-center">
                          @if (p.gender === 'female') {
                            <span
                              [class.bg-[#e11d48]]="state.activeBookingMode() === 'bus' || !state.activeBookingMode()"
                              [class.bg-[#4f46e5]]="state.activeBookingMode() === 'car'"
                              [class.bg-[#0284c7]]="state.activeBookingMode() === 'hotel'"
                              [class.bg-[#7e22ce]]="state.activeBookingMode() === 'transport'"
                              class="w-2 h-2 rounded-full">
                            </span>
                          }
                        </span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            }
          </div>
        </section>

        <!-- ============================================================= -->
        <!-- CARD 3: CONTACT DETAILS CARD                                  -->
        <!-- ============================================================= -->
        <section
          aria-label="Contact details"
          class="bg-white rounded-[22px] border border-slate-200/90 result-card-shadow p-5 space-y-4">
          
          <div>
            <h2 class="text-[16px] text-[#1b1b1b] leading-snug">
              Contact details
            </h2>
            <p class="text-[12px] text-[#6b7280] mt-0.5">
              Ticket details will be sent to your email and mobile number
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label for="contact-email" class="block text-[12px] text-[#6b7280] mb-1">
                Email ID
              </label>
              <input
                id="contact-email"
                type="email"
                [value]="state.currentUser().email"
                (input)="onEmailInput($event)"
                placeholder="passenger@example.com"
                [class.focus:border-[#e11d48]]="state.activeBookingMode() === 'bus' || !state.activeBookingMode()"
                [class.focus:border-[#4f46e5]]="state.activeBookingMode() === 'car'"
                [class.focus:border-[#0284c7]]="state.activeBookingMode() === 'hotel'"
                [class.focus:border-[#7e22ce]]="state.activeBookingMode() === 'transport'"
                class="w-full rounded-[22px] bg-[#fcfcfd] border border-slate-200/90 px-3.5 py-2.5 text-[14px] text-[#1b1b1b] placeholder-[#9ca3af] focus:outline-none transition-colors" />
            </div>

            <div>
              <label for="contact-phone" class="block text-[12px] text-[#6b7280] mb-1">
                Mobile Number
              </label>
              <input
                id="contact-phone"
                type="tel"
                [value]="state.currentUser().phone"
                (input)="onPhoneInput($event)"
                placeholder="+91 98765 43210"
                [class.focus:border-[#e11d48]]="state.activeBookingMode() === 'bus' || !state.activeBookingMode()"
                [class.focus:border-[#4f46e5]]="state.activeBookingMode() === 'car'"
                [class.focus:border-[#0284c7]]="state.activeBookingMode() === 'hotel'"
                [class.focus:border-[#7e22ce]]="state.activeBookingMode() === 'transport'"
                class="w-full rounded-[22px] bg-[#fcfcfd] border border-slate-200/90 px-3.5 py-2.5 text-[14px] text-[#1b1b1b] placeholder-[#9ca3af] focus:outline-none transition-colors" />
            </div>
          </div>
        </section>

        <!-- ============================================================= -->
        <!-- CARD 4: OFFERS & PAYMENT METHOD                               -->
        <!-- ============================================================= -->
        <section
          aria-label="Offers and Payment Option"
          class="bg-white rounded-[22px] border border-slate-200/90 result-card-shadow p-5 space-y-4">
          
          <!-- Coupon Row -->
          <div class="flex items-center justify-between pb-3.5 border-b border-[#e5e7eb]">
            @if (state.appliedCoupon(); as c) {
              <div class="flex items-center space-x-2">
                <mat-icon class="text-[18px] text-[#15803d]">local_offer</mat-icon>
                <div>
                  <span class="text-[14px] text-[#15803d] block">
                    Coupon {{ c.code }} applied (-₹{{ c.discount }})
                  </span>
                  <span class="text-[12px] text-[#6b7280]">{{ c.title }}</span>
                </div>
              </div>
              <button
                type="button"
                (click)="state.removeCoupon()"
                [class.text-[#e11d48]]="state.activeBookingMode() === 'bus' || !state.activeBookingMode()"
                [class.text-[#4f46e5]]="state.activeBookingMode() === 'car'"
                [class.text-[#0284c7]]="state.activeBookingMode() === 'hotel'"
                [class.text-[#7e22ce]]="state.activeBookingMode() === 'transport'"
                class="text-[13px] hover:underline cursor-pointer">
                Remove
              </button>
            } @else {
              <div class="flex items-center space-x-2">
                <mat-icon
                  [class.text-[#e11d48]]="state.activeBookingMode() === 'bus' || !state.activeBookingMode()"
                  [class.text-[#4f46e5]]="state.activeBookingMode() === 'car'"
                  [class.text-[#0284c7]]="state.activeBookingMode() === 'hotel'"
                  [class.text-[#7e22ce]]="state.activeBookingMode() === 'transport'"
                  class="text-[18px]">
                  local_offer
                </mat-icon>
                <span class="text-[14px] text-[#1b1b1b]">Have a coupon code?</span>
              </div>
              <button
                type="button"
                (click)="state.isCouponModalOpen.set(true)"
                [class.text-[#e11d48]]="state.activeBookingMode() === 'bus' || !state.activeBookingMode()"
                [class.text-[#4f46e5]]="state.activeBookingMode() === 'car'"
                [class.text-[#0284c7]]="state.activeBookingMode() === 'hotel'"
                [class.text-[#7e22ce]]="state.activeBookingMode() === 'transport'"
                class="text-[13px] hover:underline cursor-pointer flex items-center space-x-0.5">
                <span>Apply Coupon</span>
                <mat-icon class="text-[16px]">chevron_right</mat-icon>
              </button>
            }
          </div>

          <!-- Payment Method Selection -->
          <div>
            <h3 class="text-[14px] text-[#1b1b1b] mb-2.5">
              Payment Method
            </h3>
            <div class="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                (click)="selectedPaymentMethod.set('UPI')"
                [class.border-[#e11d48]]="selectedPaymentMethod() === 'UPI' && (state.activeBookingMode() === 'bus' || !state.activeBookingMode())"
                [class.bg-[#fff8f8]]="selectedPaymentMethod() === 'UPI' && (state.activeBookingMode() === 'bus' || !state.activeBookingMode())"
                [class.border-[#4f46e5]]="selectedPaymentMethod() === 'UPI' && state.activeBookingMode() === 'car'"
                [class.bg-indigo-50/60]="selectedPaymentMethod() === 'UPI' && state.activeBookingMode() === 'car'"
                [class.border-[#0284c7]]="selectedPaymentMethod() === 'UPI' && state.activeBookingMode() === 'hotel'"
                [class.bg-sky-50/60]="selectedPaymentMethod() === 'UPI' && state.activeBookingMode() === 'hotel'"
                [class.border-[#7e22ce]]="selectedPaymentMethod() === 'UPI' && state.activeBookingMode() === 'transport'"
                [class.bg-fuchsia-50/60]="selectedPaymentMethod() === 'UPI' && state.activeBookingMode() === 'transport'"
                [class.border-slate-200/90]="selectedPaymentMethod() !== 'UPI'"
                [class.bg-[#fcfcfd]]="selectedPaymentMethod() !== 'UPI'"
                class="p-3 rounded-[22px] border flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
                <mat-icon class="text-[20px] text-[#1b1b1b]">qr_code_2</mat-icon>
                <span class="text-[13px] text-[#1b1b1b]">UPI</span>
              </button>

              <button
                type="button"
                (click)="selectedPaymentMethod.set('Card')"
                [class.border-[#e11d48]]="selectedPaymentMethod() === 'Card' && (state.activeBookingMode() === 'bus' || !state.activeBookingMode())"
                [class.bg-[#fff8f8]]="selectedPaymentMethod() === 'Card' && (state.activeBookingMode() === 'bus' || !state.activeBookingMode())"
                [class.border-[#4f46e5]]="selectedPaymentMethod() === 'Card' && state.activeBookingMode() === 'car'"
                [class.bg-indigo-50/60]="selectedPaymentMethod() === 'Card' && state.activeBookingMode() === 'car'"
                [class.border-[#0284c7]]="selectedPaymentMethod() === 'Card' && state.activeBookingMode() === 'hotel'"
                [class.bg-sky-50/60]="selectedPaymentMethod() === 'Card' && state.activeBookingMode() === 'hotel'"
                [class.border-[#7e22ce]]="selectedPaymentMethod() === 'Card' && state.activeBookingMode() === 'transport'"
                [class.bg-fuchsia-50/60]="selectedPaymentMethod() === 'Card' && state.activeBookingMode() === 'transport'"
                [class.border-slate-200/90]="selectedPaymentMethod() !== 'Card'"
                [class.bg-[#fcfcfd]]="selectedPaymentMethod() !== 'Card'"
                class="p-3 rounded-[22px] border flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
                <mat-icon class="text-[20px] text-[#1b1b1b]">credit_card</mat-icon>
                <span class="text-[13px] text-[#1b1b1b]">Card</span>
              </button>

              <button
                type="button"
                (click)="selectedPaymentMethod.set('NetBanking')"
                [class.border-[#e11d48]]="selectedPaymentMethod() === 'NetBanking' && (state.activeBookingMode() === 'bus' || !state.activeBookingMode())"
                [class.bg-[#fff8f8]]="selectedPaymentMethod() === 'NetBanking' && (state.activeBookingMode() === 'bus' || !state.activeBookingMode())"
                [class.border-[#4f46e5]]="selectedPaymentMethod() === 'NetBanking' && state.activeBookingMode() === 'car'"
                [class.bg-indigo-50/60]="selectedPaymentMethod() === 'NetBanking' && state.activeBookingMode() === 'car'"
                [class.border-[#0284c7]]="selectedPaymentMethod() === 'NetBanking' && state.activeBookingMode() === 'hotel'"
                [class.bg-sky-50/60]="selectedPaymentMethod() === 'NetBanking' && state.activeBookingMode() === 'hotel'"
                [class.border-[#7e22ce]]="selectedPaymentMethod() === 'NetBanking' && state.activeBookingMode() === 'transport'"
                [class.bg-fuchsia-50/60]="selectedPaymentMethod() === 'NetBanking' && state.activeBookingMode() === 'transport'"
                [class.border-slate-200/90]="selectedPaymentMethod() !== 'NetBanking'"
                [class.bg-[#fcfcfd]]="selectedPaymentMethod() !== 'NetBanking'"
                class="p-3 rounded-[22px] border flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
                <mat-icon class="text-[20px] text-[#1b1b1b]">account_balance</mat-icon>
                <span class="text-[13px] text-[#1b1b1b]">NetBanking</span>
              </button>
            </div>
          </div>

        </section>

      </main>

      <!-- =============================================================== -->
      <!-- STICKY BOTTOM PAY BAR (Bus / Car / Hotel Gradient CTA)          -->
      <!-- =============================================================== -->
      <footer class="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-[#e5e7eb] shadow-[0_-4px_20px_rgba(15,23,42,0.06)]">
        <div class="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
          <div>
            <span class="text-[11px] uppercase tracking-wider text-[#6b7280] block">
              Total Payable
            </span>
            <div class="text-[20px] text-[#1b1b1b] tabular-nums leading-tight">
              ₹{{ formatPrice(totalPayable()) }}
            </div>
          </div>

          <button
            type="button"
            (click)="confirmAndPay()"
            [disabled]="isProcessing()"
            [class.from-[#e11d48]]="state.activeBookingMode() === 'bus' || !state.activeBookingMode()"
            [class.via-[#f43f5e]]="state.activeBookingMode() === 'bus' || !state.activeBookingMode()"
            [class.to-[#fb923c]]="state.activeBookingMode() === 'bus' || !state.activeBookingMode()"
            [class.from-[#4f46e5]]="state.activeBookingMode() === 'car'"
            [class.via-[#6366f1]]="state.activeBookingMode() === 'car'"
            [class.to-[#9333ea]]="state.activeBookingMode() === 'car'"
            [class.from-[#0284c7]]="state.activeBookingMode() === 'hotel'"
            [class.via-[#0ea5e9]]="state.activeBookingMode() === 'hotel'"
            [class.to-[#38bdf8]]="state.activeBookingMode() === 'hotel'"
            [class.from-[#7e22ce]]="state.activeBookingMode() === 'transport'"
            [class.via-[#a21caf]]="state.activeBookingMode() === 'transport'"
            [class.to-[#db2777]]="state.activeBookingMode() === 'transport'"
            class="px-7 py-3 rounded-[22px] bg-gradient-to-r disabled:opacity-50 text-white text-[14px] cursor-pointer active:scale-95 transition-all flex items-center space-x-1.5 shadow-sm">
            @if (isProcessing()) {
              <mat-icon class="text-[18px] animate-spin text-white">autorenew</mat-icon>
              <span>Processing...</span>
            } @else {
              <span>Proceed to pay</span>
            }
          </button>

        </div>
      </footer>

    </div>
  `,
})
export class PassengerInfo {
  readonly state = inject(BookingState);

  readonly selectedPaymentMethod = signal<'UPI' | 'Card' | 'NetBanking'>('UPI');
  readonly isProcessing = signal<boolean>(false);

  readonly activeTrip = computed<Trip | null>(() =>
    this.state.activeBookingMode() === 'bus' ? this.state.selectedTrip() : null,
  );
  readonly activeCar = computed<SharedCarTrip | null>(() =>
    this.state.activeBookingMode() === 'car' ? this.state.selectedSharedCarTrip() : null,
  );
  readonly activeTransport = computed<SharedCarTrip | null>(() =>
    this.state.activeBookingMode() === 'transport' ? this.state.selectedTransportTrip() : null,
  );
  readonly activeHotel = computed<DestinationHotel | null>(() =>
    this.state.activeBookingMode() === 'hotel' ? this.state.selectedHotelForBooking() : null,
  );

  readonly operatorName = computed(() => {
    if (this.activeHotel()) {
      return this.activeHotel()!.name;
    }
    return (
      this.activeTrip()?.bus.operatorName ||
      this.activeCar()?.operatorName ||
      this.activeTransport()?.operatorName ||
      'Express Transit'
    );
  });

  readonly vehicleSubtitle = computed(() => {
    if (this.activeHotel()) {
      return `${this.activeHotel()!.cityName} · ${this.activeHotel()!.terminalDistance}`;
    }
    if (this.activeTrip()) {
      return this.activeTrip()!.bus.busType;
    }
    if (this.activeCar()) {
      return `${this.activeCar()!.vehicleName} · Shared Cab`;
    }
    if (this.activeTransport()) {
      return `${this.activeTransport()!.vehicleName} · Transport Vehicle`;
    }
    return '';
  });

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
    if (this.activeHotel()) {
      return this.activeHotel()!.cityName || this.state.destinationCity().name;
    }
    return (
      this.activeTrip()?.destinationCityName ||
      this.activeCar()?.destinationCityName ||
      this.activeTransport()?.destinationCityName ||
      this.state.destinationCity().name ||
      'Destination City'
    );
  });

  readonly formattedDate = computed(() => {
    const dStr = this.activeTrip()?.date || this.activeCar()?.date || this.activeTransport()?.date || this.state.travelDate();
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    } catch {
      return dStr;
    }
  });

  readonly selectedSeatCount = computed(() => {
    if (this.activeHotel()) {
      return 1;
    }
    if (this.activeTrip()) {
      return this.state.selectedSeats().length;
    }
    if (this.activeCar()) {
      return this.state.selectedCarSeatIds().length;
    }
    if (this.activeTransport()) {
      return this.state.selectedTransportSeatIds().length;
    }
    return 0;
  });

  readonly selectedSeatNumbers = computed(() => {
    if (this.activeHotel()) {
      return 'Room 1';
    }
    if (this.activeTrip()) {
      return this.state.selectedSeats().map((s) => s.seatNumber).join(', ');
    }
    if (this.activeCar()) {
      const car = this.activeCar()!;
      return this.state
        .selectedCarSeatIds()
        .map((id) => car.seats.find((s) => s.id === id)?.seatNumber || id)
        .join(', ');
    }
    if (this.activeTransport()) {
      const tr = this.activeTransport()!;
      return this.state
        .selectedTransportSeatIds()
        .map((id) => tr.seats.find((s) => s.id === id)?.seatNumber || id)
        .join(', ');
    }
    return 'None';
  });

  readonly baseFareTotal = computed(() => {
    if (this.activeHotel()) {
      return this.activeHotel()!.discountedPrice;
    }
    if (this.activeTrip()) {
      return this.state.totalBasePrice();
    }
    if (this.activeCar()) {
      const car = this.activeCar()!;
      return this.state.selectedCarSeatIds().reduce((sum, id) => {
        const s = car.seats.find((seat) => seat.id === id);
        return sum + (s?.price || car.baseFare || 650);
      }, 0);
    }
    if (this.activeTransport()) {
      const tr = this.activeTransport()!;
      return this.state.selectedTransportSeatIds().reduce((sum, id) => {
        const s = tr.seats.find((seat) => seat.id === id);
        return sum + (s?.price || tr.baseFare || 650);
      }, 0);
    }
    return 0;
  });

  readonly totalPayable = computed(() => {
    if (this.activeTrip()) {
      return this.state.finalPayable();
    }
    const base = this.baseFareTotal();
    const discount = this.state.appliedCoupon()?.discount || 0;
    return Math.max(0, base - discount);
  });

  onBackClick() {
    if (this.state.activeBookingMode() === 'hotel') {
      this.state.backToResults();
    } else {
      this.state.goToBoardingDropping();
    }
  }

  onNameInput(idx: number, e: Event) {
    const name = (e.target as HTMLInputElement).value;
    this.state.updatePassenger(idx, 'name', name);
  }

  onAgeInput(idx: number, e: Event) {
    const age = parseInt((e.target as HTMLInputElement).value, 10) || 0;
    this.state.updatePassenger(idx, 'age', age);
  }

  setGender(idx: number, gender: 'male' | 'female') {
    this.state.updatePassenger(idx, 'gender', gender);
  }

  onEmailInput(e: Event) {
    const email = (e.target as HTMLInputElement).value;
    this.state.currentUser.update((u) => ({ ...u, email }));
  }

  onPhoneInput(e: Event) {
    const phone = (e.target as HTMLInputElement).value;
    this.state.currentUser.update((u) => ({ ...u, phone }));
  }

  confirmAndPay() {
    const invalidPassenger = this.state.passengers().find((p) => !p.name.trim() || p.age <= 0);
    if (invalidPassenger) {
      this.state.showToast('Please enter valid name and age to proceed', 'warning');
      return;
    }

    this.isProcessing.set(true);

    if (this.activeHotel()) {
      const hotel = this.activeHotel()!;
      const primaryGuest = this.state.passengers()[0];
      setTimeout(() => {
        this.state.bookHotelStay(hotel, {
          name: primaryGuest?.name || this.state.currentUser().fullName,
          phone: this.state.currentUser().phone,
          checkInDate: this.state.travelDate(),
        });
        this.isProcessing.set(false);
        this.state.selectedHotelForBooking.set(null);
      }, 500);
      return;
    }

    if (this.activeTransport()) {
      const tr = this.activeTransport()!;
      const bp = this.state.selectedBoardingPoint()?.id || tr.boardingPoints[0]?.id || '';
      const dp = this.state.selectedDroppingPoint()?.id || tr.droppingPoints[0]?.id || '';
      setTimeout(() => {
        this.state.bookTransportTrip({
          transportId: tr.id,
          boardingPointId: bp,
          droppingPointId: dp,
          passengers: this.state.passengers(),
          totalFare: this.totalPayable(),
          couponCode: this.state.appliedCoupon()?.code,
          discountAmount: this.state.appliedCoupon()?.discount || 0,
        });
        this.isProcessing.set(false);
      }, 450);
      return;
    }

    if (this.activeCar()) {
      const car = this.activeCar()!;
      const bp = this.state.selectedBoardingPoint()?.id || car.boardingPoints[0]?.id || '';
      const dp = this.state.selectedDroppingPoint()?.id || car.droppingPoints[0]?.id || '';
      this.state.bookSharedCarTrip(
        {
          tripId: car.id,
          seatIds: this.state.selectedCarSeatIds(),
          passengers: this.state.passengers().map((p) => ({
            seatId: p.seatId,
            seatNumber: p.seatNumber,
            name: p.name,
            age: p.age,
            gender: p.gender,
            fare: p.fare,
          })),
          selectedBoardingPointId: bp,
          selectedDroppingPointId: dp,
        },
        () => {
          this.isProcessing.set(false);
          this.state.selectedSharedCarTrip.set(null);
          this.state.selectedCarSeatIds.set([]);
        },
        () => {
          this.isProcessing.set(false);
        },
      );
      return;
    }

    setTimeout(() => {
      this.state.confirmBooking(this.selectedPaymentMethod());
      this.isProcessing.set(false);
    }, 600);
  }

  formatPrice(val: number): string {
    return Math.round(val).toLocaleString('en-IN');
  }
}
