import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';

export interface CalendarDayCell {
  iso: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isPast: boolean;
  isBeyondMax: boolean;
  isDisabled: boolean;
  isToday: boolean;
  isSelected: boolean;
}

@Component({
  selector: 'app-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div
      class="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans animate-fade-in"
      (click)="closed.emit()">
      <div
        class="bg-white rounded-t-[30px] sm:rounded-[30px] max-w-md w-full overflow-hidden result-card-shadow animate-slide-up text-[#1b1b1b]"
        (click)="$event.stopPropagation()">
        <!-- Pastel Peach-Pink-Lavender Modal Header -->
        <div
          class="px-5 pt-3.5 pb-4 bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] relative overflow-hidden">
          <div
            class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)] pointer-events-none"></div>

          <!-- Top Drag Pill on Mobile -->
          <div class="relative z-10 w-11 h-1.5 bg-slate-400/40 rounded-full mx-auto mb-2.5 sm:hidden"></div>

          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div
                [class.bg-[#ffe4e6]]="category() === 'bus'"
                [class.text-[#be123c]]="category() === 'bus'"
                [class.bg-[#e0e7ff]]="category() === 'cars'"
                [class.text-[#4338ca]]="category() === 'cars'"
                [class.bg-[#e0f2fe]]="category() === 'hotel'"
                [class.text-[#0284c7]]="category() === 'hotel'"
                [class.bg-[#fae8ff]]="category() === 'transport'"
                [class.text-[#a21caf]]="category() === 'transport'"
                [class.bg-[#e0f2fe]]="category() === 'flight'"
                [class.text-[#0284c7]]="category() === 'flight'"
                class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs">
                <mat-icon class="text-[22px] leading-none">calendar_month</mat-icon>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="text-[16px] font-extrabold text-slate-900 leading-tight">
                    Select Journey Date
                  </h3>
                  <span
                    [class.bg-rose-100/80]="category() === 'bus'"
                    [class.text-[#be123c]]="category() === 'bus'"
                    [class.bg-indigo-100/80]="category() === 'cars'"
                    [class.text-[#4338ca]]="category() === 'cars'"
                    [class.bg-sky-100/80]="category() === 'hotel'"
                    [class.text-[#0284c7]]="category() === 'hotel'"
                    [class.bg-fuchsia-100/80]="category() === 'transport'"
                    [class.text-[#a21caf]]="category() === 'transport'"
                    [class.bg-sky-100/80]="category() === 'flight'"
                    [class.text-[#0284c7]]="category() === 'flight'"
                    class="px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wide">
                    Up to {{ maxMonths() }}M
                  </span>
                </div>
                <p class="text-[12px] text-slate-600 font-medium mt-0.5">
                  {{ formattedSelectedBanner() }}
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="closed.emit()"
              aria-label="Close calendar"
              class="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center cursor-pointer transition-colors shadow-2xs">
              <mat-icon class="text-[18px] leading-none">close</mat-icon>
            </button>
          </div>
        </div>

        <!-- Quick Date Shortcuts (Today / Tomorrow / Next Day) -->
        <div class="px-4 pt-3.5 pb-2 flex items-center gap-2">
          <button
            type="button"
            (click)="selectQuickDate(0)"
            [class.bg-[#ffe4e6]]="isQuickDateSelected(0) && category() === 'bus'"
            [class.text-[#be123c]]="isQuickDateSelected(0) && category() === 'bus'"
            [class.bg-[#e0e7ff]]="isQuickDateSelected(0) && category() === 'cars'"
            [class.text-[#4338ca]]="isQuickDateSelected(0) && category() === 'cars'"
            [class.bg-[#e0f2fe]]="isQuickDateSelected(0) && category() === 'hotel'"
            [class.text-[#0284c7]]="isQuickDateSelected(0) && category() === 'hotel'"
            [class.bg-[#fae8ff]]="isQuickDateSelected(0) && category() === 'transport'"
            [class.text-[#a21caf]]="isQuickDateSelected(0) && category() === 'transport'"
            [class.bg-[#e0f2fe]]="isQuickDateSelected(0) && category() === 'flight'"
            [class.text-[#0284c7]]="isQuickDateSelected(0) && category() === 'flight'"
            [class.bg-[#f4f6f9]]="!isQuickDateSelected(0)"
            [class.text-slate-700]="!isQuickDateSelected(0)"
            class="flex-1 py-2 px-3 rounded-2xl text-[12.5px] font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-95">
            <mat-icon class="text-[15px] leading-none">today</mat-icon>
            <span>Today</span>
          </button>

          <button
            type="button"
            (click)="selectQuickDate(1)"
            [class.bg-[#ffe4e6]]="isQuickDateSelected(1) && category() === 'bus'"
            [class.text-[#be123c]]="isQuickDateSelected(1) && category() === 'bus'"
            [class.bg-[#e0e7ff]]="isQuickDateSelected(1) && category() === 'cars'"
            [class.text-[#4338ca]]="isQuickDateSelected(1) && category() === 'cars'"
            [class.bg-[#e0f2fe]]="isQuickDateSelected(1) && category() === 'hotel'"
            [class.text-[#0284c7]]="isQuickDateSelected(1) && category() === 'hotel'"
            [class.bg-[#fae8ff]]="isQuickDateSelected(1) && category() === 'transport'"
            [class.text-[#a21caf]]="isQuickDateSelected(1) && category() === 'transport'"
            [class.bg-[#e0f2fe]]="isQuickDateSelected(1) && category() === 'flight'"
            [class.text-[#0284c7]]="isQuickDateSelected(1) && category() === 'flight'"
            [class.bg-[#f4f6f9]]="!isQuickDateSelected(1)"
            [class.text-slate-700]="!isQuickDateSelected(1)"
            class="flex-1 py-2 px-3 rounded-2xl text-[12.5px] font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-95">
            <mat-icon class="text-[15px] leading-none">event</mat-icon>
            <span>Tomorrow</span>
          </button>

          <button
            type="button"
            (click)="selectQuickDate(2)"
            [class.bg-[#ffe4e6]]="isQuickDateSelected(2) && category() === 'bus'"
            [class.text-[#be123c]]="isQuickDateSelected(2) && category() === 'bus'"
            [class.bg-[#e0e7ff]]="isQuickDateSelected(2) && category() === 'cars'"
            [class.text-[#4338ca]]="isQuickDateSelected(2) && category() === 'cars'"
            [class.bg-[#e0f2fe]]="isQuickDateSelected(2) && category() === 'hotel'"
            [class.text-[#0284c7]]="isQuickDateSelected(2) && category() === 'hotel'"
            [class.bg-[#fae8ff]]="isQuickDateSelected(2) && category() === 'transport'"
            [class.text-[#a21caf]]="isQuickDateSelected(2) && category() === 'transport'"
            [class.bg-[#e0f2fe]]="isQuickDateSelected(2) && category() === 'flight'"
            [class.text-[#0284c7]]="isQuickDateSelected(2) && category() === 'flight'"
            [class.bg-[#f4f6f9]]="!isQuickDateSelected(2)"
            [class.text-slate-700]="!isQuickDateSelected(2)"
            class="flex-1 py-2 px-3 rounded-2xl text-[12.5px] font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-95">
            <mat-icon class="text-[15px] leading-none">date_range</mat-icon>
            <span>Day After</span>
          </button>
        </div>

        <!-- Month Navigation Header -->
        <div class="px-4 py-2 flex items-center justify-between">
          <button
            type="button"
            [disabled]="!canGoPrevMonth()"
            (click)="prevMonth()"
            aria-label="Previous Month"
            [class.opacity-35]="!canGoPrevMonth()"
            [class.cursor-not-allowed]="!canGoPrevMonth()"
            [class.cursor-pointer]="canGoPrevMonth()"
            [class.hover:bg-slate-200/80]="canGoPrevMonth()"
            [class.active:scale-90]="canGoPrevMonth()"
            class="w-9 h-9 rounded-xl bg-[#f4f6f9] text-slate-800 flex items-center justify-center transition-all">
            <mat-icon class="text-[20px] leading-none">chevron_left</mat-icon>
          </button>

          <div class="text-center">
            <div class="text-[15px] font-extrabold text-slate-900 tracking-tight leading-tight">
              {{ currentMonthLabel() }}
            </div>
            <div class="text-[10.5px] font-medium text-slate-400 leading-tight mt-0.5">
              Booking open till {{ formattedMaxDateLabel() }}
            </div>
          </div>

          <button
            type="button"
            [disabled]="!canGoNextMonth()"
            (click)="nextMonth()"
            aria-label="Next Month"
            [class.opacity-35]="!canGoNextMonth()"
            [class.cursor-not-allowed]="!canGoNextMonth()"
            [class.cursor-pointer]="canGoNextMonth()"
            [class.hover:bg-slate-200/80]="canGoNextMonth()"
            [class.active:scale-90]="canGoNextMonth()"
            class="w-9 h-9 rounded-xl bg-[#f4f6f9] text-slate-800 flex items-center justify-center transition-all">
            <mat-icon class="text-[20px] leading-none">chevron_right</mat-icon>
          </button>
        </div>

        <!-- Weekday Headers -->
        <div class="px-4 pt-1 pb-1.5 grid grid-cols-7 text-center">
          @for (wd of weekDays; track wd) {
            <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {{ wd }}
            </span>
          }
        </div>

        <!-- Calendar Days Grid -->
        <div class="px-4 pb-5 grid grid-cols-7 gap-1.5">
          @for (cell of calendarDays(); track cell.iso) {
            @if (!cell.isCurrentMonth) {
              <div class="h-10 rounded-xl"></div>
            } @else {
              <button
                type="button"
                [disabled]="cell.isDisabled"
                (click)="onDayClick(cell)"
                [class.opacity-35]="cell.isDisabled"
                [class.cursor-not-allowed]="cell.isDisabled"
                [class.cursor-pointer]="!cell.isDisabled"
                [class.bg-gradient-to-b]="cell.isSelected && !cell.isDisabled"
                [class.from-[#e11d48]]="cell.isSelected && !cell.isDisabled && category() === 'bus'"
                [class.via-[#f43f5e]]="cell.isSelected && !cell.isDisabled && category() === 'bus'"
                [class.to-[#fb923c]]="cell.isSelected && !cell.isDisabled && category() === 'bus'"
                [class.from-[#4f46e5]]="cell.isSelected && !cell.isDisabled && category() === 'cars'"
                [class.via-[#6366f1]]="cell.isSelected && !cell.isDisabled && category() === 'cars'"
                [class.to-[#9333ea]]="cell.isSelected && !cell.isDisabled && category() === 'cars'"
                [class.from-[#0284c7]]="cell.isSelected && !cell.isDisabled && category() === 'hotel'"
                [class.via-[#0ea5e9]]="cell.isSelected && !cell.isDisabled && category() === 'hotel'"
                [class.to-[#38bdf8]]="cell.isSelected && !cell.isDisabled && category() === 'hotel'"
                [class.from-[#7e22ce]]="cell.isSelected && !cell.isDisabled && category() === 'transport'"
                [class.via-[#a21caf]]="cell.isSelected && !cell.isDisabled && category() === 'transport'"
                [class.to-[#db2777]]="cell.isSelected && !cell.isDisabled && category() === 'transport'"
                [class.from-[#0284c7]]="cell.isSelected && !cell.isDisabled && category() === 'flight'"
                [class.via-[#0ea5e9]]="cell.isSelected && !cell.isDisabled && category() === 'flight'"
                [class.to-[#38bdf8]]="cell.isSelected && !cell.isDisabled && category() === 'flight'"
                [class.text-white]="cell.isSelected && !cell.isDisabled"
                [class.shadow-sm]="cell.isSelected && !cell.isDisabled"
                [class.bg-[#f4f6f9]]="(!cell.isSelected || cell.isDisabled) && cell.isToday"
                [class.bg-white]="(!cell.isSelected || cell.isDisabled) && !cell.isToday"
                [class.hover:bg-slate-100]="!cell.isSelected && !cell.isDisabled"
                class="h-10 rounded-2xl flex flex-col items-center justify-center relative transition-all active:scale-95">
                <span class="text-[13.5px] font-bold leading-none tabular-nums">
                  {{ cell.dayNumber }}
                </span>
                @if (cell.isToday) {
                  <span
                    [class.text-white/90]="cell.isSelected && !cell.isDisabled"
                    [class.text-rose-600]="(!cell.isSelected || cell.isDisabled) && category() === 'bus'"
                    [class.text-indigo-600]="(!cell.isSelected || cell.isDisabled) && category() === 'cars'"
                    [class.text-sky-600]="(!cell.isSelected || cell.isDisabled) && category() === 'hotel'"
                    [class.text-fuchsia-700]="(!cell.isSelected || cell.isDisabled) && category() === 'transport'"
                    [class.text-sky-600]="(!cell.isSelected || cell.isDisabled) && category() === 'flight'"
                    class="text-[8px] font-extrabold uppercase leading-none mt-0.5">
                    Today
                  </span>
                }
              </button>
            }
          }
        </div>
      </div>
    </div>
  `,
})
export class DatePicker implements OnInit {
  readonly selectedDate = input.required<string>();
  readonly category = input<'bus' | 'cars' | 'train' | 'hotel' | 'flight' | 'transport'>('bus');

  readonly dateSelected = output<string>();
  readonly closed = output<void>();

  readonly weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  private readonly monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  readonly viewYear = signal<number>(new Date().getFullYear());
  readonly viewMonth = signal<number>(new Date().getMonth());

  readonly maxMonths = computed<number>(() => (this.category() === 'hotel' || this.category() === 'flight' ? 6 : 3));

  readonly minDate = computed<Date>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  readonly maxDate = computed<Date>(() => {
    const max = new Date();
    max.setHours(0, 0, 0, 0);
    max.setMonth(max.getMonth() + this.maxMonths());
    return max;
  });

  readonly formattedMaxDateLabel = computed<string>(() => {
    const d = this.maxDate();
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${shortMonths[d.getMonth()]} ${d.getFullYear()}`;
  });

  readonly canGoPrevMonth = computed<boolean>(() => {
    const min = this.minDate();
    const curIndex = this.viewYear() * 12 + this.viewMonth();
    const minIndex = min.getFullYear() * 12 + min.getMonth();
    return curIndex > minIndex;
  });

  readonly canGoNextMonth = computed<boolean>(() => {
    const max = this.maxDate();
    const curIndex = this.viewYear() * 12 + this.viewMonth();
    const maxIndex = max.getFullYear() * 12 + max.getMonth();
    return curIndex < maxIndex;
  });

  ngOnInit() {
    const min = this.minDate();
    const max = this.maxDate();
    const raw = this.selectedDate();
    if (raw) {
      const [y, m, d] = raw.split('-').map(Number);
      if (y && m && d) {
        const parsed = new Date(y, m - 1, d);
        parsed.setHours(0, 0, 0, 0);
        const clamped =
          parsed.getTime() < min.getTime()
            ? min
            : parsed.getTime() > max.getTime()
            ? max
            : parsed;
        this.viewYear.set(clamped.getFullYear());
        this.viewMonth.set(clamped.getMonth());
        return;
      }
    }
    this.viewYear.set(min.getFullYear());
    this.viewMonth.set(min.getMonth());
  }

  readonly currentMonthLabel = computed(() => {
    return `${this.monthNames[this.viewMonth()]} ${this.viewYear()}`;
  });

  readonly formattedSelectedBanner = computed(() => {
    const raw = this.selectedDate();
    if (!raw) return 'Choose your travel date';
    const [y, m, d] = raw.split('-').map(Number);
    if (!y || !m || !d) return raw;
    const dt = new Date(y, m - 1, d);
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[dt.getDay()]}, ${d} ${shortMonths[m - 1]} ${y}`;
  });

  readonly calendarDays = computed<CalendarDayCell[]>(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const selectedIso = this.selectedDate();

    const today = this.minDate();
    const maxAllowed = this.maxDate();
    const todayIso = this.toIsoString(today);

    const firstDayOfMonth = new Date(year, month, 1);
    const startWeekday = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells: CalendarDayCell[] = [];

    // Leading empty cells
    for (let i = 0; i < startWeekday; i++) {
      cells.push({
        iso: `empty-prev-${year}-${month}-${i}`,
        dayNumber: 0,
        isCurrentMonth: false,
        isPast: true,
        isBeyondMax: false,
        isDisabled: true,
        isToday: false,
        isSelected: false,
      });
    }

    // Actual days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      cellDate.setHours(0, 0, 0, 0);
      const iso = this.toIsoString(cellDate);
      const isPast = cellDate.getTime() < today.getTime();
      const isBeyondMax = cellDate.getTime() > maxAllowed.getTime();
      cells.push({
        iso,
        dayNumber: day,
        isCurrentMonth: true,
        isPast,
        isBeyondMax,
        isDisabled: isPast || isBeyondMax,
        isToday: iso === todayIso,
        isSelected: iso === selectedIso,
      });
    }

    return cells;
  });

  prevMonth() {
    if (!this.canGoPrevMonth()) return;
    if (this.viewMonth() === 0) {
      this.viewMonth.set(11);
      this.viewYear.update((y) => y - 1);
    } else {
      this.viewMonth.update((m) => m - 1);
    }
  }

  nextMonth() {
    if (!this.canGoNextMonth()) return;
    if (this.viewMonth() === 11) {
      this.viewMonth.set(0);
      this.viewYear.update((y) => y + 1);
    } else {
      this.viewMonth.update((m) => m + 1);
    }
  }

  onDayClick(cell: CalendarDayCell) {
    if (cell.isDisabled || !cell.isCurrentMonth) return;
    this.dateSelected.emit(cell.iso);
    this.closed.emit();
  }

  selectQuickDate(offsetDays: number) {
    const dt = new Date();
    dt.setHours(0, 0, 0, 0);
    dt.setDate(dt.getDate() + offsetDays);
    if (dt.getTime() < this.minDate().getTime() || dt.getTime() > this.maxDate().getTime()) {
      return;
    }
    const iso = this.toIsoString(dt);
    this.dateSelected.emit(iso);
    this.closed.emit();
  }

  isQuickDateSelected(offsetDays: number): boolean {
    const dt = new Date();
    dt.setHours(0, 0, 0, 0);
    dt.setDate(dt.getDate() + offsetDays);
    return this.selectedDate() === this.toIsoString(dt);
  }

  private toIsoString(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
