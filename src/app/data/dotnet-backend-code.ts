export const DOTNET_PROJECT_SETUP = `# =========================================================================
# STEP 1: CREATE .NET CORE 9.0 / 8.0 SOLUTION & WEB API PROJECT
# =========================================================================

# 1. Create a new Solution and Web API Project
dotnet new sln -n RedBusBookingSystem
dotnet new webapi -n RedBus.Api -controllers
dotnet sln add RedBus.Api/RedBus.Api.csproj

# 2. Navigate to project directory
cd RedBus.Api

# 3. Add NuGet Packages for PostgreSQL (EF Core) and Supabase
dotnet add package Npgsql.EntityFrameworkCore.PostgreSQL --version 9.0.0
dotnet add package Microsoft.EntityFrameworkCore.Design --version 9.0.0
dotnet add package Supabase --version 1.1.1
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer --version 9.0.0
dotnet add package Swashbuckle.AspNetCore --version 6.6.2

# 4. Restore dependencies
dotnet restore
`;

export const DOTNET_APPSETTINGS_JSON = `{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    /* 
     * DIRECT CONNECTION (Recommended for EF Core migrations & DDL): Port 5432
     * TRANSACTION POOLER (Recommended for serverless / high concurrency): Port 6543
     */
    "SupabasePostgres": "Host=db.iauhlbfzmfmeybxzfkwq.supabase.co;Port=5432;Database=postgres;SearchPath=redbus_db,public;Username=postgres;Password=RedBus@0904;SSL Mode=Require;Trust Server Certificate=true;Include Error Detail=true",
    "DedicatedPostgres": "Host=db.iauhlbfzmfmeybxzfkwq.supabase.co;Port=5432;Database=postgres;SearchPath=redbus_db,public;Username=postgres;Password=RedBus@0904;SSL Mode=Require;Trust Server Certificate=true;Include Error Detail=true"
  },
  "Supabase": {
    "Url": "https://iauhlbfzmfmeybxzfkwq.supabase.co",
    "Key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhdWhsYmZ6bWZtZXlieHpma3dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MjU4MzYsImV4cCI6MjEwNzIwMTgzNn0.fZQYUJc5O7XiKNabVlEhMWUrDKf95qGj_rs9yQV7wMw",
    "JwtSecret": "mLgCfpcBKoY4vDbMkkbEo0CjB9YWntFm1I3fz0m8Y+yJqq52QS8b8D09eO3QJzXKGcGyYPg5K3RZC4PLO/8EOg=="
  }
}`;

