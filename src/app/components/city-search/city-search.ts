import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconModule} from '@angular/material/icon';
import {BookingState} from '../../services/booking-state';
import {City} from '../../models/bus-booking.models';

export interface RecentCitySearchItem {
  id: string;
  type: 'route' | 'city';
  label: string;
  fromCityName?: string;
  toCityName?: string;
  cityName?: string;
}

const DEFAULT_RECENT_SEARCHES: RecentCitySearchItem[] = [
  {
    id: 'rec-route-1',
    type: 'route',
    label: 'Hyderabad - Bengaluru',
    fromCityName: 'Hyderabad',
    toCityName: 'Bengaluru',
  },
  {
    id: 'rec-route-2',
    type: 'route',
    label: 'Siliguri - Gangtok',
    fromCityName: 'Siliguri',
    toCityName: 'Gangtok',
  },
  {
    id: 'rec-city-1',
    type: 'city',
    label: 'Bengaluru',
    cityName: 'Bengaluru',
  },
  {
    id: 'rec-city-2',
    type: 'city',
    label: 'Hyderabad',
    cityName: 'Hyderabad',
  },
];

const POPULAR_CITY_NAMES: string[] = [
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Mumbai',
  'Delhi',
  'Coimbatore',
  'Kolkata',
  'Jaipur',
  'Ahmedabad',
  'Lucknow',
  'Siliguri',
  'Gangtok',
];

