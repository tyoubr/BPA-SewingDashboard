//using Microsoft.AspNetCore.Mvc;

//namespace SewingDashboard.Controllers
//{
//    public class ProxyController : Controller
//    {
//        public IActionResult Index()
//        {
//            return View();
//        }
//    }
//}
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;

namespace SewingDashboard.Controllers
{
    public class ProxyController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public ProxyController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        // Proxy endpoint
        public async Task<IActionResult> PhpDashboard(int companyId, int floorId)
        {
            var date = System.DateTime.Now.ToString("dd-MM-yyyy");

            var phpUrl = $"http://180.92.235.190:8022/erp/production/reports/display_board_nrg_new.php" +
                         $"?action=report_generate" +
                         $"&cbo_company_name={companyId}" +
                         $"&txt_date={date}" +
                         $"&cbo_floor_id={floorId}" +
                         $"&page_width=1536" +
                         $"&page_height=864";

            var client = _httpClientFactory.CreateClient();

            var response = await client.GetAsync(phpUrl);
            var content = await response.Content.ReadAsStringAsync();

            // 🔥 IMPORTANT: remove iframe blocking headers
            Response.Headers.Remove("X-Frame-Options");
            Response.Headers.Remove("Content-Security-Policy");

            return Content(content, "text/html");
        }
    }
}