export const DOTNET_MODELS_CS = `namespace RedBus.Api.Models;

using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

// 1. City Entity
[Table("cities", Schema = "redbus_db")]
public class City
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(100)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("state")]
    public string State { get; set; } = string.Empty;

    [Required]
    [MaxLength(10)]
    [Column("code")]
    public string Code { get; set; } = string.Empty;

    [Column("popular_terminals", TypeName = "jsonb")]
    public string PopularTerminalsJson { get; set; } = "[]";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// 2. Bus Entity
[Table("buses", Schema = "redbus_db")]
public class Bus
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(150)]
    [Column("operator_name")]
    public string OperatorName { get; set; } = string.Empty;

    [Required]
    [MaxLength(30)]
    [Column("bus_number")]
    public string BusNumber { get; set; } = string.Empty;

    [Required]
    [Column("bus_type")]
    public string BusType { get; set; } = "ac_sleeper"; // sleeper, seater, semi_sleeper, ac_sleeper, volvo_multi_axle

    [Column("total_seats")]
    public int TotalSeats { get; set; } = 36;

    [Column("amenities")]
    public string[] Amenities { get; set; } = Array.Empty<string>();

    [Column("rating")]
    public decimal Rating { get; set; } = 4.5m;

    [Column("total_reviews")]
    public int TotalReviews { get; set; } = 0;

    [Column("has_ac")]
    public bool HasAc { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Seat> Seats { get; set; } = new List<Seat>();
}

// 3. Trip Entity (Route Schedule)
[Table("trips", Schema = "redbus_db")]
public class Trip
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("bus_id")]
    public Guid BusId { get; set; }
    public Bus Bus { get; set; } = null!;

    [Required]
    [Column("source_city_id")]
    public Guid SourceCityId { get; set; }
    public City SourceCity { get; set; } = null!;

    [Required]
    [Column("destination_city_id")]
    public Guid DestinationCityId { get; set; }
    public City DestinationCity { get; set; } = null!;

    [Column("departure_time")]
    public DateTime DepartureTime { get; set; }

    [Column("arrival_time")]
    public DateTime ArrivalTime { get; set; }

    [Column("base_fare")]
    public decimal BaseFare { get; set; }

    [Column("boarding_points", TypeName = "jsonb")]
    public string BoardingPointsJson { get; set; } = "[]";

    [Column("dropping_points", TypeName = "jsonb")]
    public string DroppingPointsJson { get; set; } = "[]";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// 4. Seat Entity (Bus Layout Grid)
[Table("seats", Schema = "redbus_db")]
public class Seat
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("bus_id")]
    public Guid BusId { get; set; }
    public Bus Bus { get; set; } = null!;

    [Required]
    [MaxLength(10)]
    [Column("seat_number")]
    public string SeatNumber { get; set; } = string.Empty;

    [Required]
    [Column("deck")]
    public string Deck { get; set; } = "lower"; // "lower" or "upper"

    [Column("row_index")]
    public int RowIndex { get; set; }

    [Column("col_index")]
    public int ColIndex { get; set; }

    [Column("seat_type")]
    public string SeatType { get; set; } = "sleeper";

    [Column("fare_multiplier")]
    public decimal FareMultiplier { get; set; } = 1.00m;

    [Column("is_ladies_reserved")]
    public bool IsLadiesReserved { get; set; } = false;

    [Column("gender_preference")]
    public string GenderPreference { get; set; } = "any";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// 5. SeatHold Entity (Temporary 5-Minute Concurrency Lock)
[Table("seat_holds", Schema = "redbus_db")]
public class SeatHold
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("trip_id")]
    public Guid TripId { get; set; }

    [Required]
    [Column("seat_id")]
    public Guid SeatId { get; set; }

    [Required]
    [Column("user_id")]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(64)]
    [Column("hold_token")]
    public string HoldToken { get; set; } = string.Empty;

    [Column("expires_at")]
    public DateTime ExpiresAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// 6. Booking Entity (Confirmed Order)
[Table("bookings", Schema = "redbus_db")]
public class Booking
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(20)]
    [Column("booking_code")]
    public string BookingCode { get; set; } = string.Empty;

    [Required]
    [Column("user_id")]
    public Guid UserId { get; set; }

    [Required]
    [Column("trip_id")]
    public Guid TripId { get; set; }
    public Trip Trip { get; set; } = null!;

    [Column("total_amount")]
    public decimal TotalAmount { get; set; }

    [Column("tax_amount")]
    public decimal TaxAmount { get; set; }

    [Column("booking_status")]
    public string BookingStatus { get; set; } = "confirmed";

    [Column("payment_status")]
    public string PaymentStatus { get; set; } = "completed";

    [MaxLength(100)]
    [Column("payment_reference")]
    public string? PaymentReference { get; set; }

    [MaxLength(50)]
    [Column("payment_method")]
    public string? PaymentMethod { get; set; }

    [Column("selected_boarding_point", TypeName = "jsonb")]
    public string SelectedBoardingPointJson { get; set; } = "{}";

    [Column("selected_dropping_point", TypeName = "jsonb")]
    public string SelectedDroppingPointJson { get; set; } = "{}";

    [Column("passenger_details", TypeName = "jsonb")]
    public string PassengerDetailsJson { get; set; } = "[]";

    [Column("seat_numbers")]
    public string[] SeatNumbers { get; set; } = Array.Empty<string>();

    [Column("booked_at")]
    public DateTime BookedAt { get; set; } = DateTime.UtcNow;

    public ICollection<BookingItem> Items { get; set; } = new List<BookingItem>();
}

// 7. BookingItem Entity
[Table("booking_items", Schema = "redbus_db")]
public class BookingItem
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [Column("booking_id")]
    public Guid BookingId { get; set; }
    public Booking Booking { get; set; } = null!;

    [Required]
    [Column("seat_id")]
    public Guid SeatId { get; set; }

    [Required]
    [MaxLength(120)]
    [Column("passenger_name")]
    public string PassengerName { get; set; } = string.Empty;

    [Column("passenger_age")]
    public int PassengerAge { get; set; }

    [Required]
    [MaxLength(10)]
    [Column("passenger_gender")]
    public string PassengerGender { get; set; } = "male";

    [Column("fare")]
    public decimal Fare { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
`;

