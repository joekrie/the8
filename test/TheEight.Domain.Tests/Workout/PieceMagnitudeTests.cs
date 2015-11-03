using NodaTime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using TheEight.Domain.Workouts;

namespace TheEight.Domain.Tests
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
    }
}
