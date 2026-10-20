export interface City {
  id: string;
  name: string;
  state: string;
  code: string;
  popularTerminals: string[];
}

export interface Bus {
  id: string;
  operatorName: string;
  busNumber: string;
  busType: 'sleeper' | 'seater' | 'semi_sleeper' | 'ac_sleeper' | 'volvo_multi_axle';
  totalSeats: number;
  amenities: string[];
  rating: number;
  totalReviews: number;
  hasAc: boolean;
  isLiveTracking: boolean;
  isPrimo?: boolean;
  isEcoFriendly?: boolean;
  isBestPrice?: boolean;
  offerTag?: string;
  hasLadiesSeats?: boolean;
}

export interface BoardingPoint {
  id: string;
  name?: string;
  time: string;
  location: string;
  landmark: string;
}

export interface DroppingPoint {
  id: string;
  name?: string;
  time: string;
  location: string;
  landmark: string;
}

export type SeatStatus = 'available' | 'locked' | 'booked' | 'selected';

export type SeatCategory =
  | 'driver'
  | 'general'
  | 'female'
  | 'male'
  | 'handicap'
  | 'old_age'
  | 'toilet'
  | 'cafeteria'
  | 'exit_entry'
  | 'reserved'
  | 'empty';
export type VehicleSeatFormat = 'seater' | 'sleeper' | 'both';

export interface Seat {
  id: string;
  tripId?: string;
  busId?: string;
  seatNumber: string;
  deck: 'lower' | 'middle' | 'upper';
  row: number;
  col: number;
  rowSpan?: number;
  colSpan?: number;
  seatType: 'sleeper' | 'seater';
  seatCategory?: SeatCategory;
  reservedLabel?: string;
  fareMultiplier: number;
  price?: number;
  status: SeatStatus;
  isLadiesReserved: boolean;
  isMaleReserved?: boolean;
  isHandicapReserved?: boolean;
  isOldAgeReserved?: boolean;
  isDriverSeat?: boolean;
  isReservedSection?: boolean;
  lockedByUserId?: string;
  lockExpiresAt?: number;
  remainingSeconds?: number;
}

export interface Trip {
  id: string;
  busId: string;
  bus: Bus;
  sourceCityId: string;
  sourceCityName: string;
  sourceCity?: City;
  destinationCityId: string;
  destinationCityName: string;
  destinationCity?: City;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  date: string;
  travelDate?: string;
  baseFare: number;
  availableSeatsCount: number;
  boardingPoints: BoardingPoint[];
  droppingPoints: DroppingPoint[];
  seats?: Seat[];
  offerTag?: string;
  hasOffer?: boolean;
  isNewBus?: boolean;
}

export interface ActiveSeatHold {
  holdToken: string;
  tripId: string;
  seatIds: string[];
  expiresAt: number;
  remainingSeconds: number;
}

export interface Passenger {
  seatNumber: string;
  seatId: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  fare: number;
}

export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  tripId: string;
  trip: Trip;
  bookingType?: 'bus' | 'shared_car' | 'cab_rental' | 'car_rental' | 'hotel' | 'tour' | 'transport';
  passengers: Passenger[];
  totalAmount: number;
  taxAmount: number;
  discountAmount?: number;
  couponCode?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired';
  paymentStatus: 'unpaid' | 'processing' | 'completed' | 'refunded';
  paymentReference: string;
  paymentMethod: string;
  selectedBoardingPoint: BoardingPoint;
  selectedDroppingPoint: DroppingPoint;
  bookedAt: string;
  createdAt?: string;
}

export interface CarRental {
  id: string;
  name: string;
  category: 'sedan' | 'suv' | 'luxury' | 'ev' | 'hatchback' | string;
  categoryLabel: string;
  seats: number;
  luggageCount: number;
  hasAc: boolean;
  pricePerKm: number;
  baseFare: number;
  fuelType: 'Diesel' | 'Petrol' | 'Electric' | 'CNG';
  transmission: 'Manual' | 'Automatic';
  rating: number;
  reviewsCount: number;
  features: string[];
  isAvailable: boolean;
}

export interface CarSeat {
  id: string;
  seatNumber: string;
  label: string;
  row: 'front' | 'middle' | 'rear' | 'jump';
  gridRow?: number;
  rowIndex?: number;
  rowSpan?: number;
  colSpan?: number;
  position: 'window_left' | 'center' | 'window_right' | 'jump_side';
  deck?: 'lower' | 'middle' | 'upper';
  col?: number;
  seatType?: 'seater' | 'sleeper';
  seatCategory?: SeatCategory;
  reservedLabel?: string;
  price: number;
  status: 'available' | 'booked' | 'locked' | 'selected';
  isLadiesReserved?: boolean;
  isMaleReserved?: boolean;
  isHandicapReserved?: boolean;
  isOldAgeReserved?: boolean;
  isDriverSeat?: boolean;
  isReservedSection?: boolean;
  bookedByGender?: 'male' | 'female';
  passengerName?: string;
  lockedByUserId?: string;
  lockExpiresAt?: number;
}

export interface SharedCarTrip {
  id: string;
  operatorName: string;
  vehicleName: string;
  vehicleModel: 'scorpio' | 'bolero' | 'cruiser' | 'sumo' | 'ertiga' | 'innova';
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  sourceCityId: string;
  sourceCityName: string;
  destinationCityId: string;
  destinationCityName: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  date: string;
  baseFare: number;
  hasAc: boolean;
  fuelType: 'Diesel' | 'Petrol' | 'CNG';
  totalSeats: number;
  availableSeatsCount: number;
  rating: number;
  totalReviews: number;
  frequency: string;
  features: string[];
  hasCaptainSeats?: boolean;
  offerTag?: string;
  hasOffer?: boolean;
  boardingPoints: BoardingPoint[];
  droppingPoints: DroppingPoint[];
  seats: CarSeat[];
}