export const DOTNET_DBCONTEXT_CS = `namespace RedBus.Api.Data;

using Microsoft.EntityFrameworkCore;
using RedBus.Api.DTOs;
using RedBus.Api.Models;

public class BusBookingDbContext : DbContext
{
    public BusBookingDbContext(DbContextOptions<BusBookingDbContext> options) : base(options) { }

    public DbSet<City> Cities => Set<City>();
    public DbSet<Bus> Buses => Set<Bus>();
    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<Seat> Seats => Set<Seat>();
    public DbSet<SeatHold> SeatHolds => Set<SeatHold>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<BookingItem> BookingItems => Set<BookingItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // PostgreSQL Enum mappings
        modelBuilder.HasPostgresEnum("bus_type", new[] { "sleeper", "seater", "semi_sleeper", "ac_sleeper", "volvo_multi_axle" });
        modelBuilder.HasPostgresEnum("seat_type", new[] { "seater", "sleeper" });
        modelBuilder.HasPostgresEnum("deck_type", new[] { "lower", "upper" });

        // Table Mappings
        modelBuilder.Entity<City>().ToTable("cities", "redbus_db");
        modelBuilder.Entity<Bus>().ToTable("buses", "redbus_db");
        modelBuilder.Entity<Trip>().ToTable("trips", "redbus_db");
        modelBuilder.Entity<Seat>().ToTable("seats", "redbus_db");
        modelBuilder.Entity<SeatHold>().ToTable("seat_holds", "redbus_db");
        modelBuilder.Entity<Booking>().ToTable("bookings", "redbus_db");
        modelBuilder.Entity<BookingItem>().ToTable("booking_items", "redbus_db");

        // Relationships
        modelBuilder.Entity<Trip>()
            .HasOne(t => t.SourceCity)
            .WithMany()
            .HasForeignKey(t => t.SourceCityId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Trip>()
            .HasOne(t => t.DestinationCity)
            .WithMany()
            .HasForeignKey(t => t.DestinationCityId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Seat>()
            .HasIndex(s => new { s.BusId, s.Deck, s.SeatNumber })
            .IsUnique();

        modelBuilder.Entity<SeatHold>()
            .HasIndex(sh => new { sh.TripId, sh.SeatId })
            .IsUnique();

        // Stored procedure return keyless entity types
        modelBuilder.Entity<SeatHoldProcResult>().HasNoKey();
        modelBuilder.Entity<FinalizeBookingProcResult>().HasNoKey();
    }
}
`;

export const DOTNET_DTOS_CS = `namespace RedBus.Api.DTOs;

public record TripSearchResultDto
{
    public Guid TripId { get; init; }
    public Guid BusId { get; init; }
    public string OperatorName { get; init; } = string.Empty;
    public string BusNumber { get; init; } = string.Empty;
    public string BusType { get; init; } = string.Empty;
    public decimal Rating { get; init; }
    public int TotalReviews { get; init; }
    public bool HasAc { get; init; }
    public string[] Amenities { get; init; } = Array.Empty<string>();
    public string SourceCity { get; init; } = string.Empty;
    public string DestinationCity { get; init; } = string.Empty;
    public DateTime DepartureTime { get; init; }
    public DateTime ArrivalTime { get; init; }
    public string Duration { get; init; } = string.Empty;
    public decimal BaseFare { get; init; }
    public int AvailableSeats { get; init; }
}

public record SeatAvailabilityDto
{
    public Guid SeatId { get; init; }
    public string SeatNumber { get; init; } = string.Empty;
    public string Deck { get; init; } = "lower";
    public int RowIndex { get; init; }
    public int ColIndex { get; init; }
    public string SeatType { get; init; } = "sleeper";
    public decimal FareMultiplier { get; init; }
    public decimal CalculatedFare { get; init; }
    public bool IsLadiesReserved { get; init; }
    public string Status { get; init; } = "available"; // "available" | "locked" | "booked"
    public bool IsHeldByCurrentUser { get; init; }
    public int LockRemainingSeconds { get; init; }
}

public record HoldSeatsRequestDto(List<Guid> SeatIds);
public record ReleaseSeatsRequestDto(List<Guid> SeatIds);

public record SeatHoldResultDto
{
    public bool Success { get; init; }
    public string? HoldToken { get; init; }
    public DateTime? ExpiresAt { get; init; }
    public int RemainingSeconds { get; init; }
    public string Message { get; init; } = string.Empty;
}

public record PassengerDto(Guid SeatId, string Name, int Age, string Gender, decimal Fare);
public record StopPointDto(string Id, string Time, string Location, string Landmark);

public record CheckoutRequestDto
{
    public Guid TripId { get; init; }
    public List<Guid> SeatIds { get; init; } = new();
    public List<PassengerDto> Passengers { get; init; } = new();
    public StopPointDto SelectedBoardingPoint { get; init; } = null!;
    public StopPointDto SelectedDroppingPoint { get; init; } = null!;
    public decimal TotalAmount { get; init; }
    public decimal TaxAmount { get; init; }
    public string PaymentMethod { get; init; } = "UPI";
    public string PaymentReference { get; init; } = string.Empty;
}

public record BookingConfirmationDto
{
    public Guid BookingId { get; init; }
    public string BookingCode { get; init; } = string.Empty;
    public string Status { get; init; } = "confirmed";
    public string Message { get; init; } = string.Empty;
}

// Stored procedure direct SQL query result types
public class SeatHoldProcResult
{
    public bool success { get; set; }
    public string? hold_token { get; set; }
    public DateTime? expires_at { get; set; }
    public Guid? conflict_seat_id { get; set; }
    public string message { get; set; } = string.Empty;
}

public class FinalizeBookingProcResult
{
    public bool success { get; set; }
    public Guid booking_id { get; set; }
    public string booking_code { get; set; } = string.Empty;
    public string message { get; set; } = string.Empty;
}
`;

