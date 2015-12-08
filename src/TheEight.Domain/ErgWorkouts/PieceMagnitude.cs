using System;
using NodaTime;

namespace TheEight.Domain.ErgWorkouts
{
    public struct PieceMagnitude
    {
        private readonly decimal _distance;
        private readonly Duration _duration;

        private PieceMagnitude(decimal meters)
        {
            if (meters <= 0)
            {
                var msg = $"The argument {nameof(meters)} must be positive.";
                throw new ArgumentOutOfRangeException(nameof(meters), meters, msg);
            }
            
            _distance = meters;
            _duration = Duration.Zero;
            Type = PieceType.FixedDistance;
        }
        
        private PieceMagnitude(Duration duration)
        {
            if (duration <= Duration.Zero)
            {
                var msg = $"The argument {nameof(duration)} must be positive.";
                throw new ArgumentOutOfRangeException(nameof(duration), duration, msg);
            }
            
            _distance = 0;
            _duration = duration;
            Type = PieceType.FixedDuration;
        }

        public static PieceMagnitude FromFixedMeters(decimal meters)
        {
            return new PieceMagnitude(meters);
        }

        public static PieceMagnitude FromFixedTotalDuration(Duration duration)
        {
            return new PieceMagnitude(duration);
        }
        
        public PieceType Type { get; }

        public decimal? DistanceInMeters => Type == PieceType.FixedDistance ? _distance : new decimal?();
        public Duration? TotalDuration => Type == PieceType.FixedDuration ? _duration : new Duration?();
                
        public static bool operator ==(PieceMagnitude x, PieceMagnitude y)
        {
            return x.Equals(y);
        }

        public static bool operator !=(PieceMagnitude x, PieceMagnitude y)
        {
            return !x.Equals(y);
        }

        public override bool Equals(object obj)
        {
            if (obj is PieceMagnitude)
            {
                var other = (PieceMagnitude)obj;

                return other._distance == _distance
                    && other._duration == _duration
                    && other.Type == Type;
            }

            return false;
        }

        public override int GetHashCode()
        {
            return new { _distance, _duration, Type }.GetHashCode();
        }
    }
}