using Microsoft.AspNet.Mvc;

namespace TheEightSuite.WebApp.Controllers
{
    [Route("erg")]
    public class ErgTrackerController : Controller
    {
        [HttpGet("workout-builder")]
        public IActionResult WorkoutBuilder()
        {
            return View();
        }
        
        [HttpGet("coach-submits-workout")]
        public IActionResult CoachSubmitsWorkout()
        {
            return View();
        }

        [HttpGet("rower-submits-workout")]
        public IActionResult RowerSubmitsWorkout()
        {
            return View();
        }
    }
}
