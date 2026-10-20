import {ChangeDetectionStrategy, Component, inject, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {BookingState} from '../../services/booking-state';
import {CuratedTourTrip} from '../../models/bus-booking.models';

@Component({
  selector: 'app-trip-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-[#f8fafc] relative overflow-x-hidden space-y-3 pb-16 text-[#1f2937] font-sans">
      
      <!-- =============================================================== -->
      <!-- HOME PAGE PASTEL PEACH-PINK-LAVENDER GRADIENT BACKDROP          -->
      <!-- =============================================================== -->
      <div class="absolute top-0 inset-x-0 h-[230px] bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] rounded-b-[32px] pointer-events-none z-0 overflow-hidden shadow-[0_8px_28px_rgba(15,23,42,0.04)]">
        <div class="absolute -top-12 -left-10 w-64 h-64 rounded-full bg-[#fcd5b5]/60 blur-3xl"></div>
        <div class="absolute top-4 left-1/3 w-72 h-72 rounded-full bg-[#f9d8e8]/70 blur-3xl"></div>
        <div class="absolute -bottom-10 -right-10 w-72 h-72 rounded-full bg-[#d0dffe]/80 blur-3xl"></div>
      </div>

      <!-- Minimalist Compact Header -->
      <section class="relative z-10 pt-4 pb-3 sm:pt-6 sm:pb-4 px-3 sm:px-6 text-center overflow-hidden">
        <div class="max-w-2xl mx-auto">
          <h1 class="text-2xl sm:text-3xl font-normal tracking-tight text-[#0f172a]">
            Curated Tours & Getaways
          </h1>
          <p class="text-xs text-slate-600 font-normal mt-1">Handpicked holiday tour packages with transit & accommodation included</p>
        </div>
      </section>

      <!-- Main Content Container -->
      <div class="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 space-y-3">

        <!-- Theme Filter Chips -->
        <div class="flex items-center space-x-1.5 overflow-x-auto py-1 text-xs font-normal scrollbar-none">
          <button
            type="button"
            (click)="selectedCategory.set('all')"
            [class]="selectedCategory() === 'all'
              ? 'bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#14b8a6] text-white border-transparent shadow-[0_4px_12px_rgba(16,185,129,0.25)]'
              : 'bg-white/95 text-slate-700 border-slate-200/90 hover:border-[#10b981]/50'"
            class="px-3 py-1.5 rounded-[14px] border transition-all cursor-pointer text-xs shrink-0 active:scale-95">
            All ({{ state.tourTrips().length }})
          </button>
          <button
            type="button"
            (click)="selectedCategory.set('beach')"
            [class]="selectedCategory() === 'beach'
              ? 'bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#14b8a6] text-white border-transparent shadow-[0_4px_12px_rgba(16,185,129,0.25)]'
              : 'bg-white/95 text-slate-700 border-slate-200/90 hover:border-[#10b981]/50'"
            class="px-3 py-1.5 rounded-[14px] border transition-all cursor-pointer text-xs shrink-0 active:scale-95">
            Beach
          </button>
          <button
            type="button"
            (click)="selectedCategory.set('hill_station')"
            [class]="selectedCategory() === 'hill_station'
              ? 'bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#14b8a6] text-white border-transparent shadow-[0_4px_12px_rgba(16,185,129,0.25)]'
              : 'bg-white/95 text-slate-700 border-slate-200/90 hover:border-[#10b981]/50'"
            class="px-3 py-1.5 rounded-[14px] border transition-all cursor-pointer text-xs shrink-0 active:scale-95">
            Hills
          </button>
          <button
            type="button"
            (click)="selectedCategory.set('weekend')"
            [class]="selectedCategory() === 'weekend'
              ? 'bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#14b8a6] text-white border-transparent shadow-[0_4px_12px_rgba(16,185,129,0.25)]'
              : 'bg-white/95 text-slate-700 border-slate-200/90 hover:border-[#10b981]/50'"
            class="px-3 py-1.5 rounded-[14px] border transition-all cursor-pointer text-xs shrink-0 active:scale-95">
            Weekend
          </button>
          <button
            type="button"
            (click)="selectedCategory.set('heritage')"
            [class]="selectedCategory() === 'heritage'
              ? 'bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#14b8a6] text-white border-transparent shadow-[0_4px_12px_rgba(16,185,129,0.25)]'
              : 'bg-white/95 text-slate-700 border-slate-200/90 hover:border-[#10b981]/50'"
            class="px-3 py-1.5 rounded-[14px] border transition-all cursor-pointer text-xs shrink-0 active:scale-95">
            Heritage
          </button>
        </div>

        <!-- Tour Trips Responsive Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
          @for (tour of filteredTours(); track tour.id) {
            <div class="bg-white rounded-[22px] border border-slate-200/80 shadow-[0_14px_34px_rgba(15,23,42,0.06)] hover:border-[#10b981]/40 transition-all flex flex-col justify-between overflow-hidden text-[#1f2937]">
              
              <!-- Card Body -->
              <div class="p-3 sm:p-4 space-y-2.5">
                
                <!-- Duration & Rating -->
                <div class="flex items-center justify-between text-xs">
                  <span class="text-[11px] font-normal text-[#047857] bg-[#d1fae5] px-2 py-0.5 rounded-[8px] border border-[#a7f3d0]">
                    {{ tour.durationDays }}D / {{ tour.durationNights }}N
                  </span>

                  <div class="inline-flex items-center gap-0.5 bg-[#10b981] text-white px-1.5 py-0.5 rounded-[8px] text-[10px] font-normal leading-none">
                    <span class="text-[8px] leading-none">★</span>
                    <span class="text-[10px] leading-none text-white font-normal">{{ tour.rating }}</span>
                  </div>
                </div>

                <!-- Big Title -->
                <div>
                  <h3 class="text-sm sm:text-base font-normal text-[#0f172a] truncate leading-snug">
                    {{ tour.title }}
                  </h3>
                  <p class="text-[11px] text-slate-500 truncate mt-0.5">
                    {{ tour.subtitle }}
                  </p>
                </div>

                <!-- Features summary -->
                <div class="bg-slate-50 p-2 rounded-[14px] border border-slate-100 text-[11px] text-slate-700 flex items-center justify-between">
                  <span class="truncate">{{ tour.travelMode }}</span>
                  <span class="text-slate-300">·</span>
                  <span class="truncate">{{ tour.hotelType }}</span>
                </div>

              </div>

              <!-- Price & Book Footer -->
              <div class="p-2.5 sm:p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span class="text-sm sm:text-base font-normal text-slate-900 tabular-nums block leading-none">₹{{ tour.basePrice }}</span>
                  <span class="text-[10px] text-slate-500">per person</span>
                </div>

                <button
                  type="button"
                  (click)="openItineraryModal(tour)"
                  class="px-3.5 py-1.5 rounded-[12px] bg-gradient-to-r from-[#10b981] via-[#34d399] to-[#14b8a6] shadow-[0_4px_12px_rgba(16,185,129,0.24)] text-white font-normal text-xs transition-all cursor-pointer active:scale-95">
                  <span>Itinerary</span>
                </button>
              </div>

            </div>
          }
        </div>

      </div>

      <!-- Itinerary & Booking Modal -->
      @if (activeTour(); as tour) {
        <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div class="bg-white text-slate-800 rounded-[30px] max-w-sm sm:max-w-md w-full max-h-[85vh] overflow-y-auto border border-slate-200/90 shadow-[0_24px_60px_rgba(15,23,42,0.22)] animate-slide-up">
            
            <!-- Home Page Pastel Peach-Pink-Lavender Modal Header -->
            <div class="p-4 sm:p-5 border-b border-white/80 flex items-start justify-between bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] relative overflow-hidden">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)] pointer-events-none"></div>
              <div class="relative z-10 flex items-center space-x-2.5 min-w-0">
                <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#059669] via-[#10b981] to-[#14b8a6] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <mat-icon class="text-base text-white">landscape</mat-icon>
                </div>
                <div class="min-w-0">
                  <span class="text-[10px] uppercase font-normal text-[#047857] tracking-wider block">Holiday Package</span>
                  <h3 class="text-base sm:text-lg font-normal text-slate-900 mt-0.5 truncate">{{ tour.title }}</h3>
                  <p class="text-xs text-slate-600">{{ tour.durationDays }} Days · {{ tour.durationNights }} Nights</p>
                </div>
              </div>

              <button
                type="button"
                (click)="activeTour.set(null)"
                class="relative z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center cursor-pointer transition-colors border border-slate-200/80 shrink-0">
                <mat-icon class="text-sm">close</mat-icon>
              </button>
            </div>

            <!-- Day by Day Itinerary -->
            <div class="p-4 sm:p-5 space-y-3.5">
              <h4 class="text-xs font-normal uppercase tracking-wider text-slate-900">Schedule</h4>
              <div class="space-y-2">
                @for (day of tour.itinerary; track day.day) {
                  <div class="p-3 bg-[#fcfcfd] rounded-[22px] border border-slate-200/80 space-y-1 text-xs text-slate-800">
                    <div class="font-normal text-slate-900 flex items-center space-x-2">
                      <span class="w-5 h-5 rounded-full bg-gradient-to-br from-[#059669] via-[#10b981] to-[#14b8a6] text-white text-[10px] font-normal flex items-center justify-center shrink-0">
                        {{ day.day }}
                      </span>
                      <span class="text-xs text-slate-900 font-normal">{{ day.title }}</span>
                    </div>
                    <p class="text-slate-600 pl-7 text-[11px] leading-relaxed">{{ day.desc }}</p>
                  </div>
                }
              </div>

              <!-- Quick Booking Form -->
              <div class="border-t border-slate-100 pt-3.5 space-y-3">
                <div class="grid grid-cols-2 gap-2 text-slate-800">
                  <div class="space-y-0.5">
                    <label for="tour-travelers-count" class="text-[10px] font-normal text-slate-600 uppercase block">Travelers</label>
                    <select
                      id="tour-travelers-count"
                      [value]="travelersCount()"
                      (change)="travelersCount.set(+($any($event.target).value))"
                      class="w-full bg-[#fcfcfd] border border-slate-200/90 rounded-[22px] px-3 py-2 text-xs font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                      <option [value]="1">1 Traveler</option>
                      <option [value]="2">2 Travelers</option>
                      <option [value]="3">3 Travelers</option>
                      <option [value]="4">4 Travelers</option>
                    </select>
                  </div>

                  <div class="space-y-0.5">
                    <label for="tour-booking-date" class="text-[10px] font-normal text-slate-600 uppercase block">Date</label>
                    <input
                      id="tour-booking-date"
                      type="date"
                      [value]="tourTravelDate()"
                      (change)="tourTravelDate.set($any($event.target).value)"
                      class="w-full bg-[#fcfcfd] border border-slate-200/90 rounded-[22px] px-3 py-2 text-xs font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                  </div>
                </div>

                <div class="bg-[#d1fae5]/40 p-3 rounded-[22px] flex items-center justify-between text-xs font-normal border border-[#a7f3d0]">
                  <span class="text-slate-700 font-normal">Total Payable:</span>
                  <span class="text-base font-normal text-[#047857] tabular-nums">
                    ₹{{ Math.round(tour.basePrice * travelersCount() * 1.05) }}
                  </span>
                </div>

                <!-- Confirm Booking Button -->
                <button
                  type="button"
                  (click)="confirmTourBooking(tour)"
                  class="w-full bg-gradient-to-r from-[#059669] via-[#10b981] to-[#14b8a6] text-white font-normal py-2.5 px-4 rounded-[22px] text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5">
                  <mat-icon class="text-sm text-white">verified</mat-icon>
                  <span class="text-white font-normal">Confirm Booking</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      }

    </div>
  `,
})
export class TripView {
  readonly state = inject(BookingState);
  readonly Math = Math;

  readonly selectedCategory = signal<string>('all');
  readonly activeTour = signal<CuratedTourTrip | null>(null);
  readonly travelersCount = signal<number>(2);
  readonly tourTravelDate = signal<string>(new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]);

  readonly filteredTours = computed(() => {
    const all = this.state.tourTrips();
    const cat = this.selectedCategory();
    if (cat === 'all') return all;
    return all.filter((t) => t.category === cat);
  });

  openItineraryModal(tour: CuratedTourTrip) {
    this.activeTour.set(tour);
  }

  confirmTourBooking(tour: CuratedTourTrip) {
    this.state.bookTourTrip({
      tourId: tour.id,
      travelDate: this.tourTravelDate(),
      travelersCount: this.travelersCount(),
      customerName: this.state.currentUser().fullName,
      customerPhone: this.state.currentUser().phone,
      customerEmail: this.state.currentUser().email,
    });
    this.activeTour.set(null);
  }
}
