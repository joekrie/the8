using Microsoft.AspNet.Mvc;

namespace TheEight.WebApp.Controllers
{
    [Route("water-events")]
    public class WaterEventsController : Controller
    {
        [HttpGet("")]
        public IActionResult Index()
        {
            return View();
        }
    }
}