export const DOTNET_SERVICES_CS = `namespace RedBus.Api.Services;

using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using RedBus.Api.Data;
using RedBus.Api.DTOs;

// =========================================================================
// 1. TRIP SEARCH SERVICE
// =========================================================================
public interface ITripSearchService
{
    Task<List<TripSearchResultDto>> SearchTripsAsync(Guid sourceCityId, Guid destinationCityId, DateOnly travelDate);
}

public class TripSearchService : ITripSearchService
{
    private readonly BusBookingDbContext _db;

    public TripSearchService(BusBookingDbContext db) => _db = db;

    public async Task<List<TripSearchResultDto>> SearchTripsAsync(Guid sourceCityId, Guid destinationCityId, DateOnly travelDate)
    {
        var startOfDay = travelDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
        var endOfDay = travelDate.ToDateTime(TimeOnly.MaxValue, DateTimeKind.Utc);

        var trips = await _db.Trips
            .AsNoTracking()
            .Include(t => t.Bus)
            .Include(t => t.SourceCity)
            .Include(t => t.DestinationCity)
            .Where(t => t.SourceCityId == sourceCityId &&
                        t.DestinationCityId == destinationCityId &&
                        t.DepartureTime >= startOfDay &&
                        t.DepartureTime <= endOfDay)
            .OrderBy(t => t.DepartureTime)
            .ToListAsync();

        var result = new List<TripSearchResultDto>();

        foreach (var t in trips)
        {
            var bookedSeatsCount = await _db.BookingItems
                .CountAsync(bi => bi.Booking.TripId == t.Id && bi.Booking.BookingStatus == "confirmed");

            var activeHoldsCount = await _db.SeatHolds
                .CountAsync(sh => sh.TripId == t.Id && sh.ExpiresAt > DateTime.UtcNow);

            var availableCount = t.Bus.TotalSeats - (bookedSeatsCount + activeHoldsCount);

            result.Add(new TripSearchResultDto
            {
                TripId = t.Id,
                BusId = t.BusId,
                OperatorName = t.Bus.OperatorName,
                BusNumber = t.Bus.BusNumber,
                BusType = t.Bus.BusType,
                Rating = t.Bus.Rating,
                TotalReviews = t.Bus.TotalReviews,
                HasAc = t.Bus.HasAc,
                Amenities = t.Bus.Amenities,
                SourceCity = t.SourceCity.Name,
                DestinationCity = t.DestinationCity.Name,
                DepartureTime = t.DepartureTime,
                ArrivalTime = t.ArrivalTime,
                Duration = $"{(t.ArrivalTime - t.DepartureTime).Hours}h {(t.ArrivalTime - t.DepartureTime).Minutes}m",
                BaseFare = t.BaseFare,
                AvailableSeats = Math.Max(0, availableCount)
            });
        }

        return result;
    }
}

// =========================================================================
// 2. SEAT SERVICE (Seat Grid Matrix & Live Hold Statuses)
// =========================================================================
public interface ISeatService
{
    Task<List<SeatAvailabilityDto>> GetSeatAvailabilityAsync(Guid tripId, Guid? currentUserId);
}

public class SeatService : ISeatService
{
    private readonly BusBookingDbContext _db;

    public SeatService(BusBookingDbContext db) => _db = db;

    public async Task<List<SeatAvailabilityDto>> GetSeatAvailabilityAsync(Guid tripId, Guid? currentUserId)
    {
        var trip = await _db.Trips.Include(t => t.Bus).FirstOrDefaultAsync(t => t.Id == tripId)
            ?? throw new KeyNotFoundException($"Trip {tripId} not found.");

        var allSeats = await _db.Seats
            .AsNoTracking()
            .Where(s => s.BusId == trip.BusId)
            .OrderBy(s => s.Deck)
            .ThenBy(s => s.RowIndex)
            .ThenBy(s => s.ColIndex)
            .ToListAsync();

        var bookedSeatIds = await _db.BookingItems
            .AsNoTracking()
            .Where(bi => bi.Booking.TripId == tripId && bi.Booking.BookingStatus == "confirmed")
            .Select(bi => bi.SeatId)
            .ToListAsync();

        var now = DateTime.UtcNow;
        var activeHolds = await _db.SeatHolds
            .AsNoTracking()
            .Where(sh => sh.TripId == tripId && sh.ExpiresAt > now)
            .ToListAsync();

        return allSeats.Select(s =>
        {
            string status = "available";
            int remainingSeconds = 0;
            bool isHeldByCurrentUser = false;

            if (bookedSeatIds.Contains(s.Id))
            {
                status = "booked";
            }
            else
            {
                var hold = activeHolds.FirstOrDefault(h => h.SeatId == s.Id);
                if (hold != null)
                {
                    status = "locked";
                    remainingSeconds = (int)Math.Max(0, (hold.ExpiresAt - now).TotalSeconds);
                    isHeldByCurrentUser = (currentUserId.HasValue && hold.UserId == currentUserId.Value);
                }
            }

            return new SeatAvailabilityDto
            {
                SeatId = s.Id,
                SeatNumber = s.SeatNumber,
                Deck = s.Deck,
                RowIndex = s.RowIndex,
                ColIndex = s.ColIndex,
                SeatType = s.SeatType,
                FareMultiplier = s.FareMultiplier,
                CalculatedFare = Math.Round(trip.BaseFare * s.FareMultiplier, 2),
                IsLadiesReserved = s.IsLadiesReserved,
                Status = status,
                IsHeldByCurrentUser = isHeldByCurrentUser,
                LockRemainingSeconds = remainingSeconds
            };
        }).ToList();
    }
}

// =========================================================================
// 3. BOOKING SERVICE (Atomic 5-Minute Concurrency Engine)
// =========================================================================
public interface IBookingService
{
    Task<SeatHoldResultDto> AcquireSeatHoldAsync(Guid tripId, List<Guid> seatIds, Guid userId, int durationSeconds = 300);
    Task<bool> ReleaseSeatHoldAsync(Guid tripId, List<Guid> seatIds, Guid userId);
    Task<BookingConfirmationDto> FinalizeBookingAsync(CheckoutRequestDto request, Guid userId);
}

public class BookingService : IBookingService
{
    private readonly BusBookingDbContext _db;

    public BookingService(BusBookingDbContext db) => _db = db;

    // Calls PostgreSQL redbus_db.acquire_seat_hold() with atomic row locks
    public async Task<SeatHoldResultDto> AcquireSeatHoldAsync(Guid tripId, List<Guid> seatIds, Guid userId, int durationSeconds = 300)
    {
        var sql = @"
            SELECT success, hold_token, expires_at, conflict_seat_id, message 
            FROM redbus_db.acquire_seat_hold(@trip_id, @seat_ids, @user_id, @duration)";

        var tripParam = new NpgsqlParameter("trip_id", tripId);
        var seatsParam = new NpgsqlParameter("seat_ids", seatIds.ToArray());
        var userParam = new NpgsqlParameter("user_id", userId);
        var durationParam = new NpgsqlParameter("duration", durationSeconds);

        var result = await _db.Database
            .SqlQueryRaw<SeatHoldProcResult>(sql, tripParam, seatsParam, userParam, durationParam)
            .FirstOrDefaultAsync();

        if (result == null || !result.success)
        {
            return new SeatHoldResultDto
            {
                Success = false,
                Message = result?.message ?? "Seat lock failed. Seat is already held by another user."
            };
        }

        return new SeatHoldResultDto
        {
            Success = true,
            HoldToken = result.hold_token,
            ExpiresAt = result.expires_at,
            RemainingSeconds = durationSeconds,
            Message = result.message
        };
    }

    public async Task<bool> ReleaseSeatHoldAsync(Guid tripId, List<Guid> seatIds, Guid userId)
    {
        var sql = "SELECT redbus_db.release_seat_hold(@trip_id, @seat_ids, @user_id)";
        var tripParam = new NpgsqlParameter("trip_id", tripId);
        var seatsParam = new NpgsqlParameter("seat_ids", seatIds.ToArray());
        var userParam = new NpgsqlParameter("user_id", userId);

        var ok = await _db.Database
            .SqlQueryRaw<bool>(sql, tripParam, seatsParam, userParam)
            .FirstOrDefaultAsync();

        return ok;
    }

    // Calls PostgreSQL redbus_db.finalize_booking() inside atomic transaction
    public async Task<BookingConfirmationDto> FinalizeBookingAsync(CheckoutRequestDto request, Guid userId)
    {
        var passengersJson = JsonSerializer.Serialize(request.Passengers);
        var boardingJson = JsonSerializer.Serialize(request.SelectedBoardingPoint);
        var droppingJson = JsonSerializer.Serialize(request.SelectedDroppingPoint);

        var sql = @"
            SELECT success, booking_id, booking_code, message
            FROM redbus_db.finalize_booking(
                @trip_id, @user_id, @seat_ids, @payment_ref, 
                @payment_method, @total_amount, @tax_amount, 
                @boarding::jsonb, @dropping::jsonb, @passengers::jsonb
            )";

        var pTrip = new NpgsqlParameter("trip_id", request.TripId);
        var pUser = new NpgsqlParameter("user_id", userId);
        var pSeats = new NpgsqlParameter("seat_ids", request.SeatIds.ToArray());
        var pPayRef = new NpgsqlParameter("payment_ref", request.PaymentReference);
        var pPayMethod = new NpgsqlParameter("payment_method", request.PaymentMethod);
        var pTotal = new NpgsqlParameter("total_amount", request.TotalAmount);
        var pTax = new NpgsqlParameter("tax_amount", request.TaxAmount);
        var pBoarding = new NpgsqlParameter("boarding", boardingJson);
        var pDropping = new NpgsqlParameter("dropping", droppingJson);
        var pPassengers = new NpgsqlParameter("passengers", passengersJson);

        var res = await _db.Database
            .SqlQueryRaw<FinalizeBookingProcResult>(
                sql, pTrip, pUser, pSeats, pPayRef, pPayMethod, pTotal, pTax, pBoarding, pDropping, pPassengers)
            .FirstOrDefaultAsync();

        if (res == null || !res.success)
        {
            throw new InvalidOperationException(res?.message ?? "Booking finalization failed: 5-minute hold expired.");
        }

        return new BookingConfirmationDto
        {
            BookingId = res.booking_id,
            BookingCode = res.booking_code,
            Status = "confirmed",
            Message = res.message
        };
    }
}
`;

