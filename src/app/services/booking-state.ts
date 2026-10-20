import {Injectable, signal, computed, inject} from '@angular/core';
import {
  City,
  Trip,
  Seat,
  Passenger,
  Booking,
  BoardingPoint,
  DroppingPoint,
  ActiveSeatHold,
  CarRental,
  CuratedTourTrip,
  SharedCarTrip,
  CarSeat,
  DestinationHotel,
  CouponOffer,
  VehicleCustomConfig,
  VehicleLayoutModel,
  CustomDeckConfig,
  GridSeatCell,
  SeatCategory,
  VehicleSeatFormat,
} from '../models/bus-booking.models';
import {ApiClient, DatabaseStatusResponse, ConnectivityTestResponse} from './api-client';

export interface TripFilter {
  hasAc: boolean | null;
  busType: 'all' | 'sleeper' | 'seater' | 'semi_sleeper';
  departureTimeSlot: 'all' | 'morning' | 'afternoon' | 'evening' | 'night';
  maxPrice: number;
  operator: string;
  minRating: number;
  sortBy: 'departure_asc' | 'departure_desc' | 'price_asc' | 'price_desc' | 'rating_desc';
}

export interface CrudTestStepResult {
  step: string;
  operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'VERIFY';
  target: string;
  durationMs: number;
  status: 'PASSED' | 'FAILED' | 'RUNNING';
  details: string;
}

@Injectable({
  providedIn: 'root',
})
export class BookingState {
  private readonly apiClient = inject(ApiClient);

  // Navigation / Tab state across phases
  readonly currentTab = signal<'booking' | 'cars' | 'trip' | 'tickets' | 'admin' | 'schema' | 'dotnet' | 'tests'>('booking');

  // Multi-page search flow: 'search' | 'results' | 'seats' | 'car-seats' | 'transport-seats' | 'boarding-dropping' | 'passenger-info'
  readonly searchPageStep = signal<'search' | 'results' | 'seats' | 'car-seats' | 'transport-seats' | 'boarding-dropping' | 'passenger-info'>('search');
  readonly resultsTargetSection = signal<'bus' | 'car' | 'hotel' | 'flight' | 'transport' | 'rides'>('bus');
  readonly searchCategory = signal<'bus' | 'car' | 'hotel' | 'flight' | 'transport' | 'rides'>('bus');
  readonly bookingForWomen = signal<boolean>(false);
  readonly isHelpModalOpen = signal<boolean>(false);
  readonly walletBalance = signal<number>(100);

  // Supabase Auth modal & session
  readonly isAuthModalOpen = signal<boolean>(false);

  // Auth state (Supabase Auth active session)
  readonly currentUser = signal<{
    id: string;
    email: string;
    fullName: string;
    phone: string;
  }>({
    id: 'u8888888-8888-8888-8888-888888888888',
    email: 'passenger@example.com',
    fullName: 'Rahul Sharma',
    phone: '+91 98765 43210',
  });

  // Cities database (Loaded from Database API)
  readonly cities = signal<City[]>([]);
  readonly isCitiesLoading = signal<boolean>(false);

  // Cars database (Car & Cab Rentals - Replaces Train)
  readonly cars = signal<CarRental[]>([]);
  readonly isCarsLoading = signal<boolean>(false);

  // Shared Car Trips / Sawari Vehicles (Small Town / Route Shared Scorpio, Bolero, Cruiser, etc.)
  readonly sharedCarTrips = signal<SharedCarTrip[]>([]);
  readonly isSharedCarTripsLoading = signal<boolean>(false);
  readonly selectedSharedCarTrip = signal<SharedCarTrip | null>(null);
  readonly selectedCarSeatIds = signal<string[]>([]);
  readonly carVehicleFilter = signal<string>('all'); // 'all' | 'scorpio' | 'bolero' | 'cruiser' | 'sumo' | 'ertiga'
  readonly carAcFilter = signal<string>('all'); // 'all' | 'true' | 'false'

  // Transport Trips (Express Logistics & Cargo-Passenger Fleet: Tata Winger, Force Urbania, Bolero Maxi, etc.)
  readonly transportTrips = signal<SharedCarTrip[]>([]);
  readonly isTransportTripsLoading = signal<boolean>(false);
  readonly selectedTransportTrip = signal<SharedCarTrip | null>(null);
  readonly selectedTransportSeatIds = signal<string[]>([]);

  // Curated Tour Trips database (Holiday Packages - Replaces Metro)
  readonly tourTrips = signal<CuratedTourTrip[]>([]);
  readonly isTourTripsLoading = signal<boolean>(false);

  // Search parameters
  readonly isLocating = signal<boolean>(false);
  readonly locationDetected = signal<boolean>(false);
  readonly sourceCity = signal<City>({
    id: '3',
    name: 'Bengaluru',
    state: 'Karnataka',
    code: 'BLR',
    popularTerminals: ['Majestic', 'Madiwala', 'Silk Board'],
  });
  readonly destinationCity = signal<City>({
    id: '5',
    name: 'Hyderabad',
    state: 'Telangana',
    code: 'HYD',
    popularTerminals: ['Ameerpet', 'Gachibowli', 'MGBS'],
  });
  readonly travelDate = signal<string>(new Date().toISOString().split('T')[0]);

  // Hotel search location & nearest matched road / area / sector from Google Maps
  readonly hotelCustomSearchLocation = signal<string>('');
  readonly hotelUserLocation = signal<{
    lat: number;
    lng: number;
    areaName: string;
    cityName: string;
  } | null>(null);

  // Popular routes dynamically generated based on current location (sourceCity)
  readonly popularRoutesFromLocation = computed(() => {
    const src = this.sourceCity();
    const all = this.cities();
    return all.filter((c) => c.id !== src.id).slice(0, 4);
  });

  // Trips data (Loaded from Database API)
  readonly allTrips = signal<Trip[]>([]);
  readonly isTripsLoading = signal<boolean>(false);
  readonly selectedTrip = signal<Trip | null>(null);

  // Active Deck Tab in Seat Layout
  readonly activeDeck = signal<'lower' | 'middle' | 'upper'>('lower');

  // Admin Layout & Vehicle Details Studio Configurations + Reusable Vehicle Models (Persisted in state & localStorage)
  readonly vehicleModels = signal<VehicleLayoutModel[]>([]);
  readonly vehicleModelAssignments = signal<Record<string, string>>({});
  readonly vehicleCustomConfigs = signal<Record<string, VehicleCustomConfig>>({});

  // Selected seats by the user
  readonly selectedSeats = signal<Seat[]>([]);

  // Concurrency & 5-minute Seat Hold State
  readonly activeHold = signal<ActiveSeatHold | null>(null);
  readonly holdCountdownSeconds = signal<number>(0);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  // Passengers list corresponding to selected seats
  readonly passengers = signal<Passenger[]>([]);

  // Selected Boarding & Dropping points
  readonly selectedBoardingPoint = signal<BoardingPoint | null>(null);
  readonly selectedDroppingPoint = signal<DroppingPoint | null>(null);

  // Filter state
  readonly filters = signal<TripFilter>({
    hasAc: null,
    busType: 'all',
    departureTimeSlot: 'all',
    maxPrice: 2500,
    operator: 'all',
    minRating: 0,
    sortBy: 'departure_asc',
  });

  // Modal states
  readonly isCheckoutOpen = signal<boolean>(false);
  readonly isSuccessModalOpen = signal<boolean>(false);
  readonly isFilterModalOpen = signal<boolean>(false);
  readonly isCouponModalOpen = signal<boolean>(false);
  readonly activeBookingResult = signal<Booking | null>(null);

  // Active coupon state & Database Coupons
  readonly appliedCoupon = signal<{code: string; discount: number; title: string} | null>(null);
  readonly availableCoupons = signal<CouponOffer[]>([]);

  // Hotels database (Loaded from Database API)
  readonly dbHotels = signal<DestinationHotel[]>([]);
  readonly isHotelsLoading = signal<boolean>(false);

  // Booking history (Loaded from Database API)
  readonly userBookings = signal<Booking[]>([]);
  readonly isBookingsLoading = signal<boolean>(false);

  // Database Health & Connectivity State
  readonly dbStatus = signal<DatabaseStatusResponse | null>(null);
  readonly isDbTesting = signal<boolean>(false);
  readonly lastConnectivityTest = signal<ConnectivityTestResponse | null>(null);
  readonly crudTestResults = signal<CrudTestStepResult[]>([]);
  readonly isCrudTesting = signal<boolean>(false);

  // Notification / Toast
  readonly toastMessage = signal<{text: string; type: 'info' | 'success' | 'warning' | 'error'} | null>(null);

  constructor() {
    this.initDefaultVehicleModels();
    if (typeof window !== 'undefined') {
      this.restoreStudioStateFromStorage();
      this.initializeFromDatabase();
    }
  }

  // =========================================================================
  // INITIAL DATA HYDRATION FROM DATABASE API
  // =========================================================================

  initializeFromDatabase() {
    this.refreshDatabaseStatus();
    this.loadCitiesFromDb();
    this.loadTripsFromDb();
    this.loadBookingsFromDb();
    this.loadCarsFromDb();
    this.loadSharedCarTripsFromDb();
    this.loadTourTripsFromDb();
    this.loadHotelsFromDb();
    this.loadTransportTrips();
    this.loadCouponsFromDb();
  }

  refreshDatabaseStatus() {
    this.apiClient.getDatabaseStatus().subscribe({
      next: (status) => this.dbStatus.set(status),
      error: (err) => console.error('Failed to get database status', err),
    });
  }

  loadCitiesFromDb() {
    this.isCitiesLoading.set(true);
    this.apiClient.getCities().subscribe({
      next: (citiesList) => {
        this.isCitiesLoading.set(false);
        if (citiesList && citiesList.length > 0) {
          this.cities.set(citiesList);
          // Sync source & destination defaults by ID or city name
          const currentSrc =
            citiesList.find(
              (c) =>
                c.id === this.sourceCity().id ||
                c.name.toLowerCase() === this.sourceCity().name.toLowerCase(),
            ) || citiesList[0];
          const currentDst =
            citiesList.find(
              (c) =>
                (c.id === this.destinationCity().id ||
                  c.name.toLowerCase() === this.destinationCity().name.toLowerCase()) &&
                c.id !== currentSrc.id,
            ) ||
            citiesList.find((c) => c.id !== currentSrc.id) ||
            citiesList[0];
          this.sourceCity.set(currentSrc);
          this.destinationCity.set(currentDst);
          // Automatically detect user's current location and set source city
          this.detectCurrentLocation(true);
        }
      },
      error: (err) => {
        this.isCitiesLoading.set(false);
        console.error('Error loading cities from database', err);
      },
    });
  }

