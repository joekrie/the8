using Microsoft.AspNetCore.Mvc;

namespace TheEight.WebApp.ViewComponents
{
    public class NavViewComponent : ViewComponent
    {
        public IViewComponentResult Invoke()
        {
            return View();
        }
    }
}