export const DOTNET_CONTROLLERS_CS = `namespace RedBus.Api.Controllers;

using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RedBus.Api.DTOs;
using RedBus.Api.Services;

// 1. Trips Controller
[ApiController]
[Route("api/[controller]")]
public class TripsController : ControllerBase
{
    private readonly ITripSearchService _searchService;

    public TripsController(ITripSearchService searchService) => _searchService = searchService;

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] Guid sourceCityId, [FromQuery] Guid destinationCityId, [FromQuery] DateOnly travelDate)
    {
        if (sourceCityId == Guid.Empty || destinationCityId == Guid.Empty)
            return BadRequest("Source and Destination city IDs are required.");

        var results = await _searchService.SearchTripsAsync(sourceCityId, destinationCityId, travelDate);
        return Ok(results);
    }
}

// 2. Seats Controller (5-Minute Hold Concurrency)
[ApiController]
[Route("api/trips/{tripId:guid}/seats")]
public class SeatsController : ControllerBase
{
    private readonly ISeatService _seatService;
    private readonly IBookingService _bookingService;

    public SeatsController(ISeatService seatService, IBookingService bookingService)
    {
        _seatService = seatService;
        _bookingService = bookingService;
    }

    [HttpGet]
    public async Task<IActionResult> GetSeatLayout(Guid tripId)
    {
        var userId = GetCurrentUserId();
        var seats = await _seatService.GetSeatAvailabilityAsync(tripId, userId);
        return Ok(seats);
    }

    [HttpPost("hold")]
    [Authorize] // Requires valid Supabase JWT Bearer token
    public async Task<IActionResult> HoldSeats(Guid tripId, [FromBody] HoldSeatsRequestDto request)
    {
        if (request.SeatIds == null || !request.SeatIds.Any())
            return BadRequest("At least one seat ID must be selected.");

        if (request.SeatIds.Count > 6)
            return BadRequest("Maximum 6 seats per transaction.");

        var userId = GetCurrentUserId()!.Value;
        var holdResult = await _bookingService.AcquireSeatHoldAsync(tripId, request.SeatIds, userId, durationSeconds: 300);

        if (!holdResult.Success)
            return Conflict(holdResult); // HTTP 409 Conflict when locked by another user

        return Ok(holdResult);
    }

    [HttpDelete("hold")]
    [Authorize]
    public async Task<IActionResult> ReleaseSeats(Guid tripId, [FromBody] ReleaseSeatsRequestDto request)
    {
        var userId = GetCurrentUserId()!.Value;
        var success = await _bookingService.ReleaseSeatHoldAsync(tripId, request.SeatIds, userId);
        return Ok(new { success, message = "Seat hold released." });
    }

    private Guid? GetCurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        return Guid.TryParse(sub, out var guid) ? guid : null;
    }
}

// 3. Bookings Controller (Checkout & Finalization)
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(IBookingService bookingService) => _bookingService = bookingService;

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout([FromBody] CheckoutRequestDto request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub")!);

        try
        {
            var result = await _bookingService.FinalizeBookingAsync(request, userId);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
`;

