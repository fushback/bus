import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  City,
  Trip,
  Seat,
  Booking,
  CarRental,
  CuratedTourTrip,
  SharedCarTrip,
  DestinationHotel,
  CouponOffer,
  UserProfile,
} from '../models/bus-booking.models';

export interface DatabaseStatusResponse {
  status: string;
  engine: string;
  schema: string;
  persistence?: string;
  latencyMs?: number;
  tables: {
    cities: number;
    trips: number;
    seatHolds: number;
    bookedSeats: number;
    bookings: number;
    cars?: number;
    sharedCarTrips?: number;
    hotels?: number;
    coupons?: number;
    users?: number;
    tourTrips?: number;
  };
  lastChecked: string;
}

export interface ConnectivityTestResponse {
  connected: boolean;
  latencyMs: number;
  roundtripMs?: number;
  probeKey?: string;
  database: string;
  schema: string;
  operationsVerified: string[];
  counts: {
    cities: number;
    trips: number;
    sharedCarTrips?: number;
    hotels?: number;
    coupons?: number;
    bookings: number;
  };
  timestamp: string;
  message: string;
}

export interface CouponValidationResponse {
  valid: boolean;
  coupon?: CouponOffer;
  discountAmount?: number;
  finalAmount?: number;
  message: string;
}

export interface AuthResponse {
  user: UserProfile;
  message?: string;
  session: {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  // 1. Database Status & Connectivity
  getDatabaseStatus(): Observable<DatabaseStatusResponse> {
    return this.http.get<DatabaseStatusResponse>(`${this.baseUrl}/database/status`);
  }

  testDatabaseConnectivity(): Observable<ConnectivityTestResponse> {
    return this.http.post<ConnectivityTestResponse>(`${this.baseUrl}/database/test-connectivity`, {});
  }

  seedDatabase(mode: 'reset' | 'append' = 'reset'): Observable<{
    success: boolean;
    message: string;
    counts: Record<string, number>;
  }> {
    return this.http.post<{
      success: boolean;
      message: string;
      counts: Record<string, number>;
    }>(`${this.baseUrl}/database/seed`, { mode });
  }

  // 2. Cities with State API & CRUD
  getCities(filters?: { state?: string; search?: string; limit?: number }): Observable<City[]> {
    let params = new HttpParams();
    if (filters?.state) params = params.set('state', filters.state);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.limit) params = params.set('limit', String(filters.limit));
    return this.http.get<City[]>(`${this.baseUrl}/cities`, { params });
  }

  getCitiesWithState(filters?: { state?: string; search?: string }): Observable<City[]> {
    let params = new HttpParams();
    if (filters?.state) params = params.set('state', filters.state);
    if (filters?.search) params = params.set('search', filters.search);
    return this.http.get<City[]>(`${this.baseUrl}/cities-with-state`, { params });
  }

  getCity(id: string): Observable<City> {
    return this.http.get<City>(`${this.baseUrl}/cities/${id}`);
  }

  createCity(payload: { name: string; state: string; code: string; popularTerminals: string[] }): Observable<{
    success: boolean;
    city: City;
    message: string;
  }> {
    return this.http.post<{ success: boolean; city: City; message: string }>(`${this.baseUrl}/cities`, payload);
  }

  updateCity(id: string, payload: Partial<City>): Observable<{
    success: boolean;
    city: City;
    message: string;
  }> {
    return this.http.put<{ success: boolean; city: City; message: string }>(`${this.baseUrl}/cities/${id}`, payload);
  }

  deleteCity(id: string): Observable<{
    success: boolean;
    deletedCity: City;
    message: string;
  }> {
    return this.http.delete<{ success: boolean; deletedCity: City; message: string }>(`${this.baseUrl}/cities/${id}`);
  }

  // 3. Trips CRUD & Search
  getTrips(): Observable<Trip[]> {
    return this.http.get<Trip[]>(`${this.baseUrl}/trips`);
  }

