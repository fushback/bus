import {ChangeDetectionStrategy, Component, computed, inject, input, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {BookingState} from '../../services/booking-state';

export type BookingFlowStep = 'search' | 'seats' | 'passenger-info' | 'checkout';

export interface ProgressStepItem {
  id: BookingFlowStep;
  index: number;
  label: string;
  shortLabel: string;
  icon: string;
  subtitle: string;
}

@Component({
  selector: 'app-booking-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <section
      aria-label="Booking flow progress"
      class="w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-[0_2px_10px_rgba(15,23,42,0.03)] px-3 sm:px-6 py-2.5 sm:py-3 transition-all">
      <div class="max-w-3xl mx-auto">
        
        <!-- Top Status Sub-strip for Extra Context & Orientation -->
        <div class="flex items-center justify-between pb-2 mb-1.5 text-[11px] sm:text-xs text-slate-500 font-sans">
          <div class="flex items-center space-x-1.5 truncate">
            <span
              [class.bg-[#ffe4e6]]="activeCategory() === 'bus'"
              [class.text-[#be123c]]="activeCategory() === 'bus'"
              [class.bg-[#e0e7ff]]="activeCategory() === 'car'"
              [class.text-[#4338ca]]="activeCategory() === 'car'"
              [class.bg-[#e0f2fe]]="activeCategory() === 'hotel'"
              [class.text-[#0284c7]]="activeCategory() === 'hotel'"
              class="w-2 h-2 rounded-full inline-block animate-ping"></span>
            <span class="font-semibold text-slate-800 tracking-tight">Step {{ activeStepNumber() }} of 4:</span>
            <span class="font-medium text-slate-600 truncate">{{ activeStepHeadline() }}</span>
          </div>

          <div class="flex items-center space-x-2 shrink-0">
            @if (currentStep() === 'seats') {
              <span class="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10.5px] font-medium bg-slate-100 text-slate-600">
                {{ completionPercent() }}% Completed
              </span>
            }
            <button
              type="button"
              (click)="onStepClick('search')"
              title="Return to Search to change dates or locations"
              class="text-[11px] text-slate-600 hover:text-slate-900 flex items-center space-x-1 cursor-pointer transition-colors active:scale-95">
              <mat-icon class="text-xs">edit</mat-icon>
              <span class="underline">Edit Search</span>
            </button>
          </div>
        </div>

        <!-- 4-Step Stepper Flow Bar -->
        <nav class="relative" aria-label="Steps">
          <!-- Background Track Line -->
          <div
            aria-hidden="true"
            class="absolute top-4 sm:top-5 left-5 right-5 -translate-y-1/2 h-[3px] bg-slate-100 rounded-full z-0 overflow-hidden">
            <!-- Active Fill Segment -->
            <div
              [class.from-[#e11d48]]="activeCategory() === 'bus'"
              [class.via-[#f43f5e]]="activeCategory() === 'bus'"
              [class.to-[#fb923c]]="activeCategory() === 'bus'"
              [class.from-[#4f46e5]]="activeCategory() === 'car'"
              [class.via-[#6366f1]]="activeCategory() === 'car'"
              [class.to-[#9333ea]]="activeCategory() === 'car'"
              [class.from-[#0284c7]]="activeCategory() === 'hotel'"
              [class.via-[#0ea5e9]]="activeCategory() === 'hotel'"
              [class.to-[#38bdf8]]="activeCategory() === 'hotel'"
              class="h-full bg-gradient-to-r transition-all duration-500 ease-out"
              [style.width.%]="progressBarWidth()">
            </div>
          </div>

          <!-- Step Nodes Grid -->
          <ol class="relative z-10 grid grid-cols-4 gap-1 sm:gap-2">
            @for (s of steps; track s.id) {
              <li class="flex flex-col items-center group">
                <button
                  type="button"
                  (click)="onStepClick(s.id)"
                  [attr.aria-current]="s.id === currentStep() ? 'step' : null"
                  [disabled]="s.index > activeStepNumber() + 1"
                  [class.cursor-pointer]="s.index <= activeStepNumber() + 1"
                  [class.cursor-not-allowed]="s.index > activeStepNumber() + 1"
                  class="flex flex-col items-center focus:outline-none transition-all active:scale-95 w-full">
                  
                  <!-- Step Circle Node -->
                  <div class="relative flex items-center justify-center">
                    
                    <!-- COMPLETED STEP (Check icon) -->
                    @if (s.index < activeStepNumber()) {
                      <div
                        class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                        <mat-icon class="text-[17px] sm:text-[20px] leading-none text-white font-bold">check</mat-icon>
                      </div>
                    }

                    <!-- CURRENT / ACTIVE STEP (Themed with glow aura) -->
                    @if (s.index === activeStepNumber()) {
                      <div
                        [class.ring-rose-500/25]="activeCategory() === 'bus'"
                        [class.ring-indigo-500/25]="activeCategory() === 'car'"
                        [class.ring-sky-500/25]="activeCategory() === 'hotel'"
                        class="relative rounded-full ring-4 transition-all">
                        <div
                          [class.from-[#e11d48]]="activeCategory() === 'bus'"
                          [class.via-[#f43f5e]]="activeCategory() === 'bus'"
                          [class.to-[#fb923c]]="activeCategory() === 'bus'"
                          [class.from-[#4f46e5]]="activeCategory() === 'car'"
                          [class.via-[#6366f1]]="activeCategory() === 'car'"
                          [class.to-[#9333ea]]="activeCategory() === 'car'"
                          [class.from-[#0284c7]]="activeCategory() === 'hotel'"
                          [class.via-[#0ea5e9]]="activeCategory() === 'hotel'"
                          [class.to-[#38bdf8]]="activeCategory() === 'hotel'"
                          class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r text-white flex items-center justify-center shadow-md">
                          <mat-icon class="text-[17px] sm:text-[20px] leading-none text-white">
                            {{ getStepIcon(s) }}
                          </mat-icon>
                        </div>
                      </div>
                    }

                    <!-- UPCOMING / INACTIVE STEP -->
                    @if (s.index > activeStepNumber()) {
                      <div
                        class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-slate-400 border border-slate-200/90 flex items-center justify-center shadow-2xs group-hover:border-slate-300 transition-colors">
                        <span class="text-xs sm:text-sm font-semibold tabular-nums text-slate-400">
                          {{ s.index }}
                        </span>
                      </div>
                    }
                  </div>

                  <!-- Step Label & Subtitle Text -->
                  <div class="mt-1.5 text-center px-0.5 min-w-0 max-w-full">
                    <span
                      [class.text-emerald-700]="s.index < activeStepNumber()"
                      [class.font-semibold]="s.index <= activeStepNumber()"
                      [class.text-slate-900]="s.index === activeStepNumber()"
                      [class.text-slate-400]="s.index > activeStepNumber()"
                      [class.font-medium]="s.index > activeStepNumber()"
                      class="text-[10.5px] sm:text-xs leading-tight block truncate">
                      {{ s.label }}
                    </span>

                    <!-- Descriptive Subtitle for Tablets/Desktop -->
                    <span
                      class="hidden sm:block text-[9.5px] leading-tight text-slate-400 truncate mt-0.5">
                      @if (s.index < activeStepNumber()) {
                        <span class="text-emerald-600 font-medium">Done</span>
                      } @else if (s.index === activeStepNumber()) {
                        <span
                          [class.text-[#e11d48]]="activeCategory() === 'bus'"
                          [class.text-[#4f46e5]]="activeCategory() === 'car'"
                          [class.text-[#0284c7]]="activeCategory() === 'hotel'"
                          class="font-semibold">Current</span>
                      } @else {
                        <span>{{ s.subtitle }}</span>
                      }
                    </span>
                  </div>

                </button>
              </li>
            }
          </ol>
        </nav>

      </div>
    </section>
  `,
})
export class BookingProgress {
  readonly state = inject(BookingState);

  // Inputs
  readonly currentStep = input<BookingFlowStep>('seats');
  readonly category = input<'bus' | 'car' | 'hotel' | 'buses' | 'cars' | 'hotels'>('bus');

  // Outputs
  readonly stepSelected = output<BookingFlowStep>();

  readonly steps: ProgressStepItem[] = [
    {
      id: 'search',
      index: 1,
      label: 'Search',
      shortLabel: 'Search',
      icon: 'search',
      subtitle: 'Date & City',
    },
    {
      id: 'seats',
      index: 2,
      label: 'Select Seat',
      shortLabel: 'Seats',
      icon: 'event_seat',
      subtitle: 'Choose Seats',
    },
    {
      id: 'passenger-info',
      index: 3,
      label: 'Passenger Info',
      shortLabel: 'Traveler',
      icon: 'person',
      subtitle: 'Board & Details',
    },
    {
      id: 'checkout',
      index: 4,
      label: 'Checkout',
      shortLabel: 'Pay',
      icon: 'payments',
      subtitle: 'Offers & Pay',
    },
  ];

  readonly activeCategory = computed<'bus' | 'car' | 'hotel'>(() => {
    const raw = (this.category() || '').toLowerCase();
    if (raw.includes('car')) return 'car';
    if (raw.includes('hotel')) return 'hotel';
    return 'bus';
  });

  readonly activeStepNumber = computed<number>(() => {
    const step = this.currentStep();
    switch (step) {
      case 'search':
        return 1;
      case 'seats':
        return 2;
      case 'passenger-info':
        return 3;
      case 'checkout':
        return 4;
      default:
        return 2;
    }
  });

  readonly progressBarWidth = computed<number>(() => {
    const stepNum = this.activeStepNumber();
    if (stepNum === 1) return 10;
    if (stepNum === 2) return 40;
    if (stepNum === 3) return 72;
    return 100;
  });

  readonly completionPercent = computed<number>(() => {
    const stepNum = this.activeStepNumber();
    if (stepNum === 1) return 25;
    if (stepNum === 2) return 50;
    if (stepNum === 3) return 75;
    return 100;
  });

  readonly activeStepHeadline = computed<string>(() => {
    const step = this.currentStep();
    const cat = this.activeCategory();
    if (step === 'search') return 'Search for routes & travel dates';
    if (step === 'seats') {
      if (cat === 'car') return 'Select car ride & reserve seats';
      if (cat === 'hotel') return 'Select verified hotel near station';
      return 'Select bus & pick preferred seats';
    }
    if (step === 'passenger-info') {
      return 'Enter traveler details & boarding point';
    }
    return 'Review booking, apply coupons & checkout';
  });

  getStepIcon(step: ProgressStepItem): string {
    if (step.id === 'seats') {
      const cat = this.activeCategory();
      if (cat === 'hotel') return 'hotel';
      if (cat === 'car') return 'directions_car';
      return 'event_seat';
    }
    return step.icon;
  }

  onStepClick(stepId: BookingFlowStep) {
    this.stepSelected.emit(stepId);

    if (stepId === 'search') {
      // Return to search or open search modify
      this.state.goToSearch();
      return;
    }

    if (stepId === 'seats') {
      if (this.currentStep() !== 'seats') {
        this.state.backToResults();
      }
      return;
    }

    if (stepId === 'passenger-info') {
      if (this.currentStep() === 'passenger-info') return;
      // If user has seats or trips selected, allow going forward
      const mode = this.state.activeBookingMode();
      if (mode === 'bus' && this.state.selectedSeats().length > 0) {
        this.state.goToPassengerInfo();
      } else if (mode === 'car' && this.state.selectedCarSeatIds().length > 0) {
        this.state.goToPassengerInfo();
      } else {
        this.state.showToast('Please select a trip and seats first to proceed to Passenger Info.', 'info');
      }
      return;
    }

    if (stepId === 'checkout') {
      if (this.state.passengers().length > 0) {
        this.state.isCheckoutOpen.set(true);
      } else {
        this.state.showToast('Please fill passenger details before checking out.', 'info');
      }
    }
  }
}
