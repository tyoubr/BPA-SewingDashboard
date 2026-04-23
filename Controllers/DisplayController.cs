using Microsoft.AspNetCore.Mvc;

namespace SewingDashboard.Controllers
{
    public class DisplayController : Controller
    {
        public IActionResult Index()
        
        {
            return View();
        }
    }
}