  searchTrips(
    sourceCityId: string,
    destinationCityId: string,
    date?: string,
    filters?: {
      busType?: string;
      hasAc?: string;
      departureTime?: string;
      quickFilter?: string;
      sortBy?: string;
    },
  ): Observable<Trip[]> {
    let params = new HttpParams()
      .set('sourceCityId', sourceCityId)
      .set('destinationCityId', destinationCityId);
    if (date) {
      params = params.set('date', date);
    }
    if (filters?.busType && filters.busType !== 'all') params = params.set('busType', filters.busType);
    if (filters?.hasAc && filters.hasAc !== 'all') params = params.set('hasAc', filters.hasAc);
    if (filters?.departureTime && filters.departureTime !== 'all') params = params.set('departureTime', filters.departureTime);
    if (filters?.quickFilter && filters.quickFilter !== 'all') params = params.set('quickFilter', filters.quickFilter);
    if (filters?.sortBy) params = params.set('sortBy', filters.sortBy);
    return this.http.get<Trip[]>(`${this.baseUrl}/trips/search`, { params });
  }

  getTrip(id: string): Observable<Trip> {
    return this.http.get<Trip>(`${this.baseUrl}/trips/${id}`);
  }

  createTrip(payload: Record<string, unknown>): Observable<{
    success: boolean;
    trip: Trip;
    message: string;
  }> {
    return this.http.post<{ success: boolean; trip: Trip; message: string }>(`${this.baseUrl}/trips`, payload);
  }

  updateTrip(id: string, payload: Record<string, unknown>): Observable<{
    success: boolean;
    trip: Trip;
    message: string;
  }> {
    return this.http.put<{ success: boolean; trip: Trip; message: string }>(`${this.baseUrl}/trips/${id}`, payload);
  }

  deleteTrip(id: string): Observable<{
    success: boolean;
    deletedTrip: Trip;
    message: string;
  }> {
    return this.http.delete<{ success: boolean; deletedTrip: Trip; message: string }>(`${this.baseUrl}/trips/${id}`);
  }

  // 4. Seats & 5-Min Atomic Hold
  getSeats(tripId: string): Observable<Seat[]> {
    return this.http.get<Seat[]>(`${this.baseUrl}/trips/${tripId}/seats`);
  }

  holdSeats(tripId: string, seatIds: string[], userId: string): Observable<{
    success: boolean;
    holdToken: string;
    expiresAt: string;
    remainingSeconds: number;
    message: string;
  }> {
    return this.http.post<{
      success: boolean;
      holdToken: string;
      expiresAt: string;
      remainingSeconds: number;
      message: string;
    }>(`${this.baseUrl}/trips/${tripId}/seats/hold`, { seatIds, userId });
  }

