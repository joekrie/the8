using NodaTime;
using System;
using TheEight.Domain.ErgWorkouts;
using Xunit;

namespace TheEight.Domain.Tests.Workout
{
    public class ResultTests
    {
        [Fact]
        public void CannotInitializeWithNonPositiveSplit()
        {
            var split = Duration.FromSeconds(-1);
            Assert.Throws<ArgumentOutOfRangeException>(() => Split.FromSplitDuration(split));
        }
    }
}