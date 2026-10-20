import {ChangeDetectionStrategy, Component, inject, signal, computed} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {BookingState} from '../../services/booking-state';
import {SharedCarTrip, CarSeat} from '../../models/bus-booking.models';

@Component({
  selector: 'app-cars-view',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] relative overflow-x-hidden pb-16">
      
      <!-- ================================================================= -->
      <!-- FULL-PAGE PASTEL PEACH-PINK-LAVENDER GRADIENT BACKDROP            -->
      <!-- ================================================================= -->
      <div
        aria-hidden="true"
        class="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd]">
        <div class="w-full h-full bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)]"></div>
      </div>

      <div class="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 space-y-3 relative z-10">
      
      <!-- Compact Sawari Search & Filter Bar (Home Page Car Design) -->
      <div class="bg-white rounded-[30px] p-3 sm:p-4 border border-slate-200/90 result-card-shadow space-y-2.5 relative z-20 text-slate-800">
        
        <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          
          <!-- From Stand / Town Dropdown -->
          <div class="md:col-span-4 bg-[#fcfcfd] hover:bg-slate-50 p-2 sm:p-2.5 rounded-[22px] border border-slate-200/90 flex items-center space-x-2.5 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
            <div class="w-9 h-9 rounded-2xl bg-[#e0e7ff] text-[#4338ca] flex items-center justify-center shrink-0">
              <mat-icon class="text-base leading-none">location_on</mat-icon>
            </div>
            <div class="flex-1 min-w-0">
              <label for="car-source-input" class="text-[9px] font-normal text-slate-500 uppercase tracking-wider block leading-none mb-0.5">Leaving From</label>
              <select
                id="car-source-input"
                aria-label="Leaving From"
                (change)="onSourceChange($event)"
                class="w-full bg-transparent border-0 p-0 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none cursor-pointer truncate">
                <option value="">All Cities</option>
                @for (city of state.cities(); track city.id) {
                  <option [value]="city.name" [selected]="city.name.toLowerCase() === sourceSearch().toLowerCase()">
                    {{ city.name }}, {{ city.state }}
                  </option>
                }
              </select>
            </div>
          </div>

          <!-- Swap Route -->
          <div class="hidden md:flex md:col-span-1 justify-center">
            <button
              type="button"
              (click)="swapCities()"
              class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-[#4f46e5] via-[#6366f1] to-[#9333ea] text-white flex items-center justify-center active:scale-90 transition-all cursor-pointer group shadow-sm"
              title="Swap Route">
              <mat-icon class="text-base text-white group-hover:rotate-180 transition-transform duration-300">swap_horiz</mat-icon>
            </button>
          </div>

          <!-- To Destination / Stand Dropdown -->
          <div class="md:col-span-4 bg-[#fcfcfd] hover:bg-slate-50 p-2 sm:p-2.5 rounded-[22px] border border-slate-200/90 flex items-center space-x-2.5 transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
            <div class="w-9 h-9 rounded-2xl bg-[#ffedd5] text-[#c2410c] flex items-center justify-center shrink-0">
              <mat-icon class="text-base leading-none">flag</mat-icon>
            </div>
            <div class="flex-1 min-w-0">
              <label for="car-dest-input" class="text-[9px] font-normal text-slate-500 uppercase tracking-wider block leading-none mb-0.5">Going To</label>
              <select
                id="car-dest-input"
                aria-label="Going To"
                (change)="onDestChange($event)"
                class="w-full bg-transparent border-0 p-0 text-xs sm:text-sm font-normal text-slate-800 focus:outline-none cursor-pointer truncate">
                <option value="">All Cities</option>
                @for (city of state.cities(); track city.id) {
                  <option [value]="city.name" [selected]="city.name.toLowerCase() === destSearch().toLowerCase()">
                    {{ city.name }}, {{ city.state }}
                  </option>
                }
              </select>
            </div>
          </div>

          <!-- Date & Search Action (Side-by-side) -->
          <div class="md:col-span-3 flex items-center space-x-1.5">
            <div class="flex-1 bg-[#fcfcfd] p-2 sm:p-2.5 rounded-[22px] border border-slate-200/90 flex items-center space-x-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
              <div class="w-8 h-8 rounded-2xl bg-[#f3e8ff] text-[#7e22ce] flex items-center justify-center shrink-0">
                <mat-icon class="text-sm leading-none">calendar_today</mat-icon>
              </div>
              <div class="flex-1 min-w-0">
                <label for="car-date-input" class="text-[9px] font-normal text-slate-500 uppercase tracking-wider block leading-none mb-0.5">Date</label>
                <input
                  id="car-date-input"
                  type="date"
                  [value]="travelDate()"
                  (change)="onDateChange($event)"
                  class="w-full bg-transparent border-0 p-0 text-xs font-normal text-slate-800 focus:outline-none" />
              </div>
            </div>

            <!-- Search Sawari Button -->
            <button
              type="button"
              (click)="applyFilters()"
              class="bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea] active:scale-95 text-white font-normal px-3.5 py-2.5 rounded-[22px] transition-all flex items-center justify-center cursor-pointer shrink-0 h-10 sm:h-11 shadow-sm"
              title="Search Cars">
              <mat-icon class="text-sm text-white">search</mat-icon>
            </button>
          </div>

        </div>

        <!-- Quick Vehicle Type Filter Chips -->
        <div class="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-[10px] font-normal text-slate-500 uppercase mr-0.5">Model:</span>
            
            <button
              type="button"
              (click)="setVehicleFilter('all')"
              [class.bg-gradient-to-r]="selectedVehicleFilter() === 'all'"
              [class.from-[#4f46e5]]="selectedVehicleFilter() === 'all'"
              [class.via-[#6366f1]]="selectedVehicleFilter() === 'all'"
              [class.to-[#9333ea]]="selectedVehicleFilter() === 'all'"
              [class.text-white]="selectedVehicleFilter() === 'all'"
              [class.bg-slate-100]="selectedVehicleFilter() !== 'all'"
              [class.text-slate-700]="selectedVehicleFilter() !== 'all'"
              class="px-3 py-1 rounded-full font-normal transition-all cursor-pointer text-[11px] border border-slate-200/80 active:scale-95">
              All ({{ state.sharedCarTrips().length }})
            </button>

            <button
              type="button"
              (click)="setVehicleFilter('scorpio')"
              [class.bg-gradient-to-r]="selectedVehicleFilter() === 'scorpio'"
              [class.from-[#4f46e5]]="selectedVehicleFilter() === 'scorpio'"
              [class.via-[#6366f1]]="selectedVehicleFilter() === 'scorpio'"
              [class.to-[#9333ea]]="selectedVehicleFilter() === 'scorpio'"
              [class.text-white]="selectedVehicleFilter() === 'scorpio'"
              [class.bg-slate-100]="selectedVehicleFilter() !== 'scorpio'"
              [class.text-slate-700]="selectedVehicleFilter() !== 'scorpio'"
              class="px-3 py-1 rounded-full font-normal transition-all cursor-pointer text-[11px] border border-slate-200/80 active:scale-95">
              Scorpio
            </button>

            <button
              type="button"
              (click)="setVehicleFilter('bolero')"
              [class.bg-gradient-to-r]="selectedVehicleFilter() === 'bolero'"
              [class.from-[#4f46e5]]="selectedVehicleFilter() === 'bolero'"
              [class.via-[#6366f1]]="selectedVehicleFilter() === 'bolero'"
              [class.to-[#9333ea]]="selectedVehicleFilter() === 'bolero'"
              [class.text-white]="selectedVehicleFilter() === 'bolero'"
              [class.bg-slate-100]="selectedVehicleFilter() !== 'bolero'"
              [class.text-slate-700]="selectedVehicleFilter() !== 'bolero'"
              class="px-3 py-1 rounded-full font-normal transition-all cursor-pointer text-[11px] border border-slate-200/80 active:scale-95">
              Bolero
            </button>

            <button
              type="button"
              (click)="setVehicleFilter('cruiser')"
              [class.bg-gradient-to-r]="selectedVehicleFilter() === 'cruiser'"
              [class.from-[#4f46e5]]="selectedVehicleFilter() === 'cruiser'"
              [class.via-[#6366f1]]="selectedVehicleFilter() === 'cruiser'"
              [class.to-[#9333ea]]="selectedVehicleFilter() === 'cruiser'"
              [class.text-white]="selectedVehicleFilter() === 'cruiser'"
              [class.bg-slate-100]="selectedVehicleFilter() !== 'cruiser'"
              [class.text-slate-700]="selectedVehicleFilter() !== 'cruiser'"
              class="px-3 py-1 rounded-full font-normal transition-all cursor-pointer text-[11px] border border-slate-200/80 active:scale-95">
              Cruiser
            </button>

            <button
              type="button"
              (click)="setVehicleFilter('sumo')"
              [class.bg-gradient-to-r]="selectedVehicleFilter() === 'sumo'"
              [class.from-[#4f46e5]]="selectedVehicleFilter() === 'sumo'"
              [class.via-[#6366f1]]="selectedVehicleFilter() === 'sumo'"
              [class.to-[#9333ea]]="selectedVehicleFilter() === 'sumo'"
              [class.text-white]="selectedVehicleFilter() === 'sumo'"
              [class.bg-slate-100]="selectedVehicleFilter() !== 'sumo'"
              [class.text-slate-700]="selectedVehicleFilter() !== 'sumo'"
              class="px-3 py-1 rounded-full font-normal transition-all cursor-pointer text-[11px] border border-slate-200/80 active:scale-95">
              Sumo
            </button>
          </div>

          <!-- AC Toggle -->
          <div class="flex items-center space-x-1">
            <button
              type="button"
              (click)="setAcFilter(selectedAcFilter() === 'true' ? 'all' : 'true')"
              [class.bg-gradient-to-r]="selectedAcFilter() === 'true'"
              [class.from-[#4f46e5]]="selectedAcFilter() === 'true'"
              [class.via-[#6366f1]]="selectedAcFilter() === 'true'"
              [class.to-[#9333ea]]="selectedAcFilter() === 'true'"
              [class.text-white]="selectedAcFilter() === 'true'"
              [class.bg-slate-100]="selectedAcFilter() !== 'true'"
              [class.text-slate-700]="selectedAcFilter() !== 'true'"
              class="px-3 py-1 rounded-full text-[11px] font-normal cursor-pointer transition-all border border-slate-200/80 active:scale-95">
              AC Only
            </button>
          </div>
        </div>

      </div>

      <!-- Sawari Trip Cards Grid: 2 TILES PER ROW FOR ALL SCREENS -->
      <div class="grid grid-cols-2 gap-2 sm:gap-3.5">
        @for (trip of filteredTrips(); track trip.id) {
          <div
            class="bg-white rounded-[22px] border result-card-shadow transition-all duration-200 overflow-hidden flex flex-col justify-between text-slate-800 hover:border-indigo-300"
            [class.col-span-2]="activeSeatMapTripId() === trip.id"
            [class.ring-2]="activeSeatMapTripId() === trip.id"
            [class.ring-indigo-500]="activeSeatMapTripId() === trip.id"
            [class.border-indigo-500]="activeSeatMapTripId() === trip.id"
            [class.border-slate-200/90]="activeSeatMapTripId() !== trip.id">
            
            <!-- Trip Tile Content: Horizontal 2-Column Split Utilizing Right-Side Space -->
            <div class="p-2.5 sm:p-3 flex items-stretch justify-between gap-2.5 sm:gap-3">
              
              <!-- Left & Center Column: Operator, Vehicle, Route Timeline -->
              <div class="flex-1 min-w-0 flex flex-col justify-between space-y-1.5">
                
                <!-- Line 1: Operator & Rating -->
                <div class="flex items-center justify-between gap-1.5">
                  <div class="flex items-center space-x-1.5 min-w-0">
                    <span class="px-1.5 py-0.5 rounded bg-[#e0e7ff] text-[#4338ca] border border-indigo-200/80 text-[9px] uppercase shrink-0">
                      {{ trip.vehicleModel }}
                    </span>
                    <h3 class="text-xs sm:text-sm font-normal text-slate-900 truncate leading-snug" [title]="trip.operatorName">
                      {{ trip.operatorName }}
                    </h3>
                  </div>

                  <div class="inline-flex items-center gap-0.5 bg-indigo-600 text-white px-1.5 py-0.5 rounded text-[10px] font-normal shrink-0 leading-none">
                    <span class="text-[8px] leading-none">★</span>
                    <span>{{ trip.rating || 4.8 }}</span>
                  </div>
                </div>

                <!-- Line 2: Timing & Duration -->
                <div class="bg-[#fcfcfd] rounded-2xl px-2.5 py-1.5 border border-slate-200/80 flex items-center justify-between text-xs gap-2">
                  <div class="min-w-0">
                    <div class="text-xs sm:text-sm font-normal text-slate-900 leading-none tabular-nums">{{ trip.departureTime }}</div>
                    <div class="text-[10px] text-slate-500 truncate mt-0.5 max-w-[75px] sm:max-w-[100px]">{{ trip.sourceCityName }}</div>
                  </div>

                  <div class="flex flex-col items-center px-1 shrink-0">
                    <span class="text-[9px] font-normal text-slate-500 leading-none">{{ trip.duration }}</span>
                    <div class="w-8 sm:w-12 h-[1px] bg-slate-300 relative my-1">
                      <div class="w-1.5 h-1.5 rounded-full bg-indigo-600 absolute -top-[2px] right-0"></div>
                    </div>
                    <span class="text-[9px] text-indigo-700 leading-none">{{ trip.availableSeatsCount }} left</span>
                  </div>

                  <div class="text-right min-w-0">
                    <div class="text-xs sm:text-sm font-normal text-slate-900 leading-none tabular-nums">{{ trip.arrivalTime }}</div>
                    <div class="text-[10px] text-slate-500 truncate mt-0.5 max-w-[75px] sm:max-w-[100px]">{{ trip.destinationCityName }}</div>
                  </div>
                </div>

                <!-- Line 3: Vehicle Name & Plate -->
                <div class="flex items-center justify-between gap-2 text-[10px] text-slate-500">
                  <span class="truncate">{{ trip.vehicleName }} · {{ trip.hasAc ? 'AC' : 'Non-AC' }}</span>
                  <span class="font-mono text-slate-600 shrink-0">{{ trip.vehicleNumber }}</span>
                </div>

              </div>

              <!-- Right Column: Price & Select Seat Button -->
              <div class="shrink-0 pl-2.5 sm:pl-3 border-l border-slate-100 flex flex-col items-end justify-between min-w-[96px] sm:min-w-[110px]">
                <div class="text-right">
                  <span class="text-[9px] uppercase font-normal text-slate-400 block leading-none">Per Seat</span>
                  <div class="text-base sm:text-lg font-normal text-slate-900 tabular-nums leading-tight mt-0.5">₹{{ trip.baseFare }}</div>
                  <span class="text-[9px] text-[#4338ca] bg-[#e0e7ff] px-1.5 py-0.2 rounded inline-block mt-0.5">
                    {{ trip.frequency }}
                  </span>
                </div>

                <button
                  type="button"
                  (click)="toggleSeatMap(trip)"
                  class="w-full py-1.5 px-2.5 rounded-[22px] font-normal text-[11px] sm:text-xs transition-all flex items-center justify-center space-x-1 cursor-pointer active:scale-95 text-white bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea]">
                  <mat-icon class="text-xs text-white">airline_seat_recline_extra</mat-icon>
                  <span class="font-normal text-white">{{ activeSeatMapTripId() === trip.id ? 'Hide' : 'Select' }}</span>
                </button>
              </div>

            </div>

            <!-- EXPANDED REALISTIC CAR SEAT STRUCTURE -->
            @if (activeSeatMapTripId() === trip.id) {
              <div class="border-t border-slate-100 bg-slate-50/60 p-3 sm:p-5 animate-fade-in space-y-4 text-slate-800">
                
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  
                  <!-- Left: Realistic Car Cabin Layout & Seating (7 Cols) -->
                  <div class="lg:col-span-7 bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 space-y-3">
                    
                    <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div class="flex items-center space-x-1.5">
                        <mat-icon class="text-sm text-emerald-600">directions_car</mat-icon>
                        <h4 class="text-xs font-normal text-slate-900 uppercase tracking-wider">
                          {{ trip.vehicleModel | uppercase }} Cabin Blueprint
                        </h4>
                      </div>
                      <span class="text-[10px] text-slate-400 font-normal">
                        Driver: {{ trip.driverName }} ({{ trip.driverPhone }})
                      </span>
                    </div>

                    <!-- Authentic Car Cabin Structure (Chassis Outline) -->
                    <div class="max-w-md mx-auto bg-slate-100/70 rounded-3xl p-3 border border-slate-200/80 relative">
                      
                      <!-- Car Front Windshield & Dashboard with Indian RHD Driver Position -->
                      <div class="bg-slate-900 text-slate-200 rounded-2xl p-2 mb-3 border border-slate-800 flex items-center justify-between">
                        <div class="flex items-center space-x-1 pl-1">
                          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span class="text-[9px] uppercase tracking-wider font-normal text-slate-300">Front Windshield</span>
                        </div>
                        <!-- Driver Steering Column on Right (RHD) -->
                        <div class="flex items-center space-x-1 bg-slate-800 px-2.5 py-0.5 rounded-xl border border-slate-700 text-slate-200 text-[10px] font-normal">
                          <mat-icon class="text-xs text-emerald-400">sports_motorsports</mat-icon>
                          <span>Driver / Steering (RHD)</span>
                        </div>
                      </div>

                      <!-- Car Rows Architecture Based on Google Vehicle Specs -->
                      <div class="space-y-3">
                        
                        <!-- 1. Front Row (Left Passenger Bucket + Right Driver) -->
                        <div class="bg-white p-2 rounded-2xl border border-slate-200/80 space-y-1">
                          <div class="flex items-center justify-between text-[9px] font-normal text-slate-500 uppercase tracking-wider px-1">
                            <span>Front Passenger (Left)</span>
                            <span>Driver Column (Right)</span>
                          </div>

                          <div class="grid grid-cols-2 gap-3 items-center">
                            <!-- Left: Front Passenger Seat(s) -->
                            <div class="flex justify-center">
                              @for (seat of getFrontSeats(trip); track seat.id) {
                                <button
                                  type="button"
                                  (click)="toggleSeat(trip, seat)"
                                  [disabled]="seat.status === 'booked'"
                                  [class]="getCarSeatClasses(seat)"
                                  class="w-28 p-1.5 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer active:scale-95">
                                  
                                  <!-- Realistic Headrest with posts -->
                                  <div class="w-10 h-2.5 rounded-full border flex items-center justify-center mb-0.5"
                                    [class.bg-emerald-500]="isSeatSelected(seat.id)"
                                    [class.bg-slate-100]="!isSeatSelected(seat.id)">
                                    <div class="w-2 h-0.5 bg-current opacity-40 rounded-full"></div>
                                  </div>

                                  <!-- Sculpted Backrest & Lumbar -->
                                  <div class="w-full flex items-center justify-between px-1">
                                    <span class="text-[10px] font-normal">{{ seat.seatNumber }}</span>
                                    <mat-icon class="text-xs">{{ isSeatSelected(seat.id) ? 'check' : 'airline_seat_recline_normal' }}</mat-icon>
                                  </div>

                                  <div class="w-3/4 h-0.5 bg-current opacity-20 rounded-full my-0.5"></div>

                                  <!-- Cushion Pan & Price -->
                                  <div class="text-[9px] font-normal">₹{{ seat.price }}</div>
                                </button>
                              }
                            </div>

                            <!-- Right: Driver Cabin Graphic -->
                            <div class="flex justify-center">
                              <div class="w-28 p-2 rounded-xl bg-slate-100 border border-slate-200 text-center flex flex-col items-center justify-center opacity-75">
                                <mat-icon class="text-slate-500 text-lg">drive_eta</mat-icon>
                                <span class="text-[10px] font-normal text-slate-700 mt-0.5">Driver Seat</span>
                                <span class="text-[8px] text-slate-400 uppercase">Reserved</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- 2. Middle Row (2 Captain Chairs or 3-Passenger Bench) -->
                        <div class="bg-white p-2 rounded-2xl border border-slate-200/80 space-y-1">
                          <div class="flex items-center justify-between text-[9px] font-normal text-slate-500 uppercase tracking-wider px-1">
                            <span>Middle Cabin Row</span>
                            <span>{{ trip.hasAc ? 'Chilled AC Ducts' : 'Window Comfort' }}</span>
                          </div>

                          <div class="grid grid-cols-3 gap-2">
                            @for (seat of getMiddleSeats(trip); track seat.id) {
                              <button
                                type="button"
                                (click)="toggleSeat(trip, seat)"
                                [disabled]="seat.status === 'booked'"
                                [class]="getCarSeatClasses(seat)"
                                class="p-1.5 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer active:scale-95">
                                
                                <!-- Realistic Headrest -->
                                <div class="w-9 h-2.5 rounded-full border flex items-center justify-center mb-0.5"
                                  [class.bg-emerald-500]="isSeatSelected(seat.id)"
                                  [class.bg-slate-100]="!isSeatSelected(seat.id)">
                                  <div class="w-2 h-0.5 bg-current opacity-40 rounded-full"></div>
                                </div>

                                <!-- Sculpted Backrest & Lumbar -->
                                <div class="w-full flex items-center justify-between px-1">
                                  <span class="text-[10px] font-normal">{{ seat.seatNumber }}</span>
                                  <mat-icon class="text-xs">{{ isSeatSelected(seat.id) ? 'check' : 'airline_seat_recline_normal' }}</mat-icon>
                                </div>

                                <div class="w-3/4 h-0.5 bg-current opacity-20 rounded-full my-0.5"></div>

                                <!-- Cushion Pan & Price -->
                                <div class="text-[9px] font-normal">₹{{ seat.price }}</div>
                              </button>
                            }
                          </div>
                        </div>

                        <!-- 3. Rear Row / Inward-Facing Foldable Jump Seats -->
                        @if (getRearAndJumpSeats(trip).length > 0) {
                          <div class="bg-white p-2 rounded-2xl border border-slate-200/80 space-y-1">
                            <div class="flex items-center justify-between text-[9px] font-normal text-slate-500 uppercase tracking-wider px-1">
                              <span>Rear Row / Side Jump Seats</span>
                              <span>Rear Door Entry</span>
                            </div>

                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              @for (seat of getRearAndJumpSeats(trip); track seat.id) {
                                <button
                                  type="button"
                                  (click)="toggleSeat(trip, seat)"
                                  [disabled]="seat.status === 'booked'"
                                  [class]="getCarSeatClasses(seat)"
                                  class="p-1.5 rounded-xl border flex flex-col items-center justify-between transition-all cursor-pointer active:scale-95">
                                  
                                  <!-- Realistic Headrest / Folding Cushion -->
                                  <div class="w-8 h-2 rounded-full border flex items-center justify-center mb-0.5"
                                    [class.bg-emerald-500]="isSeatSelected(seat.id)"
                                    [class.bg-slate-100]="!isSeatSelected(seat.id)">
                                    <div class="w-2 h-0.5 bg-current opacity-40 rounded-full"></div>
                                  </div>

                                  <div class="w-full flex items-center justify-between px-1">
                                    <span class="text-[10px] font-normal">{{ seat.seatNumber }}</span>
                                    <mat-icon class="text-xs">{{ isSeatSelected(seat.id) ? 'check' : 'airline_seat_recline_normal' }}</mat-icon>
                                  </div>

                                  <div class="w-3/4 h-0.5 bg-current opacity-20 rounded-full my-0.5"></div>

                                  <div class="text-[9px] font-normal">₹{{ seat.price }}</div>
                                </button>
                              }
                            </div>
                          </div>
                        }

                      </div>

                      <!-- Rear Tailgate & Foot Step -->
                      <div class="pt-2 mt-3 border-t-2 border-dashed border-slate-200 text-center text-slate-400 font-normal text-[10px] uppercase flex items-center justify-center space-x-1.5">
                        <mat-icon class="text-xs text-slate-400">sensor_door</mat-icon>
                        <span>Rear Luggage Boot & Tailgate</span>
                      </div>

                    </div>

                  </div>

                  <!-- Right: Passenger Details & Checkout (5 Cols) -->
                  <div class="lg:col-span-5 bg-white rounded-[22px] p-3 sm:p-4 border border-slate-200/80 space-y-3 text-slate-800">
                    
                    <div class="border-b border-slate-100 pb-2 flex items-center justify-between">
                      <h4 class="text-xs font-normal text-slate-900 uppercase tracking-wider">
                        Ride Reservation
                      </h4>
                      <span class="text-[10px] font-normal text-white bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea] px-2 py-0.5 rounded-full">
                        {{ state.selectedCarSeatIds().length }} Seat(s) Chosen
                      </span>
                    </div>

                    @if (state.selectedCarSeatIds().length === 0) {
                      <div class="py-8 text-center space-y-1.5 text-slate-500">
                        <mat-icon class="text-2xl text-indigo-600">airline_seat_recline_extra</mat-icon>
                        <p class="text-xs font-normal text-slate-900">Select seats on the vehicle diagram</p>
                        <p class="text-[10px] text-slate-400">Choose front bucket, middle, or rear jump seats</p>
                      </div>
                    } @else {
                      <div class="space-y-3 animate-fade-in">
                        
                        <!-- Chosen Seats Summary -->
                        <div class="bg-[#fcfcfd] p-2.5 rounded-[22px] border border-slate-200/80 flex items-center justify-between text-xs">
                          <div>
                            <span class="text-[9px] uppercase font-normal text-slate-500 block">Selected Seats</span>
                            <div class="font-normal text-indigo-700 flex flex-wrap gap-1 mt-0.5">
                              @for (sId of state.selectedCarSeatIds(); track sId) {
                                <span class="bg-indigo-600 text-white px-2 py-0.5 rounded-md text-[10px] font-normal">
                                  {{ getSeatObj(trip, sId)?.seatNumber }}
                                </span>
                              }
                            </div>
                          </div>
                          <div class="text-right">
                            <span class="text-[9px] uppercase font-normal text-slate-500 block">Total Fare</span>
                            <span class="text-sm font-normal text-slate-900">₹{{ calculateFinalTotal(trip) }}</span>
                          </div>
                        </div>

                        <!-- Boarding & Dropping Points -->
                        <div class="grid grid-cols-2 gap-2">
                          <div class="space-y-0.5">
                            <label for="car-bp-select" class="text-[9px] font-normal text-slate-500 uppercase block">Boarding Stand</label>
                            <select
                              id="car-bp-select"
                              (change)="onBoardingPointChange($event)"
                              class="w-full bg-[#fcfcfd] border border-slate-200 rounded-xl px-2 py-1 text-xs font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer">
                              @for (bp of trip.boardingPoints; track bp.id) {
                                <option [value]="bp.id">{{ bp.time }} · {{ bp.location }}</option>
                              }
                            </select>
                          </div>

                          <div class="space-y-0.5">
                            <label for="car-dp-select" class="text-[9px] font-normal text-slate-500 uppercase block">Drop Point</label>
                            <select
                              id="car-dp-select"
                              (change)="onDroppingPointChange($event)"
                              class="w-full bg-[#fcfcfd] border border-slate-200 rounded-xl px-2 py-1 text-xs font-normal text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer">
                              @for (dp of trip.droppingPoints; track dp.id) {
                                <option [value]="dp.id">{{ dp.time }} · {{ dp.location }}</option>
                              }
                            </select>
                          </div>
                        </div>

                        <!-- Passenger Details -->
                        <div class="grid grid-cols-2 gap-2">
                          <div class="space-y-0.5">
                            <label for="car-p-name" class="text-[9px] font-normal text-slate-500 uppercase block">Full Name</label>
                            <input
                              id="car-p-name"
                              type="text"
                              [value]="passengerName()"
                              (input)="passengerName.set($any($event.target).value)"
                              class="w-full bg-[#fcfcfd] border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-normal text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                          </div>
                          <div class="space-y-0.5">
                            <label for="car-p-phone" class="text-[9px] font-normal text-slate-500 uppercase block">Phone</label>
                            <input
                              id="car-p-phone"
                              type="text"
                              [value]="passengerPhone()"
                              (input)="passengerPhone.set($any($event.target).value)"
                              class="w-full bg-[#fcfcfd] border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-normal text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                          </div>
                        </div>

                        <!-- Fare Breakdown Summary -->
                        <div class="bg-[#fcfcfd] rounded-[22px] p-2.5 border border-slate-200/80 space-y-1 text-xs">
                          <div class="flex justify-between text-slate-600 text-[11px]">
                            <span>Seats Base Fare</span>
                            <span class="font-normal text-slate-800">₹{{ calculateBaseTotal(trip) }}</span>
                          </div>
                          <div class="flex justify-between text-slate-600 text-[11px]">
                            <span>Toll & Taxes</span>
                            <span class="font-normal text-slate-800">₹{{ calculateFinalTotal(trip) - calculateBaseTotal(trip) }}</span>
                          </div>
                          <div class="pt-1 border-t border-slate-200 flex justify-between font-normal text-slate-900 text-xs">
                            <span>Total Payable:</span>
                            <span class="text-indigo-700 text-sm font-normal">₹{{ calculateFinalTotal(trip) }}</span>
                          </div>
                        </div>

                        <!-- Confirm Booking Button -->
                        <button
                          type="button"
                          (click)="confirmBooking(trip)"
                          class="w-full py-2.5 rounded-[22px] bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea] active:scale-95 text-white font-normal text-xs transition-all cursor-pointer flex items-center justify-center space-x-1.5">
                          <mat-icon class="text-xs text-white">check_circle</mat-icon>
                          <span class="font-normal text-white">Confirm & Book · ₹{{ calculateFinalTotal(trip) }}</span>
                        </button>

                      </div>
                    }

                  </div>

                </div>

              </div>
            }

          </div>
        } @empty {
          <div class="col-span-2 bg-white rounded-[22px] result-card-shadow p-8 text-center border border-slate-200/90 space-y-2 text-slate-800">
            <div class="w-12 h-12 rounded-2xl bg-[#e0e7ff] text-[#4338ca] flex items-center justify-center mx-auto">
              <mat-icon class="text-2xl text-[#4338ca]">directions_car</mat-icon>
            </div>
            <h3 class="text-xs font-normal text-slate-800">No Sawari vehicles matching your route</h3>
            <button
              type="button"
              (click)="resetFilters()"
              class="bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea] text-white text-xs font-normal px-4 py-1.5 rounded-[22px] transition-all cursor-pointer active:scale-95">
              Reset Filters
            </button>
          </div>
        }
      </div>

      </div>
    </div>
  `,
})
export class CarsView {
  readonly state = inject(BookingState);
  readonly Math = Math;

  readonly sourceSearch = signal<string>('Bengaluru');
  readonly destSearch = signal<string>('Mysuru');
  readonly travelDate = signal<string>(new Date().toISOString().split('T')[0]);

  readonly selectedVehicleFilter = signal<string>('all');
  readonly selectedAcFilter = signal<string>('all');

  readonly activeSeatMapTripId = signal<string | null>(null);

  readonly selectedBoardingPointId = signal<string>('');
  readonly selectedDroppingPointId = signal<string>('');

  readonly passengerName = signal<string>('Rahul Sharma');
  readonly passengerPhone = signal<string>('+91 98765 43210');

  readonly filteredTrips = computed(() => {
    const all = this.state.sharedCarTrips();
    const vFilter = this.selectedVehicleFilter();
    const acFilter = this.selectedAcFilter();
    const s = this.sourceSearch().toLowerCase().trim();
    const d = this.destSearch().toLowerCase().trim();

    let res = [...all];

    if (s) {
      res = res.filter((t) => t.sourceCityName.toLowerCase().includes(s));
    }
    if (d) {
      res = res.filter((t) => t.destinationCityName.toLowerCase().includes(d));
    }
    if (vFilter !== 'all') {
      res = res.filter((t) => t.vehicleModel === vFilter);
    }
    if (acFilter !== 'all') {
      res = res.filter((t) => t.hasAc === (acFilter === 'true'));
    }

    return res;
  });

  onSourceChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.sourceSearch.set(val);
  }

  onDestChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.destSearch.set(val);
  }

  onDateChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.travelDate.set(val);
  }

  swapCities() {
    const tmp = this.sourceSearch();
    this.sourceSearch.set(this.destSearch());
    this.destSearch.set(tmp);
  }

  setVehicleFilter(model: string) {
    this.selectedVehicleFilter.set(model);
  }

  setAcFilter(ac: string) {
    this.selectedAcFilter.set(ac);
  }

  applyFilters() {
    this.state.showToast(`Found ${this.filteredTrips().length} Sawari vehicle(s) on route!`, 'info');
  }

  resetFilters() {
    this.sourceSearch.set('');
    this.destSearch.set('');
    this.selectedVehicleFilter.set('all');
    this.selectedAcFilter.set('all');
  }

  toggleSeatMap(trip: SharedCarTrip) {
    if (this.activeSeatMapTripId() === trip.id) {
      this.activeSeatMapTripId.set(null);
      this.state.selectedCarSeatIds.set([]);
    } else {
      this.activeSeatMapTripId.set(trip.id);
      this.state.selectedCarSeatIds.set([]);
      if (trip.boardingPoints.length > 0) {
        this.selectedBoardingPointId.set(trip.boardingPoints[0].id);
      }
      if (trip.droppingPoints.length > 0) {
        this.selectedDroppingPointId.set(trip.droppingPoints[0].id);
      }
    }
  }

  getFrontSeats(trip: SharedCarTrip): CarSeat[] {
    return trip.seats.filter((s) => s.row === 'front');
  }

  getMiddleSeats(trip: SharedCarTrip): CarSeat[] {
    return trip.seats.filter((s) => s.row === 'middle');
  }

  getRearAndJumpSeats(trip: SharedCarTrip): CarSeat[] {
    return trip.seats.filter((s) => s.row === 'rear' || s.row === 'jump');
  }

  isSeatSelected(seatId: string): boolean {
    return this.state.selectedCarSeatIds().includes(seatId);
  }

  toggleSeat(trip: SharedCarTrip, seat: CarSeat) {
    if (seat.status === 'booked') return;

    const current = this.state.selectedCarSeatIds();
    if (current.includes(seat.id)) {
      this.state.selectedCarSeatIds.set(current.filter((id) => id !== seat.id));
    } else {
      this.state.selectedCarSeatIds.set([...current, seat.id]);
    }
  }

  getCarSeatClasses(seat: CarSeat): string {
    const isSelected = this.isSeatSelected(seat.id);

    if (isSelected) {
      return 'bg-emerald-600 text-white border-emerald-700 ring-2 ring-emerald-500';
    }

    if (seat.status === 'booked') {
      return 'bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed opacity-60';
    }

    return 'bg-white hover:bg-slate-50 hover:border-emerald-500 text-slate-800 border-slate-200';
  }

  getSeatObj(trip: SharedCarTrip, seatId: string): CarSeat | undefined {
    return trip.seats.find((s) => s.id === seatId);
  }

  calculateBaseTotal(trip: SharedCarTrip): number {
    return this.state.selectedCarSeatIds().reduce((acc, sId) => {
      const s = trip.seats.find((item) => item.id === sId);
      return acc + (s ? s.price : trip.baseFare);
    }, 0);
  }

  calculateFinalTotal(trip: SharedCarTrip): number {
    const base = this.calculateBaseTotal(trip);
    const fee = 15;
    const tax = Math.round((base + fee) * 0.05);
    return base + fee + tax;
  }

  onBoardingPointChange(event: Event) {
    this.selectedBoardingPointId.set((event.target as HTMLSelectElement).value);
  }

  onDroppingPointChange(event: Event) {
    this.selectedDroppingPointId.set((event.target as HTMLSelectElement).value);
  }

  confirmBooking(trip: SharedCarTrip) {
    const seatIds = this.state.selectedCarSeatIds();
    if (seatIds.length === 0) {
      this.state.showToast('Please select at least one seat', 'warning');
      return;
    }

    const passengers = seatIds.map((sId, index) => {
      const seat = trip.seats.find((s) => s.id === sId);
      return {
        name: index === 0 ? this.passengerName() : `Passenger ${index + 1}`,
        age: 30,
        gender: 'male',
        fare: seat ? seat.price : trip.baseFare,
      };
    });

    this.state.bookSharedCarTrip({
      tripId: trip.id,
      seatIds,
      passengers,
      selectedBoardingPointId: this.selectedBoardingPointId() || trip.boardingPoints[0].id,
      selectedDroppingPointId: this.selectedDroppingPointId() || trip.droppingPoints[0].id,
    }, () => {
      this.activeSeatMapTripId.set(null);
    });
  }
}
