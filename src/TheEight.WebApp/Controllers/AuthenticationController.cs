﻿using Microsoft.AspNet.Http;
using Microsoft.AspNet.Mvc;
using Newtonsoft.Json;

namespace TheEight.WebApp.Controllers
{
    [Route("")]
    public class AuthenticationController : Controller
    {
        [HttpGet("")]
        public IActionResult Index()
        {
            ViewBag.Login = JsonConvert.SerializeObject(HttpContext.User,
                new JsonSerializerSettings
                {
                    ReferenceLoopHandling = ReferenceLoopHandling.Ignore
                });

            return View();
        }

        [HttpPost("")]
        public IActionResult LoginWithProvider(string provider)
        {
            return new ChallengeResult(provider);
        }
    }
}
