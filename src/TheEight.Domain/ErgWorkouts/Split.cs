using System;
using NodaTime;

namespace TheEight.Domain.ErgWorkouts
{
    public struct Split : IComparable<Split>, IComparable<Duration>
    {
        private static readonly Duration MinSplit = Duration.FromMinutes(1);
        private static readonly Duration MaxSplit = Duration.FromMinutes(5);

        private readonly Duration _split;

        public Split(Duration splitDuration)
        {
            if (splitDuration <= MinSplit)
            {
                var msg = $"The argument {nameof(splitDuration)} must exceed {MinSplit}.";
                throw new ArgumentOutOfRangeException(nameof(splitDuration), splitDuration, msg);
            }

            if (splitDuration > MaxSplit)
            {
                var msg = $"The argument {nameof(splitDuration)} may not exceed {MaxSplit}.";
                throw new ArgumentOutOfRangeException(nameof(splitDuration), splitDuration, msg);
            }

            _split = splitDuration;
        }

        public Split(Duration totalDuration, decimal distance)
        {
            if (totalDuration <= Duration.Zero)
            {
                var msg = $"The argument {nameof(totalDuration)} must be positive.";
                throw new ArgumentOutOfRangeException(nameof(totalDuration), totalDuration, msg);
            }

            if (distance <= 0)
            {
                var msg = $"The argument {nameof(distance)} must be positive.";
                throw new ArgumentOutOfRangeException(nameof(distance), distance, msg);
            }

            var split = CalculateSplit(totalDuration, distance);

            if (split <= MinSplit)
            {
                var msg = $"The split calculated from the arguments {nameof(totalDuration)} and {nameof(distance)} must exceed {MinSplit}.";
                throw new ArgumentException(msg);
            }

            if (split > MaxSplit)
            {
                var msg = $"The split calculated from the arguments {nameof(totalDuration)} and {nameof(distance)} may not exceed {MaxSplit}.";
                throw new ArgumentException(msg);
            }

            _split = split;
        }

        public static Split FromSplitDuration(Duration split)
        {
            return new Split(split);
        }

        public Duration SplitDuration => _split;

        public Duration CalculateTotalDuration(decimal distance)
        {
            return CalculateDuration(_split, distance);
        }

        public decimal CalculateDistance(Duration totalDuration)
        {
            return CalculateDistance(_split, totalDuration);
        }

        public static implicit operator Split(Duration splitDuration)
        {
            return new Split(splitDuration);
        }

        public static bool operator ==(Split x, Split y)
        {
            return x.Equals(y);
        }

        public static bool operator !=(Split x, Split y)
        {
            return !x.Equals(y);
        }

        public static bool operator >(Split x, Split y)
        {
            return Compare(x, y) > 0;
        }

        public static bool operator <(Split x, Split y)
        {
            return Compare(x, y) < 0;
        }

        public int CompareTo(Split other)
        {
            return _split.CompareTo(other._split);
        }

        public static int Compare(Split x, Split y)
        {
            return x._split.CompareTo(y._split);
        }

        public int CompareTo(Duration other)
        {
            return _split.CompareTo(other);
        }

        public override bool Equals(object obj)
        {
            if (obj is Split)
            {
                var other = (Split)obj;
                return other._split == _split;
            }

            if (obj is Duration)
            {
                var other = (Duration)obj;
                return other == _split;
            }

            return false;
        }

        public override int GetHashCode()
        {
            return _split.GetHashCode();
        }

        private static Duration CalculateSplit(Duration totalDuration, decimal distance)
        {
            var fiveHundreds = decimal.Divide(distance, 500m);
            var splitTicks = decimal.Divide(totalDuration.Ticks, fiveHundreds);
            return Duration.FromTicks((long)splitTicks);
        }

        private static Duration CalculateDuration(Duration splitDuration, decimal distance)
        {
            var fiveHundreds = decimal.Divide(distance, 500m);
            var durationTicks = splitDuration.Ticks * fiveHundreds;
            return Duration.FromTicks((long)durationTicks);
        }

        private static decimal CalculateDistance(Duration splitDuration, Duration totalDuration)
        {
            var factor = decimal.Divide(totalDuration.Ticks, splitDuration.Ticks);
            return factor * 500m;
        }
    }
}