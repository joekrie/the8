using Microsoft.AspNet.Mvc;
using TheEightSuite.BusinessLogic.WorkoutTracker;

namespace TheEightSuite.WebApp.Controllers
{
    public class HomeController : Controller
    {
        private readonly WorkoutTrackerService _workoutTrackerService;

        public HomeController(WorkoutTrackerService workoutTrackerService)
        {
            _workoutTrackerService = workoutTrackerService;
        }

        public IActionResult Index()
        {
            _workoutTrackerService.SaveWorkout();
            return Json(_workoutTrackerService.GetWorkout(""));
        }
    }
}