@Component({
  selector: 'app-city-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div
      class="fixed inset-0 z-50 bg-black/55 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 font-sans animate-fade-in"
      (click)="closed.emit()">
      <div
        class="bg-white rounded-t-[30px] sm:rounded-[30px] max-w-md w-full h-[88vh] sm:h-[82vh] flex flex-col overflow-hidden result-card-shadow animate-slide-up text-[#1b1b1b]"
        (click)="$event.stopPropagation()">
        <!-- Pastel Peach-Pink-Lavender Offcanvas Header (Matches Date Offcanvas Theme) -->
        <div
          class="px-5 pt-3.5 pb-4 bg-gradient-to-r from-[#fde6cf] via-[#fae1ef] to-[#dfe7fd] relative overflow-hidden shrink-0">
          <div
            class="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(254,215,170,0.65),_transparent_55%),radial-gradient(circle_at_50%_50%,_rgba(251,207,232,0.55),_transparent_60%),radial-gradient(circle_at_88%_30%,_rgba(199,210,254,0.65),_transparent_55%)] pointer-events-none"></div>

          <!-- Top Drag Pill on Mobile -->
          <div class="relative z-10 w-11 h-1.5 bg-slate-400/40 rounded-full mx-auto mb-2.5 sm:hidden"></div>

          <div class="relative z-10 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div
                [class.bg-[#ffe4e6]]="category() === 'bus' && mode() !== 'hotel'"
                [class.text-[#be123c]]="category() === 'bus' && mode() !== 'hotel'"
                [class.bg-[#e0e7ff]]="category() === 'cars' && mode() !== 'hotel'"
                [class.text-[#4338ca]]="category() === 'cars' && mode() !== 'hotel'"
                [class.bg-[#e0f2fe]]="category() === 'hotel' || mode() === 'hotel'"
                [class.text-[#0284c7]]="category() === 'hotel' || mode() === 'hotel'"
                [class.bg-[#fae8ff]]="category() === 'transport' && mode() !== 'hotel'"
                [class.text-[#a21caf]]="category() === 'transport' && mode() !== 'hotel'"
                [class.bg-[#e0f2fe]]="category() === 'flight' && mode() !== 'hotel'"
                [class.text-[#0284c7]]="category() === 'flight' && mode() !== 'hotel'"
                class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs">
                <mat-icon class="text-[22px] leading-none">
                  {{ mode() === 'hotel' ? 'hotel' : mode() === 'to' ? 'flag' : 'location_on' }}
                </mat-icon>
              </div>
              <div>
                <div class="flex items-center space-x-2">
                  <h3 class="text-[16px] font-extrabold text-slate-900 leading-tight">
                    {{ mode() === 'hotel' ? 'Select Hotel Destination' : mode() === 'to' ? 'Select Going To City' : 'Select Leaving From City' }}
                  </h3>
                  <span
                    [class.bg-rose-100/80]="category() === 'bus' && mode() !== 'hotel'"
                    [class.text-[#be123c]]="category() === 'bus' && mode() !== 'hotel'"
                    [class.bg-indigo-100/80]="category() === 'cars' && mode() !== 'hotel'"
                    [class.text-[#4338ca]]="category() === 'cars' && mode() !== 'hotel'"
                    [class.bg-sky-100/80]="category() === 'hotel' || mode() === 'hotel'"
                    [class.text-[#0284c7]]="category() === 'hotel' || mode() === 'hotel'"
                    [class.bg-fuchsia-100/80]="category() === 'transport' && mode() !== 'hotel'"
                    [class.text-[#a21caf]]="category() === 'transport' && mode() !== 'hotel'"
                    [class.bg-sky-100/80]="category() === 'flight' && mode() !== 'hotel'"
                    [class.text-[#0284c7]]="category() === 'flight' && mode() !== 'hotel'"
                    class="px-2 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wide">
                    {{ mode() === 'hotel' ? 'Stays' : mode() === 'to' ? 'Destination' : 'Origin' }}
                  </span>
                </div>
                <p class="text-[12px] text-slate-600 font-medium mt-0.5">
                  {{ mode() === 'hotel' ? 'Search city, area or landmark' : 'Search across 1,200+ cities & terminals' }}
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="closed.emit()"
              aria-label="Close city search"
              class="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center cursor-pointer transition-colors shadow-2xs">
              <mat-icon class="text-[18px] leading-none">close</mat-icon>
            </button>
          </div>
        </div>

        <!-- Borderless Search Bar -->
        <div class="px-4 pt-3.5 pb-2 bg-white shrink-0">
          <div
            class="w-full rounded-2xl bg-[#f4f6f9] px-4 py-3 flex items-center space-x-3 transition-all">
            <mat-icon
              [class.text-[#be123c]]="category() === 'bus' && mode() !== 'hotel'"
              [class.text-[#4338ca]]="category() === 'cars' && mode() !== 'hotel'"
              [class.text-[#0284c7]]="category() === 'hotel' || mode() === 'hotel'"
              [class.text-[#a21caf]]="category() === 'transport' && mode() !== 'hotel'"
              [class.text-[#0284c7]]="category() === 'flight' && mode() !== 'hotel'"
              class="text-[20px] leading-none shrink-0">
              search
            </mat-icon>

            <input
              #searchInput
              type="text"
              [value]="searchQuery()"
              (input)="onQueryInput($event)"
              placeholder="Search city, area or terminal"
              aria-label="Search area"
              autocomplete="off"
              class="flex-1 min-w-0 bg-transparent border-0 p-0 text-[15px] font-semibold text-[#1b1b1b] placeholder:text-slate-400 placeholder:font-normal focus:outline-none" />

            @if (searchQuery().length > 0) {
              <button
                type="button"
                (click)="clearQuery()"
                aria-label="Clear search"
                class="w-6 h-6 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center cursor-pointer transition-colors shrink-0">
                <mat-icon class="text-[15px] leading-none">close</mat-icon>
              </button>
            }
          </div>
        </div>

        <!-- Scrollable List Container -->
        <div class="flex-1 overflow-y-auto scrollbar-none px-4 pb-8">
          @if (!searchQuery().trim()) {
            <!-- =============================================================== -->
            <!-- RECENT SEARCHES SECTION                                         -->
            <!-- =============================================================== -->
            <div class="pt-2">
              <h3 class="px-1 py-2 text-[12px] font-extrabold text-slate-400 uppercase tracking-wider">
                Recent searches
              </h3>

              <div class="space-y-1.5">
                @for (item of visibleRecentSearches(); track item.id) {
                  <button
                    type="button"
                    (click)="onRecentItemClick(item)"
                    class="w-full px-3.5 py-3 rounded-2xl bg-[#f8fafc] hover:bg-[#f1f5f9] active:scale-[0.99] flex items-center space-x-3.5 transition-all cursor-pointer text-left">
                    <div
                      [class.bg-[#ffe4e6]]="category() === 'bus' && mode() !== 'hotel'"
                      [class.text-[#be123c]]="category() === 'bus' && mode() !== 'hotel'"
                      [class.bg-[#e0e7ff]]="category() === 'cars' && mode() !== 'hotel'"
                      [class.text-[#4338ca]]="category() === 'cars' && mode() !== 'hotel'"
                      [class.bg-[#e0f2fe]]="category() === 'hotel' || mode() === 'hotel'"
                      [class.text-[#0284c7]]="category() === 'hotel' || mode() === 'hotel'"
                      [class.bg-[#fae8ff]]="category() === 'transport' && mode() !== 'hotel'"
                      [class.text-[#a21caf]]="category() === 'transport' && mode() !== 'hotel'"
                      [class.bg-[#e0f2fe]]="category() === 'flight' && mode() !== 'hotel'"
                      [class.text-[#0284c7]]="category() === 'flight' && mode() !== 'hotel'"
                      class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
                      @if (item.type === 'route') {
                        <mat-icon class="text-[19px] leading-none">history</mat-icon>
                      } @else {
                        <mat-icon class="text-[19px] leading-none">location_city</mat-icon>
                      }
                    </div>
                    <span class="text-[14.5px] font-bold text-slate-800 truncate">
                      {{ item.label }}
                    </span>
                  </button>
                }
              </div>
            </div>

            <!-- =============================================================== -->
            <!-- POPULAR CITIES SECTION                                          -->
            <!-- =============================================================== -->
            <div class="pt-4">
              <h3 class="px-1 py-2 text-[12px] font-extrabold text-slate-400 uppercase tracking-wider">
                Popular cities
              </h3>

              <div class="space-y-1.5">
                @for (city of popularCities(); track city.id) {
                  <button
                    type="button"
                    (click)="selectSingleCity(city)"
                    class="w-full px-3.5 py-3 rounded-2xl bg-[#f8fafc] hover:bg-[#f1f5f9] active:scale-[0.99] flex items-center justify-between transition-all cursor-pointer text-left">
                    <div class="flex items-center space-x-3.5 min-w-0">
                      <div class="w-9 h-9 rounded-xl bg-white text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                        <mat-icon class="text-[19px] leading-none">location_city</mat-icon>
                      </div>
                      <div class="min-w-0">
                        <span class="text-[14.5px] font-bold text-slate-800 block truncate leading-tight">
                          {{ city.name }}
                        </span>
                        <span class="text-[11.5px] text-slate-500 block truncate mt-0.5">
                          {{ city.state }}
                        </span>
                      </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-xl bg-white text-[11px] font-bold text-slate-500 shrink-0 ml-2">
                      {{ city.code }}
                    </span>
                  </button>
                }
              </div>
            </div>
          } @else {
            <!-- =============================================================== -->
            <!-- FILTERED SEARCH RESULTS ACROSS ALL 1,221 CITIES WITH STATE      -->
            <!-- =============================================================== -->
            <div class="pt-1">
              <div class="px-1 py-2 text-[12px] font-extrabold text-slate-400 uppercase tracking-wider">
                Matching Cities ({{ filteredCities().length }})
              </div>

              @if (filteredCities().length === 0) {
                <div class="px-6 py-14 text-center space-y-2">
                  <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <mat-icon class="text-[24px]">location_off</mat-icon>
                  </div>
                  <p class="text-[15px] font-semibold text-slate-800">No cities found for "{{ searchQuery() }}"</p>
                  <p class="text-[12.5px] text-slate-500">Try searching with a different city or state name.</p>
                </div>
              } @else {
                <div class="space-y-1.5">
                  @for (city of filteredCities(); track city.id) {
                    <button
                      type="button"
                      (click)="selectSingleCity(city)"
                      class="w-full px-3.5 py-3 rounded-2xl bg-[#f8fafc] hover:bg-[#f1f5f9] active:scale-[0.99] flex items-center justify-between transition-all cursor-pointer text-left">
                      <div class="flex items-center space-x-3.5 min-w-0">
                        <div class="w-9 h-9 rounded-xl bg-white text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
                          <mat-icon class="text-[19px] leading-none">location_city</mat-icon>
                        </div>
                        <div class="min-w-0">
                          <div class="text-[14.5px] font-bold text-slate-800 truncate leading-tight">
                            {{ city.name }}
                          </div>
                          <div class="text-[11.5px] text-slate-500 truncate mt-0.5">
                            {{ city.state }}
                          </div>
                        </div>
                      </div>
                      <span class="px-2.5 py-1 rounded-xl bg-white text-[11px] font-bold text-slate-500 shrink-0 ml-2">
                        {{ city.code }}
                      </span>
                    </button>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class CitySearch implements AfterViewInit {
  readonly state = inject(BookingState);

  /** 'from' | 'to' | 'hotel' */
  readonly mode = input<'from' | 'to' | 'hotel'>('from');
  readonly category = input<'bus' | 'cars' | 'train' | 'hotel' | 'flight' | 'transport'>('bus');

  readonly citySelected = output<City>();
  readonly routeSelected = output<{from: City; to: City}>();
  readonly closed = output<void>();

  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  readonly searchQuery = signal<string>('');
  readonly recentSearches = signal<RecentCitySearchItem[]>(this.loadRecentSearches());

  readonly visibleRecentSearches = computed(() => {
    const items = this.recentSearches();
    if (this.mode() === 'hotel') {
      // For hotel city selection, show recent items (routes still resolve destination city or single cities)
      return items;
    }
    return items;
  });

  readonly popularCities = computed<City[]>(() => {
    const all = this.state.cities();
    if (!all.length) return [];

    const result: City[] = [];
    for (const name of POPULAR_CITY_NAMES) {
      const found = all.find((c) => c.name.toLowerCase() === name.toLowerCase());
      if (found) {
        result.push(found);
      } else {
        result.push({
          id: `pop-${name.toLowerCase()}`,
          name,
          state: name === 'Gangtok' ? 'Sikkim' : name === 'Siliguri' ? 'West Bengal' : 'India',
          code: name.slice(0, 3).toUpperCase(),
          popularTerminals: [`${name} Main Stand`],
        });
      }
    }
    return result;
  });

  readonly filteredCities = computed<City[]>(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return [];
    const all = this.state.cities();

    const startsWithName: City[] = [];
    const containsNameOrState: City[] = [];

    for (const city of all) {
      const nameLower = city.name.toLowerCase();
      const stateLower = (city.state || '').toLowerCase();
      const codeLower = (city.code || '').toLowerCase();

      if (nameLower.startsWith(q) || codeLower === q) {
        startsWithName.push(city);
      } else if (nameLower.includes(q) || stateLower.includes(q)) {
        containsNameOrState.push(city);
      }
    }

    return [...startsWithName, ...containsNameOrState].slice(0, 80);
  });

  ngAfterViewInit() {
    setTimeout(() => {
      this.searchInputRef?.nativeElement?.focus();
    }, 50);
  }

  onQueryInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchQuery.set(val);
  }

  clearQuery() {
    this.searchQuery.set('');
    this.searchInputRef?.nativeElement?.focus();
  }

  onRecentItemClick(item: RecentCitySearchItem) {
    if (item.type === 'route' && item.fromCityName && item.toCityName) {
      const fromCity = this.resolveCityByName(item.fromCityName);
      const toCity = this.resolveCityByName(item.toCityName);
      if (this.mode() === 'hotel') {
        this.selectSingleCity(toCity);
        return;
      }
      this.state.sourceCity.set(fromCity);
      this.state.destinationCity.set(toCity);
      this.routeSelected.emit({from: fromCity, to: toCity});
      this.closed.emit();
      return;
    }

    const targetName = item.cityName || item.label;
    const city = this.resolveCityByName(targetName);
    this.selectSingleCity(city);
  }

  selectSingleCity(city: City) {
    const currentMode = this.mode();
    if (currentMode === 'from') {
      this.state.sourceCity.set(city);
      this.saveRecentSingleCity(city.name);
    } else if (currentMode === 'to') {
      this.state.destinationCity.set(city);
      this.saveRecentRoute(this.state.sourceCity().name, city.name);
    } else {
      this.state.destinationCity.set(city);
      this.saveRecentSingleCity(city.name);
    }
    this.citySelected.emit(city);
    this.closed.emit();
  }

  private resolveCityByName(name: string): City {
    const all = this.state.cities();
    const match = all.find((c) => c.name.toLowerCase() === name.toLowerCase());
    if (match) return match;
    return {
      id: name.toLowerCase(),
      name,
      state: name === 'Gangtok' ? 'Sikkim' : name === 'Siliguri' ? 'West Bengal' : 'India',
      code: name.slice(0, 3).toUpperCase(),
      popularTerminals: [`${name} Central`],
    };
  }

  private loadRecentSearches(): RecentCitySearchItem[] {
    if (typeof window === 'undefined') return DEFAULT_RECENT_SEARCHES;
    try {
      const raw = localStorage.getItem('redbus_recent_city_searches_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_RECENT_SEARCHES;
  }

  private saveRecentSingleCity(cityName: string) {
    const current = this.recentSearches();
    const newItem: RecentCitySearchItem = {
      id: `rec-city-${cityName.toLowerCase()}`,
      type: 'city',
      label: cityName,
      cityName,
    };
    const updated = [
      newItem,
      ...current.filter((i) => i.label.toLowerCase() !== cityName.toLowerCase()),
    ].slice(0, 6);
    this.recentSearches.set(updated);
    this.persistRecentSearches(updated);
  }

  private saveRecentRoute(fromName: string, toName: string) {
    if (fromName.toLowerCase() === toName.toLowerCase()) return;
    const label = `${fromName} - ${toName}`;
    const current = this.recentSearches();
    const newItem: RecentCitySearchItem = {
      id: `rec-route-${fromName.toLowerCase()}-${toName.toLowerCase()}`,
      type: 'route',
      label,
      fromCityName: fromName,
      toCityName: toName,
    };
    const updated = [
      newItem,
      ...current.filter((i) => i.label.toLowerCase() !== label.toLowerCase()),
    ].slice(0, 6);
    this.recentSearches.set(updated);
    this.persistRecentSearches(updated);
  }

  private persistRecentSearches(items: RecentCitySearchItem[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('redbus_recent_city_searches_v1', JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }
}