export const DOTNET_PROGRAM_CS = `using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using RedBus.Api.Data;
using RedBus.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. EF Core Database Connection (PostgreSQL / Supabase)
var connectionString = builder.Configuration.GetConnectionString("SupabasePostgres")
    ?? throw new InvalidOperationException("Connection string 'SupabasePostgres' not found.");

builder.Services.AddDbContext<BusBookingDbContext>(options =>
{
    options.UseNpgsql(connectionString, npgsqlOptions =>
    {
        npgsqlOptions.EnableRetryOnFailure(maxRetryCount: 3);
        npgsqlOptions.CommandTimeout(30);
    });
});

// 2. Official Supabase C# Client SDK Registration
var supabaseUrl = builder.Configuration["Supabase:Url"]!;
var supabaseKey = builder.Configuration["Supabase:Key"]!;
builder.Services.AddScoped(_ => new Supabase.Client(supabaseUrl, supabaseKey, new Supabase.SupabaseOptions
{
    AutoRefreshToken = true,
    AutoConnectRealtime = true
}));

// 3. JWT Bearer Authentication (Validating Supabase Auth Tokens)
var jwtSecret = builder.Configuration["Supabase:JwtSecret"]!;
var key = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = true,
            ValidAudience = "authenticated",
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();

// 4. Register Core Business Domain Services
builder.Services.AddScoped<ITripSearchService, TripSearchService>();
builder.Services.AddScoped<ISeatService, SeatService>();
builder.Services.AddScoped<IBookingService, BookingService>();

// 5. Controllers & Swagger Documentation with Bearer Token Support
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "RedBus Reservation API",
        Version = "v1",
        Description = ".NET Core Web API with Supabase PostgreSQL & 5-Minute Seat Lock Concurrency"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Format: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// 6. CORS Policy for Angular Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngularDev");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
`;

