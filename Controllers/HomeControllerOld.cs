using Microsoft.AspNetCore.Mvc;

namespace SewingDashboard.Controllers
{
    public class HomeControllerOld : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public HomeControllerOld(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public IActionResult Index(int? floorId, int? companyId)
        {
            ViewBag.FloorId = floorId ?? 1;
            ViewBag.CompanyId = companyId ?? 3;

            return View();
        }

        public IActionResult DHUDashboardOnly()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> Proxy(int companyId, int floorId, string date)
        {
            try
            {
                // ✅ fallback date
                if (string.IsNullOrWhiteSpace(date))
                {
                    date = DateTime.Now.ToString("dd-MM-yyyy");
                }

                var baseUrl = "http://180.92.235.190:8022";

                var url = $"{baseUrl}/erp/production/reports/display_board_nrg_new.php" +
                          $"?action=report_generate" +
                          $"&cbo_company_name={companyId}" +
                          $"&txt_date={date}" +
                          $"&cbo_floor_id={floorId}" +
                          $"&page_width=1536" +
                          $"&page_height=864";

                var client = _httpClientFactory.CreateClient();
                client.Timeout = TimeSpan.FromSeconds(60);

                var response = await client.GetAsync(url);

                if (!response.IsSuccessStatusCode)
                {
                    return Content("❌ Remote server error", "text/plain");
                }

                var content = await response.Content.ReadAsStringAsync();

                // ✅ 🔥 FIX: ensure all relative paths work
                if (content.Contains("<head>"))
                {
                    content = content.Replace(
                        "<head>",
                        $"<head><base href=\"{baseUrl}/\">"
                    );
                }

                return Content(content, "text/html");
            }
            catch (Exception ex)
            {
                return Content("❌ Proxy Error: " + ex.Message, "text/plain");
            }
        }
    }
}