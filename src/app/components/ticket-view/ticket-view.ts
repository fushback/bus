import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {BookingState} from '../../services/booking-state';
import {Passenger} from '../../models/bus-booking.models';

@Component({
  selector: 'app-ticket-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <!-- Success Modal popup when newly booked -->
    @if (state.isSuccessModalOpen(); as isOpen) {
      <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
        <div class="bg-white text-[#1f2937] rounded-[30px] max-w-sm sm:max-w-md w-full shadow-[0_24px_60px_rgba(15,23,42,0.22)] text-center overflow-hidden animate-slide-up mx-auto border border-slate-200/90">
          
          <!-- Home Page Pastel Peach-Pink-Lavender Header -->
          <div class="p-5 sm:p-6 bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] border-b border-white/80 relative overflow-hidden space-y-2">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)] pointer-events-none"></div>
            <div
              class="relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xs"
              [class]="state.activeBookingMode() === 'car' || state.searchCategory() === 'car'
                ? 'bg-gradient-to-br from-[#4f46e5] via-[#6366f1] to-[#9333ea]'
                : state.searchCategory() === 'hotel'
                  ? 'bg-gradient-to-br from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]'
                  : state.activeBookingMode() === 'transport' || state.searchCategory() === 'transport'
                    ? 'bg-gradient-to-br from-[#7e22ce] via-[#a21caf] to-[#db2777]'
                    : 'bg-gradient-to-br from-[#e11d48] via-[#f43f5e] to-[#fb923c]'">
              <mat-icon class="text-2xl leading-none text-white">check_circle</mat-icon>
            </div>

            <div class="relative z-10 space-y-1">
              <h3 class="text-lg sm:text-xl font-normal text-[#0f172a] leading-tight">Reservation Confirmed</h3>
              <p class="text-xs text-slate-600">Your ticket has been saved to your account bookings.</p>
            </div>
          </div>

          <div class="p-5 sm:p-6 space-y-4">
            @if (state.activeBookingResult(); as booking) {
              <div class="bg-[#fcfcfd] rounded-[22px] p-4 text-left space-y-2.5 font-sans text-xs border border-slate-200/90 text-[#1f2937]">
                <div class="flex items-center justify-between pb-2.5 border-b border-slate-200">
                  <div>
                    <span class="text-[10px] uppercase text-slate-500 font-normal block leading-none">Ticket Code</span>
                    <div class="font-mono text-sm sm:text-base text-slate-900 font-normal tracking-wider mt-1">{{ booking.bookingCode }}</div>
                  </div>
                  <div class="text-right">
                    <span class="text-[10px] uppercase text-slate-500 font-normal block leading-none">Total Paid</span>
                    <div class="text-sm sm:text-base font-normal text-slate-900 tabular-nums mt-1">₹{{ booking.totalAmount }}</div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span class="text-slate-500 font-normal block text-[10px] uppercase leading-none">Operator</span>
                    <span class="text-slate-900 font-normal leading-tight block mt-0.5">{{ booking.trip.bus.operatorName }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-normal block text-[10px] uppercase leading-none">Seats</span>
                    <span class="text-slate-900 font-normal leading-tight block mt-0.5">
                      {{ getSeatNumbers(booking.passengers) }}
                    </span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-normal block text-[10px] uppercase leading-none">Boarding</span>
                    <span class="text-slate-700 leading-tight block mt-0.5">{{ booking.selectedBoardingPoint.location || booking.selectedBoardingPoint.name || 'Terminal' }}</span>
                  </div>
                  <div>
                    <span class="text-slate-500 font-normal block text-[10px] uppercase leading-none">Dropping</span>
                    <span class="text-slate-700 leading-tight block mt-0.5">{{ booking.selectedDroppingPoint.location || booking.selectedDroppingPoint.name || 'Terminal' }}</span>
                  </div>
                </div>
              </div>
            }

            <div class="flex items-center justify-center space-x-2 pt-1">
              <button
                type="button"
                (click)="dismissSuccessModal()"
                [class]="state.activeBookingMode() === 'car' || state.searchCategory() === 'car'
                  ? 'bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea]'
                  : state.searchCategory() === 'hotel'
                    ? 'bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]'
                    : state.activeBookingMode() === 'transport' || state.searchCategory() === 'transport'
                      ? 'bg-gradient-to-r from-[#7e22ce] via-[#a21caf] to-[#db2777]'
                      : 'bg-gradient-to-r from-[#e11d48] via-[#f43f5e] to-[#fb923c]'"
                class="flex-1 py-2.5 px-4 rounded-[22px] text-white text-sm font-normal transition-all cursor-pointer active:scale-95 text-center">
                <span>View Ticket Pass</span>
              </button>
              <button
                type="button"
                (click)="printTicket()"
                class="px-4 py-2.5 rounded-[22px] bg-[#fcfcfd] hover:bg-slate-50 text-slate-700 font-normal text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer active:scale-95 border border-slate-200/90">
                <mat-icon class="text-sm text-slate-700">print</mat-icon>
                <span>Print</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    }

    <!-- Tickets Tab Content -->
    @if (state.currentTab() === 'tickets') {
      <div class="min-h-screen bg-[#f8fafc] relative overflow-x-hidden pb-16">
        
        <!-- =============================================================== -->
        <!-- HOME PAGE PASTEL PEACH-PINK-LAVENDER GRADIENT BACKDROP          -->
        <!-- =============================================================== -->
        <div class="absolute top-0 inset-x-0 h-[220px] bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] rounded-b-[32px] pointer-events-none z-0 overflow-hidden shadow-[0_8px_28px_rgba(15,23,42,0.04)]">
          <div class="absolute -top-12 -left-10 w-64 h-64 rounded-full bg-[#fcd5b5]/60 blur-3xl"></div>
          <div class="absolute top-4 left-1/3 w-72 h-72 rounded-full bg-[#f9d8e8]/70 blur-3xl"></div>
          <div class="absolute -bottom-10 -right-10 w-72 h-72 rounded-full bg-[#d0dffe]/80 blur-3xl"></div>
        </div>

        <div class="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-5 text-slate-800">
          
          <div class="bg-white/95 backdrop-blur-md rounded-[22px] p-4 border border-white/80 shadow-[0_14px_34px_rgba(15,23,42,0.06)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 class="text-lg sm:text-2xl font-normal text-slate-900">My Travel Tickets</h2>
              <p class="text-xs text-slate-500">Live booking records</p>
            </div>
            <div class="flex items-center space-x-2">
              <button
                type="button"
                (click)="state.goToSearch(); state.currentTab.set('booking')"
                class="px-3.5 py-2 rounded-[14px] bg-slate-900 text-white text-xs font-normal flex items-center space-x-1 hover:bg-slate-800 cursor-pointer active:scale-95 transition-all">
                <mat-icon class="text-xs text-white">home</mat-icon>
                <span>Home</span>
              </button>
              <button
                type="button"
                (click)="state.searchCategory.set('bus'); state.goToSearch(); state.currentTab.set('booking')"
                class="px-3.5 py-2 rounded-[14px] bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316] text-white text-xs font-normal flex items-center space-x-1 shadow-[0_4px_12px_rgba(244,63,94,0.24)] cursor-pointer active:scale-95 transition-all">
                <mat-icon class="text-xs text-white">directions_bus</mat-icon>
                <span>Bus</span>
              </button>
              <button
                type="button"
                (click)="state.searchCategory.set('car'); state.goToSearch(); state.currentTab.set('cars')"
                class="px-3.5 py-2 rounded-[14px] bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#a855f7] text-white text-xs font-normal flex items-center space-x-1 shadow-[0_4px_12px_rgba(99,102,241,0.24)] cursor-pointer active:scale-95 transition-all">
                <mat-icon class="text-xs text-white">directions_car</mat-icon>
                <span>Car</span>
              </button>
            </div>
          </div>

          @if (state.userBookings().length === 0) {
            <div class="bg-white rounded-[30px] p-10 text-center border border-slate-200/80 shadow-[0_14px_34px_rgba(15,23,42,0.06)] space-y-3">
              <div class="w-12 h-12 rounded-[14px] bg-[#ffe4e6] text-[#e11d48] flex items-center justify-center mx-auto border border-[#fecdd3]">
                <mat-icon class="text-2xl text-[#e11d48]">confirmation_number</mat-icon>
              </div>
              <h3 class="text-sm font-normal text-slate-900">No active bookings yet</h3>
              <p class="text-xs text-slate-500">Search and reserve your favorite seats now.</p>
              <button
                type="button"
                (click)="state.goToSearch(); state.currentTab.set('booking')"
                class="px-5 py-2.5 rounded-[14px] bg-gradient-to-r from-[#f43f5e] via-[#fb7185] to-[#f97316] shadow-[0_6px_16px_rgba(244,63,94,0.28)] text-white font-normal text-xs cursor-pointer active:scale-95 transition-all">
                <span>Search Rides Now</span>
              </button>
            </div>
          } @else {
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              @for (b of state.userBookings(); track b.id) {
                <div class="bg-white rounded-[22px] border border-slate-200/80 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition-all p-4 sm:p-5 space-y-3.5 text-slate-800">
                  
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div>
                      <div class="flex items-center space-x-2 text-xs">
                        @if (b.status === 'confirmed') {
                          <span class="inline-flex items-center space-x-1 text-[#047857] font-normal text-xs bg-[#d1fae5] px-2 py-0.5 rounded-full border border-[#a7f3d0]">
                            <span class="w-2 h-2 rounded-full bg-[#10b981]"></span>
                            <span>Confirmed</span>
                          </span>
                        } @else {
                          <span class="inline-flex items-center space-x-1 text-[#e11d48] font-normal text-xs bg-[#ffe4e6] px-2 py-0.5 rounded-full border border-[#fecdd3]">
                            <span class="w-2 h-2 rounded-full bg-[#f43f5e]"></span>
                            <span>Cancelled</span>
                          </span>
                        }
                        <span class="text-slate-300">·</span>
                        <span class="font-mono text-slate-600 font-normal text-xs">{{ b.bookingCode }}</span>
                      </div>

                      <h3 class="text-base font-normal text-slate-900 mt-1">
                        {{ b.trip.bus.operatorName }}
                      </h3>
                    </div>

                    <div class="flex items-center space-x-3 text-right">
                      <div>
                        <span class="text-[10px] uppercase text-slate-500 font-normal block leading-none">Amount</span>
                        <span class="text-base font-normal text-slate-900 tabular-nums">₹{{ b.totalAmount }}</span>
                      </div>

                      @if (b.status === 'confirmed') {
                        <button
                          type="button"
                          (click)="cancelBooking(b.id)"
                          class="text-xs text-[#e11d48] hover:text-rose-700 font-normal px-2.5 py-1 rounded-[10px] hover:bg-[#ffe4e6]/50 transition-colors cursor-pointer border border-[#fecdd3]">
                          Cancel
                        </button>
                      }
                    </div>
                  </div>

                  <!-- Route & Timing Summary -->
                  <div class="bg-slate-50 rounded-[16px] p-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border border-slate-100">
                    <div>
                      <span class="text-[10px] uppercase text-slate-500 font-normal block leading-none">From</span>
                      <span class="text-slate-900 font-normal mt-1 block">{{ b.trip.sourceCityName || b.trip.sourceCity?.name || 'Origin' }}</span>
                      <span class="text-[10px] text-slate-500">{{ b.trip.departureTime }}</span>
                    </div>
                    <div>
                      <span class="text-[10px] uppercase text-slate-500 font-normal block leading-none">To</span>
                      <span class="text-slate-900 font-normal mt-1 block">{{ b.trip.destinationCityName || b.trip.destinationCity?.name || 'Destination' }}</span>
                      <span class="text-[10px] text-slate-500">{{ b.trip.arrivalTime }}</span>
                    </div>
                    <div>
                      <span class="text-[10px] uppercase text-slate-500 font-normal block leading-none">Seats</span>
                      <span class="text-slate-900 font-normal mt-1 block">{{ getSeatNumbers(b.passengers) }}</span>
                      <span class="text-[10px] text-slate-500">{{ b.passengers.length }} Passenger(s)</span>
                    </div>
                    <div>
                      <span class="text-[10px] uppercase text-slate-500 font-normal block leading-none">Travel Date</span>
                      <span class="text-slate-900 font-normal mt-1 block">{{ b.trip.date || b.trip.travelDate }}</span>
                      <span class="text-[10px] text-slate-500">{{ b.trip.bus.busType }}</span>
                    </div>
                  </div>

                  <!-- Passenger Details List -->
                  <div class="space-y-1 pt-1">
                    <span class="text-[10px] uppercase text-slate-500 font-normal block tracking-wider">Passengers</span>
                    <div class="flex flex-wrap gap-2">
                      @for (p of b.passengers; track p.seatId) {
                        <div class="bg-slate-50 px-2.5 py-1 rounded-[12px] text-xs flex items-center space-x-1.5 border border-slate-200/80">
                          <span class="text-[#e11d48] bg-[#ffe4e6] border border-[#fecdd3] font-mono font-normal text-[10px] px-1.5 py-0.2 rounded-md">Seat {{ p.seatNumber }}</span>
                          <span class="text-slate-300">·</span>
                          <span class="text-slate-800 font-normal">{{ p.name }} ({{ p.age }}{{ p.gender[0].toUpperCase() }})</span>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Footer Actions -->
                  <div class="flex items-center justify-between pt-2 text-xs border-t border-slate-100">
                    <span class="text-[10px] text-slate-500">
                      Booked on {{ formatDate(b.bookedAt || b.createdAt || '') }}
                    </span>
                    <button
                      type="button"
                      (click)="printTicket()"
                      class="text-[#e11d48] hover:text-rose-700 flex items-center space-x-1 font-normal cursor-pointer">
                      <mat-icon class="text-xs text-[#e11d48]">print</mat-icon>
                      <span>Print e-Ticket</span>
                    </button>
                  </div>

                </div>
              }
            </div>
          }

        </div>
      </div>
    }
  `,
})
export class TicketView {
  readonly state = inject(BookingState);

  dismissSuccessModal(): void {
    this.state.isSuccessModalOpen.set(false);
    this.state.currentTab.set('tickets');
  }

  printTicket(): void {
    window.print();
  }

  cancelBooking(bookingId: string): void {
    const reason = 'User requested cancellation';
    this.state.cancelBooking(bookingId, reason);
  }

  getSeatNumbers(passengers: Passenger[]): string {
    return passengers.map(p => p.seatNumber).join(', ');
  }

  formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  }
}
