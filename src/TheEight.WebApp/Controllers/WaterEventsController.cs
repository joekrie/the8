using System;
using Microsoft.AspNetCore.Mvc;

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

        [HttpGet("boat-lineups/{id:guid?}")]
        public IActionResult BoatLineups(Guid id = new Guid())
        {
            return View();
        }
    }
}