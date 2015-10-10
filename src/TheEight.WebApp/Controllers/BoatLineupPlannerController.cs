using Microsoft.AspNet.Mvc;

namespace TheEight.WebApp.Controllers
{
    [Route("boat-lineup-planner")]
    public class BoatLineupPlannerController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }


    }
}