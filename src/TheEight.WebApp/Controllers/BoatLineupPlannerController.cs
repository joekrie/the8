using Microsoft.AspNet.Mvc;

namespace TheEight.WebApp.Controllers
{
    [Route("")]
    public class BoatLineupPlannerController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }        
    }
}