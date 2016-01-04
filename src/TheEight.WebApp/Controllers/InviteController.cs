using Microsoft.AspNet.Mvc;

namespace TheEight.WebApp.Controllers
{
    [Route("invites")]
    public class InviteController : Controller
    {
        [HttpGet("")]
        public IActionResult InviteRowers()
        {
            return View();
        }
    }
}