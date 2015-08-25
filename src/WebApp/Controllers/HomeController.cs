using Microsoft.AspNet.Mvc;
using Microsoft.Framework.OptionsModel;
using TheEight.Common.Config;

namespace TheEight.WebApp.Controllers
{
    [Route("")]
    public class HomeController : Controller
    {
        private readonly IOptions<AzureSettings> _azureSettings;

        public HomeController(IOptions<AzureSettings> azureSettings)
        {
            _azureSettings = azureSettings;
        }

        [HttpGet("")]
        public IActionResult Index()
        {
            return Json(_azureSettings.Options);
        }
    }
}