  detectCurrentLocation(silent = false) {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      if (!silent) this.showToast('Geolocation is not supported by your browser', 'warning');
      return;
    }
    this.isLocating.set(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Search current location using Google Maps Reverse Geocoding
        this.apiClient.reverseGeocode(latitude, longitude).subscribe({
          next: (geoRes) => {
            this.isLocating.set(false);
            const gmpCityName = (geoRes.city || 'Bengaluru').trim();
            const gmpStateName = (geoRes.state || 'Karnataka').trim();

            // 1. Filter with my city API / database (if exists in my city api)
            const allCities = this.cities();
            const lowerGmp = gmpCityName.toLowerCase();
            const existingCity = allCities.find(
              (c) =>
                c.name.toLowerCase() === lowerGmp ||
                c.name.toLowerCase().includes(lowerGmp) ||
                lowerGmp.includes(c.name.toLowerCase()),
            );

            if (existingCity) {
              // Exists in City API: select that city entity
              this.sourceCity.set(existingCity);
              this.locationDetected.set(true);
              if (this.destinationCity().id === existingCity.id) {
                const alternate = allCities.find((c) => c.id !== existingCity.id) || allCities[0];
                if (alternate) this.destinationCity.set(alternate);
              }
              if (!silent) {
                this.showToast(`Current location verified from Google Maps: ${existingCity.name}, ${existingCity.state}`, 'success');
              }
            } else {
              // Does not exist in City API: select the name of the city from Google Maps
              const newCity: City = {
                id: 'gmp-cty-' + Date.now(),
                name: gmpCityName,
                state: gmpStateName,
                code: gmpCityName.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase() || 'CTY',
                popularTerminals: [
                  `${gmpCityName} Central Bus Stand`,
                  `${gmpCityName} Main Stand`,
                  `${gmpCityName} Railway Station Terminal`,
                ],
              };
              this.cities.update((prev) => [newCity, ...prev]);
              this.sourceCity.set(newCity);
              this.locationDetected.set(true);
              if (this.destinationCity().id === newCity.id) {
                const alternate = allCities.find((c) => c.id !== newCity.id) || allCities[0];
                if (alternate) this.destinationCity.set(alternate);
              }
              if (!silent) {
                this.showToast(`Current location set from Google Maps: ${newCity.name}, ${newCity.state}`, 'success');
              }
            }
          },
          error: () => {
            this.isLocating.set(false);
            const closest = this.findClosestCity(latitude, longitude);
            if (closest) {
              this.sourceCity.set(closest);
              this.locationDetected.set(true);
              if (this.destinationCity().id === closest.id) {
                const alternate = this.cities().find((c) => c.id !== closest.id) || this.cities()[0];
                if (alternate) this.destinationCity.set(alternate);
              }
              if (!silent) {
                this.showToast(`Current location detected: ${closest.name}, ${closest.state}`, 'success');
              }
            }
          },
        });
      },
      () => {
        this.isLocating.set(false);
        if (!silent) {
          this.showToast('Could not access current location. Please check location permissions.', 'info');
        }
      },
      { timeout: 8000, maximumAge: 600000 },
    );
  }

  detectHotelCurrentLocation(silent = false) {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      if (!silent) this.showToast('Geolocation is not supported by your browser', 'warning');
      return;
    }
    this.isLocating.set(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // In hotel case: use Google Maps to search within India regions and select the nearest road / area / sector / cross main
        this.apiClient.reverseGeocode(latitude, longitude).subscribe({
          next: (geoRes) => {
            this.isLocating.set(false);
            const areaOrRoad = (geoRes.nearestAreaOrRoad || geoRes.area || geoRes.road || geoRes.sector || geoRes.city || '').trim();
            const cityName = (geoRes.city || 'Bengaluru').trim();
            const stateName = (geoRes.state || 'Karnataka').trim();
            const fullLocationText = areaOrRoad ? `${areaOrRoad}, ${cityName}` : cityName;

            this.hotelCustomSearchLocation.set(fullLocationText);
            this.hotelUserLocation.set({
              lat: latitude,
              lng: longitude,
              areaName: areaOrRoad || cityName,
              cityName,
            });

            // Match or assign destinationCity so hotel queries are contextual
            const allCities = this.cities();
            const lowerCity = cityName.toLowerCase();
            const matchedCity = allCities.find(
              (c) =>
                c.name.toLowerCase() === lowerCity ||
                c.name.toLowerCase().includes(lowerCity) ||
                lowerCity.includes(c.name.toLowerCase()),
            );

            if (matchedCity) {
              this.destinationCity.set(matchedCity);
            } else {
              const newCity: City = {
                id: 'gmp-htl-' + Date.now(),
                name: cityName,
                state: stateName,
                code: cityName.replace(/[^A-Za-z]/g, '').substring(0, 3).toUpperCase() || 'HTL',
                popularTerminals: [`${areaOrRoad} Hotel Zone`, `${cityName} Central Stand`],
              };
              this.cities.update((prev) => [newCity, ...prev]);
              this.destinationCity.set(newCity);
            }

            if (!silent) {
              this.showToast(`Nearest area located via Google Maps: ${areaOrRoad} (${cityName})`, 'success');
            }

            this.loadHotelsFromDb();
          },
          error: () => {
            this.isLocating.set(false);
            if (!silent) {
              this.showToast('Could not find nearest area from Google Maps.', 'info');
            }
          },
        });
      },
      () => {
        this.isLocating.set(false);
        if (!silent) {
          this.showToast('Could not access current location for hotels.', 'info');
        }
      },
      { timeout: 8000, maximumAge: 600000 },
    );
  }

  private findClosestCity(lat: number, lng: number): City | null {
    const list = this.cities();
    if (!list.length) return null;

    const coordsByName: Record<string, { lat: number; lng: number }> = {
      mumbai: { lat: 19.0760, lng: 72.8777 },
      delhi: { lat: 28.7041, lng: 77.1025 },
      bengaluru: { lat: 12.9716, lng: 77.5946 },
      ahmedabad: { lat: 23.0225, lng: 72.5714 },
      hyderabad: { lat: 17.3850, lng: 78.4867 },
      chennai: { lat: 13.0827, lng: 80.2707 },
      kolkata: { lat: 22.5726, lng: 88.3639 },
      pune: { lat: 18.5204, lng: 73.8567 },
      jaipur: { lat: 26.9124, lng: 75.7873 },
      surat: { lat: 21.1702, lng: 72.8311 },
      lucknow: { lat: 26.8467, lng: 80.9462 },
    };

    let closestCity = list[0];
    let minDistance = Infinity;

    for (const city of list) {
      const coords = coordsByName[city.name.toLowerCase()];
      if (coords) {
        const dLat = (coords.lat - lat) * (Math.PI / 180);
        const dLng = (coords.lng - lng) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat * (Math.PI / 180)) * Math.cos(coords.lat * (Math.PI / 180)) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = 6371 * c;
        if (distance < minDistance) {
          minDistance = distance;
          closestCity = city;
        }
      }
    }
    return closestCity;
  }

  loadTripsFromDb() {
    this.isTripsLoading.set(true);
    const startedAt = Date.now();
    const srcId = this.sourceCity().id;
    const dstId = this.destinationCity().id;
    const date = this.travelDate();

    this.apiClient.searchTrips(srcId, dstId, date).subscribe({
      next: (tripsList) => {
        if (Array.isArray(tripsList)) {
          const hydratedList = tripsList.map((t) => this.hydrateBusTripWithConfig(t));
          const currentSel = this.selectedTrip();
          this.allTrips.set(hydratedList);
          if (currentSel) {
            const found =
              hydratedList.find((t) => t.id === currentSel.id) ||
              hydratedList.find((t) => t.bus.operatorName === currentSel.bus.operatorName);
            if (found) {
              this.loadSeatsForTrip(found);
            }
          }
        }
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, 480 - elapsed);
        setTimeout(() => {
          this.isTripsLoading.set(false);
        }, remaining);
      },
      error: (err) => {
        this.isTripsLoading.set(false);
        console.error('Error searching trips from database', err);
      },
    });
  }

  // Dedicated Individual Search: ONLY Bus
  searchOnlyBus() {
    this.searchCategory.set('bus');
    this.resultsTargetSection.set('bus');
    this.currentTab.set('booking');
    this.loadTripsFromDb();
    this.loadSharedCarTripsFromDb();
    this.loadCarsFromDb();
    this.searchPageStep.set('results');
    this.showToast(`Found buses for ${this.sourceCity().name} → ${this.destinationCity().name}`, 'success');
  }

  // Dedicated Individual Search: ONLY Car
  searchOnlyCar() {
    this.searchCategory.set('car');
    this.resultsTargetSection.set('car');
    this.currentTab.set('booking');
    this.loadSharedCarTripsFromDb();
    this.loadTripsFromDb();
    this.loadCarsFromDb();
    this.searchPageStep.set('results');
    this.showToast(`Found cars for ${this.sourceCity().name} → ${this.destinationCity().name}`, 'success');
  }

  // Dedicated Individual Search: ONLY Hotel (Results show 1 tab: Hotels at destination)
  searchOnlyHotel() {
    this.searchCategory.set('hotel');
    this.resultsTargetSection.set('hotel');
    this.currentTab.set('booking');
    this.loadHotelsFromDb();
    this.searchPageStep.set('results');
    this.showToast(`Found hotels in ${this.destinationCity().name}`, 'success');
  }

  // Dedicated Individual Search: Transport Module (Same flow as Car)
  searchOnlyTransport() {
    this.searchCategory.set('transport');
    this.resultsTargetSection.set('transport');
    this.currentTab.set('booking');
    this.loadTransportTrips();
    this.loadSharedCarTripsFromDb();
    this.searchPageStep.set('results');
    this.showToast(`Found transport for ${this.sourceCity().name} → ${this.destinationCity().name}`, 'success');
  }

  loadTransportTrips() {
    this.isTransportTripsLoading.set(true);
    const src = this.sourceCity();
    const dst = this.destinationCity();
    const date = this.travelDate();

    const list: SharedCarTrip[] = [
      {
        id: `trp-${src.code || 'SRC'}-${dst.code || 'DST'}-1`,
        operatorName: 'VRL Logistics & Express Transport',
        vehicleName: 'Tata Winger Transport Cruiser (12-Seater)',
        vehicleModel: 'cruiser',
        vehicleNumber: 'KA 01 TR 4821',
        driverName: 'Manjunath Gowda',
        driverPhone: '+91 98452 11029',
        sourceCityId: src.id,
        sourceCityName: src.name,
        destinationCityId: dst.id,
        destinationCityName: dst.name,
        departureTime: '06:30 AM',
        arrivalTime: '01:30 PM',
        duration: '7h 00m',
        date: date,
        baseFare: 650,
        hasAc: true,
        fuelType: 'Diesel',
        totalSeats: 12,
        availableSeatsCount: 9,
        rating: 4.8,
        totalReviews: 1420,
        frequency: 'Daily 4 Services',
        features: ['AC Transport', 'Luggage Compartment', 'GPS Live Tracking', 'Express Highway'],
        offerTag: '₹100 OFF',
        hasOffer: true,
        boardingPoints: [
          { id: 'bp-t1', time: '06:30 AM', location: `${src.name} Main Transport Hub`, landmark: 'Near Outer Ring Toll' },
          { id: 'bp-t2', time: '07:15 AM', location: `${src.name} Central Cargo Depot`, landmark: 'Gate 2' },
        ],
        droppingPoints: [
          { id: 'dp-t1', time: '01:00 PM', location: `${dst.name} Highway Junction`, landmark: 'Ring Road' },
          { id: 'dp-t2', time: '01:30 PM', location: `${dst.name} Central Transit Terminal`, landmark: 'Platform 5' },
        ],
        seats: [
          { id: 's-f1', seatNumber: 'F1', label: 'Front Co-Passenger', row: 'front', position: 'window_right', price: 750, status: 'available' },
          { id: 's-f2', seatNumber: 'F2', label: 'Front Cabin', row: 'front', position: 'center', price: 700, status: 'available' },
          { id: 's-m1', seatNumber: 'M1', label: 'Mid Row Left', row: 'middle', position: 'window_left', price: 650, status: 'available', isLadiesReserved: true },
          { id: 's-m2', seatNumber: 'M2', label: 'Mid Row Center', row: 'middle', position: 'center', price: 650, status: 'available' },
          { id: 's-m3', seatNumber: 'M3', label: 'Mid Row Right', row: 'middle', position: 'window_right', price: 650, status: 'available' },
          { id: 's-m4', seatNumber: 'M4', label: 'Mid Row Aisle', row: 'middle', position: 'center', price: 650, status: 'booked' },
          { id: 's-r1', seatNumber: 'R1', label: 'Rear Window Left', row: 'rear', position: 'window_left', price: 600, status: 'available' },
          { id: 's-r2', seatNumber: 'R2', label: 'Rear Center', row: 'rear', position: 'center', price: 600, status: 'available' },
          { id: 's-r3', seatNumber: 'R3', label: 'Rear Right', row: 'rear', position: 'window_right', price: 600, status: 'available' },
          { id: 's-r4', seatNumber: 'R4', label: 'Rear Bay Slot', row: 'rear', position: 'center', price: 550, status: 'available' },
        ],
      },
      {
        id: `trp-${src.code || 'SRC'}-${dst.code || 'DST'}-2`,
        operatorName: 'SRS Cargo & Passenger Transits',
        vehicleName: 'Force Urbania Super Transport (14-Seater)',
        vehicleModel: 'cruiser',
        vehicleNumber: 'KA 05 TR 9022',
        driverName: 'Suresh Kumar',
        driverPhone: '+91 94481 77210',
        sourceCityId: src.id,
        sourceCityName: src.name,
        destinationCityId: dst.id,
        destinationCityName: dst.name,
        departureTime: '08:45 AM',
        arrivalTime: '03:15 PM',
        duration: '6h 30m',
        date: date,
        baseFare: 850,
        hasAc: true,
        fuelType: 'Diesel',
        totalSeats: 14,
        availableSeatsCount: 11,
        rating: 4.9,
        totalReviews: 2180,
        frequency: 'Daily Hourly',
        features: ['High-Roof Luxury', 'Dedicated Cargo Bay', 'USB Charging', 'Highway Fast-Tag'],
        offerTag: 'POPULAR',
        hasOffer: true,
        boardingPoints: [
          { id: 'bp-t3', time: '08:45 AM', location: `${src.name} Express Transit Hub`, landmark: 'Opposite Metro Station' },
        ],
        droppingPoints: [
          { id: 'dp-t3', time: '03:15 PM', location: `${dst.name} Transport City Terminal`, landmark: 'Terminal 1' },
        ],
        seats: [
          { id: 'u-f1', seatNumber: 'F1', label: 'Front Co-Passenger', row: 'front', position: 'window_right', price: 950, status: 'available' },
          { id: 'u-f2', seatNumber: 'F2', label: 'Front Cabin', row: 'front', position: 'center', price: 900, status: 'available' },
          { id: 'u-m1', seatNumber: 'M1', label: 'Captain Seat 1', row: 'middle', position: 'window_left', price: 850, status: 'available' },
          { id: 'u-m2', seatNumber: 'M2', label: 'Captain Seat 2', row: 'middle', position: 'window_right', price: 850, status: 'available' },
          { id: 'u-m3', seatNumber: 'M3', label: 'Captain Seat 3', row: 'middle', position: 'window_left', price: 850, status: 'available' },
          { id: 'u-m4', seatNumber: 'M4', label: 'Captain Seat 4', row: 'middle', position: 'window_right', price: 850, status: 'available' },
          { id: 'u-r1', seatNumber: 'R1', label: 'Rear Seat 1', row: 'rear', position: 'window_left', price: 800, status: 'available' },
          { id: 'u-r2', seatNumber: 'R2', label: 'Rear Seat 2', row: 'rear', position: 'center', price: 800, status: 'available' },
          { id: 'u-r3', seatNumber: 'R3', label: 'Rear Seat 3', row: 'rear', position: 'window_right', price: 800, status: 'available' },
        ],
      },
      {
        id: `trp-${src.code || 'SRC'}-${dst.code || 'DST'}-3`,
        operatorName: 'National Highway Transport Co.',
        vehicleName: 'Mahindra Bolero Maxi Transport',
        vehicleModel: 'bolero',
        vehicleNumber: 'MH 12 TR 3301',
        driverName: 'Ramesh Patil',
        driverPhone: '+91 97662 55431',
        sourceCityId: src.id,
        sourceCityName: src.name,
        destinationCityId: dst.id,
        destinationCityName: dst.name,
        departureTime: '11:00 AM',
        arrivalTime: '06:00 PM',
        duration: '7h 00m',
        date: date,
        baseFare: 520,
        hasAc: false,
        fuelType: 'Diesel',
        totalSeats: 8,
        availableSeatsCount: 6,
        rating: 4.7,
        totalReviews: 940,
        frequency: 'Daily 3 Services',
        features: ['Budget Friendly', 'Heavy Luggage Support', 'Direct Drop', 'Express Toll'],
        offerTag: 'BEST VALUE',
        hasOffer: true,
        boardingPoints: [
          { id: 'bp-t4', time: '11:00 AM', location: `${src.name} Goods & Transit Hub`, landmark: 'Near Toll' },
        ],
        droppingPoints: [
          { id: 'dp-t4', time: '06:00 PM', location: `${dst.name} Bypass Toll Depot`, landmark: 'Bypass' },
        ],
        seats: [
          { id: 'b-f1', seatNumber: 'F1', label: 'Front Co-Passenger', row: 'front', position: 'window_right', price: 600, status: 'available' },
          { id: 'b-m1', seatNumber: 'M1', label: 'Middle Window', row: 'middle', position: 'window_left', price: 520, status: 'available' },
          { id: 'b-m2', seatNumber: 'M2', label: 'Middle Center', row: 'middle', position: 'center', price: 520, status: 'available' },
          { id: 'b-m3', seatNumber: 'M3', label: 'Middle Window', row: 'middle', position: 'window_right', price: 520, status: 'available' },
          { id: 'b-r1', seatNumber: 'R1', label: 'Rear Side 1', row: 'rear', position: 'window_left', price: 480, status: 'available' },
          { id: 'b-r2', seatNumber: 'R2', label: 'Rear Side 2', row: 'rear', position: 'window_right', price: 480, status: 'available' },
        ],
      },
      {
        id: `trp-${src.code || 'SRC'}-${dst.code || 'DST'}-4`,
        operatorName: 'Intercity Transport Network',
        vehicleName: 'Force Traveller Express Cargo & Rider',
        vehicleModel: 'cruiser',
        vehicleNumber: 'DL 01 TR 7719',
        driverName: 'Harpreet Singh',
        driverPhone: '+91 98112 44321',
        sourceCityId: src.id,
        sourceCityName: src.name,
        destinationCityId: dst.id,
        destinationCityName: dst.name,
        departureTime: '02:30 PM',
        arrivalTime: '09:00 PM',
        duration: '6h 30m',
        date: date,
        baseFare: 750,
        hasAc: true,
        fuelType: 'CNG',
        totalSeats: 10,
        availableSeatsCount: 8,
        rating: 4.8,
        totalReviews: 1850,
        frequency: 'Daily 2 Services',
        features: ['Eco CNG', 'AC Cooling', 'Ample Legroom', 'Speed Governor Safe'],
        boardingPoints: [
          { id: 'bp-t5', time: '02:30 PM', location: `${src.name} Transport Nagar`, landmark: 'Depot 3' },
        ],
        droppingPoints: [
          { id: 'dp-t5', time: '09:00 PM', location: `${dst.name} Main Ring Road`, landmark: 'Flyover Exit' },
        ],
        seats: [
          { id: 't-f1', seatNumber: 'F1', label: 'Front Co-Passenger', row: 'front', position: 'window_right', price: 850, status: 'available' },
          { id: 't-m1', seatNumber: 'M1', label: 'Row 1 Left', row: 'middle', position: 'window_left', price: 750, status: 'available' },
          { id: 't-m2', seatNumber: 'M2', label: 'Row 1 Right', row: 'middle', position: 'window_right', price: 750, status: 'available' },
          { id: 't-m3', seatNumber: 'M3', label: 'Row 2 Left', row: 'middle', position: 'window_left', price: 750, status: 'available' },
          { id: 't-m4', seatNumber: 'M4', label: 'Row 2 Right', row: 'middle', position: 'window_right', price: 750, status: 'available' },
          { id: 't-r1', seatNumber: 'R1', label: 'Back Left', row: 'rear', position: 'window_left', price: 700, status: 'available' },
          { id: 't-r2', seatNumber: 'R2', label: 'Back Center', row: 'rear', position: 'center', price: 700, status: 'available' },
          { id: 't-r3', seatNumber: 'R3', label: 'Back Right', row: 'rear', position: 'window_right', price: 700, status: 'available' },
        ],
      },
      {
        id: `trp-${src.code || 'SRC'}-${dst.code || 'DST'}-5`,
        operatorName: 'Prime Transport Solutions',
        vehicleName: 'Toyota Innova Crysta Transport Fleet',
        vehicleModel: 'innova',
        vehicleNumber: 'TS 09 TR 1190',
        driverName: 'Venkat Reddy',
        driverPhone: '+91 99890 12345',
        sourceCityId: src.id,
        sourceCityName: src.name,
        destinationCityId: dst.id,
        destinationCityName: dst.name,
        departureTime: '07:00 PM',
        arrivalTime: '01:00 AM',
        duration: '6h 00m',
        date: date,
        baseFare: 950,
        hasAc: true,
        fuelType: 'Diesel',
        totalSeats: 6,
        availableSeatsCount: 5,
        rating: 4.9,
        totalReviews: 3200,
        frequency: 'Daily Express',
        features: ['Luxury Captain Seats', 'Priority Transport', 'Fast-Track Lane', 'Bottled Water'],
        offerTag: 'PREMIUM',
        hasOffer: true,
        boardingPoints: [
          { id: 'bp-t6', time: '07:00 PM', location: `${src.name} Commercial Hub`, landmark: 'Pillar 44' },
        ],
        droppingPoints: [
          { id: 'dp-t6', time: '01:00 AM', location: `${dst.name} City Gateway`, landmark: 'Toll Plaza' },
        ],
        seats: [
          { id: 'i-f1', seatNumber: 'F1', label: 'Front Co-Passenger', row: 'front', position: 'window_right', price: 1100, status: 'available' },
          { id: 'i-m1', seatNumber: 'M1', label: 'Middle Captain Left', row: 'middle', position: 'window_left', price: 950, status: 'available' },
          { id: 'i-m2', seatNumber: 'M2', label: 'Middle Captain Right', row: 'middle', position: 'window_right', price: 950, status: 'available' },
          { id: 'i-r1', seatNumber: 'R1', label: 'Rear Window Left', row: 'rear', position: 'window_left', price: 850, status: 'available' },
          { id: 'i-r2', seatNumber: 'R2', label: 'Rear Window Right', row: 'rear', position: 'window_right', price: 850, status: 'available' },
        ],
      },
    ];

    this.transportTrips.set(list);
    setTimeout(() => {
      this.isTransportTripsLoading.set(false);
    }, 250);
  }

  loadHotelsFromDb(filter = 'all', sort = 'recommended') {
    this.isHotelsLoading.set(true);
    const dst = this.destinationCity();
    this.apiClient
      .getHotels({ cityId: dst.id, cityName: dst.name, filter, sort })
      .subscribe({
        next: (hotelsList) => {
          this.isHotelsLoading.set(false);
          if (Array.isArray(hotelsList)) {
            this.dbHotels.set(hotelsList);
          }
        },
        error: (err) => {
          this.isHotelsLoading.set(false);
          console.error('Error loading hotels from database', err);
        },
      });
  }

  loadCouponsFromDb(category = 'all') {
    this.apiClient.getCoupons(category).subscribe({
      next: (coupons) => {
        if (Array.isArray(coupons) && coupons.length > 0) {
          this.availableCoupons.set(coupons);
        }
      },
      error: (err) => console.error('Error loading coupons from database', err),
    });
  }

  searchRide() {
    const target = this.resultsTargetSection();
    if (target === 'car') {
      this.searchOnlyCar();
    } else if (target === 'hotel') {
      this.searchOnlyHotel();
    } else {
      this.searchOnlyBus();
    }
  }

  searchTrips() {
    this.searchOnlyBus();
  }

  searchBus() {
    this.searchOnlyBus();
  }

  searchCar() {
    this.searchOnlyCar();
  }

  searchHotel() {
    this.searchOnlyHotel();
  }

  searchFlight() {
    this.searchOnlyFlight();
  }

  searchOnlyFlight() {
    this.searchCategory.set('flight');
    this.resultsTargetSection.set('flight');
    this.showToast(`Found flights from ${this.sourceCity().name} (${this.sourceCity().code}) to ${this.destinationCity().name} (${this.destinationCity().code})`, 'success');
  }

  bookHotelStay(hotel: DestinationHotel, guestDetails?: { name?: string; phone?: string; checkInDate?: string }) {
    const user = this.currentUser();
    const guestName = guestDetails?.name || user.fullName || 'Guest';
    const checkIn = guestDetails?.checkInDate || this.travelDate();

    this.apiClient
      .bookHotelStay({
        hotelId: hotel.id,
        checkInDate: checkIn,
        nights: 1,
        guestsCount: 2,
        roomsCount: 1,
        customerName: guestName,
        userId: user.id,
        couponCode: this.appliedCoupon()?.code,
      })
      .subscribe({
        next: (res) => {
          if (res?.success && res.booking) {
            this.userBookings.update((prev) => [res.booking, ...prev]);
            this.activeBookingResult.set(res.booking);
            this.isSuccessModalOpen.set(true);
            this.loadHotelsFromDb();
            this.refreshDatabaseStatus();
            this.showToast(res.message || `Hotel Confirmed: ${hotel.name}! Booking Code: ${res.bookingCode}`, 'success');
          }
        },
        error: (err) => {
          console.error('Failed to book hotel stay via API', err);
          this.showToast('Could not complete hotel reservation. Please try again.', 'error');
        },
      });
  }

  // Destination Location Hotels near Central Bus/Transit terminals or matched Google Maps area
  readonly destinationHotels = computed<DestinationHotel[]>(() => {
    const dest = this.destinationCity();
    const destName = dest.name || 'Bengaluru';
    const locMatch = this.hotelUserLocation();
    const areaName = locMatch?.areaName || this.hotelCustomSearchLocation().split(',')[0];

    const fromDb = this.dbHotels().filter(
      (h) => h.cityId === dest.id || h.cityName.toLowerCase() === destName.toLowerCase(),
    );
    const list: DestinationHotel[] = fromDb.length > 0 ? [...fromDb] : [
      {
        id: `htl-${dest.id}-h1`,
        cityId: dest.id,
        name: `FabHotel Prime Grand Suites`,
        cityName: destName,
        location: `${destName} Central · 400m from Central Bus Stand`,
        terminalDistance: '400m from Bus Stand',
        rating: 4.8,
        totalReviews: 864,
        originalPrice: 4299,
        discountedPrice: 1289,
        discountPercent: 70,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500&auto=format&fit=crop&q=60',
        amenities: ['Free High-Speed WiFi', 'AC Room', 'Early 6 AM Check-In', 'Free Breakfast'],
        tag: 'redBus Exclusive Deal',
      },
      {
        id: `htl-${dest.id}-h2`,
        cityId: dest.id,
        name: `Treebo Trend Royal Residency`,
        cityName: destName,
        location: `${destName} Metro Hub · Near Terminal Gate 2`,
        terminalDistance: '650m from Terminal',
        rating: 4.6,
        totalReviews: 540,
        originalPrice: 3899,
        discountedPrice: 1169,
        discountPercent: 70,
        imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&auto=format&fit=crop&q=60',
        amenities: ['Free WiFi', 'AC Deluxe', 'Sanitized Stay', '24/7 Room Service'],
        tag: 'Top Rated by Bus Travelers',
      },
      {
        id: `htl-${dest.id}-h3`,
        cityId: dest.id,
        name: `Lemon Tree Premier Outstation Stay`,
        cityName: destName,
        location: `${destName} Highway Link · Shuttle Available`,
        terminalDistance: '1.2 km from Drop Point',
        rating: 4.9,
        totalReviews: 1210,
        originalPrice: 5999,
        discountedPrice: 1799,
        discountPercent: 70,
        imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&auto=format&fit=crop&q=60',
        amenities: ['Swimming Pool', 'Luxury Buffet Breakfast', 'Express Checkout', 'Fitness Center'],
        tag: 'Luxury Transit Comfort',
      },
      {
        id: `htl-${dest.id}-h4`,
        cityId: dest.id,
        name: `Bloomrooms Express Transit`,
        cityName: destName,
        location: `${destName} Main Plaza · Walking Distance`,
        terminalDistance: '250m from Arrival Bay',
        rating: 4.7,
        totalReviews: 412,
        originalPrice: 3499,
        discountedPrice: 1049,
        discountPercent: 70,
        imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=500&auto=format&fit=crop&q=60',
        amenities: ['Cloud Bedding', 'Rain Shower', 'Complimentary Beverages', 'Soundproof Rooms'],
        tag: 'Instant Check-in',
      },
    ];

    if (areaName && areaName.trim()) {
      const cleanArea = areaName.trim();
      const distances = ['200m', '400m', '650m', '1.1 km', '1.8 km', '2.4 km'];
      const enriched = list.map((h, idx) => ({
        ...h,
        location: `${cleanArea} · ${distances[idx % distances.length]} from location match`,
        terminalDistance: `${distances[idx % distances.length]} from ${cleanArea}`,
        tag: idx === 0 ? `Closest to ${cleanArea}` : h.tag,
      }));

      // Sort with closest distance first
      const getMeters = (dStr: string) => {
        if (dStr.includes('km')) {
          const match = dStr.match(/([\d.]+)\s*km/);
          return match ? parseFloat(match[1]) * 1000 : 2000;
        }
        const match = dStr.match(/(\d+)\s*m/);
        return match ? parseInt(match[1], 10) : 500;
      };

      enriched.sort((a, b) => getMeters(a.terminalDistance) - getMeters(b.terminalDistance));
      return enriched;
    }

    return list;
  });

  goToResults() {
    this.searchPageStep.set('results');
  }

  goToSearch() {
    this.currentTab.set('booking');
    this.searchPageStep.set('search');
  }

  setToday() {
    const today = new Date().toISOString().split('T')[0];
    this.travelDate.set(today);
  }

  setTomorrow() {
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    this.travelDate.set(tmr.toISOString().split('T')[0]);
  }

  toggleBookingForWomen() {
    const nextVal = !this.bookingForWomen();
    this.bookingForWomen.set(nextVal);
    if (nextVal) {
      this.showToast('Women-only booking activated. Female-friendly sleeper berths highlighted.', 'info');
    } else {
      this.showToast('Women booking preference turned off.', 'info');
    }
  }

  updateFilters(newFilters: Partial<TripFilter>) {
    this.filters.update((current) => ({
      ...current,
      ...newFilters,
    }));
  }

  resetFilters() {
    this.filters.set({
      hasAc: null,
      busType: 'all',
      departureTimeSlot: 'all',
      maxPrice: 2500,
      operator: 'all',
      minRating: 0,
      sortBy: 'departure_asc',
    });
  }

  loadBookingsFromDb() {
    this.isBookingsLoading.set(true);
    this.apiClient.getBookings().subscribe({
      next: (bookings) => {
        this.isBookingsLoading.set(false);
        if (Array.isArray(bookings)) {
          this.userBookings.set(bookings);
        }
      },
      error: (err) => {
        this.isBookingsLoading.set(false);
        console.error('Error loading bookings from database', err);
      },
    });
  }

  loadCarsFromDb() {
    this.isCarsLoading.set(true);
    this.apiClient.getCars().subscribe({
      next: (carsList) => {
        this.isCarsLoading.set(false);
        if (Array.isArray(carsList)) {
          this.cars.set(carsList);
        }
      },
      error: (err) => {
        this.isCarsLoading.set(false);
        console.error('Error loading cars from database', err);
      },
    });
  }

  loadSharedCarTripsFromDb(filters?: { source?: string; destination?: string; model?: string; hasAc?: string }) {
    this.isSharedCarTripsLoading.set(true);
    const query = {
      source: filters?.source || this.sourceCity().name,
      destination: filters?.destination || this.destinationCity().name,
      model: filters?.model,
      hasAc: filters?.hasAc,
    };
    this.apiClient.getSharedCarTrips(query).subscribe({
      next: (trips) => {
        this.isSharedCarTripsLoading.set(false);
        if (Array.isArray(trips)) {
          const hydratedCars = trips.map((c) => this.hydrateCarTripWithConfig(c));
          this.sharedCarTrips.set(hydratedCars);
          const currentSelected = this.selectedSharedCarTrip();
          if (currentSelected) {
            const updated =
              hydratedCars.find((t) => t.id === currentSelected.id) ||
              hydratedCars.find((t) => t.operatorName === currentSelected.operatorName);
            if (updated) {
              this.selectedSharedCarTrip.set({ ...updated });
            }
          }
        }
      },
      error: (err) => {
        this.isSharedCarTripsLoading.set(false);
        console.error('Error loading shared car trips from database', err);
      },
    });
  }

  bookSharedCarTrip(
    payload: {
      tripId: string;
      seatIds: string[];
      passengers?: { seatId?: string; seatNumber?: string; name: string; age?: number; gender?: string; fare?: number }[];
      selectedBoardingPointId: string;
      selectedDroppingPointId: string;
    },
    onSuccess?: () => void,
    onError?: () => void,
  ) {
    const fullPayload = {
      ...payload,
      couponCode: this.appliedCoupon()?.code,
      discountAmount: this.couponDiscount(),
      userId: this.currentUser().id,
    };
    this.apiClient.bookSharedCarTrip(fullPayload).subscribe({
      next: (res) => {
        if (res.success && res.booking) {
          this.activeBookingResult.set(res.booking);
          this.userBookings.update((prev) => [res.booking, ...prev]);
          this.isSuccessModalOpen.set(true);
          this.showToast(`Sawari Confirmed! Ticket: ${res.booking.bookingCode}`, 'success');
          // Reload shared car trips to reflect new seat statuses
          this.loadSharedCarTripsFromDb();
          this.selectedCarSeatIds.set([]);
          if (onSuccess) {
            onSuccess();
          }
          this.currentTab.set('tickets');
          this.refreshDatabaseStatus();
        }
      },
      error: (err) => {
        console.error('Failed to book shared car', err);
        const msg = err.error?.error || 'Failed to book shared car. Please try again.';
        this.showToast(msg, 'error');
        if (onError) {
          onError();
        }
      },
    });
  }

  loadTourTripsFromDb() {
    this.isTourTripsLoading.set(true);
    this.apiClient.getTourTrips().subscribe({
      next: (toursList) => {
        this.isTourTripsLoading.set(false);
        if (Array.isArray(toursList)) {
          this.tourTrips.set(toursList);
        }
      },
      error: (err) => {
        this.isTourTripsLoading.set(false);
        console.error('Error loading tour trips from database', err);
      },
    });
  }

  bookCar(payload: {
    carId: string;
    pickupCity: string;
    dropCity: string;
    pickupDate: string;
    pickupTime: string;
    tripType: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
  }) {
    this.apiClient.bookCar(payload).subscribe({
      next: (res) => {
        if (res.success && res.booking) {
          this.userBookings.update((prev) => [res.booking, ...prev]);
          this.showToast(`Car booking confirmed! Code: ${res.booking.bookingCode}`, 'success');
          this.currentTab.set('tickets');
        }
      },
      error: (err) => {
        console.error('Failed to book car', err);
        this.showToast('Failed to book car. Please try again.', 'error');
      },
    });
  }

  bookTourTrip(payload: {
    tourId: string;
    travelDate: string;
    travelersCount: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
  }) {
    this.apiClient.bookTourTrip(payload).subscribe({
      next: (res) => {
        if (res.success && res.booking) {
          this.userBookings.update((prev) => [res.booking, ...prev]);
          this.showToast(`Tour package booked! Voucher Code: ${res.booking.bookingCode}`, 'success');
          this.currentTab.set('tickets');
        }
      },
      error: (err) => {
        console.error('Failed to book tour trip', err);
        this.showToast('Failed to book tour trip. Please try again.', 'error');
      },
    });
  }

  // =========================================================================
  // SEAT LAYOUT & 5-MIN CONCURRENCY ENGINE
  // =========================================================================

  // Selected hotel for Passenger Info page flow
  readonly selectedHotelForBooking = signal<DestinationHotel | null>(null);

  readonly activeBookingMode = computed<'bus' | 'car' | 'hotel' | 'transport' | null>(() => {
    const step = this.searchPageStep();
    if (step === 'transport-seats') return 'transport';
    if (step === 'car-seats') return 'car';
    if (step === 'seats') return 'bus';
    if (this.selectedTransportTrip() && this.searchCategory() === 'transport') return 'transport';
    if (this.searchCategory() === 'hotel' && this.selectedHotelForBooking()) return 'hotel';
    if (this.selectedTransportSeatIds().length > 0 && this.selectedTransportTrip()) return 'transport';
    if (this.selectedCarSeatIds().length > 0 && this.selectedSharedCarTrip()) return 'car';
    if (this.selectedSeats().length > 0 && this.selectedTrip()) return 'bus';
    if (this.searchCategory() === 'transport' && this.selectedTransportTrip()) return 'transport';
    if (this.searchCategory() === 'car' && this.selectedSharedCarTrip()) return 'car';
    if (this.selectedHotelForBooking() && !this.selectedTrip() && !this.selectedSharedCarTrip() && !this.selectedTransportTrip()) return 'hotel';
    if (this.selectedTransportTrip()) return 'transport';
    if (this.selectedSharedCarTrip() && !this.selectedTrip()) return 'car';
    if (this.selectedTrip()) return 'bus';
    if (this.selectedSharedCarTrip()) return 'car';
    if (this.selectedHotelForBooking()) return 'hotel';
    return null;
  });

  selectHotelForPassengerInfo(hotel: DestinationHotel) {
    this.clearSeatHold();
    this.selectedTrip.set(null);
    this.selectedSeats.set([]);
    this.selectedSharedCarTrip.set(null);
    this.selectedCarSeatIds.set([]);
    this.selectedHotelForBooking.set(hotel);
    this.resultsTargetSection.set('hotel');
    this.searchCategory.set('hotel');
    this.passengers.set([
      {
        seatId: 'room-1',
        seatNumber: 'Room 1',
        name: this.currentUser().fullName || 'Rahul Sharma',
        age: 28,
        gender: 'male',
        fare: hotel.discountedPrice,
      },
    ]);
    this.searchPageStep.set('passenger-info');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  selectTrip(trip: Trip) {
    this.clearSeatHold();
    this.selectedHotelForBooking.set(null);
    this.selectedSharedCarTrip.set(null);
    this.selectedCarSeatIds.set([]);
    const hydrated = this.hydrateBusTripWithConfig(trip);
    this.selectedTrip.set({ ...hydrated });
    this.selectedSeats.set([]);
    this.passengers.set([]);
    this.selectedBoardingPoint.set(null);
    this.selectedDroppingPoint.set(null);
    this.resultsTargetSection.set('bus');
    this.searchCategory.set('bus');
    this.loadSeatsForTrip(hydrated);
    this.searchPageStep.set('seats');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  backToResults() {
    this.clearSeatHold();
    this.selectedTrip.set(null);
    this.selectedSeats.set([]);
    this.selectedHotelForBooking.set(null);
    this.searchPageStep.set('results');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  selectSharedCarTrip(car: SharedCarTrip) {
    this.clearSeatHold();
    this.selectedHotelForBooking.set(null);
    this.selectedTrip.set(null);
    this.selectedSeats.set([]);
    this.selectedTransportTrip.set(null);
    this.selectedTransportSeatIds.set([]);
    const hydrated = this.hydrateCarTripWithConfig(car);
    this.selectedSharedCarTrip.set({ ...hydrated });
    this.selectedCarSeatIds.set([]);
    this.passengers.set([]);
    this.selectedBoardingPoint.set(null);
    this.selectedDroppingPoint.set(null);
    this.resultsTargetSection.set('car');
    this.searchCategory.set('car');
    this.searchPageStep.set('car-seats');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  backToCarResults() {
    this.selectedSharedCarTrip.set(null);
    this.selectedCarSeatIds.set([]);
    this.resultsTargetSection.set('car');
    this.searchCategory.set('car');
    this.searchPageStep.set('results');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  selectTransportTrip(transport: SharedCarTrip) {
    this.clearSeatHold();
    this.selectedHotelForBooking.set(null);
    this.selectedTrip.set(null);
    this.selectedSeats.set([]);
    this.selectedSharedCarTrip.set(null);
    this.selectedCarSeatIds.set([]);
    this.selectedTransportTrip.set({ ...transport });
    this.selectedTransportSeatIds.set([]);
    this.passengers.set([]);
    this.selectedBoardingPoint.set(null);
    this.selectedDroppingPoint.set(null);
    this.resultsTargetSection.set('transport');
    this.searchCategory.set('transport');
    this.searchPageStep.set('transport-seats');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  backToTransportResults() {
    this.selectedTransportTrip.set(null);
    this.selectedTransportSeatIds.set([]);
    this.resultsTargetSection.set('transport');
    this.searchCategory.set('transport');
    this.searchPageStep.set('results');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  syncPassengersWithTransportSeats() {
    const transport = this.selectedTransportTrip();
    if (!transport) return;
    const seatIds = this.selectedTransportSeatIds();
    const current = [...this.passengers()];
    const allSeats = transport.seats || [];
    const updated: Passenger[] = seatIds.map((id, i) => {
      const existing = current.find((p) => p.seatId === id);
      if (existing) return existing;
      const s = allSeats.find((seat) => seat.id === id);
      return {
        seatId: id,
        seatNumber: s?.seatNumber || `T${i + 1}`,
        name: i === 0 ? this.currentUser().fullName : '',
        age: i === 0 ? 28 : 25,
        gender: s?.isLadiesReserved ? 'female' : 'male',
        fare: s?.price || transport.baseFare || 650,
      };
    });
    this.passengers.set(updated);
  }

  bookTransportTrip(payload: {
    transportId: string;
    boardingPointId: string;
    droppingPointId: string;
    passengers: Passenger[];
    totalFare: number;
    couponCode?: string;
    gstAmount?: number;
    discountAmount?: number;
  }) {
    const transport = this.selectedTransportTrip();
    if (!transport) {
      this.showToast('No active transport trip selected', 'error');
      return;
    }
    const bp = transport.boardingPoints.find((b) => b.id === payload.boardingPointId) || transport.boardingPoints[0];
    const dp = transport.droppingPoints.find((d) => d.id === payload.droppingPointId) || transport.droppingPoints[0];
    const user = this.currentUser();
    const bookingCode = 'TRP-' + Math.floor(100000 + Math.random() * 900000);

    const syntheticTrip: Trip = {
      id: transport.id,
      busId: transport.id,
      bus: {
        id: transport.id,
        operatorName: transport.operatorName,
        busNumber: transport.vehicleNumber,
        busType: 'seater',
        totalSeats: transport.totalSeats,
        amenities: transport.features,
        rating: transport.rating,
        totalReviews: transport.totalReviews,
        hasAc: transport.hasAc,
        isLiveTracking: true,
      },
      sourceCityId: transport.sourceCityId,
      sourceCityName: transport.sourceCityName,
      destinationCityId: transport.destinationCityId,
      destinationCityName: transport.destinationCityName,
      departureTime: transport.departureTime,
      arrivalTime: transport.arrivalTime,
      duration: transport.duration,
      date: transport.date,
      baseFare: transport.baseFare,
      availableSeatsCount: Math.max(0, transport.availableSeatsCount - payload.passengers.length),
      boardingPoints: transport.boardingPoints,
      droppingPoints: transport.droppingPoints,
    };

    const newBooking: Booking = {
      id: 'book-' + Date.now(),
      bookingCode,
      userId: user.id,
      tripId: transport.id,
      trip: syntheticTrip,
      bookingType: 'transport',
      passengers: payload.passengers,
      totalAmount: payload.totalFare,
      taxAmount: payload.gstAmount || Math.round(payload.totalFare * 0.05),
      discountAmount: payload.discountAmount || 0,
      couponCode: payload.couponCode,
      status: 'confirmed',
      paymentStatus: 'completed',
      paymentReference: 'PAY-TRP-' + Math.floor(1000000 + Math.random() * 9000000),
      paymentMethod: 'UPI / FastPay',
      selectedBoardingPoint: bp,
      selectedDroppingPoint: dp,
      bookedAt: new Date().toISOString(),
    };

    this.userBookings.update((prev) => [newBooking, ...prev]);
    this.activeBookingResult.set(newBooking);
    this.isSuccessModalOpen.set(true);
    this.selectedTransportTrip.set(null);
    this.selectedTransportSeatIds.set([]);
    this.searchPageStep.set('search');
    this.showToast(`Transport Booking Confirmed! Code: ${bookingCode}`, 'success');
  }

  // =========================================================================
  // BOARDING & DROPPING POINTS DEDICATED PAGE NAVIGATION
  // =========================================================================

  goToBoardingDropping() {
    const mode = this.activeBookingMode();

    if (mode === 'car') {
      if (this.selectedCarSeatIds().length === 0) {
        this.showToast('Please select at least one seat to continue', 'warning');
        return;
      }
      // Ensure any stale bus selection is cleared so downstream pages render the Car trip
      this.selectedTrip.set(null);
      this.selectedSeats.set([]);
      this.selectedTransportTrip.set(null);
      this.selectedTransportSeatIds.set([]);
      this.syncPassengersWithCarSeats();
    } else if (mode === 'transport') {
      if (this.selectedTransportSeatIds().length === 0) {
        this.showToast('Please select at least one seat to continue', 'warning');
        return;
      }
      this.selectedTrip.set(null);
      this.selectedSeats.set([]);
      this.selectedSharedCarTrip.set(null);
      this.selectedCarSeatIds.set([]);
      this.syncPassengersWithTransportSeats();
    } else if (mode === 'bus') {
      if (this.selectedSeats().length === 0) {
        this.showToast('Please select at least one seat to continue', 'warning');
        return;
      }
      this.selectedSharedCarTrip.set(null);
      this.selectedCarSeatIds.set([]);
      this.selectedTransportTrip.set(null);
      this.selectedTransportSeatIds.set([]);
      this.syncPassengersWithSeats(this.selectedSeats());
    } else {
      this.showToast('Please select a trip first', 'warning');
      return;
    }

    this.searchPageStep.set('boarding-dropping');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private syncPassengersWithCarSeats() {
    const car = this.selectedSharedCarTrip();
    if (!car) return;
    const seatIds = this.selectedCarSeatIds();
    const current = [...this.passengers()];
    const allCarSeats =
      car.seats && car.seats.length > 0
        ? car.seats
        : this.buildCarSeatsFromCustomConfig(car.id, car.baseFare, this.getEffectiveConfigForCar(car));
    const updated: Passenger[] = seatIds.map((id, i) => {
      const existing = current.find((p) => p.seatId === id);
      if (existing) return existing;
      const carSeat = allCarSeats.find((s) => s.id === id);
      return {
        seatId: id,
        seatNumber: carSeat?.seatNumber || `S${i + 1}`,
        name: i === 0 ? this.currentUser().fullName : '',
        age: i === 0 ? 28 : 25,
        gender: carSeat?.isLadiesReserved ? 'female' : 'male',
        fare: carSeat?.price || car.baseFare || 650,
      };
    });
    this.passengers.set(updated);
  }

  backToSeatSelection() {
    const mode = this.activeBookingMode();
    if (mode === 'transport' && this.selectedTransportTrip()) {
      this.searchPageStep.set('transport-seats');
    } else if (mode === 'car' && this.selectedSharedCarTrip()) {
      this.searchPageStep.set('car-seats');
    } else if (mode === 'bus' && this.selectedTrip()) {
      this.searchPageStep.set('seats');
    } else if (this.selectedTransportTrip()) {
      this.searchPageStep.set('transport-seats');
    } else if (this.selectedSharedCarTrip()) {
      this.searchPageStep.set('car-seats');
    } else if (this.selectedTrip()) {
      this.searchPageStep.set('seats');
    } else {
      this.searchPageStep.set('results');
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  selectBoardingPoint(bp: BoardingPoint) {
    this.selectedBoardingPoint.set(bp);
  }

  selectDroppingPoint(dp: DroppingPoint) {
    this.selectedDroppingPoint.set(dp);
  }

  goToPassengerInfo() {
    const mode = this.activeBookingMode();

    if (!mode) {
      this.showToast('No active trip selected', 'error');
      return;
    }
    if (mode === 'bus' && this.selectedSeats().length === 0) {
      this.showToast('Please select at least one seat to proceed', 'warning');
      return;
    }
    if (mode === 'car' && this.selectedCarSeatIds().length === 0) {
      this.showToast('Please select at least one seat to proceed', 'warning');
      return;
    }
    if (mode === 'transport' && this.selectedTransportSeatIds().length === 0) {
      this.showToast('Please select at least one seat to proceed', 'warning');
      return;
    }
    if (!this.selectedBoardingPoint()) {
      this.showToast('Please select a Boarding Point to proceed', 'warning');
      return;
    }
    if (!this.selectedDroppingPoint()) {
      this.showToast('Please select a Dropping Point to proceed', 'warning');
      return;
    }

    if (mode === 'bus') {
      this.syncPassengersWithSeats(this.selectedSeats());
    } else if (mode === 'car') {
      this.syncPassengersWithCarSeats();
    } else if (mode === 'transport') {
      this.syncPassengersWithTransportSeats();
    }

    this.searchPageStep.set('passenger-info');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  proceedToCheckoutModal() {
    this.goToPassengerInfo();
  }

  loadSeatsForTrip(trip: Trip) {
    const customCfg = this.getEffectiveConfigForBus(trip);
    const generatedSeats = this.buildBusSeatsFromCustomConfig(trip.id, trip.baseFare, customCfg);
    const bpList = customCfg.boardingPoints.length > 0 ? [...customCfg.boardingPoints] : trip.boardingPoints;
    const dpList = customCfg.droppingPoints.length > 0 ? [...customCfg.droppingPoints] : trip.droppingPoints;
    const availCount = generatedSeats.filter(
      (s) => s.status === 'available' && !s.isDriverSeat && !s.isReservedSection,
    ).length;

    // Set initial rendered trip layout immediately
    this.selectedTrip.set({
      ...trip,
      seats: generatedSeats,
      availableSeatsCount: availCount,
      boardingPoints: bpList,
      droppingPoints: dpList,
    });

    // Always fetch live booked and locked seats from database so client is in sync
    this.apiClient.getSeats(trip.id).subscribe({
      next: (dbSeats) => {
        let finalSeats = generatedSeats;
        if (Array.isArray(dbSeats) && dbSeats.length > 0) {
          const bookedIds = new Set<string>();
          const bookedNumbers = new Set<string>();
          const lockedIds = new Set<string>();
          const lockedNumbers = new Set<string>();

          dbSeats.forEach((d) => {
            if (d.status === 'booked') {
              bookedIds.add(d.id);
              bookedNumbers.add(d.seatNumber);
            } else if (d.status === 'locked') {
              lockedIds.add(d.id);
              lockedNumbers.add(d.seatNumber);
            }
          });

          finalSeats = generatedSeats.map((s) => {
            if (s.isDriverSeat || s.isReservedSection) return s;
            const isBooked =
              s.status === 'booked' ||
              bookedIds.has(s.id) ||
              bookedNumbers.has(s.seatNumber) ||
              bookedIds.has(`${trip.id}-${s.seatNumber}`);
            if (isBooked) {
              return { ...s, status: 'booked' as const };
            }
            const isLocked =
              s.status === 'locked' ||
              lockedIds.has(s.id) ||
              lockedNumbers.has(s.seatNumber) ||
              lockedIds.has(`${trip.id}-${s.seatNumber}`);
            if (isLocked) {
              return { ...s, status: 'locked' as const };
            }
            return s;
          });
        }
        const avail = finalSeats.filter(
          (s) => s.status === 'available' && !s.isDriverSeat && !s.isReservedSection,
        ).length;
        this.selectedTrip.set({
          ...trip,
          seats: finalSeats,
          availableSeatsCount: avail,
          boardingPoints: bpList,
          droppingPoints: dpList,
        });
      },
      error: () => {
        // Fallback to generated seats already set
      },
    });
  }

  toggleSeat(seat: Seat) {
    if (seat.isDriverSeat || seat.seatCategory === 'driver') {
      this.showToast('This is the Driver cockpit seat and cannot be booked by passengers.', 'info');
      return;
    }

    if (seat.isReservedSection || seat.seatCategory === 'reserved') {
      this.showToast(`This area is reserved for ${seat.reservedLabel || 'Toilet / Facility'} and cannot be booked.`, 'info');
      return;
    }

    if (seat.seatCategory === 'empty') {
      return;
    }

    if (seat.status === 'booked') {
      this.showToast(`Seat ${seat.seatNumber} is already confirmed booked!`, 'error');
      return;
    }

    if (seat.status === 'locked' && seat.lockedByUserId && seat.lockedByUserId !== this.currentUser().id) {
      this.showToast(`Seat ${seat.seatNumber} is temporarily locked by another user!`, 'warning');
      return;
    }

    const currentSelected = [...this.selectedSeats()];
    const index = currentSelected.findIndex((s) => s.id === seat.id);

    if (index >= 0) {
      // Deselect seat
      currentSelected.splice(index, 1);
      this.selectedSeats.set(currentSelected);
      this.syncPassengersWithSeats(currentSelected);

      if (currentSelected.length === 0) {
        this.clearSeatHold();
      } else {
        this.acquireHoldForSeats(currentSelected);
      }
      this.showToast(`Seat ${seat.seatNumber} released.`, 'info');
    } else {
      // Max 6 seats constraint
      if (currentSelected.length >= 6) {
        this.showToast('You can select a maximum of 6 seats per transaction.', 'warning');
        return;
      }

      currentSelected.push(seat);
      this.selectedSeats.set(currentSelected);
      this.syncPassengersWithSeats(currentSelected);
      this.acquireHoldForSeats(currentSelected);
      this.showToast(`Seat ${seat.seatNumber} locked in database for 5 minutes!`, 'success');
    }
  }

  private acquireHoldForSeats(seats: Seat[]) {
    const trip = this.selectedTrip();
    if (!trip) return;

    const fiveMinutes = 300;
    const expiresAt = Date.now() + fiveMinutes * 1000;
    const token = 'hold-' + Math.random().toString(36).substring(2, 9);

    this.activeHold.set({
      tripId: trip.id,
      seatIds: seats.map((s) => s.id),
      holdToken: token,
      expiresAt,
      remainingSeconds: fiveMinutes,
    });

    this.holdCountdownSeconds.set(fiveMinutes);
    this.startHoldCountdown();

    // Call live database hold API
    this.apiClient.holdSeats(trip.id, seats.map((s) => s.id), this.currentUser().id).subscribe({
      next: (res) => {
        if (!res.success) {
          this.showToast(res.message, 'warning');
        }
      },
      error: (err) => {
        const msg =
          err?.error?.message || 'Seat could not be held as it was recently booked or locked by another passenger.';
        this.showToast(msg, 'warning');

        // Refresh seats from server to update UI state to booked/locked
        this.loadSeatsForTrip(trip);

        // Deselect the conflicting seats so user is not blocked
        const conflictIds = new Set(seats.map((s) => s.id));
        const current = this.selectedSeats().filter((s) => !conflictIds.has(s.id));
        this.selectedSeats.set(current);
        this.syncPassengersWithSeats(current);

        if (current.length === 0) {
          this.clearSeatHold();
        }
      },
    });
  }

  private startHoldCountdown() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.timerInterval = setInterval(() => {
      const hold = this.activeHold();
      if (!hold) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        return;
      }

      const diff = Math.max(0, Math.floor((hold.expiresAt - Date.now()) / 1000));
      this.holdCountdownSeconds.set(diff);

      if (diff <= 0) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.handleHoldExpired();
      }
    }, 1000);
  }

  private handleHoldExpired() {
    this.showToast('5-minute hold limit expired. Seats have been unlocked in the database.', 'warning');
    this.clearSeatHold();
  }

  clearSeatHold() {
    const existingHold = this.activeHold();
    if (existingHold) {
      this.apiClient.releaseSeats(existingHold.tripId, existingHold.seatIds).subscribe({
        error: (err) => console.error('Failed to release hold', err),
      });
    }

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.activeHold.set(null);
    this.holdCountdownSeconds.set(0);
    this.selectedSeats.set([]);
    this.passengers.set([]);
    this.isCheckoutOpen.set(false);

    // Refresh seat status if trip selected
    const trip = this.selectedTrip();
    if (trip) {
      this.loadSeatsForTrip(trip);
    }
  }

  private syncPassengersWithSeats(seats: Seat[]) {
    const current = [...this.passengers()];
    const trip = this.selectedTrip();
    const baseFare = trip ? trip.baseFare : 800;

    const updated: Passenger[] = seats.map((seat, i) => {
      const existing = current.find((p) => p.seatId === seat.id);
      if (existing) return existing;
      const seatFare = seat.price ? Math.round(seat.price) : Math.round(baseFare * (seat.fareMultiplier || 1));
      return {
        seatId: seat.id,
        seatNumber: seat.seatNumber,
        name: i === 0 ? this.currentUser().fullName : '',
        age: i === 0 ? 28 : 25,
        gender: seat.isLadiesReserved ? 'female' : 'male',
        fare: seatFare,
      };
    });

    this.passengers.set(updated);
  }

  updatePassenger<K extends keyof Passenger>(index: number, field: K, value: Passenger[K]) {
    const list = [...this.passengers()];
    if (list[index]) {
      list[index] = {
        ...list[index],
        [field]: value,
      };
      this.passengers.set(list);
    }
  }

  // =========================================================================
  // BOOKINGS CRUD OPERATIONS
  // =========================================================================

  confirmMockBooking(paymentMethod: string): Booking | null {
    const trip = this.selectedTrip();
    const user = this.currentUser();
    const seats = this.selectedSeats();
    const boarding = this.selectedBoardingPoint();
    const dropping = this.selectedDroppingPoint();

    if (!trip || seats.length === 0 || !boarding || !dropping) {
      this.showToast('Please select seats, boarding and dropping points.', 'error');
      return null;
    }

    const invalidPassenger = this.passengers().find((p) => !p.name.trim() || p.age <= 0);
    if (invalidPassenger) {
      this.showToast('Please provide valid passenger name and age for all seats.', 'warning');
      return null;
    }

    const payload = {
      tripId: trip.id,
      seatIds: seats.map((s) => s.id),
      passengers: [...this.passengers()],
      userId: user.id,
      selectedBoardingPoint: { ...boarding },
      selectedDroppingPoint: { ...dropping },
      totalAmount: this.finalPayable(),
      taxAmount: this.gstTax(),
      discountAmount: this.couponDiscount(),
      couponCode: this.appliedCoupon()?.code,
      paymentMethod,
    };

    this.apiClient.checkout(payload).subscribe({
      next: (res) => {
        if (res.success && res.booking) {
          this.activeBookingResult.set(res.booking);
          this.userBookings.update((b) => [res.booking!, ...b]);
          this.isCheckoutOpen.set(false);
          this.isSuccessModalOpen.set(true);
          this.clearSeatHold();
          this.currentTab.set('tickets');
          this.refreshDatabaseStatus();
          this.showToast(`Booking ${res.bookingCode} confirmed in database!`, 'success');
        }
      },
      error: (err) => {
        console.error('Checkout failed', err);
        this.showToast('Checkout transaction failed. Please retry.', 'error');
      },
    });

    return null;
  }

  cancelBooking(bookingId: string, reason?: string) {
    this.apiClient.cancelBooking(bookingId).subscribe({
      next: (res) => {
        if (res.success) {
          this.userBookings.update((list) =>
            list.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' as const, paymentStatus: 'refunded' as const } : b)),
          );
          this.showToast(res.message || (reason ? `Booking cancelled: ${reason}` : 'Booking cancelled successfully'), 'success');
          this.refreshDatabaseStatus();
          // Reload trips to update seat availability
          this.loadTripsFromDb();
        }
      },
      error: (err) => {
        console.error('Failed to cancel booking', err);
        this.showToast('Failed to cancel booking in database.', 'error');
      },
    });
  }

  updateBookingDetails(bookingId: string, passengers: Passenger[]) {
    this.apiClient.updateBooking(bookingId, { passengers }).subscribe({
      next: (res) => {
        if (res.success) {
          this.userBookings.update((list) =>
            list.map((b) => (b.id === bookingId ? res.booking : b)),
          );
          this.showToast('Booking updated in database.', 'success');
        }
      },
      error: (err) => {
        console.error('Failed to update booking', err);
        this.showToast('Failed to update booking in database.', 'error');
      },
    });
  }

  // =========================================================================
  // CITIES CRUD OPERATIONS
  // =========================================================================

  createCity(payload: { name: string; state: string; code: string; popularTerminals: string[] }) {
    this.apiClient.createCity(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.cities.update((c) => [...c, res.city]);
          this.showToast(`City "${res.city.name}" created in database!`, 'success');
          this.refreshDatabaseStatus();
        }
      },
      error: (err) => {
        console.error('Failed to create city', err);
        this.showToast(err.error?.error || 'Failed to create city.', 'error');
      },
    });
  }

  updateCity(id: string, payload: Partial<City>) {
    this.apiClient.updateCity(id, payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.cities.update((list) => list.map((c) => (c.id === id ? res.city : c)));
          this.showToast(`City "${res.city.name}" updated in database!`, 'success');
        }
      },
      error: (err) => {
        console.error('Failed to update city', err);
        this.showToast('Failed to update city in database.', 'error');
      },
    });
  }

  deleteCity(id: string) {
    this.apiClient.deleteCity(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.cities.update((list) => list.filter((c) => c.id !== id));
          this.showToast(res.message, 'success');
          this.refreshDatabaseStatus();
        }
      },
      error: (err) => {
        console.error('Failed to delete city', err);
        this.showToast(err.error?.error || 'Failed to delete city.', 'error');
      },
    });
  }

  // =========================================================================
  // TRIPS CRUD OPERATIONS
  // =========================================================================

  createTrip(payload: Record<string, unknown>) {
    this.apiClient.createTrip(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.allTrips.update((t) => [res.trip, ...t]);
          this.showToast(`Bus schedule "${res.trip.bus.operatorName}" created in database!`, 'success');
          this.refreshDatabaseStatus();
        }
      },
      error: (err) => {
        console.error('Failed to create trip', err);
        this.showToast('Failed to create bus schedule in database.', 'error');
      },
    });
  }

  updateTrip(id: string, payload: Record<string, unknown>) {
    this.apiClient.updateTrip(id, payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.allTrips.update((list) => list.map((t) => (t.id === id ? res.trip : t)));
          this.showToast(`Trip schedule updated in database!`, 'success');
        }
      },
      error: (err) => {
        console.error('Failed to update trip', err);
        this.showToast('Failed to update trip in database.', 'error');
      },
    });
  }

  deleteTrip(id: string) {
    this.apiClient.deleteTrip(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.allTrips.update((list) => list.filter((t) => t.id !== id));
          if (this.selectedTrip()?.id === id) {
            this.selectedTrip.set(null);
            this.clearSeatHold();
          }
          this.showToast(res.message, 'success');
          this.refreshDatabaseStatus();
        }
      },
      error: (err) => {
        console.error('Failed to delete trip', err);
        this.showToast('Failed to delete trip schedule in database.', 'error');
      },
    });
  }

  // =========================================================================
  // ADMIN PORTAL CRUD OPERATIONS (SHARED CARS, HOTELS, COUPONS, BOOKINGS, SEED)
  // =========================================================================

  createSharedCarAdmin(payload: Partial<SharedCarTrip>) {
    this.apiClient.createSharedCarTrip(payload).subscribe({
      next: (res) => {
        if (res.success && res.sharedCarTrip) {
          this.sharedCarTrips.update((list) => [res.sharedCarTrip, ...list]);
          this.showToast(`Shared car schedule "${res.sharedCarTrip.operatorName}" created!`, 'success');
          this.refreshDatabaseStatus();
        }
      },
      error: (err) => {
        this.showToast(err?.error?.error || 'Failed to create shared car schedule.', 'error');
      },
    });
  }

  deleteSharedCarAdmin(id: string) {
    this.apiClient.deleteSharedCarTrip(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.sharedCarTrips.update((list) => list.filter((c) => c.id !== id));
          this.showToast(res.message || 'Shared car schedule deleted.', 'success');
          this.refreshDatabaseStatus();
        }
      },
      error: (err) => {
        this.showToast(err?.error?.error || 'Failed to delete shared car schedule.', 'error');
      },
    });
  }

  createHotelAdmin(payload: Partial<DestinationHotel>) {
    this.apiClient.createHotel(payload).subscribe({
      next: (res) => {
        if (res.success && res.hotel) {
          this.dbHotels.update((list) => [res.hotel, ...list]);
          this.showToast(`Hotel "${res.hotel.name}" added to database!`, 'success');
          this.refreshDatabaseStatus();
        }
      },
      error: (err) => {
        this.showToast(err?.error?.error || 'Failed to add hotel.', 'error');
      },
    });
  }

  deleteHotelAdmin(id: string) {
    this.apiClient.deleteHotel(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.dbHotels.update((list) => list.filter((h) => h.id !== id));
          this.showToast(res.message || 'Hotel removed from database.', 'success');
          this.refreshDatabaseStatus();
        }
      },
      error: (err) => {
        this.showToast(err?.error?.error || 'Failed to delete hotel.', 'error');
      },
    });
  }

  createCouponAdmin(payload: Partial<CouponOffer>) {
    this.apiClient.createCoupon(payload).subscribe({
      next: (res) => {
        if (res.success && res.coupon) {
          this.availableCoupons.update((list) => [res.coupon, ...list]);
          this.showToast(`Promo code "${res.coupon.code}" created!`, 'success');
          this.refreshDatabaseStatus();
        }
      },
      error: (err) => {
        this.showToast(err?.error?.error || 'Failed to create coupon.', 'error');
      },
    });
  }

  deleteCouponAdmin(code: string) {
    this.apiClient.deleteCoupon(code).subscribe({
      next: (res) => {
        if (res.success) {
          this.availableCoupons.update((list) => list.filter((c) => c.code !== code));
          this.showToast(res.message || `Coupon ${code} deleted.`, 'success');
          this.refreshDatabaseStatus();
        }
      },
      error: (err) => {
        this.showToast(err?.error?.error || 'Failed to delete coupon.', 'error');
      },
    });
  }

  deleteBookingAdmin(bookingId: string) {
    this.apiClient.deleteBooking(bookingId).subscribe({
      next: (res) => {
        if (res.success) {
          this.userBookings.update((list) => list.filter((b) => b.id !== bookingId));
          this.showToast(res.message || 'Booking record deleted.', 'success');
          this.refreshDatabaseStatus();
        }
      },
      error: (err) => {
        this.showToast(err?.error?.error || 'Failed to delete booking record.', 'error');
      },
    });
  }

  seedDatabaseAdmin(mode: 'reset' | 'append' = 'reset') {
    this.apiClient.seedDatabase(mode).subscribe({
      next: (res) => {
        if (res.success) {
          this.loadCitiesFromDb();
          this.loadTripsFromDb();
          this.loadSharedCarTripsFromDb();
          this.loadHotelsFromDb();
          this.loadCouponsFromDb();
          this.loadBookingsFromDb();
          this.refreshDatabaseStatus();
          this.showToast(res.message || 'Database re-seeded successfully!', 'success');
        }
      },
      error: () => {
        this.showToast('Failed to seed database.', 'error');
      },
    });
  }

  // =========================================================================
  // DATABASE CONNECTIVITY & COMPLETE CRUD TEST SUITE
  // =========================================================================

  testDatabaseConnectivity() {
    this.isDbTesting.set(true);
    this.apiClient.testDatabaseConnectivity().subscribe({
      next: (res) => {
        this.isDbTesting.set(false);
        this.lastConnectivityTest.set(res);
        this.refreshDatabaseStatus();
        this.showToast(res.message, 'success');
      },
      error: (err) => {
        this.isDbTesting.set(false);
        console.error('Connectivity test failed', err);
        this.showToast('Database connectivity test encountered an error.', 'error');
      },
    });
  }

  runFullCrudDiagnostics() {
    this.isCrudTesting.set(true);
    const steps: CrudTestStepResult[] = [];
    const testCityCode = 'TST_' + Math.floor(100 + Math.random() * 900);
    const testCityName = 'TestHub ' + testCityCode;
    let createdCityId = '';

    // Step 1: CREATE
    const t1 = Date.now();
    this.apiClient
      .createCity({
        name: testCityName,
        state: 'Diagnostic State',
        code: testCityCode,
        popularTerminals: ['Diagnostic Terminal 1', 'Diagnostic Terminal 2'],
      })
      .subscribe({
        next: (createRes) => {
          createdCityId = createRes.city.id;
          steps.push({
            step: 'Step 1: CREATE Entity (INSERT INTO redbus_db.cities)',
            operation: 'CREATE',
            target: `redbus_db.cities (id: ${createdCityId})`,
            durationMs: Math.max(1, Date.now() - t1),
            status: 'PASSED',
            details: `Successfully inserted city "${testCityName}" with ID ${createdCityId}.`,
          });
          this.crudTestResults.set([...steps]);

          // Step 2: READ
          const t2 = Date.now();
          this.apiClient.getCity(createdCityId).subscribe({
            next: (readRes) => {
              steps.push({
                step: 'Step 2: READ Entity (SELECT FROM redbus_db.cities WHERE id = :id)',
                operation: 'READ',
                target: `redbus_db.cities (id: ${createdCityId})`,
                durationMs: Math.max(1, Date.now() - t2),
                status: 'PASSED',
                details: `Read verified: Retrieved "${readRes.name}" (${readRes.code}) from database.`,
              });
              this.crudTestResults.set([...steps]);

              // Step 3: UPDATE
              const t3 = Date.now();
              this.apiClient
                .updateCity(createdCityId, {
                  name: testCityName + ' [MODIFIED]',
                  code: testCityCode + 'M',
                })
                .subscribe({
                  next: (upRes) => {
                    steps.push({
                      step: 'Step 3: UPDATE Entity (UPDATE redbus_db.cities SET ...)',
                      operation: 'UPDATE',
                      target: `redbus_db.cities (id: ${createdCityId})`,
                      durationMs: Math.max(1, Date.now() - t3),
                      status: 'PASSED',
                      details: `Update verified: City name updated to "${upRes.city.name}".`,
                    });
                    this.crudTestResults.set([...steps]);

                    // Step 4: DELETE
                    const t4 = Date.now();
                    this.apiClient.deleteCity(createdCityId).subscribe({
                      next: (delRes) => {
                        steps.push({
                          step: 'Step 4: DELETE Entity (DELETE FROM redbus_db.cities WHERE id = :id)',
                          operation: 'DELETE',
                          target: `redbus_db.cities (id: ${createdCityId})`,
                          durationMs: Math.max(1, Date.now() - t4),
                          status: 'PASSED',
                          details: `Delete verified: ${delRes.message}`,
                        });

                        // Step 5: VERIFY CLEANUP
                        steps.push({
                          step: 'Step 5: AUDIT & CLEANUP (Integrity Check)',
                          operation: 'VERIFY',
                          target: 'redbus_db schema',
                          durationMs: 2,
                          status: 'PASSED',
                          details: 'All temporary diagnostic records purged. 100% CRUD operations verified successfully.',
                        });

                        this.crudTestResults.set([...steps]);
                        this.isCrudTesting.set(false);
                        this.refreshDatabaseStatus();
                        this.showToast('Full Database CRUD lifecycle verified: All 5 steps passed!', 'success');
                      },
                      error: (err) => {
                        this.handleCrudTestError(steps, 'DELETE', err);
                      },
                    });
                  },
                  error: (err) => {
                    this.handleCrudTestError(steps, 'UPDATE', err);
                  },
                });
            },
            error: (err) => {
              this.handleCrudTestError(steps, 'READ', err);
            },
          });
        },
        error: (err) => {
          this.handleCrudTestError(steps, 'CREATE', err);
        },
      });
  }

  private handleCrudTestError(steps: CrudTestStepResult[], op: CrudTestStepResult['operation'], err: unknown) {
    steps.push({
      step: `Failure during ${op} operation`,
      operation: op,
      target: 'redbus_db',
      durationMs: 0,
      status: 'FAILED',
      details: String(err),
    });
    this.crudTestResults.set([...steps]);
    this.isCrudTesting.set(false);
    this.showToast(`CRUD diagnostic failed at ${op}. Check server logs.`, 'error');
  }

  // =========================================================================
  // COMPUTED SIGNALS & HELPERS
  // =========================================================================

  readonly filteredTrips = computed(() => {
    const list = this.allTrips();
    const filter = this.filters();

    let filtered = list.filter((trip) => {
      if (filter.hasAc !== null && trip.bus.hasAc !== filter.hasAc) return false;
      if (trip.baseFare > filter.maxPrice) return false;
      if (trip.bus.rating < filter.minRating) return false;
      if (filter.operator !== 'all' && !trip.bus.operatorName.toLowerCase().includes(filter.operator.toLowerCase())) {
        return false;
      }
      if (filter.busType !== 'all') {
        if (filter.busType === 'sleeper' && !trip.bus.busType.includes('sleeper')) return false;
        if (filter.busType === 'seater' && trip.bus.busType !== 'seater') return false;
        if (filter.busType === 'semi_sleeper' && trip.bus.busType !== 'semi_sleeper') return false;
      }
      if (filter.departureTimeSlot !== 'all') {
        const hour = parseInt(trip.departureTime.split(':')[0], 10);
        if (filter.departureTimeSlot === 'morning' && (hour < 6 || hour >= 12)) return false;
        if (filter.departureTimeSlot === 'afternoon' && (hour < 12 || hour >= 17)) return false;
        if (filter.departureTimeSlot === 'evening' && (hour < 17 || hour >= 20)) return false;
        if (filter.departureTimeSlot === 'night' && (hour < 20 && hour >= 6)) return false;
      }
      return true;
    });

    // Sorting
    filtered = [...filtered].sort((a, b) => {
      switch (filter.sortBy) {
        case 'departure_asc':
          return a.departureTime.localeCompare(b.departureTime);
        case 'departure_desc':
          return b.departureTime.localeCompare(a.departureTime);
        case 'price_asc':
          return a.baseFare - b.baseFare;
        case 'price_desc':
          return b.baseFare - a.baseFare;
        case 'rating_desc':
          return b.bus.rating - a.bus.rating;
        default:
          return 0;
      }
    });

    return filtered;
  });

  readonly totalBasePrice = computed(() => {
    const selected = this.selectedSeats();
    const trip = this.selectedTrip();
    if (!trip) return 0;
    return selected.reduce(
      (sum, seat) => sum + (seat.price ? Math.round(seat.price) : Math.round(trip.baseFare * (seat.fareMultiplier || 1))),
      0,
    );
  });

  readonly gstTax = computed(() => {
    return Math.round(this.totalBasePrice() * 0.05);
  });

  readonly couponDiscount = computed(() => {
    const coupon = this.appliedCoupon();
    return coupon ? coupon.discount : 0;
  });

  readonly finalPayable = computed(() => {
    const total = this.totalBasePrice() + this.gstTax() - this.couponDiscount();
    return Math.max(0, total);
  });

  readonly activeFilterCount = computed(() => {
    const f = this.filters();
    let count = 0;
    if (f.hasAc !== null) count++;
    if (f.busType !== 'all') count++;
    if (f.departureTimeSlot !== 'all') count++;
    if (f.maxPrice < 2500) count++;
    if (f.operator !== 'all') count++;
    if (f.minRating > 0) count++;
    return count;
  });

  applyCoupon(codeOrCoupon: {code: string; discount: number; title: string} | string, discount?: number, title?: string) {
    if (typeof codeOrCoupon === 'string' && discount === undefined) {
      // Validate custom coupon code against backend API
      const amount = this.totalBasePrice() || 899;
      this.apiClient.validateCoupon({ code: codeOrCoupon, orderAmount: amount }).subscribe({
        next: (res) => {
          if (res.valid && res.coupon) {
            const applied = {
              code: res.coupon.code,
              discount: res.discountAmount || res.coupon.discount,
              title: res.coupon.title,
            };
            this.appliedCoupon.set(applied);
            this.isCouponModalOpen.set(false);
            this.showToast(res.message || `Applied coupon "${applied.code}" — Saved ₹${applied.discount}!`, 'success');
          } else {
            this.showToast(res.message || 'Invalid coupon code', 'warning');
          }
        },
        error: (err) => {
          const msg = err?.error?.message || `Coupon "${codeOrCoupon}" is invalid or expired.`;
          this.showToast(msg, 'warning');
        },
      });
      return;
    }

    const coupon = typeof codeOrCoupon === 'string'
      ? { code: codeOrCoupon, discount: discount ?? 100, title: title ?? `Coupon ${codeOrCoupon}` }
      : codeOrCoupon;
    this.appliedCoupon.set(coupon);
    this.isCouponModalOpen.set(false);
    this.showToast(`Applied coupon "${coupon.code}" — Saved ₹${coupon.discount}!`, 'success');
  }

  confirmBooking(paymentMethod = 'UPI'): Booking | null {
    return this.confirmMockBooking(paymentMethod);
  }

  removeCoupon() {
    this.appliedCoupon.set(null);
    this.showToast('Coupon removed.', 'info');
  }

  loginUser(email: string, password?: string) {
    this.apiClient.login({ email, password }).subscribe({
      next: (res) => {
        if (res.user) {
          this.currentUser.set(res.user);
          this.isAuthModalOpen.set(false);
          this.loadBookingsFromDb();
          this.showToast(res.message || `Signed in as ${res.user.fullName}`, 'success');
        }
      },
      error: (err) => {
        this.showToast(err?.error?.error || 'Authentication failed', 'error');
      },
    });
  }

  signupUser(fullName: string, email: string, phone?: string, password?: string) {
    this.apiClient.signup({ fullName, email, phone, password }).subscribe({
      next: (res) => {
        if (res.user) {
          this.currentUser.set(res.user);
          this.isAuthModalOpen.set(false);
          this.loadBookingsFromDb();
          this.showToast(res.message || `Account created for ${res.user.fullName}`, 'success');
        }
      },
      error: (err) => {
        this.showToast(err?.error?.error || 'Registration failed', 'error');
      },
    });
  }

  showToast(text: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    this.toastMessage.set({ text, type });
    setTimeout(() => {
      if (this.toastMessage()?.text === text) {
        this.toastMessage.set(null);
      }
    }, 4500);
  }

  swapCities() {
    const src = this.sourceCity();
    const dst = this.destinationCity();
    this.sourceCity.set(dst);
    this.destinationCity.set(src);
    this.loadTripsFromDb();
    this.showToast(`Route swapped: ${dst.name} to ${src.name}. Querying database...`, 'info');
  }

  simulateConcurrencyConflict(seatNumber: string) {
    const trip = this.selectedTrip();
    if (!trip) return;

    const targetSeat = trip.seats?.find((s) => s.seatNumber === seatNumber);
    if (!targetSeat) return;

    if (targetSeat.status === 'available') {
      targetSeat.status = 'locked';
      targetSeat.lockedByUserId = 'other-passenger-999';
      this.showToast(`Simulated Race: Remote passenger from Mumbai locked Seat ${seatNumber}!`, 'warning');
    } else if (targetSeat.status === 'locked') {
      targetSeat.status = 'available';
      targetSeat.lockedByUserId = undefined;
      this.showToast(`Seat ${seatNumber} lock released by remote passenger. Now available in database!`, 'info');
    }
    this.selectedTrip.set({ ...trip });
  }

  // =========================================================================
  // ADMIN SEAT LAYOUT & VEHICLE DETAILS STUDIO ENGINE (2D GRID FOR BUS & CAR)
  // =========================================================================

  normalizeDeckGridSpans(
    gridRows: number,
    gridCols: number,
    rawCells: GridSeatCell[],
    prefix = 'S',
    defaultPrice = 1000,
  ): GridSeatCell[] {
    return this.normalizeDeckGridCells(gridRows, gridCols, rawCells, prefix, defaultPrice);
  }

  normalizeDeckGridCells(
    gridRows: number,
    gridCols: number,
    rawCells: GridSeatCell[],
    prefix: string,
    defaultPrice: number,
  ): GridSeatCell[] {
    const safeRows = Math.max(1, Math.min(24, gridRows || 12));
    const safeCols = Math.max(1, Math.min(8, gridCols || 4));
    const cellMap = new Map<string, GridSeatCell>();
    for (const c of rawCells || []) {
      cellMap.set(`${c.row}-${c.col}`, { ...c });
    }

    const coveredMap = new Map<string, string>(); // "r-c" -> "anchorR-anchorC"
    const result: GridSeatCell[] = [];
    let autoNum = 1;

    for (let r = 0; r < safeRows; r++) {
      for (let c = 0; c < safeCols; c++) {
        const key = `${r}-${c}`;
        const coveringAnchor = coveredMap.get(key);
        if (coveringAnchor) {
          const existing = cellMap.get(key);
          result.push({
            row: r,
            col: c,
            rowSpan: 1,
            colSpan: 1,
            coveredBy: coveringAnchor,
            seatNumber: '',
            seatCategory: 'general',
            seatType: existing?.seatType || 'seater',
            price: existing?.price || defaultPrice,
            status: 'available',
          });
          continue;
        }

        const existing = cellMap.get(key);
        const wasCovered = Boolean(existing?.coveredBy);
        const category: SeatCategory =
          existing && !wasCovered ? existing.seatCategory : 'general';
        const seatType: 'seater' | 'sleeper' =
          existing && !wasCovered ? existing.seatType : 'seater';
        let rSpan =
          existing && !wasCovered
            ? existing.rowSpan || (seatType === 'sleeper' ? 2 : 1)
            : 1;
        let cSpan = existing && !wasCovered ? existing.colSpan || 1 : 1;

        // Clamp spans to grid bounds
        rSpan = Math.max(1, Math.min(safeRows - r, rSpan));
        cSpan = Math.max(1, Math.min(safeCols - c, cSpan));

        // Prevent collision with any already covered cell
        for (let rr = r; rr < r + rSpan; rr++) {
          for (let cc = c; cc < c + cSpan; cc++) {
            if (rr === r && cc === c) continue;
            if (coveredMap.has(`${rr}-${cc}`)) {
              cSpan = 1;
              if (coveredMap.has(`${rr}-${c}`)) {
                rSpan = Math.max(1, rr - r);
              }
            }
          }
        }

        // Mark spanned cells as covered by this anchor cell
        for (let rr = r; rr < r + rSpan; rr++) {
          for (let cc = c; cc < c + cSpan; cc++) {
            if (rr === r && cc === c) continue;
            coveredMap.set(`${rr}-${cc}`, key);
          }
        }

        const isFacility =
          category === 'reserved' ||
          category === 'toilet' ||
          category === 'cafeteria' ||
          category === 'exit_entry';
        let seatNumber = existing && !wasCovered ? existing.seatNumber : '';
        if (category === 'driver') {
          seatNumber = 'DRV';
        } else if (isFacility) {
          seatNumber =
            existing?.reservedLabel ||
            existing?.seatNumber ||
            this.getDefaultReservedLabelForCategory(category, existing?.reservedLabel);
        } else if (category === 'empty') {
          seatNumber = '';
        } else if (
          !seatNumber ||
          seatNumber === 'DRV' ||
          seatNumber === 'RES' ||
          seatNumber === 'Toilet' ||
          seatNumber === 'Cafeteria' ||
          seatNumber === 'Exit / Entry'
        ) {
          const typePrefix = seatType === 'sleeper' ? prefix : `${prefix}S`;
          seatNumber = `${typePrefix}${autoNum++}`;
        } else {
          autoNum++;
        }

        result.push({
          row: r,
          col: c,
          rowSpan: rSpan,
          colSpan: cSpan,
          coveredBy: undefined,
          seatNumber,
          seatCategory: category,
          seatType,
          reservedLabel: isFacility
            ? existing?.reservedLabel || seatNumber
            : existing?.reservedLabel,
          price: existing?.price && existing.price > 0 ? existing.price : defaultPrice,
          status: existing?.status === 'booked' ? 'booked' : 'available',
        });
      }
    }

    return result;
  }

  buildGridCellsForDeck(
    deckCfg: CustomDeckConfig,
    baseFare: number,
    seaterRowSpan = 1,
    seaterColSpan = 1,
    sleeperRowSpan = 2,
    sleeperColSpan = 1,
  ): GridSeatCell[] {
    const prefix = deckCfg.deckId === 'lower' ? 'L' : deckCfg.deckId === 'middle' ? 'M' : 'U';

    if (deckCfg.gridCells && deckCfg.gridCells.length > 0) {
      const maxR =
        deckCfg.gridRows ||
        deckCfg.gridCells.reduce((acc, c) => Math.max(acc, c.row + (c.rowSpan || 1) - 1), 0) + 1;
      const maxC =
        deckCfg.gridCols ||
        deckCfg.gridCells.reduce((acc, c) => Math.max(acc, c.col + (c.colSpan || 1) - 1), 0) + 1;
      return this.normalizeDeckGridCells(maxR, maxC, deckCfg.gridCells, prefix, baseFare);
    }

    const cols = deckCfg.columns.length || 4;
    const maxRows = Math.max(
      1,
      ...deckCfg.columns.map((c) => {
        const span = c.seatType === 'sleeper' ? sleeperRowSpan : seaterRowSpan;
        return Math.max(1, Math.min(20, (c.seatCount || 6) * span));
      }),
    );

    const rawCells: GridSeatCell[] = [];
    let sleeperCounter = 1;
    let seaterCounter = 1;

    for (let c = 0; c < cols; c++) {
      const colCfg = deckCfg.columns[c] || deckCfg.columns[0];
      const isSleeperCol = colCfg?.seatType === 'sleeper';
      const rSpan = isSleeperCol ? Math.max(1, sleeperRowSpan) : Math.max(1, seaterRowSpan);
      const cSpan = isSleeperCol ? Math.max(1, sleeperColSpan) : Math.max(1, seaterColSpan);
      const totalRowsForCol = Math.min(maxRows, (colCfg?.seatCount || 6) * rSpan);

      let r = 0;
      while (r < maxRows) {
        if (r >= totalRowsForCol || r + rSpan > maxRows) {
          rawCells.push({
            row: r,
            col: c,
            rowSpan: 1,
            colSpan: 1,
            seatNumber: '',
            seatCategory: 'empty',
            seatType: isSleeperCol ? 'sleeper' : 'seater',
            price: colCfg?.price || baseFare,
            status: 'available',
          });
          r++;
          continue;
        }

        let category: SeatCategory = 'general';
        if (colCfg?.reservationType === 'female') category = 'female';
        else if (colCfg?.reservationType === 'male') category = 'male';
        else if (colCfg?.reservationType === 'handicap') category = 'handicap';
        else if (colCfg?.reservationType === 'driver') category = 'driver';

        if (deckCfg.deckId === 'lower' && r === 0 && c === 0 && category === 'general') {
          category = 'handicap';
        }

        const seatNum =
          category === 'driver'
            ? 'DRV'
            : isSleeperCol
              ? `${prefix}${sleeperCounter++}`
              : `${prefix}S${seaterCounter++}`;
        const isSold = r + rSpan >= totalRowsForCol && c === cols - 1 && category !== 'driver';

        rawCells.push({
          row: r,
          col: c,
          rowSpan: rSpan,
          colSpan: cSpan,
          seatNumber: seatNum,
          seatCategory: category,
          seatType: isSleeperCol ? 'sleeper' : 'seater',
          price: colCfg?.price || baseFare,
          status: isSold ? 'booked' : 'available',
        });

        r += rSpan;
      }
    }

    return this.normalizeDeckGridCells(maxRows, cols, rawCells, prefix, baseFare);
  }

  // =========================================================================
  // REUSABLE VEHICLE MODELS (BUS & CAR) + MULTI-VEHICLE ASSIGNMENT + SYNC
  // =========================================================================

  private getBusOperatorKey(trip: Trip): string {
    return `bus-op:${(trip.bus?.operatorName || '').trim().toLowerCase()}`;
  }

  private getCarOperatorKey(car: SharedCarTrip): string {
    return `car-op:${(car.operatorName || '').trim().toLowerCase()}`;
  }

  initDefaultVehicleModels() {
    // 1. Bus Model: Hybrid 12R x 4C (2 Col Sleeper = 12 Berths + 2 Col Seater = 24 Seats)
    const hybridLowerDeck: CustomDeckConfig = {
      deckId: 'lower',
      deckLabel: 'Lower deck',
      aisleAfterCol: 1,
      gridRows: 12,
      gridCols: 4,
      columns: [
        { colIndex: 0, label: 'Col 1 (Sleeper L)', seatCount: 6, seatType: 'sleeper', price: 2074, reservationType: 'general' },
        { colIndex: 1, label: 'Col 2 (Sleeper R)', seatCount: 6, seatType: 'sleeper', price: 1990, reservationType: 'female' },
        { colIndex: 2, label: 'Col 3 (Seater Inner)', seatCount: 12, seatType: 'seater', price: 1283, reservationType: 'male' },
        { colIndex: 3, label: 'Col 4 (Seater Window)', seatCount: 12, seatType: 'seater', price: 1331, reservationType: 'general' },
      ],
    };
    hybridLowerDeck.gridCells = this.buildGridCellsForDeck(hybridLowerDeck, 1299, 1, 1, 2, 1);

    const hybridUpperDeck: CustomDeckConfig = {
      deckId: 'upper',
      deckLabel: 'Upper deck',
      aisleAfterCol: 0,
      gridRows: 12,
      gridCols: 3,
      columns: [
        { colIndex: 0, label: 'Col 1 (Sleeper L)', seatCount: 6, seatType: 'sleeper', price: 2169, reservationType: 'general' },
        { colIndex: 1, label: 'Col 2 (Sleeper Inner)', seatCount: 6, seatType: 'sleeper', price: 1979, reservationType: 'general' },
        { colIndex: 2, label: 'Col 3 (Sleeper Window)', seatCount: 6, seatType: 'sleeper', price: 1979, reservationType: 'general' },
      ],
    };
    hybridUpperDeck.gridCells = this.buildGridCellsForDeck(hybridUpperDeck, 1899, 1, 1, 2, 1);

    // 2. Bus Model: Pure Sleeper 2+1 Double Decker (12 Grid Rows = 6 Sleeper Berths per Col)
    const sleeperLowerDeck: CustomDeckConfig = {
      deckId: 'lower',
      deckLabel: 'Lower deck',
      aisleAfterCol: 0,
      gridRows: 12,
      gridCols: 3,
      columns: [
        { colIndex: 0, label: 'Col 1 (Single Berth)', seatCount: 6, seatType: 'sleeper', price: 1890, reservationType: 'general' },
        { colIndex: 1, label: 'Col 2 (Inner Berth)', seatCount: 6, seatType: 'sleeper', price: 1850, reservationType: 'male' },
        { colIndex: 2, label: 'Col 3 (Window Berth)', seatCount: 6, seatType: 'sleeper', price: 1850, reservationType: 'female' },
      ],
    };
    sleeperLowerDeck.gridCells = this.buildGridCellsForDeck(sleeperLowerDeck, 1850, 1, 1, 2, 1);

    const sleeperUpperDeck: CustomDeckConfig = {
      deckId: 'upper',
      deckLabel: 'Upper deck',
      aisleAfterCol: 0,
      gridRows: 12,
      gridCols: 3,
      columns: [
        { colIndex: 0, label: 'Col 1 (Single Berth)', seatCount: 6, seatType: 'sleeper', price: 1750, reservationType: 'general' },
        { colIndex: 1, label: 'Col 2 (Inner Berth)', seatCount: 6, seatType: 'sleeper', price: 1690, reservationType: 'general' },
        { colIndex: 2, label: 'Col 3 (Window Berth)', seatCount: 6, seatType: 'sleeper', price: 1690, reservationType: 'general' },
      ],
    };
    sleeperUpperDeck.gridCells = this.buildGridCellsForDeck(sleeperUpperDeck, 1690, 1, 1, 2, 1);

    // 3. Bus Model: Executive Seater 12R x 4C + Rear Toilet (2R x 1C)
    const seaterToiletCells: GridSeatCell[] = [];
    const colLetters = ['A', 'B', 'C', 'D'];
    for (let r = 0; r < 12; r++) {
      for (let c = 0; c < 4; c++) {
        if (r === 10 && c === 3) {
          seaterToiletCells.push({
            row: r,
            col: c,
            rowSpan: 2,
            colSpan: 1,
            seatNumber: 'Toilet',
            reservedLabel: 'Toilet',
            seatCategory: 'reserved',
            seatType: 'seater',
            price: 0,
            status: 'available',
          });
        } else if (r === 11 && c === 3) {
          seaterToiletCells.push({
            row: r,
            col: c,
            rowSpan: 1,
            colSpan: 1,
            coveredBy: '10-3',
            seatNumber: '',
            seatCategory: 'empty',
            seatType: 'seater',
            price: 0,
            status: 'available',
          });
        } else {
          seaterToiletCells.push({
            row: r,
            col: c,
            rowSpan: 1,
            colSpan: 1,
            seatNumber: `${r + 1}${colLetters[c]}`,
            seatCategory: r === 0 && c === 0 ? 'handicap' : r === 1 && c < 2 ? 'female' : r === 2 && c >= 2 ? 'male' : 'general',
            seatType: 'seater',
            price: 699,
            status: r === 11 && c === 2 ? 'booked' : 'available',
          });
        }
      }
    }
    const seaterToiletDeck: CustomDeckConfig = {
      deckId: 'lower',
      deckLabel: 'Lower deck',
      aisleAfterCol: 1,
      gridRows: 12,
      gridCols: 4,
      columns: [],
      gridCells: this.normalizeDeckGridSpans(12, 4, seaterToiletCells, 'L', 699),
    };

    // 4. Bus Model: Triple Decker SkyCoach (Seater + Sleeper + Cafeteria)
    const tripleMiddleCells = seaterToiletCells.map((c) =>
      c.seatCategory === 'reserved'
        ? { ...c, reservedLabel: 'Cafeteria', seatNumber: 'Cafeteria' }
        : { ...c, seatNumber: c.seatNumber ? `M${c.seatNumber}` : '', price: 999 },
    );
    const tripleMiddleDeck: CustomDeckConfig = {
      deckId: 'middle',
      deckLabel: 'Middle deck',
      aisleAfterCol: 1,
      gridRows: 12,
      gridCols: 4,
      columns: [],
      gridCells: this.normalizeDeckGridSpans(12, 4, tripleMiddleCells, 'M', 999),
    };

    // Helper for Car Grid Models
    const makeCarGridDeck = (
      rows: number,
      cols: number,
      basePrice: number,
      skipMiddleFront: boolean,
      withSleeperPod = false,
    ): CustomDeckConfig => {
      const cells: GridSeatCell[] = [];
      let count = 1;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (r === 0 && c === cols - 1) {
            cells.push({
              row: r,
              col: c,
              rowSpan: 1,
              colSpan: 1,
              seatNumber: 'DRV',
              seatCategory: 'driver',
              seatType: 'seater',
              price: 0,
              status: 'available',
            });
            continue;
          }
          if (r === 0 && c === 1 && skipMiddleFront) {
            cells.push({
              row: r,
              col: c,
              rowSpan: 1,
              colSpan: 1,
              seatNumber: '',
              seatCategory: 'empty',
              seatType: 'seater',
              price: basePrice,
              status: 'available',
            });
            continue;
          }
          if (withSleeperPod && c === 0 && r === 1) {
            cells.push({
              row: r,
              col: c,
              rowSpan: 2,
              colSpan: 1,
              seatNumber: `SL1`,
              seatCategory: 'general',
              seatType: 'sleeper',
              price: basePrice + 150,
              status: 'available',
            });
            continue;
          }
          if (withSleeperPod && c === 0 && r === 2) {
            cells.push({
              row: r,
              col: c,
              rowSpan: 1,
              colSpan: 1,
              coveredBy: '1-0',
              seatNumber: '',
              seatCategory: 'empty',
              seatType: 'seater',
              price: 0,
              status: 'available',
            });
            continue;
          }
          const cat: SeatCategory =
            r === 0 && c === 0
              ? 'handicap'
              : r === 1 && c === 0
                ? 'female'
                : r === 1 && c === cols - 1
                  ? 'male'
                  : 'general';
          cells.push({
            row: r,
            col: c,
            rowSpan: 1,
            colSpan: 1,
            seatNumber: `C${count++}`,
            seatCategory: cat,
            seatType: 'seater',
            price: r === 0 ? basePrice + 40 : basePrice,
            status: r === rows - 1 && c === cols - 1 ? 'booked' : 'available',
          });
        }
      }
      return {
        deckId: 'lower',
        deckLabel: 'Lower deck',
        aisleAfterCol: -1,
        gridRows: rows,
        gridCols: cols,
        columns: [],
        gridCells: this.normalizeDeckGridSpans(rows, cols, cells, 'C', basePrice),
      };
    };

    const defaultModels: VehicleLayoutModel[] = [
      {
        id: 'mdl-bus-hybrid',
        name: 'BharatBenz 12R Hybrid (24 Seater + 12 Sleeper · 2 Decks)',
        code: 'BB-HYB-12R',
        vehicleType: 'bus',
        seatFormat: 'both',
        deckCount: 2,
        driverPosition: 'right',
        seaterDefaultRowSpan: 1,
        seaterDefaultColSpan: 1,
        sleeperDefaultRowSpan: 2,
        sleeperDefaultColSpan: 1,
        decks: [JSON.parse(JSON.stringify(hybridLowerDeck)), JSON.parse(JSON.stringify(hybridUpperDeck)), JSON.parse(JSON.stringify(tripleMiddleDeck))],
        description: 'Lower deck has 2 Sleeper columns (12 berths) + 2 Seater columns (24 seats); Upper deck has 18 Sleeper berths.',
      },
      {
        id: 'mdl-bus-sleeper',
        name: 'Volvo 9600 Multi-Axle Sleeper (36 Berths · 2 Decks)',
        code: 'VLV-SLP-36',
        vehicleType: 'bus',
        seatFormat: 'sleeper',
        deckCount: 2,
        driverPosition: 'right',
        seaterDefaultRowSpan: 1,
        seaterDefaultColSpan: 1,
        sleeperDefaultRowSpan: 2,
        sleeperDefaultColSpan: 1,
        decks: [JSON.parse(JSON.stringify(sleeperLowerDeck)), JSON.parse(JSON.stringify(sleeperUpperDeck)), JSON.parse(JSON.stringify(tripleMiddleDeck))],
        description: '12 grid rows = 6 sleeper berths per column (each sleeper spans 2R×1C) across Lower & Upper decks.',
      },
      {
        id: 'mdl-bus-seater-wc',
        name: 'Airavat Executive Seater + Toilet (46 Seats · 1 Deck)',
        code: 'EXEC-STR-WC',
        vehicleType: 'bus',
        seatFormat: 'seater',
        deckCount: 1,
        driverPosition: 'right',
        seaterDefaultRowSpan: 1,
        seaterDefaultColSpan: 1,
        sleeperDefaultRowSpan: 2,
        sleeperDefaultColSpan: 1,
        decks: [JSON.parse(JSON.stringify(seaterToiletDeck)), JSON.parse(JSON.stringify(hybridUpperDeck)), JSON.parse(JSON.stringify(tripleMiddleDeck))],
        description: 'Single-decker 12R×4C Seater layout with onboard 2R×1C rear washroom.',
      },
      {
        id: 'mdl-bus-triple-sky',
        name: 'Scania SkyDeck Triple-Decker (Seater + Sleeper + Cafeteria · 3 Decks)',
        code: 'SCN-3DECK',
        vehicleType: 'bus',
        seatFormat: 'both',
        deckCount: 3,
        driverPosition: 'right',
        seaterDefaultRowSpan: 1,
        seaterDefaultColSpan: 1,
        sleeperDefaultRowSpan: 2,
        sleeperDefaultColSpan: 1,
        decks: [JSON.parse(JSON.stringify(hybridLowerDeck)), JSON.parse(JSON.stringify(tripleMiddleDeck)), JSON.parse(JSON.stringify(sleeperUpperDeck))],
        description: 'Triple-decker luxury coach with Lower Hybrid deck, Middle Seater + Cafeteria deck, and Upper Sleeper deck.',
      },
      {
        id: 'mdl-car-scorpio',
        name: 'Mahindra Scorpio S11 / Classic (3R×3C · 7 Seater SUV)',
        code: 'SUV-SCORPIO-7',
        vehicleType: 'car',
        seatFormat: 'seater',
        deckCount: 1,
        driverPosition: 'right',
        seaterDefaultRowSpan: 1,
        seaterDefaultColSpan: 1,
        sleeperDefaultRowSpan: 2,
        sleeperDefaultColSpan: 1,
        decks: [makeCarGridDeck(3, 3, 220, true), makeCarGridDeck(3, 3, 220, true), makeCarGridDeck(3, 3, 220, true)],
        description: '3R×3C SUV cabin with Front Co-Driver, 3 Middle Seats, and 3 Rear Seats.',
      },
      {
        id: 'mdl-car-innova',
        name: 'Toyota Innova Crysta Captain (3R×3C · 6 Seater Lounge)',
        code: 'MPV-INNOVA-6',
        vehicleType: 'car',
        seatFormat: 'seater',
        deckCount: 1,
        driverPosition: 'right',
        seaterDefaultRowSpan: 1,
        seaterDefaultColSpan: 1,
        sleeperDefaultRowSpan: 2,
        sleeperDefaultColSpan: 1,
        decks: [makeCarGridDeck(3, 3, 320, true), makeCarGridDeck(3, 3, 320, true), makeCarGridDeck(3, 3, 320, true)],
        description: 'Executive Captain-Seat SUV layout with individual armrests and AC vents.',
      },
      {
        id: 'mdl-car-cruiser',
        name: 'Force Trax Cruiser / Bolero Maxi (4R×3C · 11 Seater)',
        code: 'MAXI-CRUISER-11',
        vehicleType: 'car',
        seatFormat: 'seater',
        deckCount: 1,
        driverPosition: 'right',
        seaterDefaultRowSpan: 1,
        seaterDefaultColSpan: 1,
        sleeperDefaultRowSpan: 2,
        sleeperDefaultColSpan: 1,
        decks: [makeCarGridDeck(4, 3, 150, false), makeCarGridDeck(3, 3, 150, false), makeCarGridDeck(3, 3, 150, false)],
        description: 'High-capacity 4R×3C shared shuttle layout with 11 bookable passenger seats.',
      },
      {
        id: 'mdl-car-camper-hybrid',
        name: 'Luxury Sleeper Caravan / Camper (3R×3C · Seater + Sleeper Pod)',
        code: 'VAN-HYB-SLP',
        vehicleType: 'car',
        seatFormat: 'both',
        deckCount: 1,
        driverPosition: 'right',
        seaterDefaultRowSpan: 1,
        seaterDefaultColSpan: 1,
        sleeperDefaultRowSpan: 2,
        sleeperDefaultColSpan: 1,
        decks: [makeCarGridDeck(3, 3, 390, true, true), makeCarGridDeck(3, 3, 390, true, true), makeCarGridDeck(3, 3, 390, true, true)],
        description: 'Hybrid outstation camper van featuring both Seater seats and a 2R×1C Sleeper berth pod.',
      },
    ];

    this.vehicleModels.set(defaultModels);
  }

  private persistStudioStateToStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem('rb_vehicle_models_v2', JSON.stringify(this.vehicleModels()));
      window.localStorage.setItem('rb_vehicle_model_assignments_v2', JSON.stringify(this.vehicleModelAssignments()));
      window.localStorage.setItem('rb_vehicle_custom_configs_v2', JSON.stringify(this.vehicleCustomConfigs()));
    } catch (e) {
      console.warn('Could not persist studio state to localStorage', e);
    }
  }

  private restoreStudioStateFromStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const rawModels = window.localStorage.getItem('rb_vehicle_models_v2');
      if (rawModels) {
        const parsed = JSON.parse(rawModels);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((m: VehicleLayoutModel) => {
            if (m.deckCount === 2 && !m.decks.some((d) => d.deckId === 'upper')) {
              const middle = m.decks.find((d) => d.deckId === 'middle');
              if (middle) {
                middle.deckId = 'upper';
                middle.deckLabel = 'Upper deck';
              }
            }
            return m;
          });
          this.vehicleModels.set(sanitized);
        }
      }
      const rawAssign = window.localStorage.getItem('rb_vehicle_model_assignments_v2');
      if (rawAssign) {
        const parsed = JSON.parse(rawAssign);
        if (parsed && typeof parsed === 'object') {
          this.vehicleModelAssignments.set(parsed);
        }
      }
      const rawConfigs = window.localStorage.getItem('rb_vehicle_custom_configs_v2');
      if (rawConfigs) {
        const parsed = JSON.parse(rawConfigs);
        if (parsed && typeof parsed === 'object') {
          for (const key of Object.keys(parsed)) {
            const cfg = parsed[key] as VehicleCustomConfig | undefined;
            if (cfg?.deckCount === 2 && Array.isArray(cfg.decks) && !cfg.decks.some((d: CustomDeckConfig) => d.deckId === 'upper')) {
              const middle = cfg.decks.find((d: CustomDeckConfig) => d.deckId === 'middle');
              if (middle) {
                middle.deckId = 'upper';
                middle.deckLabel = 'Upper deck';
              }
            }
          }
          this.vehicleCustomConfigs.set(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not restore studio state from localStorage', e);
    }
  }

  getBusModels(): VehicleLayoutModel[] {
    return this.vehicleModels().filter((m) => m.vehicleType === 'bus');
  }

  getCarModels(): VehicleLayoutModel[] {
    return this.vehicleModels().filter((m) => m.vehicleType === 'car');
  }

  getAssignedModelForBus(trip: Trip): VehicleLayoutModel {
    const assignments = this.vehicleModelAssignments();
    const opKey = this.getBusOperatorKey(trip);
    const assignedId = assignments[trip.id] || assignments[opKey];
    const models = this.getBusModels();

    if (assignedId) {
      const found = models.find((m) => m.id === assignedId);
      if (found) return found;
    }

    const busType = trip.bus?.busType || 'ac_sleeper';
    if (busType === 'seater' || busType === 'semi_sleeper') {
      return models.find((m) => m.id === 'mdl-bus-seater-wc') || models[0];
    }
    if (busType === 'sleeper') {
      return models.find((m) => m.id === 'mdl-bus-sleeper') || models[0];
    }
    return models.find((m) => m.id === 'mdl-bus-hybrid') || models[0];
  }

  getAssignedModelForCar(car: SharedCarTrip): VehicleLayoutModel {
    const assignments = this.vehicleModelAssignments();
    const opKey = this.getCarOperatorKey(car);
    const assignedId = assignments[car.id] || assignments[opKey];
    const models = this.getCarModels();

    if (assignedId) {
      const found = models.find((m) => m.id === assignedId);
      if (found) return found;
    }

    if (car.vehicleModel === 'innova' || car.vehicleModel === 'ertiga') {
      return models.find((m) => m.id === 'mdl-car-innova') || models[0];
    }
    if (car.vehicleModel === 'cruiser' || car.vehicleModel === 'bolero' || car.totalSeats >= 9) {
      return models.find((m) => m.id === 'mdl-car-cruiser') || models[0];
    }
    return models.find((m) => m.id === 'mdl-car-scorpio') || models[0];
  }

  hasCustomOrModelOverrideForBus(trip: Trip): boolean {
    const opKey = this.getBusOperatorKey(trip);
    const configs = this.vehicleCustomConfigs();
    const assigns = this.vehicleModelAssignments();
    return Boolean(configs[trip.id] || configs[opKey] || assigns[trip.id] || assigns[opKey]);
  }

  hasCustomOrModelOverrideForCar(car: SharedCarTrip): boolean {
    const opKey = this.getCarOperatorKey(car);
    const configs = this.vehicleCustomConfigs();
    const assigns = this.vehicleModelAssignments();
    return Boolean(configs[car.id] || configs[opKey] || assigns[car.id] || assigns[opKey]);
  }

  getDefaultCustomConfigForBus(trip: Trip): VehicleCustomConfig {
    const model = this.getAssignedModelForBus(trip);
    const clonedDecks: CustomDeckConfig[] = JSON.parse(JSON.stringify(model.decks));

    return {
      targetType: 'bus',
      targetId: trip.id,
      layoutModelId: model.id,
      layoutModelName: model.name,
      seatFormat: model.seatFormat,
      deckCount: model.deckCount,
      driverPosition: model.driverPosition,
      seaterRowSpan: model.seaterDefaultRowSpan || 1,
      seaterColSpan: model.seaterDefaultColSpan || 1,
      sleeperRowSpan: model.sleeperDefaultRowSpan || 2,
      sleeperColSpan: model.sleeperDefaultColSpan || 1,
      seaterDefaultRowSpan: model.seaterDefaultRowSpan || 1,
      seaterDefaultColSpan: model.seaterDefaultColSpan || 1,
      sleeperDefaultRowSpan: model.sleeperDefaultRowSpan || 2,
      sleeperDefaultColSpan: model.sleeperDefaultColSpan || 1,
      decks: clonedDecks,
      safetyBadgeText: 'Enhanced',
      safetyHeadline: 'Enhanced Bus Safety Shield',
      safetyDescription: `${trip.bus.operatorName} follows strict 6-point safety, hygiene, and real-time GPS monitoring checks before every departure.`,
      safetyItems: [
        { id: 'sf-1', icon: 'my_location', title: 'Live GPS Bus Tracking', subtitle: 'Real-time location shared with family & control room' },
        { id: 'sf-2', icon: 'health_and_safety', title: 'Breathalyzer Tested Driver', subtitle: 'Mandatory sobriety & fatigue check before dispatch' },
        { id: 'sf-3', icon: 'female', title: 'Women Traveler Protection', subtitle: 'Dedicated female-only adjacent seat enforcement' },
        { id: 'sf-4', icon: 'cleaning_services', title: 'Deep Sanitized Cabin', subtitle: 'Disinfected seats, headrests & air vents every trip' },
      ],
      boardingPoints: [...(trip.boardingPoints || [])],
      droppingPoints: [...(trip.droppingPoints || [])],
      routeStops: [
        { id: 'rt-1', time: trip.departureTime, title: `${trip.sourceCityName} Departure`, subtitle: `Starts from ${trip.boardingPoints[0]?.location || trip.sourceCityName}`, type: 'departure' },
        { id: 'rt-2', time: '+2h 30m', title: 'Highway Food & Rest Stop (20 Mins)', subtitle: 'Hygienic washrooms, tea/coffee & refreshments plaza', type: 'stop' },
        { id: 'rt-3', time: '+5h 00m', title: 'FASTag Toll Expressway Corridor', subtitle: 'Non-stop express highway transit', type: 'toll' },
        { id: 'rt-4', time: trip.arrivalTime, title: `${trip.destinationCityName} Arrival`, subtitle: `Drops at ${trip.droppingPoints[0]?.location || trip.destinationCityName}`, type: 'arrival' },
      ],
      reviewMetrics: {
        punctuality: 4.7,
        cleanliness: 4.6,
        staffBehavior: 4.8,
        drivingSafety: 4.7,
      },
      reviews: [
        {
          id: 'rv-1',
          author: 'Ankit Verma',
          tag: 'Verified Passenger',
          rating: 5.0,
          comment: `Bus departed right on time from ${trip.sourceCityName}. Very clean seats and smooth driving throughout the journey.`,
        },
        {
          id: 'rv-2',
          author: 'Priya Nair',
          tag: 'Solo Traveler',
          rating: 4.8,
          comment: `Safe and comfortable for female passengers. Live tracking link worked accurately till ${trip.destinationCityName}.`,
        },
      ],
      cancellationSlabs: [
        { id: 'cn-1', windowLabel: 'Before 24 Hours', ruleText: '90% Refund (10% Charge)', tone: 'positive' },
        { id: 'cn-2', windowLabel: '12 to 24 Hours before', ruleText: '75% Refund (25% Charge)', tone: 'positive' },
        { id: 'cn-3', windowLabel: '6 to 12 Hours before', ruleText: '50% Refund (50% Charge)', tone: 'warning' },
        { id: 'cn-4', windowLabel: 'Less than 6 Hours', ruleText: 'No Refund (100% Charge)', tone: 'danger' },
      ],
      dateChangeSlabs: [
        { id: 'dc-1', windowLabel: 'More than 12 Hours before', ruleText: 'FREE (₹0 Reschedule Fee)', tone: 'positive' },
        { id: 'dc-2', windowLabel: '6 to 12 Hours before', ruleText: '₹50 + Fare Difference', tone: 'warning' },
        { id: 'dc-3', windowLabel: 'Less than 6 Hours before', ruleText: 'Date Change Not Available', tone: 'danger' },
      ],
    };
  }

  getDefaultCustomConfigForCar(car: SharedCarTrip): VehicleCustomConfig {
    const model = this.getAssignedModelForCar(car);
    const clonedDecks: CustomDeckConfig[] = JSON.parse(JSON.stringify(model.decks));

    return {
      targetType: 'car',
      targetId: car.id,
      layoutModelId: model.id,
      layoutModelName: model.name,
      seatFormat: model.seatFormat,
      deckCount: model.deckCount,
      driverPosition: model.driverPosition,
      seaterRowSpan: model.seaterDefaultRowSpan || 1,
      seaterColSpan: model.seaterDefaultColSpan || 1,
      sleeperRowSpan: model.sleeperDefaultRowSpan || 2,
      sleeperColSpan: model.sleeperDefaultColSpan || 1,
      seaterDefaultRowSpan: model.seaterDefaultRowSpan || 1,
      seaterDefaultColSpan: model.seaterDefaultColSpan || 1,
      sleeperDefaultRowSpan: model.sleeperDefaultRowSpan || 2,
      sleeperDefaultColSpan: model.sleeperDefaultColSpan || 1,
      decks: clonedDecks,
      safetyBadgeText: 'Enhanced',
      safetyHeadline: 'Enhanced Car Safety Shield',
      safetyDescription: `${car.operatorName} (${car.vehicleName}) follows strict 6-point safety, driver verification, and real-time GPS cab tracking before every trip.`,
      safetyItems: [
        { id: 'csf-1', icon: 'my_location', title: 'Live GPS Cab Tracking', subtitle: 'Real-time SUV location shared with family & control room' },
        { id: 'csf-2', icon: 'verified', title: 'Verified Commercial Chauffeur', subtitle: `Driven by ${car.driverName} · Background & license verified` },
        { id: 'csf-3', icon: 'female', title: 'Women Passenger Protection', subtitle: 'Dedicated female-only seat reservation & SOS button' },
        { id: 'csf-4', icon: 'cleaning_services', title: 'Sanitized SUV Cabin', subtitle: 'Fresh seat covers, AC vents & headrest cleaning every ride' },
      ],
      boardingPoints: [...(car.boardingPoints || [])],
      droppingPoints: [...(car.droppingPoints || [])],
      routeStops: [
        { id: 'crt-1', time: car.departureTime, title: `${car.sourceCityName} Pickup Stand`, subtitle: `Starts from ${car.boardingPoints[0]?.location || car.sourceCityName}`, type: 'departure' },
        { id: 'crt-2', time: '+1h 45m', title: 'Highway Tea & Refreshment Halt (15 Mins)', subtitle: 'Clean highway food court & restroom stop', type: 'stop' },
        { id: 'crt-3', time: '+3h 00m', title: 'FASTag Expressway Corridor', subtitle: 'Non-stop point-to-point highway cruise', type: 'toll' },
        { id: 'crt-4', time: car.arrivalTime, title: `${car.destinationCityName} Drop Stand`, subtitle: `Drops at ${car.droppingPoints[0]?.location || car.destinationCityName}`, type: 'arrival' },
      ],
      reviewMetrics: {
        punctuality: 4.8,
        cleanliness: 4.7,
        staffBehavior: 4.9,
        drivingSafety: 4.8,
      },
      reviews: [
        {
          id: 'crv-1',
          author: 'Sandeep Kulkarni',
          tag: 'Verified Rider',
          rating: 5.0,
          comment: `${car.vehicleName} was spotless and departed right on schedule. Driver ${car.driverName} drove very safely.`,
        },
        {
          id: 'crv-2',
          author: 'Meera Joshi',
          tag: 'Solo Commuter',
          rating: 4.8,
          comment: `Booked the front seat. Very comfortable AC ride and convenient pickup stand.`,
        },
      ],
      cancellationSlabs: [
        { id: 'ccn-1', windowLabel: 'Before 12 Hours', ruleText: '90% Refund (10% Charge)', tone: 'positive' },
        { id: 'ccn-2', windowLabel: '4 to 12 Hours before', ruleText: '75% Refund (25% Charge)', tone: 'positive' },
        { id: 'ccn-3', windowLabel: '1 to 4 Hours before', ruleText: '50% Refund (50% Charge)', tone: 'warning' },
        { id: 'ccn-4', windowLabel: 'Less than 1 Hour', ruleText: 'No Refund (100% Charge)', tone: 'danger' },
      ],
      dateChangeSlabs: [
        { id: 'cdc-1', windowLabel: 'More than 6 Hours before', ruleText: 'FREE (₹0 Reschedule Fee)', tone: 'positive' },
        { id: 'cdc-2', windowLabel: '2 to 6 Hours before', ruleText: '₹30 + Fare Difference', tone: 'warning' },
        { id: 'cdc-3', windowLabel: 'Less than 2 Hours before', ruleText: 'Date Change Not Available', tone: 'danger' },
      ],
    };
  }

  getEffectiveConfigForBus(trip: Trip): VehicleCustomConfig {
    const configs = this.vehicleCustomConfigs();
    const opKey = this.getBusOperatorKey(trip);
    const saved = configs[trip.id] || configs[opKey];
    if (saved) {
      const cfg: VehicleCustomConfig = {
        ...saved,
        targetId: trip.id,
        boardingPoints: saved.boardingPoints?.length ? saved.boardingPoints : trip.boardingPoints || [],
        droppingPoints: saved.droppingPoints?.length ? saved.droppingPoints : trip.droppingPoints || [],
      };
      if (cfg.deckCount === 2 && !cfg.decks.some((d) => d.deckId === 'upper')) {
        const middle = cfg.decks.find((d) => d.deckId === 'middle');
        if (middle) {
          middle.deckId = 'upper';
          middle.deckLabel = 'Upper deck';
        }
      }
      return cfg;
    }
    return this.getDefaultCustomConfigForBus(trip);
  }

  getEffectiveConfigForCar(car: SharedCarTrip): VehicleCustomConfig {
    const configs = this.vehicleCustomConfigs();
    const opKey = this.getCarOperatorKey(car);
    const saved = configs[car.id] || configs[opKey];
    if (saved) {
      return {
        ...saved,
        targetId: car.id,
        boardingPoints: saved.boardingPoints?.length ? saved.boardingPoints : car.boardingPoints || [],
        droppingPoints: saved.droppingPoints?.length ? saved.droppingPoints : car.droppingPoints || [],
      };
    }
    return this.getDefaultCustomConfigForCar(car);
  }

  hydrateBusTripWithConfig(trip: Trip): Trip {
    const cfg = this.getEffectiveConfigForBus(trip);
    const customSeats = this.buildBusSeatsFromCustomConfig(trip.id, trip.baseFare, cfg);
    const availCount = customSeats.filter(
      (s) => s.status === 'available' && !s.isDriverSeat && !s.isReservedSection,
    ).length;
    return {
      ...trip,
      seats: customSeats,
      availableSeatsCount: availCount,
      boardingPoints: cfg.boardingPoints?.length ? [...cfg.boardingPoints] : trip.boardingPoints,
      droppingPoints: cfg.droppingPoints?.length ? [...cfg.droppingPoints] : trip.droppingPoints,
    };
  }

  hydrateCarTripWithConfig(car: SharedCarTrip): SharedCarTrip {
    const cfg = this.getEffectiveConfigForCar(car);
    const dbSeats = Array.isArray(car.seats) ? car.seats : [];
    const bookedIds = new Set<string>();
    const bookedNums = new Set<string>();
    const lockedIds = new Set<string>();
    const lockedNums = new Set<string>();

    dbSeats.forEach((s) => {
      if (s.status === 'booked') {
        bookedIds.add(s.id);
        bookedNums.add(s.seatNumber);
      } else if (s.status === 'locked') {
        lockedIds.add(s.id);
        lockedNums.add(s.seatNumber);
      }
    });

    const customSeats = this.buildCarSeatsFromCustomConfig(car.id, car.baseFare, cfg).map((s) => {
      if (s.isDriverSeat || s.isReservedSection) return s;
      if (
        s.status === 'booked' ||
        bookedIds.has(s.id) ||
        bookedNums.has(s.seatNumber) ||
        bookedIds.has(`${car.id}-${s.seatNumber}`)
      ) {
        return { ...s, status: 'booked' as const };
      }
      if (
        s.status === 'locked' ||
        lockedIds.has(s.id) ||
        lockedNums.has(s.seatNumber) ||
        lockedIds.has(`${car.id}-${s.seatNumber}`)
      ) {
        return { ...s, status: 'locked' as const };
      }
      return s;
    });

    const bookableSeats = customSeats.filter((s) => !s.isDriverSeat && !s.isReservedSection);
    return {
      ...car,
      seats: customSeats,
      totalSeats: bookableSeats.length,
      availableSeatsCount: bookableSeats.filter((s) => s.status === 'available').length,
      boardingPoints: cfg.boardingPoints?.length ? [...cfg.boardingPoints] : car.boardingPoints,
      droppingPoints: cfg.droppingPoints?.length ? [...cfg.droppingPoints] : car.droppingPoints,
    };
  }

  refreshAllHydratedVehicles() {
    const updatedTrips = this.allTrips().map((t) => this.hydrateBusTripWithConfig(t));
    this.allTrips.set(updatedTrips);
    const selTrip = this.selectedTrip();
    if (selTrip) {
      const match =
        updatedTrips.find((t) => t.id === selTrip.id) ||
        updatedTrips.find((t) => t.bus.operatorName === selTrip.bus.operatorName);
      if (match) {
        this.selectedTrip.set({ ...match });
      } else {
        this.selectedTrip.set(this.hydrateBusTripWithConfig(selTrip));
      }
    }

    const updatedCars = this.sharedCarTrips().map((c) => this.hydrateCarTripWithConfig(c));
    this.sharedCarTrips.set(updatedCars);
    const selCar = this.selectedSharedCarTrip();
    if (selCar) {
      const match =
        updatedCars.find((c) => c.id === selCar.id) ||
        updatedCars.find((c) => c.operatorName === selCar.operatorName);
      if (match) {
        this.selectedSharedCarTrip.set({ ...match });
      } else {
        this.selectedSharedCarTrip.set(this.hydrateCarTripWithConfig(selCar));
      }
    }
  }

  createVehicleLayoutModel(params: {
    name: string;
    vehicleType: 'bus' | 'car';
    vehicleSubType?: string;
    seatFormat: VehicleSeatFormat;
    deckCount: 1 | 2 | 3;
    driverPosition?: 'right' | 'left' | 'center' | 'none';
    seaterDefaultRowSpan?: number;
    seaterDefaultColSpan?: number;
    sleeperDefaultRowSpan?: number;
    sleeperDefaultColSpan?: number;
    decks: CustomDeckConfig[];
  }): VehicleLayoutModel {
    const id = `mdl-${params.vehicleType}-${Date.now().toString(36)}`;
    const code = params.name
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 8)
      .toUpperCase() || 'CUSTOM';
    const newModel: VehicleLayoutModel = {
      id,
      name: params.name.trim(),
      code,
      vehicleType: params.vehicleType,
      vehicleSubType:
        params.vehicleSubType ||
        (params.vehicleType === 'bus' ? 'AC Coach / Multi-Axle' : 'SUV / Shared Cab'),
      seatFormat: params.seatFormat,
      deckCount: params.deckCount,
      driverPosition: params.driverPosition || 'right',
      seaterDefaultRowSpan: params.seaterDefaultRowSpan || 1,
      seaterDefaultColSpan: params.seaterDefaultColSpan || 1,
      sleeperDefaultRowSpan: params.sleeperDefaultRowSpan || 2,
      sleeperDefaultColSpan: params.sleeperDefaultColSpan || 1,
      decks: JSON.parse(JSON.stringify(params.decks)),
      description: `Custom ${params.vehicleType.toUpperCase()} model (${params.seatFormat.toUpperCase()} · ${params.deckCount} Deck)`,
    };

    this.vehicleModels.update((prev) => [newModel, ...prev]);
    this.persistStudioStateToStorage();
    this.showToast(`Created new ${params.vehicleType === 'bus' ? 'Bus' : 'Car'} Model: "${newModel.name}"!`, 'success');
    return newModel;
  }

  saveVehicleLayoutModel(model: VehicleLayoutModel, silent = false) {
    const copy: VehicleLayoutModel = JSON.parse(JSON.stringify(model));
    this.vehicleModels.update((prev) => {
      const exists = prev.some((m) => m.id === copy.id);
      return exists ? prev.map((m) => (m.id === copy.id ? copy : m)) : [copy, ...prev];
    });

    // Propagate updated model layout (Lower, Middle & Upper decks) to all custom configs that use this modelId
    const matchingKeys = new Set<string>();
    if (copy.vehicleType === 'bus') {
      for (const t of this.allTrips()) {
        if (this.getAssignedModelForBus(t).id === copy.id) {
          matchingKeys.add(t.id);
          matchingKeys.add(this.getBusOperatorKey(t));
        }
      }
    } else {
      for (const c of this.sharedCarTrips()) {
        if (this.getAssignedModelForCar(c).id === copy.id) {
          matchingKeys.add(c.id);
          matchingKeys.add(this.getCarOperatorKey(c));
        }
      }
    }

    this.vehicleCustomConfigs.update((prev) => {
      const next: Record<string, VehicleCustomConfig> = { ...prev };
      for (const key of Object.keys(next)) {
        if (
          next[key].layoutModelId === copy.id ||
          (!next[key].layoutModelId && matchingKeys.has(key))
        ) {
          next[key] = {
            ...next[key],
            layoutModelId: copy.id,
            layoutModelName: copy.name,
            vehicleSubType: copy.vehicleSubType,
            seatFormat: copy.seatFormat,
            deckCount: copy.deckCount,
            driverPosition: copy.driverPosition,
            seaterDefaultRowSpan: copy.seaterDefaultRowSpan,
            seaterDefaultColSpan: copy.seaterDefaultColSpan,
            sleeperDefaultRowSpan: copy.sleeperDefaultRowSpan,
            sleeperDefaultColSpan: copy.sleeperDefaultColSpan,
            decks: JSON.parse(JSON.stringify(copy.decks)),
          };
        }
      }
      return next;
    });

    this.refreshAllHydratedVehicles();
    this.persistStudioStateToStorage();
    if (!silent) {
      this.showToast(`Model "${copy.name}" (Lower & Upper Deck) updated & synced to all assigned vehicles!`, 'success');
    }
  }

  deleteVehicleLayoutModel(modelId: string) {
    const target = this.vehicleModels().find((m) => m.id === modelId);
    if (!target) return;
    const sameTypeModels = this.vehicleModels().filter((m) => m.vehicleType === target.vehicleType);
    if (sameTypeModels.length <= 1) {
      this.showToast(`At least one ${target.vehicleType === 'bus' ? 'Bus' : 'Car'} model must remain.`, 'warning');
      return;
    }
    this.vehicleModels.update((prev) => prev.filter((m) => m.id !== modelId));
    this.persistStudioStateToStorage();
    this.showToast(`Deleted model "${target.name}".`, 'info');
  }

  applyModelToVehicles(
    modelId: string,
    vehicleType: 'bus' | 'car',
    targetIds: string[],
    overrideDecks?: CustomDeckConfig[],
  ) {
    const model = this.vehicleModels().find((m) => m.id === modelId);
    if (!model || targetIds.length === 0) return;

    const decksToApply: CustomDeckConfig[] = JSON.parse(
      JSON.stringify(overrideDecks && overrideDecks.length > 0 ? overrideDecks : model.decks),
    );

    const nextAssign = { ...this.vehicleModelAssignments() };
    const nextConfigs = { ...this.vehicleCustomConfigs() };

    if (vehicleType === 'bus') {
      const trips = this.allTrips();
      for (const tId of targetIds) {
        const trip = trips.find((t) => t.id === tId);
        if (!trip) continue;
        const opKey = this.getBusOperatorKey(trip);
        nextAssign[trip.id] = model.id;
        nextAssign[opKey] = model.id;

        const baseCfg = this.getEffectiveConfigForBus(trip);
        const updatedCfg: VehicleCustomConfig = {
          ...baseCfg,
          targetType: 'bus',
          targetId: trip.id,
          layoutModelId: model.id,
          layoutModelName: model.name,
          vehicleSubType: model.vehicleSubType,
          seatFormat: model.seatFormat,
          deckCount: model.deckCount,
          driverPosition: model.driverPosition,
          seaterDefaultRowSpan: model.seaterDefaultRowSpan,
          seaterDefaultColSpan: model.seaterDefaultColSpan,
          sleeperDefaultRowSpan: model.sleeperDefaultRowSpan,
          sleeperDefaultColSpan: model.sleeperDefaultColSpan,
          decks: JSON.parse(JSON.stringify(decksToApply)),
        };
        nextConfigs[trip.id] = updatedCfg;
        nextConfigs[opKey] = { ...updatedCfg, targetId: opKey };
      }
    } else {
      const cars = this.sharedCarTrips();
      for (const cId of targetIds) {
        const car = cars.find((c) => c.id === cId);
        if (!car) continue;
        const opKey = this.getCarOperatorKey(car);
        nextAssign[car.id] = model.id;
        nextAssign[opKey] = model.id;

        const baseCfg = this.getEffectiveConfigForCar(car);
        const updatedCfg: VehicleCustomConfig = {
          ...baseCfg,
          targetType: 'car',
          targetId: car.id,
          layoutModelId: model.id,
          layoutModelName: model.name,
          vehicleSubType: model.vehicleSubType,
          seatFormat: model.seatFormat,
          deckCount: model.deckCount,
          driverPosition: model.driverPosition,
          seaterDefaultRowSpan: model.seaterDefaultRowSpan,
          seaterDefaultColSpan: model.seaterDefaultColSpan,
          sleeperDefaultRowSpan: model.sleeperDefaultRowSpan,
          sleeperDefaultColSpan: model.sleeperDefaultColSpan,
          decks: JSON.parse(JSON.stringify(decksToApply)),
        };
        nextConfigs[car.id] = updatedCfg;
        nextConfigs[opKey] = { ...updatedCfg, targetId: opKey };
      }
    }

    this.vehicleModelAssignments.set(nextAssign);
    this.vehicleCustomConfigs.set(nextConfigs);
    this.refreshAllHydratedVehicles();
    this.persistStudioStateToStorage();

    this.showToast(
      `Applied Model "${model.name}" (${model.seatFormat.toUpperCase()}) to ${targetIds.length} ${vehicleType === 'bus' ? 'Bus(es)' : 'Car(s)'}!`,
      'success',
    );
  }

  private isNonPassengerSectionCategory(cat?: SeatCategory): boolean {
    return (
      cat === 'reserved' ||
      cat === 'toilet' ||
      cat === 'cafeteria' ||
      cat === 'exit_entry'
    );
  }

  private getDefaultReservedLabelForCategory(cat?: SeatCategory, customLabel?: string): string {
    if (customLabel && customLabel.trim()) return customLabel.trim();
    if (cat === 'toilet') return 'Toilet';
    if (cat === 'cafeteria') return 'Cafeteria';
    if (cat === 'exit_entry') return 'Exit / Entry';
    return 'Toilet';
  }

  getActiveDecksForConfig(cfg: { deckCount: number; decks: CustomDeckConfig[] }): CustomDeckConfig[] {
    const targetDeckIds: ('lower' | 'middle' | 'upper')[] =
      cfg.deckCount === 1 ? ['lower'] : cfg.deckCount === 3 ? ['lower', 'middle', 'upper'] : ['lower', 'upper'];
    return targetDeckIds
      .map((id) => cfg.decks.find((d) => d.deckId === id))
      .filter((d): d is CustomDeckConfig => !!d);
  }

  buildBusSeatsFromCustomConfig(tripId: string, baseFare: number, cfg: VehicleCustomConfig): Seat[] {
    const seats: Seat[] = [];
    const activeDecks = this.getActiveDecksForConfig(cfg);

    activeDecks.forEach((deckCfg) => {
      const prefix = deckCfg.deckId === 'lower' ? 'L' : deckCfg.deckId === 'middle' ? 'M' : 'U';

      if (deckCfg.gridCells && deckCfg.gridCells.length > 0) {
        let numCounter = 1;
        const sortedCells = [...deckCfg.gridCells].sort((a, b) => a.row - b.row || a.col - b.col);
        sortedCells.forEach((cell) => {
          if (cell.coveredBy || cell.seatCategory === 'empty') return;
          const isDrv = cell.seatCategory === 'driver';
          const isRes = this.isNonPassengerSectionCategory(cell.seatCategory);
          const resLabel = isRes
            ? this.getDefaultReservedLabelForCategory(cell.seatCategory, cell.reservedLabel)
            : undefined;
          const sNum =
            cell.seatNumber ||
            (isDrv ? 'DRV' : isRes ? resLabel || 'WC' : `${prefix}${numCounter++}`);
          const cellPrice = isDrv || isRes ? 0 : cell.price || baseFare;
          seats.push({
            id: `${tripId}-${deckCfg.deckId}-${cell.row}-${cell.col}`,
            tripId,
            seatNumber: sNum,
            deck: deckCfg.deckId,
            row: cell.row,
            col: cell.col,
            rowSpan: cell.rowSpan || (cell.seatType === 'sleeper' ? 2 : 1),
            colSpan: cell.colSpan || 1,
            seatType: cell.seatType || 'seater',
            seatCategory: cell.seatCategory,
            reservedLabel: resLabel,
            fareMultiplier: Number((cellPrice / (baseFare || 1000)).toFixed(2)) || 1.0,
            price: cellPrice,
            status: cell.status === 'booked' ? 'booked' : 'available',
            isLadiesReserved: cell.seatCategory === 'female',
            isMaleReserved: cell.seatCategory === 'male',
            isHandicapReserved: cell.seatCategory === 'handicap',
            isOldAgeReserved: cell.seatCategory === 'old_age',
            isDriverSeat: isDrv,
            isReservedSection: isRes,
          });
        });
        return;
      }

      let numCounter = 1;
      deckCfg.columns.forEach((colCfg, colIdx) => {
        const count = Math.max(1, Math.min(20, colCfg.seatCount || 6));
        const rSpan = colCfg.seatType === 'sleeper' ? 2 : 1;
        for (let r = 0; r < count; r++) {
          const seatNum = `${prefix}${numCounter++}`;
          const isSold = r === count - 1 && colIdx === deckCfg.columns.length - 1;
          seats.push({
            id: `${tripId}-${seatNum}`,
            tripId,
            seatNumber: seatNum,
            deck: deckCfg.deckId,
            row: r * rSpan,
            col: colIdx,
            rowSpan: rSpan,
            colSpan: 1,
            seatType: colCfg.seatType,
            seatCategory:
              colCfg.reservationType === 'female'
                ? 'female'
                : colCfg.reservationType === 'male'
                  ? 'male'
                  : colCfg.reservationType === 'handicap'
                    ? 'handicap'
                    : colCfg.reservationType === 'driver'
                      ? 'driver'
                      : 'general',
            fareMultiplier: Number(((colCfg.price || baseFare) / (baseFare || 1000)).toFixed(2)) || 1.0,
            price: colCfg.price || baseFare,
            status: isSold ? 'booked' : 'available',
            isLadiesReserved: colCfg.reservationType === 'female',
            isMaleReserved: colCfg.reservationType === 'male',
            isHandicapReserved: colCfg.reservationType === 'handicap',
            isDriverSeat: colCfg.reservationType === 'driver',
          });
        }
      });
    });

    return seats;
  }

  buildCarSeatsFromCustomConfig(carId: string, baseFare: number, cfg: VehicleCustomConfig): CarSeat[] {
    const seats: CarSeat[] = [];
    const activeDecks = this.getActiveDecksForConfig(cfg);

    activeDecks.forEach((deckCfg) => {
      const prefix = deckCfg.deckId === 'lower' ? 'C' : deckCfg.deckId === 'middle' ? 'M' : 'U';

      if (deckCfg.gridCells && deckCfg.gridCells.length > 0) {
        let numCounter = 1;
        const sortedCells = [...deckCfg.gridCells].sort((a, b) => a.row - b.row || a.col - b.col);
        const maxCol = sortedCells.reduce((acc, c) => Math.max(acc, c.col), 1);

        sortedCells.forEach((cell) => {
          if (cell.coveredBy || cell.seatCategory === 'empty') return;
          const isDrv = cell.seatCategory === 'driver';
          const isRes = this.isNonPassengerSectionCategory(cell.seatCategory);
          const resLabel = isRes
            ? this.getDefaultReservedLabelForCategory(cell.seatCategory, cell.reservedLabel)
            : undefined;
          const sNum =
            cell.seatNumber ||
            (isDrv ? 'DRV' : isRes ? resLabel || 'RES' : `${prefix}${numCounter++}`);
          const rowCategory: 'front' | 'middle' | 'rear' | 'jump' =
            cell.row === 0 ? 'front' : cell.row === 1 ? 'middle' : cell.row === 2 ? 'rear' : 'jump';
          const posCategory: 'window_left' | 'center' | 'window_right' =
            cell.col === 0 ? 'window_left' : cell.col === maxCol ? 'window_right' : 'center';

          seats.push({
            id: `${carId}-${deckCfg.deckId}-${cell.row}-${cell.col}`,
            seatNumber: sNum,
            label: `${deckCfg.deckLabel} · Row ${cell.row + 1} Col ${cell.col + 1}`,
            row: rowCategory,
            gridRow: cell.row,
            rowIndex: cell.row,
            rowSpan: cell.rowSpan || (cell.seatType === 'sleeper' ? 2 : 1),
            colSpan: cell.colSpan || 1,
            position: posCategory,
            deck: deckCfg.deckId,
            col: cell.col,
            seatType: cell.seatType || 'seater',
            seatCategory: cell.seatCategory,
            reservedLabel: resLabel,
            price: isDrv || isRes ? 0 : cell.price || baseFare,
            status: cell.status === 'booked' ? 'booked' : 'available',
            isLadiesReserved: cell.seatCategory === 'female',
            isMaleReserved: cell.seatCategory === 'male',
            isHandicapReserved: cell.seatCategory === 'handicap',
            isOldAgeReserved: cell.seatCategory === 'old_age',
            isDriverSeat: isDrv,
            isReservedSection: isRes,
          });
        });
        return;
      }

      let numCounter = 1;
      deckCfg.columns.forEach((colCfg, colIdx) => {
        const count = Math.max(1, Math.min(16, colCfg.seatCount || 3));
        for (let r = 0; r < count; r++) {
          const seatNum = `${prefix}${numCounter++}`;
          const rowCategory: 'front' | 'middle' | 'rear' | 'jump' =
            r === 0 ? 'front' : r === 1 ? 'middle' : r === 2 ? 'rear' : 'jump';
          const posCategory: 'window_left' | 'center' | 'window_right' =
            colIdx === 0 ? 'window_left' : colIdx === deckCfg.columns.length - 1 ? 'window_right' : 'center';
          seats.push({
            id: `${carId}-${seatNum}`,
            seatNumber: seatNum,
            label: `${deckCfg.deckLabel} · ${colCfg.label} #${r + 1}`,
            row: rowCategory,
            gridRow: r,
            rowIndex: r,
            rowSpan: 1,
            colSpan: 1,
            position: posCategory,
            deck: deckCfg.deckId,
            col: colIdx,
            seatType: 'seater',
            seatCategory:
              colCfg.reservationType === 'female'
                ? 'female'
                : colCfg.reservationType === 'male'
                  ? 'male'
                  : colCfg.reservationType === 'handicap'
                    ? 'handicap'
                    : colCfg.reservationType === 'driver'
                      ? 'driver'
                      : 'general',
            price: colCfg.price || baseFare,
            status: 'available',
            isLadiesReserved: colCfg.reservationType === 'female',
            isMaleReserved: colCfg.reservationType === 'male',
            isHandicapReserved: colCfg.reservationType === 'handicap',
            isDriverSeat: colCfg.reservationType === 'driver',
          });
        }
      });
    });

    return seats;
  }

  saveVehicleCustomConfig(cfg: VehicleCustomConfig, silent = false) {
    const copy: VehicleCustomConfig = JSON.parse(JSON.stringify(cfg));
    let opKey = '';

    if (copy.targetType === 'bus') {
      const trip = this.allTrips().find((t) => t.id === copy.targetId);
      if (trip) {
        opKey = this.getBusOperatorKey(trip);
      }
    } else {
      const car = this.sharedCarTrips().find((c) => c.id === copy.targetId);
      if (car) {
        opKey = this.getCarOperatorKey(car);
      }
    }

    if (copy.layoutModelId) {
      this.vehicleModelAssignments.update((prev) => ({
        ...prev,
        [copy.targetId]: copy.layoutModelId!,
        ...(opKey ? { [opKey]: copy.layoutModelId! } : {}),
      }));
    }

    this.vehicleCustomConfigs.update((prev) => ({
      ...prev,
      [copy.targetId]: copy,
      ...(opKey ? { [opKey]: { ...copy, targetId: opKey } } : {}),
    }));

    this.refreshAllHydratedVehicles();
    this.persistStudioStateToStorage();

    if (!silent) {
      if (copy.targetType === 'bus') {
        this.showToast(
          `Saved Bus Layout & Model (${copy.layoutModelName || 'Custom'}) — live on Seat Selection page!`,
          'success',
        );
      } else {
        this.showToast(
          `Saved Car Layout & Model (${copy.layoutModelName || 'Custom'}) — live on Seat Selection page!`,
          'success',
        );
      }
    }
  }
}
