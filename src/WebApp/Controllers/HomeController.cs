using Microsoft.AspNet.Mvc;

namespace TheEightSuite.WebApp.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return new EmptyResult();
        }
    }
}
