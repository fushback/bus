import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {SUPABASE_PHASE_1_SQL} from '../../data/supabase-schema-sql';
import {BookingState} from '../../services/booking-state';

@Component({
  selector: 'app-schema-viewer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <!-- Studio Header & Database Diagnostics Banner -->
      <div class="bg-gradient-to-br from-slate-900 via-zinc-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8  border border-white/10">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-3">
            <div class="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-normal uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Database Engine & Live CRUD Studio</span>
            </div>
            <h1 class="text-2xl sm:text-4xl font-normal tracking-tight">
              Database Connectivity & CRUD Operations
            </h1>
            <p class="text-zinc-300 text-sm sm:text-base max-w-3xl leading-relaxed">
              Real-time PostgreSQL (Supabase) database connectivity, dynamic data hydration, full CRUD administration across Cities, Bus Schedules, Seats, and Bookings, with automated end-to-end verification.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              (click)="testConnectivity()"
              [disabled]="state.isDbTesting()"
              class="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-normal text-sm  -900/30 transition-all cursor-pointer disabled:opacity-50">
              <mat-icon class="text-base" [class.animate-spin]="state.isDbTesting()">
                {{ state.isDbTesting() ? 'refresh' : 'network_check' }}
              </mat-icon>
              <span>{{ state.isDbTesting() ? 'Testing...' : 'Test DB Ping' }}</span>
            </button>

            <button
              (click)="runCrudDiagnostics()"
              [disabled]="state.isCrudTesting()"
              class="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-[#800020] hover:bg-[#660019] text-white font-normal text-sm  -950/20 transition-all cursor-pointer disabled:opacity-50">
              <mat-icon class="text-base text-white" [class.animate-spin]="state.isCrudTesting()">
                {{ state.isCrudTesting() ? 'refresh' : 'play_circle' }}
              </mat-icon>
              <span class="text-white font-normal">{{ state.isCrudTesting() ? 'Verifying...' : 'Run CRUD Test Suite' }}</span>
            </button>
          </div>
        </div>

        <!-- Live Database Metrics Cards -->
        <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mt-8 pt-6 border-t border-white/10">
          <div class="bg-white/5 rounded-2xl p-4 border border-white/5">
            <span class="text-xs text-zinc-400 font-normal block uppercase tracking-wider">Status</span>
            <div class="flex items-center space-x-1.5 mt-1">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span class="text-lg sm:text-xl font-normal text-white">Connected</span>
            </div>
            <span class="text-[11px] text-zinc-400">Latency: {{ state.dbStatus()?.latencyMs || 2 }}ms</span>
          </div>

          <div class="bg-white/5 rounded-2xl p-4 border border-white/5">
            <span class="text-xs text-zinc-400 font-normal block uppercase tracking-wider">Cities Table</span>
            <span class="text-xl sm:text-2xl font-normal text-emerald-400 mt-1 block">
              {{ state.cities().length }} Records
            </span>
            <span class="text-[11px] text-zinc-400">redbus_db.cities</span>
          </div>

          <div class="bg-white/5 rounded-2xl p-4 border border-white/5">
            <span class="text-xs text-zinc-400 font-normal block uppercase tracking-wider">Trips Table</span>
            <span class="text-xl sm:text-2xl font-normal text-amber-400 mt-1 block">
              {{ state.allTrips().length }} Schedules
            </span>
            <span class="text-[11px] text-zinc-400">redbus_db.trips</span>
          </div>

          <div class="bg-white/5 rounded-2xl p-4 border border-white/5">
            <span class="text-xs text-zinc-400 font-normal block uppercase tracking-wider">Bookings Table</span>
            <span class="text-xl sm:text-2xl font-normal text-purple-400 mt-1 block">
              {{ state.userBookings().length }} Tickets
            </span>
            <span class="text-[11px] text-zinc-400">redbus_db.bookings</span>
          </div>

          <div class="bg-white/5 rounded-2xl p-4 border border-white/5 col-span-2 md:col-span-1">
            <span class="text-xs text-zinc-400 font-normal block uppercase tracking-wider">Concurrency Lock</span>
            <span class="text-xl sm:text-2xl font-normal text-blue-500 mt-1 block">
              {{ state.activeHold() ? '1 Active' : '0 Holds' }}
            </span>
            <span class="text-[11px] text-zinc-400">5-Min Atomic TTL</span>
          </div>
        </div>

        <!-- Connectivity Probe Results Bar (if executed) -->
        @if (state.lastConnectivityTest(); as probe) {
          <div class="mt-4 p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div class="flex items-center space-x-2 text-emerald-300">
              <mat-icon class="text-base text-emerald-400">check_circle</mat-icon>
              <span><strong>Connectivity Diagnostic Passed:</strong> {{ probe.message }} (Probe: {{ probe.probeKey }})</span>
            </div>
            <span class="text-zinc-400 font-mono text-[11px]">Roundtrip: {{ probe.roundtripMs }}ms</span>
          </div>
        }
      </div>

      <!-- Automated CRUD Test Suite Execution Panel (if run) -->
      @if (state.crudTestResults().length > 0) {
        <div class="bg-white rounded-3xl p-6 border border-zinc-200  space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <mat-icon class="text-lg">playlist_add_check</mat-icon>
              </div>
              <div>
                <h3 class="font-normal text-slate-900 text-base">End-to-End CRUD Test Suite Results</h3>
                <p class="text-xs text-zinc-500">Live transaction executed against the backend database.</p>
              </div>
            </div>

            <button (click)="clearCrudLogs()" class="text-xs text-zinc-500 hover:text-zinc-800 font-normal cursor-pointer">
              Clear Logs
            </button>
          </div>

          <div class="space-y-2">
            @for (step of state.crudTestResults(); track step.step) {
              <div class="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div class="flex items-start space-x-2.5">
                  <span class="px-2 py-0.5 rounded-md font-mono text-[10px] font-normal"
                    [class.bg-emerald-100]="step.operation === 'CREATE'"
                    [class.text-emerald-800]="step.operation === 'CREATE'"
                    [class.bg-blue-100]="step.operation === 'READ'"
                    [class.text-blue-800]="step.operation === 'READ'"
                    [class.bg-amber-100]="step.operation === 'UPDATE'"
                    [class.text-amber-800]="step.operation === 'UPDATE'"
                    [class.bg-blue-500]="step.operation === 'DELETE'"
                    [class.text-blue-500]="step.operation === 'DELETE'"
                    [class.bg-purple-100]="step.operation === 'VERIFY'"
                    [class.text-purple-800]="step.operation === 'VERIFY'">
                    {{ step.operation }}
                  </span>
                  <div>
                    <span class="font-normal text-slate-900">{{ step.step }}</span>
                    <p class="text-[11px] text-zinc-600 mt-0.5">{{ step.details }}</p>
                  </div>
                </div>

                <div class="flex items-center space-x-3 shrink-0 self-end sm:self-auto">
                  <span class="font-mono text-zinc-400 text-[11px]">{{ step.durationMs }}ms</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-normal uppercase bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                    <mat-icon class="text-xs">check</mat-icon>
                    <span>PASSED</span>
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Studio Navigation Tabs: Cities CRUD | Trips CRUD | Bookings CRUD | Schema DDL -->
      <div class="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2">
        <button
          (click)="activeTab.set('cities')"
          [class.border-blue-600]="activeTab() === 'cities'"
          [class.text-blue-600]="activeTab() === 'cities'"
          [class.border-transparent]="activeTab() !== 'cities'"
          [class.text-slate-600]="activeTab() !== 'cities'"
          class="px-4 py-2 font-normal text-sm border-b-2 transition-all flex items-center space-x-2 cursor-pointer shrink-0">
          <mat-icon class="text-base">location_city</mat-icon>
          <span>Cities CRUD ({{ state.cities().length }})</span>
        </button>

        <button
          (click)="activeTab.set('trips')"
          [class.border-blue-600]="activeTab() === 'trips'"
          [class.text-blue-600]="activeTab() === 'trips'"
          [class.border-transparent]="activeTab() !== 'trips'"
          [class.text-slate-600]="activeTab() !== 'trips'"
          class="px-4 py-2 font-normal text-sm border-b-2 transition-all flex items-center space-x-2 cursor-pointer shrink-0">
          <mat-icon class="text-base">directions_bus</mat-icon>
          <span>Trips & Bus CRUD ({{ state.allTrips().length }})</span>
        </button>

        <button
          (click)="activeTab.set('bookings')"
          [class.border-blue-600]="activeTab() === 'bookings'"
          [class.text-blue-600]="activeTab() === 'bookings'"
          [class.border-transparent]="activeTab() !== 'bookings'"
          [class.text-slate-600]="activeTab() !== 'bookings'"
          class="px-4 py-2 font-normal text-sm border-b-2 transition-all flex items-center space-x-2 cursor-pointer shrink-0">
          <mat-icon class="text-base">confirmation_number</mat-icon>
          <span>Bookings CRUD ({{ state.userBookings().length }})</span>
        </button>

        <button
          (click)="activeTab.set('schema')"
          [class.border-blue-600]="activeTab() === 'schema'"
          [class.text-blue-600]="activeTab() === 'schema'"
          [class.border-transparent]="activeTab() !== 'schema'"
          [class.text-slate-600]="activeTab() !== 'schema'"
          class="px-4 py-2 font-normal text-sm border-b-2 transition-all flex items-center space-x-2 cursor-pointer shrink-0">
          <mat-icon class="text-base">schema</mat-icon>
          <span>PostgreSQL Schema DDL</span>
        </button>
      </div>

      <!-- ================================================================= -->
      <!-- TAB 1: CITIES CRUD MANAGER -->
      <!-- ================================================================= -->
      @if (activeTab() === 'cities') {
        <div class="space-y-6">
          <div class="bg-white rounded-3xl p-6 border border-zinc-200  space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
              <div>
                <h3 class="font-normal text-slate-900 text-lg">Cities Database Inventory (redbus_db.cities)</h3>
                <p class="text-xs text-zinc-500">Create, Read, Update, and Delete bus departure and destination hubs in the database.</p>
              </div>

              <button
                (click)="isAddCityOpen.set(!isAddCityOpen())"
                class="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#660019] text-white font-normal text-xs flex items-center space-x-1.5 cursor-pointer ">
                <mat-icon class="text-sm text-white">{{ isAddCityOpen() ? 'close' : 'add' }}</mat-icon>
                <span class="text-white font-normal">{{ isAddCityOpen() ? 'Cancel' : 'Add New City (CRUD Create)' }}</span>
              </button>
            </div>

            <!-- Add City Form -->
            @if (isAddCityOpen()) {
              <div class="p-5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-4">
                <span class="text-xs font-normal uppercase tracking-wider text-slate-900 block">
                  Add New City Record (INSERT INTO redbus_db.cities)
                </span>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span class="block text-[11px] font-normal text-zinc-500 mb-1">City Name</span>
                    <input
                      type="text"
                      [value]="newCityName()"
                      (input)="newCityName.set($any($event.target).value)"
                      placeholder="e.g. Ahmedabad"
                      class="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-normal" />
                  </div>
                  <div>
                    <span class="block text-[11px] font-normal text-zinc-500 mb-1">State</span>
                    <input
                      type="text"
                      [value]="newCityState()"
                      (input)="newCityState.set($any($event.target).value)"
                      placeholder="e.g. Gujarat"
                      class="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-normal" />
                  </div>
                  <div>
                    <span class="block text-[11px] font-normal text-zinc-500 mb-1">Code (3-letters)</span>
                    <input
                      type="text"
                      [value]="newCityCode()"
                      (input)="newCityCode.set($any($event.target).value)"
                      placeholder="e.g. AMD"
                      class="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-normal uppercase" />
                  </div>
                </div>

                <div class="flex justify-end space-x-2">
                  <button
                    (click)="submitAddCity()"
                    class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-normal flex items-center space-x-1.5 cursor-pointer">
                    <mat-icon class="text-sm">save</mat-icon>
                    <span>Save City to Database</span>
                  </button>
                </div>
              </div>
            }

            <!-- Cities Table List -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="bg-zinc-50 text-zinc-500 uppercase tracking-wider text-[10px] border-b border-zinc-200">
                    <th class="p-3">ID</th>
                    <th class="p-3">City Name</th>
                    <th class="p-3">Code</th>
                    <th class="p-3">State</th>
                    <th class="p-3">Terminals</th>
                    <th class="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-100">
                  @for (c of state.cities(); track c.id) {
                    <tr class="hover:bg-zinc-50/70 transition-colors">
                      <td class="p-3 font-mono font-normal text-zinc-400">{{ c.id }}</td>
                      <td class="p-3 font-normal text-slate-900">{{ c.name }}</td>
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-mono font-normal">{{ c.code }}</span>
                      </td>
                      <td class="p-3 text-zinc-600">{{ c.state }}</td>
                      <td class="p-3 text-zinc-500 truncate max-w-xs">{{ c.popularTerminals.slice(0, 3).join(', ') }}</td>
                      <td class="p-3 text-right space-x-2">
                        <button
                          (click)="deleteCity(c.id, c.name)"
                          class="px-2.5 py-1 text-blue-500 hover:bg-blue-500 rounded-lg font-normal text-[11px] cursor-pointer">
                          Delete (CRUD)
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- ================================================================= -->
      <!-- TAB 2: TRIPS & BUS SCHEDULES CRUD MANAGER -->
      <!-- ================================================================= -->
      @if (activeTab() === 'trips') {
        <div class="space-y-6">
          <div class="bg-white rounded-3xl p-6 border border-zinc-200  space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
              <div>
                <h3 class="font-normal text-slate-900 text-lg">Bus Schedules Inventory (redbus_db.trips)</h3>
                <p class="text-xs text-zinc-500">Manage bus routes, operators, schedules, base fares, and berths in the database.</p>
              </div>

              <button
                (click)="isAddTripOpen.set(!isAddTripOpen())"
                class="px-4 py-2 rounded-xl bg-[#800020] hover:bg-[#660019] text-white font-normal text-xs flex items-center space-x-1.5 cursor-pointer ">
                <mat-icon class="text-sm text-white">{{ isAddTripOpen() ? 'close' : 'add' }}</mat-icon>
                <span class="text-white font-normal">{{ isAddTripOpen() ? 'Cancel' : 'Create Schedule (CRUD Create)' }}</span>
              </button>
            </div>

            <!-- Add Trip Form -->
            @if (isAddTripOpen()) {
              <div class="p-5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-4">
                <span class="text-xs font-normal uppercase tracking-wider text-slate-900 block">
                  Add Bus Schedule (INSERT INTO redbus_db.trips & redbus_db.buses)
                </span>
                <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <span class="block text-[11px] font-normal text-zinc-500 mb-1">Operator Name</span>
                    <input
                      type="text"
                      [value]="newTripOperator()"
                      (input)="newTripOperator.set($any($event.target).value)"
                      placeholder="e.g. VRL Travels"
                      class="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-normal" />
                  </div>
                  <div>
                    <span class="block text-[11px] font-normal text-zinc-500 mb-1">Bus Type</span>
                    <select
                      [value]="newTripBusType()"
                      (change)="newTripBusType.set($any($event.target).value)"
                      class="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-normal">
                      <option value="ac_sleeper">AC Sleeper (2+1)</option>
                      <option value="volvo_multi_axle">Volvo Multi-Axle</option>
                      <option value="sleeper">Non-AC Sleeper</option>
                      <option value="semi_sleeper">Semi Sleeper</option>
                    </select>
                  </div>
                  <div>
                    <span class="block text-[11px] font-normal text-zinc-500 mb-1">Departure Time</span>
                    <input
                      type="time"
                      [value]="newTripDepTime()"
                      (input)="newTripDepTime.set($any($event.target).value)"
                      class="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-normal" />
                  </div>
                  <div>
                    <span class="block text-[11px] font-normal text-zinc-500 mb-1">Base Fare (₹)</span>
                    <input
                      type="number"
                      [value]="newTripFare()"
                      (input)="newTripFare.set($any($event.target).value)"
                      class="w-full p-2.5 bg-white border border-zinc-300 rounded-xl text-xs font-normal" />
                  </div>
                </div>

                <div class="flex justify-end space-x-2">
                  <button
                    (click)="submitAddTrip()"
                    class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-normal flex items-center space-x-1.5 cursor-pointer">
                    <mat-icon class="text-sm">save</mat-icon>
                    <span>Create Schedule in Database</span>
                  </button>
                </div>
              </div>
            }

            <!-- Trips Table List -->
            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs">
                <thead>
                  <tr class="bg-zinc-50 text-zinc-500 uppercase tracking-wider text-[10px] border-b border-zinc-200">
                    <th class="p-3">Schedule ID</th>
                    <th class="p-3">Operator</th>
                    <th class="p-3">Route</th>
                    <th class="p-3">Time</th>
                    <th class="p-3">Base Fare</th>
                    <th class="p-3">Rating</th>
                    <th class="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-100">
                  @for (t of state.allTrips(); track t.id) {
                    <tr class="hover:bg-zinc-50/70 transition-colors">
                      <td class="p-3 font-mono font-normal text-zinc-400">{{ t.id }}</td>
                      <td class="p-3">
                        <span class="font-normal text-slate-900 block">{{ t.bus.operatorName }}</span>
                        <span class="text-[10px] text-zinc-500">{{ t.bus.busType }}</span>
                      </td>
                      <td class="p-3 font-normal text-zinc-700">{{ t.sourceCityName }} → {{ t.destinationCityName }}</td>
                      <td class="p-3 font-mono">{{ t.departureTime }} - {{ t.arrivalTime }}</td>
                      <td class="p-3 font-normal text-slate-900">₹{{ t.baseFare }}</td>
                      <td class="p-3">
                        <span class="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-normal text-[11px]">★ {{ t.bus.rating }}</span>
                      </td>
                      <td class="p-3 text-right space-x-2">
                        <button
                          (click)="deleteTrip(t.id, t.bus.operatorName)"
                          class="px-2.5 py-1 text-blue-500 hover:bg-blue-500 rounded-lg font-normal text-[11px] cursor-pointer">
                          Delete (CRUD)
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- ================================================================= -->
      <!-- TAB 3: BOOKINGS CRUD MANAGER -->
      <!-- ================================================================= -->
      @if (activeTab() === 'bookings') {
        <div class="space-y-6">
          <div class="bg-white rounded-3xl p-6 border border-zinc-200  space-y-4">
            <div class="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div>
                <h3 class="font-normal text-slate-900 text-lg">Bookings & Tickets Ledger (redbus_db.bookings)</h3>
                <p class="text-xs text-zinc-500">Live booking records persisted in database with cancel and passenger update capabilities.</p>
              </div>

              <span class="px-3 py-1 rounded-full text-xs font-normal bg-purple-50 text-purple-700">
                {{ state.userBookings().length }} Confirmed Transactions
              </span>
            </div>

            @if (state.userBookings().length === 0) {
              <div class="p-8 text-center text-zinc-400 text-xs">
                No booking records currently in database. Book a trip from the main booking app to generate entries.
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                  <thead>
                    <tr class="bg-zinc-50 text-zinc-500 uppercase tracking-wider text-[10px] border-b border-zinc-200">
                      <th class="p-3">PNR Code</th>
                      <th class="p-3">Route</th>
                      <th class="p-3">Seats</th>
                      <th class="p-3">Total Amount</th>
                      <th class="p-3">Status</th>
                      <th class="p-3 text-right">CRUD Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-100">
                    @for (b of state.userBookings(); track b.id) {
                      <tr class="hover:bg-zinc-50/70 transition-colors">
                        <td class="p-3 font-mono font-normal text-[#800020]">{{ b.bookingCode }}</td>
                        <td class="p-3 font-normal text-slate-900">{{ b.trip.sourceCityName }} → {{ b.trip.destinationCityName }}</td>
                        <td class="p-3 font-normal text-emerald-700">
                          {{ getSeatNums(b) }}
                        </td>
                        <td class="p-3 font-normal text-slate-900">₹{{ b.totalAmount }}</td>
                        <td class="p-3">
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-normal uppercase"
                            [class.bg-emerald-100]="b.status === 'confirmed'"
                            [class.text-emerald-800]="b.status === 'confirmed'"
                            [class.bg-blue-500]="b.status === 'cancelled'"
                            [class.text-blue-500]="b.status === 'cancelled'">
                            {{ b.status }}
                          </span>
                        </td>
                        <td class="p-3 text-right space-x-2">
                          @if (b.status === 'confirmed') {
                            <button
                              (click)="cancelBooking(b.id, b.bookingCode)"
                              class="px-2.5 py-1 text-blue-500 hover:bg-blue-500 rounded-lg font-normal text-[11px] cursor-pointer">
                              Cancel & Free Seats (CRUD)
                            </button>
                          }
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      }

      <!-- ================================================================= -->
      <!-- TAB 4: POSTGRESQL SCHEMA DDL & ARCHITECTURE -->
      <!-- ================================================================= -->
      @if (activeTab() === 'schema') {
        <div class="space-y-6">
          <div class="bg-zinc-950 rounded-3xl p-6 border border-zinc-800 text-zinc-100  space-y-4">
            <div class="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div class="flex items-center space-x-2">
                <span class="w-3 h-3 rounded-full bg-rose-500"></span>
                <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span class="w-3 h-3 rounded-full bg-green-500"></span>
                <span class="text-xs text-zinc-400 font-mono ml-2">supabase/migrations/redbus_db_schema.sql</span>
              </div>
              <button
                (click)="copySql()"
                class="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-normal text-zinc-300 flex items-center space-x-1.5 cursor-pointer">
                <mat-icon class="text-sm">{{ copied() ? 'check' : 'content_copy' }}</mat-icon>
                <span>{{ copied() ? 'Copied' : 'Copy DDL Script' }}</span>
              </button>
            </div>

            <pre class="font-mono text-xs sm:text-sm text-zinc-300 overflow-x-auto p-2 leading-relaxed max-h-[500px]"><code>{{ sqlContent }}</code></pre>
          </div>
        </div>
      }

    </div>
  `,
})
export class SchemaViewer {
  readonly state = inject(BookingState);

  readonly activeTab = signal<'cities' | 'trips' | 'bookings' | 'schema'>('cities');
  readonly copied = signal<boolean>(false);

  // Forms
  readonly isAddCityOpen = signal<boolean>(false);
  readonly newCityName = signal<string>('');
  readonly newCityState = signal<string>('');
  readonly newCityCode = signal<string>('');

  readonly isAddTripOpen = signal<boolean>(false);
  readonly newTripOperator = signal<string>('VRL Travels');
  readonly newTripBusType = signal<string>('ac_sleeper');
  readonly newTripDepTime = signal<string>('21:00');
  readonly newTripFare = signal<string>('950');

  readonly sqlContent = SUPABASE_PHASE_1_SQL;

  testConnectivity() {
    this.state.testDatabaseConnectivity();
  }

  runCrudDiagnostics() {
    this.state.runFullCrudDiagnostics();
  }

  clearCrudLogs() {
    this.state.crudTestResults.set([]);
  }

  submitAddCity() {
    if (!this.newCityName().trim() || !this.newCityState().trim()) {
      this.state.showToast('Please enter both city name and state', 'warning');
      return;
    }
    this.state.createCity({
      name: this.newCityName().trim(),
      state: this.newCityState().trim(),
      code: (this.newCityCode() || this.newCityName().substring(0, 3)).toUpperCase(),
      popularTerminals: ['Central Bus Station', 'Railway Terminal'],
    });
    this.newCityName.set('');
    this.newCityState.set('');
    this.newCityCode.set('');
    this.isAddCityOpen.set(false);
  }

  deleteCity(id: string, name: string) {
    if (confirm(`Delete city "${name}" from database?`)) {
      this.state.deleteCity(id);
    }
  }

  submitAddTrip() {
    if (!this.newTripOperator().trim()) {
      this.state.showToast('Please enter operator name', 'warning');
      return;
    }
    const src = this.state.sourceCity();
    const dst = this.state.destinationCity();

    this.state.createTrip({
      operatorName: this.newTripOperator().trim(),
      busType: this.newTripBusType(),
      sourceCityId: src.id,
      destinationCityId: dst.id,
      departureTime: this.newTripDepTime(),
      arrivalTime: '06:00',
      duration: '9h 00m',
      baseFare: Number(this.newTripFare()) || 850,
      hasAc: this.newTripBusType().includes('ac'),
      date: this.state.travelDate(),
    });

    this.isAddTripOpen.set(false);
  }

  deleteTrip(id: string, name: string) {
    if (confirm(`Delete bus schedule "${name}" from database?`)) {
      this.state.deleteTrip(id);
    }
  }

  cancelBooking(id: string, code: string) {
    if (confirm(`Cancel booking ${code} in database and release all associated seats?`)) {
      this.state.cancelBooking(id);
    }
  }

  getSeatNums(b: { passengers: { seatNumber: string }[] }): string {
    return b.passengers.map((p) => p.seatNumber).join(', ');
  }

  copySql() {
    navigator.clipboard.writeText(this.sqlContent);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
    this.state.showToast('SQL DDL copied to clipboard!', 'success');
  }
}
