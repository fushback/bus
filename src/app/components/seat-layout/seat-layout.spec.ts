import {TestBed, ComponentFixture, fakeAsync, tick} from '@angular/core/testing';
import {provideHttpClient} from '@angular/common/http';
import {SeatLayout} from './seat-layout';
import {BookingState} from '../../services/booking-state';
import {Seat, Trip} from '../../models/bus-booking.models';

describe('SeatLayoutComponent & BookingState', () => {
  let fixture: ComponentFixture<SeatLayout>;
  let component: SeatLayout;
  let state: BookingState;

  const mockTrip: Trip = {
    id: 'test-trip-1',
    busId: 'test-bus-1',
    bus: {
      id: 'test-bus-1',
      operatorName: 'IntrCity SmartBus',
      busNumber: 'KA-01-AK-7788',
      busType: 'ac_sleeper',
      totalSeats: 36,
      amenities: ['Wifi', 'Water Bottle'],
      rating: 4.8,
      totalReviews: 120,
      hasAc: true,
      isLiveTracking: true,
    },
    sourceCityId: 'c1',
    sourceCityName: 'Bengaluru',
    destinationCityId: 'c2',
    destinationCityName: 'Hyderabad',
    departureTime: '21:00',
    arrivalTime: '06:00',
    duration: '9h',
    date: '2026-10-15',
    baseFare: 1000,
    availableSeatsCount: 30,
    boardingPoints: [{ id: 'bp1', time: '21:00', location: 'Majestic', landmark: 'Platform 1' }],
    droppingPoints: [{ id: 'dp1', time: '06:00', location: 'Gachibowli', landmark: 'Toll' }],
    seats: [
      {
        id: 's-l1',
        busId: 'test-bus-1',
        seatNumber: 'L1',
        deck: 'lower',
        row: 0,
        col: 0,
        seatType: 'sleeper',
        fareMultiplier: 1.0,
        isLadiesReserved: false,
        status: 'available',
      },
      {
        id: 's-l2',
        busId: 'test-bus-1',
        seatNumber: 'L2',
        deck: 'lower',
        row: 0,
        col: 2,
        seatType: 'sleeper',
        fareMultiplier: 1.0,
        isLadiesReserved: false,
        status: 'booked',
      },
      {
        id: 's-l3',
        busId: 'test-bus-1',
        seatNumber: 'L3',
        deck: 'lower',
        row: 0,
        col: 3,
        seatType: 'sleeper',
        fareMultiplier: 1.0,
        isLadiesReserved: true,
        status: 'available',
      },
      {
        id: 's-u1',
        busId: 'test-bus-1',
        seatNumber: 'U1',
        deck: 'upper',
        row: 0,
        col: 0,
        seatType: 'sleeper',
        fareMultiplier: 1.15,
        isLadiesReserved: false,
        status: 'available',
      },
      {
        id: 's-u2',
        busId: 'test-bus-1',
        seatNumber: 'U2',
        deck: 'upper',
        row: 0,
        col: 2,
        seatType: 'sleeper',
        fareMultiplier: 1.0,
        isLadiesReserved: false,
        status: 'locked',
        lockedByUserId: 'other-user',
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatLayout],
      providers: [BookingState, provideHttpClient()],
    }).compileComponents();

    state = TestBed.inject(BookingState);
    state.selectedTrip.set(mockTrip);

    fixture = TestBed.createComponent(SeatLayout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and display the seat layout component', () => {
    expect(component).toBeTruthy();
    expect(state.selectedTrip()?.id).toBe('test-trip-1');
  });

  it('should correctly filter seats by deck', () => {
    state.activeDeck.set('lower');
    const lowerSeat = component.getSeatAt('lower', 0, 0);
    expect(lowerSeat).toBeDefined();
    expect(lowerSeat?.seatNumber).toBe('L1');

    state.activeDeck.set('upper');
    const upperSeat = component.getSeatAt('upper', 0, 0);
    expect(upperSeat).toBeDefined();
    expect(upperSeat?.seatNumber).toBe('U1');
  });

  it('should allow selecting an available seat and start the 5-minute hold timer', () => {
    const seatL1 = mockTrip.seats[0]; // Available
    state.toggleSeat(seatL1);

    expect(state.selectedSeats().length).toBe(1);
    expect(state.selectedSeats()[0].seatNumber).toBe('L1');
    expect(state.activeHold()).toBeTruthy();
    expect(state.holdCountdownSeconds()).toBe(300); // 5 minutes = 300 seconds
  });

  it('should deselect a seat when clicked again and release hold if empty', () => {
    const seatL1 = mockTrip.seats[0];
    state.toggleSeat(seatL1);
    expect(state.selectedSeats().length).toBe(1);

    // Toggle again to deselect
    state.toggleSeat(seatL1);
    expect(state.selectedSeats().length).toBe(0);
    expect(state.activeHold()).toBeNull();
    expect(state.holdCountdownSeconds()).toBe(0);
  });

  it('should prevent selecting already booked seats', () => {
    const bookedSeat = mockTrip.seats[1]; // status: 'booked'
    state.toggleSeat(bookedSeat);

    expect(state.selectedSeats().length).toBe(0);
    expect(state.toastMessage()?.text).toContain('already booked');
  });

  it('should prevent selecting seats locked by another user (concurrency lock)', () => {
    const lockedSeat = mockTrip.seats[4]; // status: 'locked' by 'other-user'
    state.toggleSeat(lockedSeat);

    expect(state.selectedSeats().length).toBe(0);
    expect(state.toastMessage()?.text).toContain('currently locked');
  });

  it('should enforce maximum 6 seats limit per transaction', () => {
    const dummySeats: Seat[] = Array.from({ length: 6 }, (_, i) => ({
      id: `seat-${i}`,
      busId: 'test-bus-1',
      seatNumber: `L${i + 10}`,
      deck: 'lower',
      row: i,
      col: 0,
      seatType: 'sleeper',
      fareMultiplier: 1.0,
      isLadiesReserved: false,
      status: 'available',
    }));

    dummySeats.forEach((s) => state.toggleSeat(s));
    expect(state.selectedSeats().length).toBe(6);

    // Attempting 7th seat
    const extraSeat: Seat = {
      id: 'seat-extra',
      busId: 'test-bus-1',
      seatNumber: 'L99',
      deck: 'lower',
      row: 5,
      col: 2,
      seatType: 'sleeper',
      fareMultiplier: 1.0,
      isLadiesReserved: false,
      status: 'available',
    };

    state.toggleSeat(extraSeat);
    expect(state.selectedSeats().length).toBe(6);
    expect(state.toastMessage()?.text).toContain('maximum of 6 seats');
  });

  it('should decrement the 5-minute countdown timer each second and release seats on expiry', fakeAsync(() => {
    const seatL1 = mockTrip.seats[0];
    state.toggleSeat(seatL1);

    expect(state.holdCountdownSeconds()).toBe(300);

    // Fast-forward 10 seconds
    tick(10000);
    expect(state.holdCountdownSeconds()).toBe(290);

    // Fast-forward remaining 290 seconds (Total 300s)
    tick(290000);
    expect(state.holdCountdownSeconds()).toBe(0);
    expect(state.selectedSeats().length).toBe(0);
    expect(state.activeHold()).toBeNull();
  }));

  it('should calculate correct total price including base fare multipliers and 5% GST', () => {
    const seatL1 = mockTrip.seats[0]; // Multiplier 1.0 => 1000
    const seatU1 = mockTrip.seats[3]; // Multiplier 1.15 => 1150
    state.toggleSeat(seatL1);
    state.toggleSeat(seatU1);

    expect(state.totalBasePrice()).toBe(2150); // 1000 + 1150
    expect(state.gstTax()).toBe(Math.round(2150 * 0.05)); // 108
    expect(state.finalPayable()).toBe(2150 + 108); // 2258
  });
});
