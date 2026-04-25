////using Microsoft.AspNetCore.Mvc;
////using System.Net.Http;
////using System.Threading.Tasks;

////namespace SewingDashboard.Controllers
////{
////    public class ProxyController : Controller
////    {
////        private readonly IHttpClientFactory _httpClientFactory;

////        public ProxyController(IHttpClientFactory httpClientFactory)
////        {
////            _httpClientFactory = httpClientFactory;
////        }

////        // Proxy endpoint
////        public async Task<IActionResult> PhpDashboard(int companyId, int floorId)
////        {
////            var date = System.DateTime.Now.ToString("dd-MM-yyyy");

////            var phpUrl = $"http://180.92.235.190:8022/erp/production/reports/display_board_nrg_new.php" +
////                         $"?action=report_generate" +
////                         $"&cbo_company_name={companyId}" +
////                         $"&txt_date={date}" +
////                         $"&cbo_floor_id={floorId}" +
////                         $"&page_width=1536" +
////                         $"&page_height=864";

////            var client = _httpClientFactory.CreateClient();

////            var response = await client.GetAsync(phpUrl);
////            var content = await response.Content.ReadAsStringAsync();

////            // 🔥 IMPORTANT: remove iframe blocking headers
////            Response.Headers.Remove("X-Frame-Options");
////            Response.Headers.Remove("Content-Security-Policy");

////            return Content(content, "text/html");
////        }
////    }
////}

//using Microsoft.AspNetCore.Mvc;

//namespace SewingDashboard.Controllers
//{
//    public class ProxyController : Controller
//    {
//        public IActionResult PhpDashboard(int companyId, int floorId)
//        {
//            var date = DateTime.Now.ToString("dd-MM-yyyy");

//            var url =
//                "http://180.92.235.190:8022/erp/production/reports/display_board_nrg_new.php"
//                + "?action=report_generate"
//                + "&cbo_company_name=" + companyId
//                + "&txt_date=" + date
//                + "&cbo_floor_id=" + floorId
//                + "&page_width=1536"
//                + "&page_height=864";

//            return Redirect(url);
//        }
//    }
//}


//2nd try

//using Microsoft.AspNetCore.Mvc;

//namespace SewingDashboard.Controllers
//{
//    public class ProxyController : Controller
//    {
//        public IActionResult TestPhp()
//        {
//            var url =
//                "http://180.92.235.190:8022/erp/production/reports/display_board_nrg_new.php"
//                + "?action=report_generate"
//                + "&cbo_company_name=3"
//                + "&txt_date=21-04-2026"
//                + "&hidden_line_id="
//                + "&cbo_floor_id=20"
//                + "&page_width=1536"
//                + "&page_height=864";

//            return Redirect(url);
//        }
//    }
//}

//3rd try

//using Microsoft.AspNetCore.Mvc;
//using System.Net.Http;
//using System.Threading.Tasks;

//namespace SewingDashboard.Controllers
//{
//    public class ProxyController : Controller
//    {
//        private readonly IHttpClientFactory _httpClientFactory;

//        public ProxyController(IHttpClientFactory httpClientFactory)
//        {
//            _httpClientFactory = httpClientFactory;
//        }

//        public async Task<IActionResult> PhpDashboard(int companyId, int floorId)
//        {
//            var date = System.DateTime.Now.ToString("dd-MM-yyyy");

//            var url =
//                "http://180.92.235.190:8022/erp/production/reports/display_board_nrg_new.php"
//                + "?action=report_generate"
//                + "&cbo_company_name=" + companyId
//                + "&txt_date=" + date
//                + "&cbo_floor_id=" + floorId
//                + "&page_width=1536"
//                + "&page_height=864";

//            var client = _httpClientFactory.CreateClient();

//            var response = await client.GetAsync(url);
//            var html = await response.Content.ReadAsStringAsync();

//            // 🔥 IMPORTANT: allow iframe rendering
//            Response.Headers.Remove("X-Frame-Options");
//            Response.Headers.Remove("Content-Security-Policy");

//            return Content(html, "text/html");
//        }
//    }
//}

//4th
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Threading.Tasks;

namespace SewingDashboard.Controllers
{
    public class ProxyController : Controller
    {
        private readonly IHttpClientFactory _factory;

        public ProxyController(IHttpClientFactory factory)
        {
            _factory = factory;
        }

        public async Task<IActionResult> GetPhp(int companyId, int floorId)
        {
            var date = DateTime.Now.ToString("dd-MM-yyyy");

            var url =
                "http://180.92.235.190:8022/erp/production/reports/display_board_nrg_new.php"
                + "?action=report_generate"
                + "&cbo_company_name=" + companyId
                + "&txt_date=" + date
                + "&cbo_floor_id=" + floorId
                + "&page_width=1536"
                + "&page_height=864";

            var client = _factory.CreateClient();

            var response = await client.GetAsync(url);
            var html = await response.Content.ReadAsStringAsync();

            return Content(html, "text/html");
        }
    }
}