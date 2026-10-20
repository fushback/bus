import {ChangeDetectionStrategy, Component, inject, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {BookingState} from '../../services/booking-state';
import {SharedCarTrip, CarSeat} from '../../models/bus-booking.models';

@Component({
  selector: 'app-transport-seat-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    @if (state.selectedTransportTrip(); as transport) {
      <div class="min-h-screen bg-[#f8fafc] text-[#1b1b1b] pb-48 sm:pb-56 font-sans">
        
        <!-- =============================================================== -->
        <!-- TOP STICKY HEADER                                               -->
        <!-- =============================================================== -->
        <header class="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
          <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
            
            <!-- Left: Back Arrow + Title + Route -->
            <div class="flex items-center space-x-3.5 min-w-0">
              <button
                type="button"
                (click)="state.backToTransportResults()"
                title="Back to Transport Results"
                class="w-9 h-9 -ml-1.5 rounded-full hover:bg-slate-100 text-[#1b1b1b] flex items-center justify-center cursor-pointer active:scale-90 transition-all shrink-0">
                <mat-icon class="text-[22px]">arrow_back</mat-icon>
              </button>

              <div class="min-w-0">
                <div class="flex items-center space-x-2">
                  <h1 class="text-[17px] sm:text-[18px] font-extrabold text-[#1b1b1b] truncate leading-tight">
                    Select Transport Seats
                  </h1>
                  <span class="px-2 py-0.5 rounded-full bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200 text-[10px] font-bold uppercase tracking-wide truncate">
                    {{ transport.vehicleName }}
                  </span>
                </div>
                <p class="text-[13px] text-slate-500 truncate leading-tight mt-0.5 font-medium">
                  {{ transport.operatorName }} &bull; {{ transport.sourceCityName }} &rarr; {{ transport.destinationCityName }}
                </p>
              </div>
            </div>

            <!-- Right: Vehicle Number / Fleet Badge -->
            <div class="shrink-0 flex items-center space-x-2">
              <span class="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-mono font-bold">
                {{ transport.vehicleNumber }}
              </span>
            </div>

          </div>

          <!-- 3-Step Horizontal Stepper Bar (Matching Car Flow) -->
          <div class="max-w-5xl mx-auto flex items-center border-t border-slate-200/80 bg-white">
            <!-- Step 1: Select seats (Active - Transport Fuchsia Theme) -->
            <div class="w-1/3 py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-bold border-b-2 border-[#7e22ce] text-[#7e22ce] bg-fuchsia-50/50 flex items-center justify-center space-x-1.5 text-center truncate">
              <mat-icon class="text-sm sm:text-base shrink-0">local_shipping</mat-icon>
              <span class="truncate">1. Select seats</span>
            </div>

            <!-- Step 2: Board/Drop -->
            <button
              type="button"
              (click)="state.goToBoardingDropping()"
              class="w-1/3 py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center space-x-1.5 cursor-pointer transition-all text-center truncate">
              <mat-icon class="text-sm sm:text-base shrink-0">pin_drop</mat-icon>
              <span class="truncate">2. Board/Drop</span>
            </button>

            <!-- Step 3: Passenger Info -->
            <button
              type="button"
              (click)="state.goToPassengerInfo()"
              class="w-1/3 py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center space-x-1.5 cursor-pointer transition-all text-center truncate">
              <mat-icon class="text-sm sm:text-base shrink-0">person</mat-icon>
              <span class="truncate">3. Passenger Info</span>
            </button>
          </div>
        </header>

        <!-- =============================================================== -->
        <!-- MAIN TRANSPORT CABIN SEAT SELECTION BODY                        -->
        <!-- =============================================================== -->
        <main class="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 pt-5 pb-8 space-y-4">
          
          <!-- Vehicle Quick Specs Strip -->
          <div class="bg-white rounded-[22px] p-3.5 result-card-shadow border border-slate-200/80 flex items-center justify-between text-xs">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7e22ce] via-[#a21caf] to-[#db2777] text-white flex items-center justify-center shrink-0 shadow-xs">
                <mat-icon class="text-[20px] leading-none">local_shipping</mat-icon>
              </div>
              <div>
                <h3 class="font-extrabold text-slate-900 text-sm leading-tight">
                  {{ transport.vehicleName }}
                </h3>
                <div class="flex items-center space-x-2 mt-0.5 text-slate-500 text-[11px]">
                  <span>{{ transport.fuelType }}</span>
                  <span>&bull;</span>
                  <span>{{ transport.hasAc ? 'AC Transport' : 'Non-AC' }}</span>
                  <span>&bull;</span>
                  <span class="text-emerald-700 font-bold flex items-center">
                    <mat-icon class="text-[12px] leading-none mr-0.5">star</mat-icon>
                    {{ transport.rating }} ({{ transport.totalReviews }})
                  </span>
                </div>
              </div>
            </div>

            <div class="text-right">
              <div class="text-base font-extrabold text-slate-900 tabular-nums">
                ₹{{ transport.baseFare }}
              </div>
              <div class="text-[10px] text-slate-400 font-medium">per seat/slot</div>
            </div>
          </div>

          <!-- Seat Status Legend -->
          <div class="bg-white rounded-2xl p-3 result-card-shadow border border-slate-200/80 flex flex-wrap items-center justify-around gap-2 text-xs">
            <div class="flex items-center space-x-1.5">
              <div class="w-4 h-4 rounded-md border-2 border-slate-300 bg-white"></div>
              <span class="text-slate-600 text-[11px] font-semibold">Available</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <div class="w-4 h-4 rounded-md bg-gradient-to-r from-[#7e22ce] to-[#db2777]"></div>
              <span class="text-slate-900 text-[11px] font-bold">Selected</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <div class="w-4 h-4 rounded-md bg-slate-300 border border-slate-400"></div>
              <span class="text-slate-400 text-[11px]">Booked</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <div class="w-4 h-4 rounded-md border-2 border-pink-400 bg-pink-50"></div>
              <span class="text-pink-600 text-[11px] font-semibold">Ladies</span>
            </div>
          </div>

          <!-- Transport Vehicle Cabin Graphic Container -->
          <div class="bg-white rounded-[28px] p-5 result-card-shadow border-2 border-slate-200 relative overflow-hidden max-w-md mx-auto">
            
            <!-- Vehicle Windshield Front -->
            <div class="w-full h-8 rounded-t-3xl bg-gradient-to-b from-slate-200 to-slate-100 border-b border-slate-300 flex items-center justify-center mb-5">
              <div class="flex items-center space-x-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <mat-icon class="text-[14px]">directions_car</mat-icon>
                <span>FRONT WINDSHIELD</span>
              </div>
            </div>

            <!-- Row 0: Driver & Front Cabin -->
            <div class="flex items-center justify-between pb-4 border-b border-dashed border-slate-200">
              <!-- Driver Wheel -->
              <div class="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-300 flex flex-col items-center justify-center text-slate-500 shadow-2xs">
                <mat-icon class="text-[22px] leading-none">sports_motorsports</mat-icon>
                <span class="text-[9px] font-bold uppercase mt-0.5">Driver</span>
              </div>

              <!-- Front Passenger Seats (F1, F2) -->
              <div class="flex items-center space-x-2">
                @for (seat of getFrontRow(transport); track seat.id) {
                  <button
                    type="button"
                    [disabled]="seat.status === 'booked'"
                    (click)="toggleSeat(seat)"
                    [class.bg-gradient-to-br]="isSeatSelected(seat.id)"
                    [class.from-[#7e22ce]]="isSeatSelected(seat.id)"
                    [class.via-[#a21caf]]="isSeatSelected(seat.id)"
                    [class.to-[#db2777]]="isSeatSelected(seat.id)"
                    [class.text-white]="isSeatSelected(seat.id)"
                    [class.shadow-md]="isSeatSelected(seat.id)"
                    [class.scale-105]="isSeatSelected(seat.id)"
                    [class.bg-slate-200]="seat.status === 'booked'"
                    [class.text-slate-400]="seat.status === 'booked'"
                    [class.cursor-not-allowed]="seat.status === 'booked'"
                    [class.border-pink-300]="seat.isLadiesReserved && !isSeatSelected(seat.id)"
                    [class.bg-pink-50]="seat.isLadiesReserved && !isSeatSelected(seat.id)"
                    [class.bg-white]="!isSeatSelected(seat.id) && seat.status !== 'booked' && !seat.isLadiesReserved"
                    [class.border-slate-300]="!isSeatSelected(seat.id) && !seat.isLadiesReserved"
                    class="w-13 h-13 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90 font-bold">
                    <span class="text-[12px] leading-tight">{{ seat.seatNumber }}</span>
                    <span class="text-[9px] font-normal leading-tight opacity-90">₹{{ seat.price }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- Middle Cabin Passenger Seats -->
            <div class="py-4 border-b border-dashed border-slate-200 space-y-3">
              <div class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 text-center">
                Main Passenger Cabin
              </div>

              <div class="grid grid-cols-4 gap-2 justify-items-center">
                @for (seat of getMiddleRows(transport); track seat.id) {
                  <button
                    type="button"
                    [disabled]="seat.status === 'booked'"
                    (click)="toggleSeat(seat)"
                    [class.bg-gradient-to-br]="isSeatSelected(seat.id)"
                    [class.from-[#7e22ce]]="isSeatSelected(seat.id)"
                    [class.via-[#a21caf]]="isSeatSelected(seat.id)"
                    [class.to-[#db2777]]="isSeatSelected(seat.id)"
                    [class.text-white]="isSeatSelected(seat.id)"
                    [class.shadow-md]="isSeatSelected(seat.id)"
                    [class.scale-105]="isSeatSelected(seat.id)"
                    [class.bg-slate-200]="seat.status === 'booked'"
                    [class.text-slate-400]="seat.status === 'booked'"
                    [class.cursor-not-allowed]="seat.status === 'booked'"
                    [class.border-pink-300]="seat.isLadiesReserved && !isSeatSelected(seat.id)"
                    [class.bg-pink-50]="seat.isLadiesReserved && !isSeatSelected(seat.id)"
                    [class.bg-white]="!isSeatSelected(seat.id) && seat.status !== 'booked' && !seat.isLadiesReserved"
                    [class.border-slate-300]="!isSeatSelected(seat.id) && !seat.isLadiesReserved"
                    class="w-13 h-13 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90 font-bold">
                    <span class="text-[12px] leading-tight">{{ seat.seatNumber }}</span>
                    <span class="text-[9px] font-normal leading-tight opacity-90">₹{{ seat.price }}</span>
                  </button>
                }
              </div>
            </div>

            <!-- Rear Passenger / Cargo Bay Section -->
            <div class="pt-4 space-y-3">
              <div class="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                <span>Rear Passenger Row</span>
                <span class="text-fuchsia-600 font-bold flex items-center">
                  <mat-icon class="text-[12px] leading-none mr-0.5">luggage</mat-icon>
                  Cargo Luggage Space
                </span>
              </div>

              <div class="grid grid-cols-4 gap-2 justify-items-center">
                @for (seat of getRearRows(transport); track seat.id) {
                  <button
                    type="button"
                    [disabled]="seat.status === 'booked'"
                    (click)="toggleSeat(seat)"
                    [class.bg-gradient-to-br]="isSeatSelected(seat.id)"
                    [class.from-[#7e22ce]]="isSeatSelected(seat.id)"
                    [class.via-[#a21caf]]="isSeatSelected(seat.id)"
                    [class.to-[#db2777]]="isSeatSelected(seat.id)"
                    [class.text-white]="isSeatSelected(seat.id)"
                    [class.shadow-md]="isSeatSelected(seat.id)"
                    [class.scale-105]="isSeatSelected(seat.id)"
                    [class.bg-slate-200]="seat.status === 'booked'"
                    [class.text-slate-400]="seat.status === 'booked'"
                    [class.cursor-not-allowed]="seat.status === 'booked'"
                    [class.border-pink-300]="seat.isLadiesReserved && !isSeatSelected(seat.id)"
                    [class.bg-pink-50]="seat.isLadiesReserved && !isSeatSelected(seat.id)"
                    [class.bg-white]="!isSeatSelected(seat.id) && seat.status !== 'booked' && !seat.isLadiesReserved"
                    [class.border-slate-300]="!isSeatSelected(seat.id) && !seat.isLadiesReserved"
                    class="w-13 h-13 rounded-2xl border-2 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-90 font-bold">
                    <span class="text-[12px] leading-tight">{{ seat.seatNumber }}</span>
                    <span class="text-[9px] font-normal leading-tight opacity-90">₹{{ seat.price }}</span>
                  </button>
                }
              </div>

              <!-- Dedicated Luggage Boot Banner -->
              <div class="rounded-xl bg-slate-50 border border-slate-200 p-2 text-center text-[10.5px] font-medium text-slate-500 flex items-center justify-center space-x-1">
                <mat-icon class="text-[15px] text-fuchsia-600">inventory_2</mat-icon>
                <span>Spacious Boot Space Included for Heavy Luggage &amp; Cargo</span>
              </div>
            </div>

          </div>

        </main>

        <!-- =============================================================== -->
        <!-- BOTTOM STICKY SUMMARY & BOOKING BAR                            -->
        <!-- =============================================================== -->
        <div class="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-4 shadow-[0_-6px_25px_rgba(15,23,42,0.08)] z-40">
          <div class="flex items-center justify-between gap-4">
            
            <!-- Left: Selected Seats Details & Total -->
            <div class="min-w-0">
              <div class="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                Selected: <span class="text-slate-900 font-bold">{{ selectedSeatsCount() }} Seat(s)</span>
              </div>
              <div class="flex items-baseline space-x-1.5 mt-0.5">
                <span class="text-2xl font-black text-slate-900 tabular-nums">
                  ₹{{ totalFare() }}
                </span>
                @if (selectedSeatsCount() > 0) {
                  <span class="text-xs text-slate-500 truncate font-medium">
                    ({{ selectedSeatNumbers() }})
                  </span>
                }
              </div>
            </div>

            <!-- Right: Continue Button -->
            <button
              type="button"
              [disabled]="selectedSeatsCount() === 0"
              (click)="continueToBoardingDropping()"
              [class.opacity-40]="selectedSeatsCount() === 0"
              [class.cursor-not-allowed]="selectedSeatsCount() === 0"
              class="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#7e22ce] via-[#a21caf] to-[#db2777] hover:opacity-95 text-white font-extrabold text-[15px] shadow-sm cursor-pointer transition-all active:scale-95 flex items-center space-x-2 shrink-0">
              <span>Select Boarding Point</span>
              <mat-icon class="text-[18px]">arrow_forward</mat-icon>
            </button>

          </div>
        </div>

      </div>
    }
  `,
})
export class TransportSeatLayout {
  readonly state = inject(BookingState);

  getFrontRow(transport: SharedCarTrip): CarSeat[] {
    return (transport.seats || []).filter((s) => s.row === 'front');
  }

  getMiddleRows(transport: SharedCarTrip): CarSeat[] {
    return (transport.seats || []).filter((s) => s.row === 'middle');
  }

  getRearRows(transport: SharedCarTrip): CarSeat[] {
    return (transport.seats || []).filter((s) => s.row === 'rear');
  }

  isSeatSelected(seatId: string): boolean {
    return this.state.selectedTransportSeatIds().includes(seatId);
  }

  toggleSeat(seat: CarSeat) {
    if (seat.status === 'booked') return;
    const current = this.state.selectedTransportSeatIds();
    if (current.includes(seat.id)) {
      this.state.selectedTransportSeatIds.set(current.filter((id) => id !== seat.id));
    } else {
      if (current.length >= 6) {
        this.state.showToast('You can select a maximum of 6 transport seats per booking', 'warning');
        return;
      }
      this.state.selectedTransportSeatIds.set([...current, seat.id]);
    }
  }

  readonly selectedSeatsCount = computed(() => this.state.selectedTransportSeatIds().length);

  readonly selectedSeatNumbers = computed(() => {
    const transport = this.state.selectedTransportTrip();
    if (!transport) return '';
    const ids = this.state.selectedTransportSeatIds();
    const seats = (transport.seats || []).filter((s) => ids.includes(s.id));
    return seats.map((s) => s.seatNumber).join(', ');
  });

  readonly totalFare = computed(() => {
    const transport = this.state.selectedTransportTrip();
    if (!transport) return 0;
    const ids = this.state.selectedTransportSeatIds();
    const seats = (transport.seats || []).filter((s) => ids.includes(s.id));
    return seats.reduce((sum, s) => sum + (s.price || transport.baseFare), 0);
  });

  continueToBoardingDropping() {
    if (this.selectedSeatsCount() === 0) {
      this.state.showToast('Please select at least one seat to continue', 'warning');
      return;
    }
    this.state.goToBoardingDropping();
  }
}
