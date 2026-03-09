using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace SewingDashboard.Controllers
{
    public class DashboardController : Controller
    {
        private readonly IConfiguration _configuration;

        public DashboardController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        // ✅ Loads the dashboard page
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> GetCompanyList()
        {
            var companyList = new List<string>();

            string? connectionString = _configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrEmpty(connectionString))
                return BadRequest("Connection string not found.");

            await using SqlConnection con = new SqlConnection(connectionString);
            await using SqlCommand cmd = new SqlCommand("COMPANY", con);

            cmd.CommandType = CommandType.StoredProcedure;

            await con.OpenAsync();
            await using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                if (reader["COMPANY_NAME"] != DBNull.Value)
                {
                    companyList.Add(reader["COMPANY_NAME"].ToString()!);
                }
            }

            return Json(companyList);
        }

        [HttpGet]
        public async Task<IActionResult> GetFloorList()
        {
            var floorList = new List<string>();

            string? connectionString = _configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrEmpty(connectionString))
                return BadRequest("Connection string not found.");

            await using SqlConnection con = new SqlConnection(connectionString);
            await using SqlCommand cmd = new SqlCommand("COM_FLOOR_LINE", con);

            cmd.CommandType = CommandType.StoredProcedure;

            await con.OpenAsync();
            await using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                if (reader["FLOOR"] != DBNull.Value)
                {
                    floorList.Add(reader["FLOOR"].ToString()!);
                }
            }

            return Json(floorList);
        }

        //[HttpGet]
        //public async Task<IActionResult> GetDashboardCardData()
        //{
        //    var floorWiseData = new List<FloorWiseDTO>();

        //    string connectionString = _configuration.GetConnectionString("DefaultConnection");

        //    if (string.IsNullOrEmpty(connectionString))
        //        return BadRequest("Connection string not found.");

        //    await using SqlConnection con = new SqlConnection(connectionString);
        //    await using SqlCommand cmd = new SqlCommand("Test_rptSewingDHU_FLOOR", con);

        //    cmd.CommandType = CommandType.StoredProcedure;

        //    await con.OpenAsync();

        //    await using SqlDataReader reader = await cmd.ExecuteReaderAsync();

        //    while (await reader.ReadAsync())
        //    {
        //        floorWiseData.Add(new FloorWiseDTO
        //        {
        //            INPUT_QTY = reader["INPUT_QTY"] != DBNull.Value ? Convert.ToDecimal(reader["INPUT_QTY"]) : 0,
        //            CHECK_QTY = reader["CHECK_QTY"] != DBNull.Value ? Convert.ToDecimal(reader["CHECK_QTY"]) : 0,
        //            OUTPUT_QTY = reader["OUTPUT_QTY"] != DBNull.Value ? Convert.ToDecimal(reader["OUTPUT_QTY"]) : 0,
        //            ALTER_SPOT_QNTY = reader["ALTER_SPOT_QNTY"] != DBNull.Value ? Convert.ToDecimal(reader["ALTER_SPOT_QNTY"]) : 0,
        //            REPLACE_QTY = reader["REPLACE_QTY"] != DBNull.Value ? Convert.ToDecimal(reader["REPLACE_QTY"]) : 0,
        //            REJECT_QNTY = reader["REJECT_QNTY"] != DBNull.Value ? Convert.ToDecimal(reader["REJECT_QNTY"]) : 0,
        //            REJECT_POINT = reader["REJECT_POINT"] != DBNull.Value ? Convert.ToDecimal(reader["REJECT_POINT"]) : 0,
        //            DHU = reader["DHU"] != DBNull.Value ? Convert.ToDecimal(reader["DHU"]) : 0
        //        });
        //    }
        //    return Json(floorWiseData);

        //}

        // ✅ Returns dashboard data as JSON
        [HttpGet]
        public async Task<IActionResult> GetDashboardData(string company, string floorName)
        {
            var lineWise = new List<LineWiseDto>();

            string connectionString = _configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrEmpty(connectionString))
                return BadRequest("Connection string not found.");

            await using SqlConnection con = new SqlConnection(connectionString);
            await using SqlCommand cmd = new SqlCommand("rptSewingDHU", con);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add("@Company", SqlDbType.NVarChar, 200).Value = company;
            cmd.Parameters.Add("@Floor", SqlDbType.NVarChar, 200).Value = floorName;

            await con.OpenAsync();

            await using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                lineWise.Add(new LineWiseDto
                {
                    Name = reader["LINE_NAME"]?.ToString(),
                    Value = reader["DHU"] != DBNull.Value
                                ? Convert.ToDecimal(reader["DHU"])
                                : 0
                });
            }
            // For now, just reuse lineWise as defects for pie chart
            //var defects = lineWise.Select(l => new { l.Name, Value = (int)l.Value }).ToList();


            return Json(lineWise);
            //return Json(new { count = lineWise.Count, data = lineWise });
            /*return Json(new { lineWise, defects });*/ // ✅ return both datasets

        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardCardData(string company, string floorName)
        {
            var floorWiseData = new List<FloorWiseDTO>();

            string connectionString = _configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrEmpty(connectionString))
                return BadRequest("Connection string not found.");

            await using SqlConnection con = new SqlConnection(connectionString);
            await using SqlCommand cmd = new SqlCommand("Tst_rptSewingDHU_FLOOR", con);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add("@Company", SqlDbType.NVarChar, 200).Value = company;
            cmd.Parameters.Add("@Floor", SqlDbType.NVarChar, 200).Value = floorName;

            await con.OpenAsync();

            await using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                floorWiseData.Add(new FloorWiseDTO
                {
                    INPUT_QTY = reader["INPUT_QTY"] != DBNull.Value ? Convert.ToDecimal(reader["INPUT_QTY"]) : 0,
                    CHECK_QTY = reader["CHECK_QTY"] != DBNull.Value ? Convert.ToDecimal(reader["CHECK_QTY"]) : 0,
                    OUTPUT_QTY = reader["OUTPUT_QTY"] != DBNull.Value ? Convert.ToDecimal(reader["OUTPUT_QTY"]) : 0,
                    ALTER_SPOT_QNTY = reader["ALTER_SPOT_QNTY"] != DBNull.Value ? Convert.ToDecimal(reader["ALTER_SPOT_QNTY"]) : 0,
                    REPLACE_QTY = reader["REPLACE_QTY"] != DBNull.Value ? Convert.ToDecimal(reader["REPLACE_QTY"]) : 0,
                    REJECT_QNTY = reader["REJECT_QNTY"] != DBNull.Value ? Convert.ToDecimal(reader["REJECT_QNTY"]) : 0,
                    REJECT_POINT = reader["REJECT_POINT"] != DBNull.Value ? Convert.ToDecimal(reader["REJECT_POINT"]) : 0,
                    DHU = reader["DHU"] != DBNull.Value ? Convert.ToDecimal(reader["DHU"]) : 0
                });
            }
            // For now, just reuse lineWise as defects for pie chart
            //var defects = lineWise.Select(l => new { l.Name, Value = (int)l.Value }).ToList();


            return Json(floorWiseData);
            //return Json(new { count = floorWiseData.Count, data = floorWiseData });
            /*return Json(new { lineWise, defects });*/ // ✅ return both datasets

        }

        [HttpGet]
        public async Task<IActionResult> GetFloorWiseDHU(string company, string floorName)
        {
            var floorWiseDHU = new List<FloorWiseDHUDTO>();

            string connectionString = _configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrEmpty(connectionString))
                return BadRequest("Connection string not found.");

            await using SqlConnection con = new SqlConnection(connectionString);
            await using SqlCommand cmd = new SqlCommand("rptSewingDHU", con);

            cmd.CommandType = CommandType.StoredProcedure;

            cmd.Parameters.Add("@Company", SqlDbType.NVarChar, 200).Value = company;
            cmd.Parameters.Add("@Floor", SqlDbType.NVarChar, 200).Value = floorName;

            await con.OpenAsync();

            await using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                floorWiseDHU.Add(new FloorWiseDHUDTO
                {
                    Name = reader["LINE_NAME"]?.ToString(),
                    Value = reader["DHU"] != DBNull.Value
                                ? Convert.ToDecimal(reader["DHU"])
                                : 0
                });
            }
            return Json(floorWiseDHU);
        }

        [HttpGet]
        public async Task<IActionResult> GetPieChartData(string company, string floorName)
        {
            var DefectList = new List<DefectDTO>();

            string connectionString = _configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrEmpty(connectionString))
                return BadRequest("Connection string not found.");

            await using SqlConnection con = new SqlConnection(connectionString);
            await using SqlCommand cmd = new SqlCommand("Tst_top5Defect", con);

            cmd.CommandType = CommandType.StoredProcedure;

            // ✅ Set timeout to 4 minutes
            cmd.CommandTimeout = 240;

            cmd.Parameters.Add("@Company", SqlDbType.NVarChar, 200).Value = company;
            cmd.Parameters.Add("@Floor", SqlDbType.NVarChar, 200).Value = floorName;

            await con.OpenAsync();

            await using SqlDataReader reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                DefectList.Add(new DefectDTO
                {
                    Name = reader["DEFECT_NAME"]?.ToString(),
                    Value = reader["DEFECT_QTY"] != DBNull.Value
                                ? Convert.ToDecimal(reader["DEFECT_QTY"])
                                : 0
                });
            }
            return Json(DefectList);
        }


        //[HttpGet]
        //public async Task<IActionResult> GetPieChartData()
        //{
        //    var DefectList = new List<DefectDTO>();

        //    string connectionString = _configuration.GetConnectionString("DefaultConnection");

        //    if (string.IsNullOrEmpty(connectionString))
        //        return BadRequest("Connection string not found.");

        //    await using SqlConnection con = new SqlConnection(connectionString);
        //    await using SqlCommand cmd = new SqlCommand("Test_top5Defect", con);
        //    cmd.CommandType = CommandType.StoredProcedure;
        //    await con.OpenAsync();
        //    await using SqlDataReader reader = await cmd.ExecuteReaderAsync();

        //    while (await reader.ReadAsync())
        //    {
        //        DefectList.Add(new DefectDTO
        //        {
        //            Name = reader["DEFECT_NAME"]?.ToString(),
        //            Value = reader["DEFECT_QTY"] != DBNull.Value
        //                        ? Convert.ToDecimal(reader["DEFECT_QTY"])
        //                        : 0
        //        });
        //    }

        //    return Json(DefectList);

        //}
    }
}



// ✅ Strongly Typed DTO Model
public class LineWiseDto
{
    public string? Name { get; set; }
    public decimal Value { get; set; }
}
public class FloorWiseDHUDTO
{
    public string? Name { get; set; }
    public decimal Value { get; set; }
}

public class FloorWiseDTO
{
    public decimal INPUT_QTY { get; set; }
    public decimal CHECK_QTY { get; set; }
    public decimal OUTPUT_QTY { get; set; }
    public decimal ALTER_SPOT_QNTY { get; set; }
    public decimal REPLACE_QTY { get; set; }
    public decimal REJECT_QNTY { get; set; }
    public decimal REJECT_POINT { get; set; }
    public decimal DHU { get; set; }
}

public class DefectDTO
{
    public string? Name { get; set; }
    public decimal Value { get; set; }
}