export const DOTNET_SINGLE_PROJECT_SETUP = `# =========================================================================
# SINGLE-PROJECT RUNNER: .NET CORE 9.0 WEB API + ANGULAR INTEGRATED
# =========================================================================

### How to Run .NET Core Web API & Angular Together

There are two primary industry-standard patterns to run .NET Core and Angular together:

---

### PATTERN 1: Unified Single-Process Host (Production & Container Ready)
In this pattern, the compiled Angular SPA artifacts are served directly by ASP.NET Core
Static Files middleware, while all \`/api/*\` routes are routed to ASP.NET Core Controllers.

1. Configure RedBus.Api.csproj with SPA build targets:
\`\`\`xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <SpaRoot>../src</SpaRoot>
    <SpaProxyServerUrl>http://localhost:3000</SpaProxyServerUrl>
    <SpaProxyLaunchCommand>npm start</SpaProxyLaunchCommand>
  </PropertyGroup>

  <!-- Publish Angular build output into wwwroot during dotnet publish -->
  <Target Name="PublishRunWebpack" AfterTargets="ComputeFilesToPublish">
    <Exec WorkingDirectory="$(SpaRoot)" Command="npm install" />
    <Exec WorkingDirectory="$(SpaRoot)" Command="npm run build -- --output-path $(PublishDir)wwwroot" />
  </Target>
</Project>
\`\`\`

2. In Program.cs:
\`\`\`csharp
app.UseCors("AllowAngularDev");
app.UseAuthentication();
app.UseAuthorization();

// Serve Angular Static Assets from wwwroot
app.UseDefaultFiles();
app.UseStaticFiles();

// Map .NET API Controllers
app.MapControllers();

// SPA Fallback: Any non-API route returns index.html for Angular Router
app.MapFallbackToFile("index.html");

app.Run();
\`\`\`

3. Run with a single command:
\`\`\`bash
# Run both Backend API and Frontend in one process
dotnet run
# Browse to: http://localhost:5000 (Angular UI + /api/* endpoints live!)
\`\`\`

---

### PATTERN 2: Development Dual-Host with Angular Proxy (proxy.conf.json)
During development, run Angular dev server on port 3000 (with instant hot reloading)
and .NET Web API on port 5000 or 7198, forwarding all \`/api\` calls automatically.

1. Angular proxy.conf.json:
\`\`\`json
{
  "/api": {
    "target": "https://localhost:7198",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
\`\`\`

2. Start .NET Core Backend:
\`\`\`bash
cd backend/RedBus.Api
dotnet run
# Listening on https://localhost:7198 and http://localhost:5000
\`\`\`

3. Start Angular Client:
\`\`\`bash
npm start
# Listening on http://localhost:3000 (proxies /api to .NET Core)
\`\`\`
`;