export interface CuratedTourTrip {
  id: string;
  title: string;
  subtitle: string;
  sourceCity: string;
  destinationCity: string;
  durationDays: number;
  durationNights: number;
  category: 'weekend' | 'beach' | 'hill_station' | 'heritage' | 'adventure';
  basePrice: number;
  originalPrice: number;
  rating: number;
  reviewsCount: number;
  travelMode: 'Luxury Sleeper Bus' | 'Private AC Car' | 'Volvo Multi-Axle' | string;
  hotelType: '3-Star Premium Resort' | '4-Star Luxury Villa' | 'Boutique Heritage Stay' | string;
  mealsIncluded: string;
  highlights: string[];
  itinerary: { day: number; title: string; desc: string }[];
  badge?: string;
}

export interface DestinationHotel {
  id: string;
  cityId?: string;
  cityName: string;
  name: string;
  location: string;
  terminalDistance: string;
  rating: number;
  totalReviews: number;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  imageUrl: string;
  amenities: string[];
  tag: string;
  availableRooms?: number;
}

export interface CouponOffer {
  code: string;
  title: string;
  desc: string;
  badge: string;
  discount: number;
  minFare: number;
  category: 'all' | 'bus' | 'car' | 'hotel';
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  walletBalance: number;
  createdAt?: string;
}

// ============================================================================
// ADMIN SEAT LAYOUT & VEHICLE OFFCANVAS DETAILS STUDIO MODELS (2D GRID ENGINE)
// ============================================================================

export interface GridSeatCell {
  row: number;
  col: number;
  rowSpan?: number; // Default 1 for Seater, 2 for Sleeper, custom for Reserved/Toilet
  colSpan?: number; // Default 1
  coveredBy?: string; // "anchorRow-anchorCol" when covered by a multi-row/col seat or toilet
  seatNumber: string;
  seatCategory: SeatCategory; // 'driver' | 'general' | 'female' | 'male' | 'handicap' | 'reserved' | 'empty'
  seatType: 'seater' | 'sleeper';
  reservedLabel?: string; // e.g. 'Toilet', 'Cafeteria', 'Pantry', 'Luggage'
  price: number;
  status?: 'available' | 'booked';
}

export interface CustomColumnConfig {
  colIndex: number;
  label: string;
  seatCount: number;
  seatType: 'seater' | 'sleeper';
  price: number;
  reservationType: 'general' | 'male' | 'female' | 'handicap' | 'driver';
}

export interface CustomDeckConfig {
  deckId: 'lower' | 'middle' | 'upper';
  deckLabel: string;
  aisleAfterCol: number;
  columns: CustomColumnConfig[];
  gridRows?: number;
  gridCols?: number;
  gridCells?: GridSeatCell[];
}

export interface SafetyHighlightItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

export interface RouteStopItem {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  type: 'departure' | 'stop' | 'toll' | 'arrival';
}

export interface ReviewItem {
  id: string;
  author: string;
  tag: string;
  rating: number;
  comment: string;
}

export interface PolicySlabItem {
  id: string;
  windowLabel: string;
  ruleText: string;
  tone: 'positive' | 'warning' | 'danger';
}

export interface VehicleLayoutModel {
  id: string;
  name: string;
  code: string;
  vehicleType: 'bus' | 'car';
  vehicleSubType?: string; // e.g. 'Volvo Multi-Axle AC', 'BharatBenz Coach', 'SUV (Scorpio / Bolero)', 'MPV (Innova / Ertiga)'
  seatFormat: VehicleSeatFormat; // 'seater' | 'sleeper' | 'both'
  deckCount: 1 | 2 | 3; // 1 = Single Decker, 2 = Double Decker, 3 = Triple Decker
  driverPosition: 'right' | 'left' | 'center' | 'none';
  seaterDefaultRowSpan: number;
  seaterDefaultColSpan: number;
  sleeperDefaultRowSpan: number;
  sleeperDefaultColSpan: number;
  decks: CustomDeckConfig[];
  description?: string;
}

export interface VehicleCustomConfig {
  targetType: 'bus' | 'car';
  targetId: string;
  layoutModelId?: string;
  layoutModelName?: string;
  vehicleSubType?: string;
  seatFormat?: VehicleSeatFormat; // 'seater' | 'sleeper' | 'both'
  deckCount: 1 | 2 | 3; // 1 = Single Decker, 2 = Double Decker, 3 = Triple Decker
  driverPosition: 'right' | 'left' | 'center' | 'none';
  seaterRowSpan?: number; // Default: 1 row per seater
  seaterColSpan?: number; // Default: 1 col per seater
  sleeperRowSpan?: number; // Default: 2 rows per sleeper
  sleeperColSpan?: number; // Default: 1 col per sleeper
  seaterDefaultRowSpan?: number;
  seaterDefaultColSpan?: number;
  sleeperDefaultRowSpan?: number;
  sleeperDefaultColSpan?: number;
  decks: CustomDeckConfig[];
  // Offcanvas Details (7 Sections)
  safetyBadgeText: string;
  safetyHeadline: string;
  safetyDescription: string;
  safetyItems: SafetyHighlightItem[];
  boardingPoints: BoardingPoint[];
  droppingPoints: DroppingPoint[];
  routeStops: RouteStopItem[];
  reviewMetrics: {
    punctuality: number;
    cleanliness: number;
    staffBehavior: number;
    drivingSafety: number;
  };
  reviews: ReviewItem[];
  cancellationSlabs: PolicySlabItem[];
  dateChangeSlabs: PolicySlabItem[];
}
