import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {BookingState} from '../../services/booking-state';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <header class="bg-white text-slate-800 border-b border-slate-200 sticky top-0 z-40 transition-colors">
      <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-14">
          
          <!-- Logo & Brand (Clean Flat UI) -->
          <button
            type="button"
            (click)="state.goToSearch(); state.currentTab.set('booking')"
            class="flex items-center space-x-2.5 group cursor-pointer text-left bg-transparent p-0 focus:outline-none shrink-0">
            <div class="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center group-hover:scale-105 active:scale-95 transition-all">
              <mat-icon class="text-lg text-white">directions_bus</mat-icon>
            </div>
            <div class="flex items-baseline">
              <span class="text-lg tracking-tight text-slate-900 font-normal">
                red<span class="text-rose-600">Bus</span>
              </span>
            </div>
          </button>

          <!-- Primary Travel Navigation (Flat Segmented Control) -->
          <nav class="hidden md:flex items-center bg-slate-100/80 p-1 rounded-xl text-xs border border-slate-200">
            
            <!-- Rides (Bus & Car Unified Module) -->
            <button
              type="button"
              (click)="state.currentTab.set('booking')"
              [class.bg-white]="state.currentTab() === 'booking' || state.currentTab() === 'cars'"
              [class.text-rose-600]="state.currentTab() === 'booking' || state.currentTab() === 'cars'"
              
              [class.text-slate-600]="state.currentTab() !== 'booking' && state.currentTab() !== 'cars'"
              class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer hover:text-slate-900 active:scale-95 text-xs"
              title="Bus & Car Rides">
              <mat-icon class="text-sm leading-none" [class.text-rose-600]="state.currentTab() === 'booking' || state.currentTab() === 'cars'">commute</mat-icon>
              <span>Bus & Car</span>
            </button>

            <!-- Tour Trips -->
            <button
              type="button"
              (click)="state.currentTab.set('trip')"
              [class.bg-white]="state.currentTab() === 'trip'"
              [class.text-emerald-600]="state.currentTab() === 'trip'"
              
              [class.text-slate-600]="state.currentTab() !== 'trip'"
              class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer hover:text-slate-900 active:scale-95 text-xs">
              <mat-icon class="text-sm leading-none" [class.text-emerald-600]="state.currentTab() === 'trip'">luggage</mat-icon>
              <span>Tours</span>
            </button>

            <!-- My Tickets -->
            <button
              type="button"
              (click)="state.currentTab.set('tickets')"
              [class.bg-white]="state.currentTab() === 'tickets'"
              [class.text-indigo-600]="state.currentTab() === 'tickets'"
              
              [class.text-slate-600]="state.currentTab() !== 'tickets'"
              class="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer hover:text-slate-900 active:scale-95 text-xs">
              <mat-icon class="text-sm leading-none" [class.text-indigo-600]="state.currentTab() === 'tickets'">confirmation_number</mat-icon>
              <span>Tickets</span>
              @if (state.userBookings().length > 0) {
                <span class="px-1.5 py-0.5 text-[10px] bg-rose-50 text-rose-700 rounded-full tabular-nums font-normal border border-rose-200">
                  {{ state.userBookings().length }}
                </span>
              }
            </button>
          </nav>

          <!-- Right Action Utilities -->
          <div class="flex items-center space-x-2">
            
            <!-- Offers & Coupons Trigger -->
            <button
              type="button"
              (click)="state.isCouponModalOpen.set(true)"
              class="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-normal transition-all cursor-pointer active:scale-95"
              title="Offers & Coupons">
              <mat-icon class="text-xs text-amber-600">local_offer</mat-icon>
              <span>Coupons</span>
              @if (state.appliedCoupon()) {
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              }
            </button>

            <!-- Database Studio Button -->
            <button
              type="button"
              (click)="state.currentTab.set('schema')"
              [class.bg-slate-900]="state.currentTab() === 'schema'"
              [class.text-white]="state.currentTab() === 'schema'"
              [class.bg-slate-100]="state.currentTab() !== 'schema'"
              [class.text-slate-700]="state.currentTab() !== 'schema'"
              class="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-normal border border-slate-200 hover:border-slate-300 active:scale-95 transition-all cursor-pointer"
              title="Database Studio">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <mat-icon class="text-xs">dns</mat-icon>
              <span class="hidden sm:inline">DB Studio</span>
            </button>

            <!-- Account Trigger -->
            <button
              type="button"
              (click)="state.isAuthModalOpen.set(true)"
              class="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-normal transition-all cursor-pointer active:scale-95">
              <mat-icon class="text-xs text-white">person</mat-icon>
              <span>{{ state.currentUser() ? state.currentUser().fullName.split(' ')[0] : 'Sign In' }}</span>
            </button>

          </div>

        </div>

        <!-- Mobile Navigation Strip -->
        <div class="flex md:hidden items-center justify-around py-1.5 text-[11px] border-t border-slate-100 text-slate-600 overflow-x-auto gap-1">
          <button
            type="button"
            (click)="state.currentTab.set('booking')"
            [class.bg-rose-50]="state.currentTab() === 'booking' || state.currentTab() === 'cars'"
            [class.text-rose-600]="state.currentTab() === 'booking' || state.currentTab() === 'cars'"
            
            class="flex items-center space-x-1 px-2.5 py-1 rounded-lg cursor-pointer transition-all">
            <mat-icon class="text-sm">commute</mat-icon>
            <span>Rides</span>
          </button>
          <button
            type="button"
            (click)="state.currentTab.set('trip')"
            [class.bg-emerald-50]="state.currentTab() === 'trip'"
            [class.text-emerald-600]="state.currentTab() === 'trip'"
            
            class="flex items-center space-x-1 px-2.5 py-1 rounded-lg cursor-pointer transition-all">
            <mat-icon class="text-sm">luggage</mat-icon>
            <span>Tours</span>
          </button>
          <button
            type="button"
            (click)="state.currentTab.set('tickets')"
            [class.bg-indigo-50]="state.currentTab() === 'tickets'"
            [class.text-indigo-600]="state.currentTab() === 'tickets'"
            
            class="flex items-center space-x-1 px-2.5 py-1 rounded-lg cursor-pointer transition-all">
            <mat-icon class="text-sm">confirmation_number</mat-icon>
            <span>Tickets ({{ state.userBookings().length }})</span>
          </button>
        </div>

      </div>
    </header>
  `,
})
export class Header {
  readonly state = inject(BookingState);
}
