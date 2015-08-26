using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNet.Mvc;
using NodaTime;
using Raven.Client;
using TheEight.Domain.WorkoutTracker;
using TheEight.WebApp.ViewModels;
using TheEight.WebApp.ViewModels.WorkoutBuilder;

namespace TheEight.WebApp.Controllers
{
    [Route("workouts/builder")]
    public class WorkoutBuilderController : Controller
    {
        private readonly IDocumentStore _ravenDocStore;

        public WorkoutBuilderController(IDocumentStore ravenDocStore)
        {
            _ravenDocStore = ravenDocStore;
        }

        [HttpGet("")]
        public IActionResult Workouts()
        {
            using (var ravenSession = _ravenDocStore.OpenSession())
            {
                var workouts = ravenSession.Query<Workout>()
                    .ToList()
                    .Select(workout =>
                    {
                        var id = int.Parse(workout.Id.Split('/').Last());

                        return new WorkoutBuilderListItemVM
                        {
                            Title = workout.WorkoutInfo.Title,
                            Date = workout.WorkoutInfo.Date.ToString(),
                            Url = Url.RouteUrl("ExistingWorkoutBuilder", new {workoutId = id})
                        };
                    });

                return View(workouts);
            }
        }

        [HttpGet("{workoutId:int}", Name = "ExistingWorkoutBuilder")]
        public IActionResult WorkoutBuilder(int workoutId)
        {
            ViewBag.WorkoutId = workoutId;
            return View(
                new AjaxUrlVM
                {
                    GetUrl = Url.Action("GetWorkoutAsync", new {workoutId}),
                    SaveUrl = Url.Action("SaveWorkoutAsync")
                });
        }

        [HttpGet("new", Name = "NewWorkoutBuilder")]
        public IActionResult WorkoutBuilder()
        {
            return View(
                new AjaxUrlVM
                {
                    GetUrl = Url.Action("GetNewWorkout"),
                    SaveUrl = Url.Action("SaveWorkoutAsync")
                });
        }

        [HttpGet("get-data/{workoutId}")]
        public async Task<IActionResult> GetWorkoutAsync(int workoutId)
        {
            using (var ravenSession = _ravenDocStore.OpenAsyncSession())
            {
                var workout = await ravenSession.LoadAsync<Workout>(workoutId);
                var vm = new WorkoutBuilderVM
                {
                    WorkoutId = workout.Id,
                    WorkoutInfo = workout.WorkoutInfo,
                    Pieces = workout.Pieces.Select(p => p.PieceInfo).ToList(),
                    ForceSaveIfResults = false
                };

                return new ObjectResult(vm);
            }
        }

        [HttpGet("get-data/new")]
        public IActionResult GetNewWorkout()
        {
            var vm = new WorkoutBuilderVM
            {
                WorkoutInfo = new WorkoutInfo
                {
                    Date = SystemClock.Instance.Now.InZone(DateTimeZoneProviders.Tzdb.GetSystemDefault()).Date
                }
            };

            return new ObjectResult(vm);
        }

        [HttpPost("save")]
        public async Task SaveWorkoutAsync([FromBody] WorkoutBuilderVM vm)
        {
            using (var ravenSession = _ravenDocStore.OpenAsyncSession())
            {
                var workout = await ravenSession.LoadAsync<Workout>(vm.WorkoutId);
                var workoutAlreadyExists = workout != null;
                var resultsExist = workoutAlreadyExists && workout.Pieces.Any(p => p.Results.Any());

                if (!resultsExist || vm.ForceSaveIfResults)
                {
                    var pieces = vm.Pieces.Select(p => new Piece {PieceInfo = p}).ToList();

                    if (workoutAlreadyExists)
                    {
                        workout.WorkoutInfo = vm.WorkoutInfo;
                        workout.Pieces = pieces;
                    }
                    else
                    {
                        workout = new Workout
                        {
                            Id = vm.WorkoutId,
                            WorkoutInfo = vm.WorkoutInfo,
                            Pieces = pieces
                        };
                    }

                    await ravenSession.StoreAsync(workout);
                    await ravenSession.SaveChangesAsync();
                }
            }
        }

        [HttpPost("delete")]
        public async Task DeleteWorkoutAsync(DeleteWorkoutVM deleteCommand)
        {
            using (var ravenSession = _ravenDocStore.OpenAsyncSession())
            {
                var workout = await ravenSession.LoadAsync<Workout>(deleteCommand.WorkoutId);
                var resultsExist = workout.Pieces.Any(piece => piece.Results.Any());

                if (!resultsExist || deleteCommand.ForceDeleteIfResults)
                {
                    ravenSession.Delete(workout);
                    await ravenSession.SaveChangesAsync();
                }
            }
        }
    }
}