export const SUPABASE_DATABASE_CREATION_GUIDE = `# =========================================================================
# HOW TO CREATE YOUR NEW SUPABASE DATABASE & CONNECT TO .NET CORE
# =========================================================================

### METHOD A: Via the Supabase Web Dashboard (Recommended)

1. Go to https://supabase.com/dashboard and click "New Project".
2. Select your Organization, name the project (e.g. 'redbus-booking-db'), set a strong database password, and choose your preferred Cloud Region (e.g. Mumbai 'ap-south-1' or Singapore 'ap-southeast-1').
3. Once provisioned (approx. 60 seconds), go to:
   - "Project Settings" -> "Database" -> "Connection string" -> Select "URI" or "Parameters".
4. Copy the connection string format:
   Host: db.[YOUR_PROJECT_REF].supabase.co
   Port: 5432 (Direct) or 6543 (Pooler)
   Database: postgres
   User: postgres
   Password: [YOUR_DATABASE_PASSWORD]
5. Go to the "SQL Editor" tab in Supabase:
   - Paste the complete Phase 1 SQL script (contains all tables, RLS, and stored procedures).
   - Click "Run". All 8 tables, indexes, and concurrency procedures are created instantly.
6. Go to "Project Settings" -> "API":
   - Copy the Project URL (https://[YOUR_PROJECT_REF].supabase.co).
   - Copy the anon key.
   - Copy the JWT Secret (needed in .NET Core JwtBearer authentication).

### METHOD B: Via the Supabase CLI (Local or CI/CD)

\`\`\`bash
# 1. Login to Supabase CLI
npx supabase login

# 2. Link your local project to your remote Supabase project
npx supabase link --project-ref [YOUR_PROJECT_REF]

# 3. Apply the migration file
npx supabase db push
\`\`\`

### METHOD C: Running EF Core Migrations from .NET Core

If you prefer EF Core to manage migrations:
\`\`\`bash
# Install EF Core CLI Tool
dotnet tool install --global dotnet-ef

# Generate Initial Migration
dotnet ef migrations add InitialCreate

# Update Database on Supabase
dotnet ef database update
\`\`\`
`;
