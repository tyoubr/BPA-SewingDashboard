using Microsoft.AspNetCore.Mvc;

namespace SewingDashboard.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            //return View();
            return Redirect("SwapURL.html");
        }
        public IActionResult DHUDashboardOnly()
        {
            return View(); // View without header/menu layout
        }
    }
}
