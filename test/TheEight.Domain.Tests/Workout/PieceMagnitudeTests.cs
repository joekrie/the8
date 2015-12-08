using System;
using NodaTime;
using TheEight.Domain.ErgWorkouts;
using Xunit;

namespace TheEight.Domain.Tests.Workout
{
    public class PieceMagnitudeTests
    {
        [Fact]
        public void CannotInitializeWithNonPositiveDuration()
        {
            var duration = Duration.FromSeconds(-1);

            Assert.Throws<ArgumentOutOfRangeException>( 
                () => PieceMagnitude.FromFixedTotalDuration(duration));
        }

        [Fact]
        public void CannotInitializeWithNonPositiveMeters()
        {
            var meters = -1m;

            Assert.Throws<ArgumentOutOfRangeException>(
                () => PieceMagnitude.FromFixedMeters(meters));
        }

        [Fact]
        public void EqualWhenDurationSame()
        {
            var duration = Duration.FromSeconds(1);
            var x = PieceMagnitude.FromFixedTotalDuration(duration);
            var y = PieceMagnitude.FromFixedTotalDuration(duration);

            Assert.True(x == y);
        }


    }
}
