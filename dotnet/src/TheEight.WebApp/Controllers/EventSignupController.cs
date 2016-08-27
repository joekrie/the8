using Microsoft.AspNetCore.Mvc;

namespace TheEight.WebApp.Controllers
{
    public class EventSignupController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
