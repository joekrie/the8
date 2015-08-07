using NodaTime;
using Raven.Client;
using TheEightSuite.BusinessLogic.WorkoutTracker.Models;

namespace TheEightSuite.BusinessLogic.WorkoutTracker
{
    public class WorkoutTrackerService
    {
        private readonly IDocumentStore _ravenDocStore;

        public WorkoutTrackerService(IDocumentStore ravenDocStore)
        {
            _ravenDocStore = ravenDocStore;
        }

        private Workout _workout = new Workout
        {
            WorkoutInfo = new WorkoutInfo
            {
                Title = "2 pieces",
                Comments = "",
                Date = new LocalDate(2015, 8, 13)
            },
            Pieces =
            {
                new Piece
                {
                    PieceInfo = new PieceInfo
                    {
                        Magnitude = 20,
                        Unit = Unit.Minutes
                    }
                },
                new Piece
                {
                    PieceInfo = new PieceInfo
                    {
                        Magnitude = 4000,
                        Unit = Unit.Meters
                    }
                }
            }
        };

        public Workout GetWorkout(string workoutId)
        {
            return _workout;
        }

        public void SaveWorkout()
        {
            using (var ravenSession = _ravenDocStore.OpenSession())
            {
                ravenSession.Store(_workout);
                ravenSession.SaveChanges();
            }
        }
    }
}