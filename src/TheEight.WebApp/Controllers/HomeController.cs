using Microsoft.AspNet.Mvc;
using Microsoft.Framework.Configuration;
using Microsoft.Framework.OptionsModel;
using Newtonsoft.Json;
using TheEight.Common.Config;

namespace TheEight.WebApp.Controllers
{
    [Route("")]
    public class HomeController : Controller
    {
        private readonly IOptions<GoogleSettings> _azureSettings;
        private readonly IConfiguration _config;

        public HomeController(IOptions<GoogleSettings> azureSettings, IConfiguration config)
        {
            _azureSettings = azureSettings;
            _config = config;
        }

        [HttpGet("")]
        public IActionResult Index()
        {
            return Json(_azureSettings.Options);
        }

        [HttpGet("config")]
        public IActionResult Config()
        {
            return Json(_config.GetConfigurationSections(), new JsonSerializerSettings {Formatting = Formatting.Indented});
        }
    }
}
