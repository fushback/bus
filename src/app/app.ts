import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {HomeSearch} from './components/home-search/home-search';
import {ResultsView} from './components/results-view/results-view';
import {TripView} from './components/trip-view/trip-view';
import {AdminView} from './components/admin-view/admin-view';
import {SchemaViewer} from './components/schema-viewer/schema-viewer';
import {DotnetViewer} from './components/dotnet-viewer/dotnet-viewer';
import {TestRunner} from './components/test-runner/test-runner';
import {AuthModal} from './components/auth-modal/auth-modal';
import {TicketView} from './components/ticket-view/ticket-view';
import {CheckoutModal} from './components/checkout-modal/checkout-modal';
import {CouponModal} from './components/coupon-modal/coupon-modal';
import {FilterModal} from './components/filter-modal/filter-modal';
import {SeatLayout} from './components/seat-layout/seat-layout';
import {CarSeatLayout} from './components/car-seat-layout/car-seat-layout';
import {TransportSeatLayout} from './components/transport-seat-layout/transport-seat-layout';
import {BoardingDropping} from './components/boarding-dropping/boarding-dropping';
import {PassengerInfo} from './components/passenger-info/passenger-info';
import {BookingState} from './services/booking-state';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [
    MatIconModule,
    HomeSearch,
    ResultsView,
    SeatLayout,
    CarSeatLayout,
    TransportSeatLayout,
    BoardingDropping,
    PassengerInfo,
    TripView,
    AdminView,
    SchemaViewer,
    DotnetViewer,
    TestRunner,
    AuthModal,
    TicketView,
    CheckoutModal,
    CouponModal,
    FilterModal,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly state = inject(BookingState);
}
