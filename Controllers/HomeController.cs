using Microsoft.AspNetCore.Mvc;
using SewingDashboard.Helpers;
using System;

namespace SewingDashboard.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index(int companyId = 3, int floorId = 20)
        {
            ViewBag.CompanyId = companyId;
            ViewBag.FloorId = floorId;
            return View();
        }
        public IActionResult RedirectIndex()
        {
            return View();
        }

        public IActionResult Tv(int companyId = 3, int floorId = 21)
        {
            ViewBag.CompanyId = companyId;
            ViewBag.FloorId = floorId;
            return View();
        }
        public IActionResult Dashboard()
        {
            return View();
        }
    }
}