import {ChangeDetectionStrategy, Component, inject, signal} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {BookingState} from '../../services/booking-state';

@Component({
  selector: 'app-auth-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    @if (state.isAuthModalOpen()) {
      <div
        class="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans animate-fade-in"
        (click)="state.isAuthModalOpen.set(false)">
        <div
          class="bg-white text-[#1b1b1b] rounded-t-[30px] sm:rounded-[30px] max-w-md w-full result-card-shadow overflow-hidden animate-slide-up"
          (click)="$event.stopPropagation()">
          
          <!-- Pastel Peach-Pink-Lavender Offcanvas Header (Matches Date Offcanvas Theme) -->
          <div class="px-5 pt-3.5 pb-4 bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] relative overflow-hidden">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)] pointer-events-none"></div>

            <!-- Top Drag Pill on Mobile -->
            <div class="relative z-10 w-11 h-1.5 bg-slate-400/40 rounded-full mx-auto mb-2.5 sm:hidden"></div>

            <div class="relative z-10 flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                  [class]="state.activeBookingMode() === 'car' || state.searchCategory() === 'car'
                    ? 'bg-[#e0e7ff] text-[#4338ca]'
                    : state.searchCategory() === 'hotel'
                      ? 'bg-[#e0f2fe] text-[#0284c7]'
                      : state.activeBookingMode() === 'transport' || state.searchCategory() === 'transport'
                        ? 'bg-[#fae8ff] text-[#a21caf]'
                        : 'bg-[#ffe4e6] text-[#be123c]'">
                  <mat-icon class="text-[22px] leading-none">person</mat-icon>
                </div>
                <div>
                  <div class="flex items-center space-x-2">
                    <h3 class="text-[16px] font-extrabold text-slate-900 leading-tight">
                      {{ isSignUp() ? 'Create Account' : 'Passenger Account' }}
                    </h3>
                    <span
                      [class]="state.activeBookingMode() === 'car' || state.searchCategory() === 'car'
                        ? 'bg-indigo-100/80 text-[#4338ca]'
                        : state.searchCategory() === 'hotel'
                          ? 'bg-sky-100/80 text-[#0284c7]'
                          : state.activeBookingMode() === 'transport' || state.searchCategory() === 'transport'
                            ? 'bg-fuchsia-100/80 text-[#a21caf]'
                            : 'bg-rose-100/80 text-[#be123c]'"
                      class="px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wide">
                      Verified
                    </span>
                  </div>
                  <p class="text-[12px] text-slate-600 font-medium mt-0.5">
                    Manage your bookings &amp; wallet
                  </p>
                </div>
              </div>

              <button
                type="button"
                (click)="state.isAuthModalOpen.set(false)"
                aria-label="Close account modal"
                class="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-slate-700 cursor-pointer transition-colors shadow-2xs">
                <mat-icon class="text-[18px] leading-none">close</mat-icon>
              </button>
            </div>
          </div>

          <!-- Auth Form (Borderless Inputs & Buttons) -->
          <div class="p-5 sm:p-6 space-y-3.5 text-xs text-slate-800">
            @if (isSignUp()) {
              <div class="space-y-1">
                <label for="auth-fullname" class="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Full Name</label>
                <input
                  id="auth-fullname"
                  type="text"
                  aria-label="Full Name"
                  [value]="fullName()"
                  (input)="fullName.set(getInputValue($event))"
                  placeholder="Rahul Sharma"
                  class="w-full bg-[#f4f6f9] border-0 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none" />
              </div>
            }

            <div class="space-y-1">
              <label for="auth-email" class="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email Address</label>
              <input
                id="auth-email"
                type="email"
                aria-label="Email Address"
                [value]="email()"
                (input)="email.set(getInputValue($event))"
                placeholder="passenger@example.com"
                class="w-full bg-[#f4f6f9] border-0 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none" />
            </div>

            <div class="space-y-1">
              <label for="auth-password" class="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Password</label>
              <input
                id="auth-password"
                type="password"
                aria-label="Password"
                [value]="password()"
                (input)="password.set(getInputValue($event))"
                placeholder="••••••••••••"
                class="w-full bg-[#f4f6f9] border-0 rounded-2xl px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none" />
            </div>

            <div class="text-[11.5px] text-slate-700 bg-gradient-to-r from-[#fde6cf]/55 via-[#fae1ef]/55 to-[#dfe7fd]/55 p-3.5 rounded-2xl">
              <span class="text-slate-900 font-bold">Account Session:</span> Connected as {{ state.currentUser().fullName }} with active booking rights.
            </div>

            <!-- Primary Action Button: Category Gradient -->
            <button
              type="button"
              (click)="handleAuthSubmit()"
              [class]="state.activeBookingMode() === 'car' || state.searchCategory() === 'car'
                ? 'bg-gradient-to-r from-[#4f46e5] via-[#6366f1] to-[#9333ea]'
                : state.searchCategory() === 'hotel'
                  ? 'bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8]'
                  : state.activeBookingMode() === 'transport' || state.searchCategory() === 'transport'
                    ? 'bg-gradient-to-r from-[#7e22ce] via-[#a21caf] to-[#db2777]'
                    : 'bg-gradient-to-r from-[#e11d48] via-[#f43f5e] to-[#fb923c]'"
              class="w-full py-3 rounded-2xl text-white text-sm flex items-center justify-center space-x-1.5 transition-all cursor-pointer active:scale-95 font-bold">
              <mat-icon class="text-sm text-white">{{ isSignUp() ? 'person_add' : 'login' }}</mat-icon>
              <span class="text-white text-sm font-bold">{{ isSignUp() ? 'Create Account' : 'Sign In' }}</span>
            </button>

            <div class="text-center pt-1">
              <button
                type="button"
                (click)="isSignUp.set(!isSignUp())"
                [class]="state.activeBookingMode() === 'car' || state.searchCategory() === 'car'
                  ? 'text-[#4338ca]'
                  : state.searchCategory() === 'hotel'
                    ? 'text-[#0284c7]'
                    : state.activeBookingMode() === 'transport' || state.searchCategory() === 'transport'
                      ? 'text-[#a21caf]'
                      : 'text-[#e11d48]'"
                class="text-xs hover:underline cursor-pointer font-bold">
                {{ isSignUp() ? 'Already have an account? Sign In' : 'New to redBus? Sign Up' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    }
  `,
})
export class AuthModal {
  readonly state = inject(BookingState);

  readonly isSignUp = signal(false);
  readonly fullName = signal('');
  readonly email = signal('passenger@redbus.demo');
  readonly password = signal('••••••••');

  getInputValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  handleAuthSubmit(): void {
    const emailVal = this.email().trim() || 'passenger@redbus.demo';
    if (this.isSignUp()) {
      const nameVal = this.fullName().trim() || 'Passenger';
      this.state.signupUser(nameVal, emailVal, '+91 98765 00000', this.password());
    } else {
      this.state.loginUser(emailVal, this.password());
    }
  }
}