  releaseSeats(tripId: string, seatIds: string[]): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/trips/${tripId}/seats/hold`, {
      body: { seatIds },
    });
  }

  // 5. Bookings CRUD
  getBookings(userId?: string): Observable<Booking[]> {
    let params = new HttpParams();
    if (userId) {
      params = params.set('userId', userId);
    }
    return this.http.get<Booking[]>(`${this.baseUrl}/bookings`, { params });
  }

  checkout(payload: Record<string, unknown>): Observable<{
    success: boolean;
    booking: Booking;
    bookingId: string;
    bookingCode: string;
    status: string;
    paymentStatus: string;
    message: string;
  }> {
    return this.http.post<{
      success: boolean;
      booking: Booking;
      bookingId: string;
      bookingCode: string;
      status: string;
      paymentStatus: string;
      message: string;
    }>(`${this.baseUrl}/bookings/checkout`, payload);
  }

  updateBooking(id: string, payload: Record<string, unknown>): Observable<{
    success: boolean;
    booking: Booking;
    message: string;
  }> {
    return this.http.put<{ success: boolean; booking: Booking; message: string }>(`${this.baseUrl}/bookings/${id}`, payload);
  }

  cancelBooking(id: string): Observable<{
    success: boolean;
    booking: Booking;
    message: string;
  }> {
    return this.http.delete<{ success: boolean; booking: Booking; message: string }>(`${this.baseUrl}/bookings/${id}`);
  }

  deleteBooking(id: string): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/bookings/${id}`);
  }

  // 6. Cars & Shared Sawari Trips
  getCars(): Observable<CarRental[]> {
    return this.http.get<CarRental[]>(`${this.baseUrl}/cars`);
  }

  getSharedCarTrips(filters?: {
    source?: string;
    destination?: string;
    model?: string;
    hasAc?: string;
    quickFilter?: string;
    sortBy?: string;
    departureTime?: string;
  }): Observable<SharedCarTrip[]> {
    let params = new HttpParams();
    if (filters?.source) params = params.set('source', filters.source);
    if (filters?.destination) params = params.set('destination', filters.destination);
    if (filters?.model && filters.model !== 'all') params = params.set('model', filters.model);
    if (filters?.hasAc && filters.hasAc !== 'all') params = params.set('hasAc', filters.hasAc);
    if (filters?.quickFilter && filters.quickFilter !== 'all') params = params.set('quickFilter', filters.quickFilter);
    if (filters?.sortBy) params = params.set('sortBy', filters.sortBy);
    if (filters?.departureTime && filters.departureTime !== 'all') params = params.set('departureTime', filters.departureTime);
    return this.http.get<SharedCarTrip[]>(`${this.baseUrl}/cars/shared-trips`, { params });
  }

  createSharedCarTrip(payload: Partial<SharedCarTrip>): Observable<{
    success: boolean;
    sharedCarTrip: SharedCarTrip;
    message: string;
  }> {
    return this.http.post<{
      success: boolean;
      sharedCarTrip: SharedCarTrip;
      message: string;
    }>(`${this.baseUrl}/cars/shared-trips`, payload);
  }

  deleteSharedCarTrip(id: string): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/cars/shared-trips/${id}`);
  }

  holdSharedCarSeats(tripId: string, seatIds: string[], userId: string): Observable<{
    success: boolean;
    holdToken: string;
    expiresAt: string;
    remainingSeconds: number;
    message: string;
  }> {
    return this.http.post<{
      success: boolean;
      holdToken: string;
      expiresAt: string;
      remainingSeconds: number;
      message: string;
    }>(`${this.baseUrl}/cars/shared-trips/${tripId}/seats/hold`, { seatIds, userId });
  }

  releaseSharedCarSeats(tripId: string, seatIds: string[]): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/cars/shared-trips/${tripId}/seats/hold`, {
      body: { seatIds },
    });
  }

  bookSharedCarTrip(payload: {
    tripId: string;
    seatIds: string[];
    passengers?: { seatId?: string; seatNumber?: string; name: string; age?: number; gender?: string; fare?: number }[];
    selectedBoardingPointId: string;
    selectedDroppingPointId: string;
    couponCode?: string;
    discountAmount?: number;
    userId?: string;
  }): Observable<{
    success: boolean;
    booking: Booking;
    bookingId: string;
    bookingCode: string;
    driverInfo: { name: string; phone: string; vehicle: string; numberPlate: string };
    message: string;
  }> {
    return this.http.post<{
      success: boolean;
      booking: Booking;
      bookingId: string;
      bookingCode: string;
      driverInfo: { name: string; phone: string; vehicle: string; numberPlate: string };
      message: string;
    }>(`${this.baseUrl}/cars/shared-trips/book`, payload);
  }

  bookCar(payload: Record<string, unknown>): Observable<{
    success: boolean;
    booking: Booking;
    bookingId: string;
    bookingCode: string;
    message: string;
  }> {
    return this.http.post<{
      success: boolean;
      booking: Booking;
      bookingId: string;
      bookingCode: string;
      message: string;
    }>(`${this.baseUrl}/cars/book`, payload);
  }

  // 7. Hotels & Transit Stays CRUD & Booking
  getHotels(params?: {
    cityId?: string;
    cityName?: string;
    filter?: string;
    sort?: string;
  }): Observable<DestinationHotel[]> {
    let httpParams = new HttpParams();
    if (params?.cityId) httpParams = httpParams.set('cityId', params.cityId);
    if (params?.cityName) httpParams = httpParams.set('cityName', params.cityName);
    if (params?.filter && params.filter !== 'all') httpParams = httpParams.set('filter', params.filter);
    if (params?.sort) httpParams = httpParams.set('sort', params.sort);
    return this.http.get<DestinationHotel[]>(`${this.baseUrl}/hotels`, { params: httpParams });
  }

  createHotel(payload: Partial<DestinationHotel>): Observable<{
    success: boolean;
    hotel: DestinationHotel;
    message: string;
  }> {
    return this.http.post<{
      success: boolean;
      hotel: DestinationHotel;
      message: string;
    }>(`${this.baseUrl}/hotels`, payload);
  }

  deleteHotel(id: string): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/hotels/${id}`);
  }

  bookHotelStay(payload: {
    hotelId: string;
    checkInDate?: string;
    nights?: number;
    guestsCount?: number;
    roomsCount?: number;
    customerName?: string;
    userId?: string;
    couponCode?: string;
  }): Observable<{
    success: boolean;
    booking: Booking;
    bookingId: string;
    bookingCode: string;
    hotel: DestinationHotel;
    message: string;
  }> {
    return this.http.post<{
      success: boolean;
      booking: Booking;
      bookingId: string;
      bookingCode: string;
      hotel: DestinationHotel;
      message: string;
    }>(`${this.baseUrl}/hotels/book`, payload);
  }

  // 8. Coupons & Promo Offers
  getCoupons(category = 'all'): Observable<CouponOffer[]> {
    const params = new HttpParams().set('category', category);
    return this.http.get<CouponOffer[]>(`${this.baseUrl}/coupons`, { params });
  }

  validateCoupon(payload: {
    code: string;
    orderAmount: number;
    category?: string;
  }): Observable<CouponValidationResponse> {
    return this.http.post<CouponValidationResponse>(`${this.baseUrl}/coupons/validate`, payload);
  }

  createCoupon(payload: Partial<CouponOffer>): Observable<{
    success: boolean;
    coupon: CouponOffer;
    message: string;
  }> {
    return this.http.post<{
      success: boolean;
      coupon: CouponOffer;
      message: string;
    }>(`${this.baseUrl}/coupons`, payload);
  }

  deleteCoupon(code: string): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/coupons/${code}`);
  }

  // 9. Tour Trips (Curated Packages)
  getTourTrips(): Observable<CuratedTourTrip[]> {
    return this.http.get<CuratedTourTrip[]>(`${this.baseUrl}/tour-trips`);
  }

  bookTourTrip(payload: Record<string, unknown>): Observable<{
    success: boolean;
    booking: Booking;
    bookingId: string;
    bookingCode: string;
    message: string;
  }> {
    return this.http.post<{
      success: boolean;
      booking: Booking;
      bookingId: string;
      bookingCode: string;
      message: string;
    }>(`${this.baseUrl}/tour-trips/book`, payload);
  }

  // 10. User Auth & Profile
  signup(payload: {
    email: string;
    password?: string;
    fullName?: string;
    phone?: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/signup`, payload);
  }

  login(payload: { email: string; password?: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload);
  }

  getUserProfile(userId?: string, email?: string): Observable<{ user: UserProfile }> {
    let params = new HttpParams();
    if (userId) params = params.set('userId', userId);
    if (email) params = params.set('email', email);
    return this.http.get<{ user: UserProfile }>(`${this.baseUrl}/auth/profile`, { params });
  }

  updateUserProfile(payload: {
    userId?: string;
    email?: string;
    fullName?: string;
    phone?: string;
  }): Observable<{ success: boolean; user: UserProfile }> {
    return this.http.put<{ success: boolean; user: UserProfile }>(`${this.baseUrl}/auth/profile`, payload);
  }

  // 11. Google Maps Geocoding & Reverse Geocoding
  reverseGeocode(lat: number, lng: number): Observable<ReverseGeocodeResponse> {
    const params = new HttpParams().set('lat', String(lat)).set('lng', String(lng));
    return this.http.get<ReverseGeocodeResponse>(`${this.baseUrl}/maps/reverse-geocode`, { params });
  }
}

export interface ReverseGeocodeResponse {
  success: boolean;
  city: string;
  state: string;
  country: string;
  road?: string;
  sector?: string;
  area?: string;
  crossMain?: string;
  nearestAreaOrRoad: string;
  formattedAddress: string;
  lat: number;
  lng: number;
  matchedCity?: City | null;
}
