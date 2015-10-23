using Microsoft.AspNet.Authorization;
using Microsoft.AspNet.Mvc;

namespace TheEight.WebApp.Controllers
{
    [Route("boat")]
    public class BoatLineupPlannerController : Controller
    {
        [Authorize]
        public IActionResult Index()
        {
            return View();
        }        
    }
}