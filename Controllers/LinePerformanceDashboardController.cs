using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;

namespace SewingDashboard.Controllers
{
    public class LinePerformanceDashboardController : Controller
    {
        private IConfiguration _configuration;

        public LinePerformanceDashboardController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IActionResult Index()
        {
            return View();
        }
    }
}
