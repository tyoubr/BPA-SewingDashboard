using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SewingDashboard.Models;

namespace SewingDashboard.Controllers
{
    public class OperatorDetailInfoController(SewingDashboard.Data.ApplicationDbContext context) : Controller
    {
        private readonly SewingDashboard.Data.ApplicationDbContext _context = context;
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> OperatorDetailInfoList(int page = 1, int pageSize = 15)
        {
            var totalRecords = await _context.TblOperatorDetails.CountAsync();
            var OperatorDetailInfos = await _context.TblOperatorDetails
                .OrderBy(e => e.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            ViewBag.CurrentPage = page;
            ViewBag.TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize);
            ViewBag.TotalOperatorDetailInfo = totalRecords;
            return View(OperatorDetailInfos);

        }

        [HttpGet]
        public IActionResult Create()
        {
            return View(new TblOperatorDetail());
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(TblOperatorDetail operatorDetail)
        {
            var testName = operatorDetail.Name;
            var testProcess = operatorDetail.ProcessName;
            var testLine = operatorDetail.LineNo;

            if (ModelState.IsValid)
            {
                _context.TblOperatorDetails.Add(operatorDetail);

                await _context.SaveChangesAsync();

                return RedirectToAction(nameof(OperatorDetailInfoList));
            }

            return View(operatorDetail);
        }

        [HttpGet]
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var operatorDetail = await _context.TblOperatorDetails.FindAsync(id);
            if (operatorDetail == null)
            {
                return NotFound();
            }
            return View(operatorDetail);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, TblOperatorDetail operatorDetail)
        {
            if (id != operatorDetail.Oid)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Entry(operatorDetail).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!_context.TblOperatorDetails.Any(e => e.Oid == operatorDetail.Oid))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(OperatorDetailInfoList));
            }

            return View(operatorDetail);
        }

        [HttpGet]
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var operatorDetail = await _context.TblOperatorDetails
                .FirstOrDefaultAsync(m => m.Oid == id);

            if (operatorDetail == null)
            {
                return NotFound();
            }

            return View(operatorDetail);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var operatorDetail = await _context.TblOperatorDetails.FindAsync(id);
            _context.TblOperatorDetails.Remove(operatorDetail);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(OperatorDetailInfoList));
        }

    }
}
