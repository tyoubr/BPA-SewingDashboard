using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;
using System.Globalization;

namespace SewingDashboard.Controllers
{
    public class DashboardController : Controller
    {
        private readonly IConfiguration _configuration;

        public DashboardController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private DateTime GetSafeDate(string date)
        {
            if (string.IsNullOrWhiteSpace(date))
                return DateTime.Today;

            string[] formats = { "yyyy-MM-dd", "dd-MM-yyyy" };

            if (DateTime.TryParseExact(date, formats,
                CultureInfo.InvariantCulture,
                DateTimeStyles.None,
                out var parsed))
            {
                return parsed;
            }

            return DateTime.Today;
        }
        [HttpGet]
        public IActionResult Index(int companyId, int floorId, string date)
        {
            ViewBag.CompanyId = companyId;
            ViewBag.FloorId = floorId;
            ViewBag.Date = string.IsNullOrEmpty(date)
                ? DateTime.Today.ToString("yyyy-MM-dd")
                : date;

            return View();
        }

        [HttpGet]
        public async Task<IActionResult> GetCompanyList()
        {
            var companyList = new List<CompanyDto>();

            var connectionString = _configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrWhiteSpace(connectionString))
                return BadRequest("Connection string not found.");

            await using var con = new SqlConnection(connectionString);
            await using var cmd = new SqlCommand("COMPANY", con)
            {
                CommandType = CommandType.StoredProcedure
            };

            await con.OpenAsync();

            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                companyList.Add(new CompanyDto
                {
                    Id = reader["ID"] == DBNull.Value
                            ? 0
                            : Convert.ToInt32(reader["ID"]),

                    Name = reader["COMPANY_NAME"]?.ToString()
                });
            }

            return Ok(companyList);
        }

        [HttpGet]
        public async Task<IActionResult> GetFloorList(int companyId)
        {
            var floorList = new List<FloorDto>();

            var connectionString = _configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrWhiteSpace(connectionString))
                return BadRequest("Connection string not found.");

            await using var con = new SqlConnection(connectionString);
            await using var cmd = new SqlCommand("COM_FLOOR", con)
            {
                CommandType = CommandType.StoredProcedure
            };

            // 🔥 ADD PARAMETER
            cmd.Parameters.Add("@COMPANY_ID", SqlDbType.Int).Value = companyId;

            await con.OpenAsync();

            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                floorList.Add(new FloorDto
                {
                    Id = reader["FLOOR_ID"] == DBNull.Value
                        ? 0
                        : Convert.ToInt32(reader["FLOOR_ID"]),

                    Name = reader["FLOOR"]?.ToString()
                });
            }

            return Ok(floorList);
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardData(int companyId, int floorId, string date)

        
        
        {
            var list = new List<LineWiseDto>();

            var connectionString = _configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrWhiteSpace(connectionString))
                return BadRequest("Connection string not found.");

            var parsedDate = GetSafeDate(date);
            await using var con = new SqlConnection(connectionString);
            await using var cmd = new SqlCommand("test_rptSewingDHU", con)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.Add("@CompanyId", SqlDbType.Int).Value = companyId;
            cmd.Parameters.Add("@FloorId", SqlDbType.Int).Value = floorId;
            cmd.Parameters.Add("@Date", SqlDbType.Date).Value = parsedDate;

            await con.OpenAsync();

            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                list.Add(new LineWiseDto
                {
                    Name = reader["LINE_NAME"]?.ToString(),
                    Value = Convert.ToDecimal(reader["DHU"] ?? 0)
                });
            }

            return Ok(list);
        }

        [HttpGet]
        public async Task<IActionResult> GetDashboardCardData(int companyId, int floorId, string date)
        {
            var floorWiseData = new List<FloorWiseDTO>();

            var connectionString = _configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrWhiteSpace(connectionString))
                return BadRequest("Connection string not found.");

            var parsedDate = GetSafeDate(date);

            await using var con = new SqlConnection(connectionString);
            await using var cmd = new SqlCommand("Tst_rptSewingDHU_FLOOR", con)
            {
                CommandType = CommandType.StoredProcedure
            };

            cmd.Parameters.Add("@CompanyId", SqlDbType.Int).Value = companyId;
            cmd.Parameters.Add("@FloorId", SqlDbType.Int).Value = floorId;
            cmd.Parameters.Add("@Date", SqlDbType.Date).Value = parsedDate;

            await con.OpenAsync();

            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                floorWiseData.Add(new FloorWiseDTO
                {
                    INPUT_QTY = Convert.ToDecimal(reader["INPUT_QTY"] ?? 0),
                    CHECK_QTY = Convert.ToDecimal(reader["CHECK_QTY"] ?? 0),
                    OUTPUT_QTY = Convert.ToDecimal(reader["OUTPUT_QTY"] ?? 0),
                    ALTER_SPOT_QNTY = Convert.ToDecimal(reader["ALTER_SPOT_QNTY"] ?? 0),
                    REPLACE_QTY = Convert.ToDecimal(reader["REPLACE_QTY"] ?? 0),
                    REJECT_QTY = Convert.ToDecimal(reader["REJECT_QNTY"] ?? 0),
                    REJECT_POINT = Convert.ToDecimal(reader["REJECT_POINT"] ?? 0),
                    DHU = Convert.ToDecimal(reader["DHU"] ?? 0)
                });
            }

            return Ok(floorWiseData);
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
        public async Task<IActionResult> GetPieChartData(int companyId, int floorId, string date)
        {
            var list = new List<DefectDTO>();

            var connectionString = _configuration.GetConnectionString("DefaultConnection");

            if (string.IsNullOrWhiteSpace(connectionString))
                return BadRequest("Connection string not found.");

            var parsedDate = GetSafeDate(date);

            await using var con = new SqlConnection(connectionString);
            await using var cmd = new SqlCommand("Tst_top5Defect", con)
            {
                CommandType = CommandType.StoredProcedure,
                CommandTimeout = 240
            };

            cmd.Parameters.Add("@CompanyId", SqlDbType.Int).Value = companyId;
            cmd.Parameters.Add("@FloorId", SqlDbType.Int).Value = floorId;
            cmd.Parameters.Add("@Date", SqlDbType.Date).Value = parsedDate;

            await con.OpenAsync();

            await using var reader = await cmd.ExecuteReaderAsync();

            while (await reader.ReadAsync())
            {
                list.Add(new DefectDTO
                {
                    Name = reader["DEFECT_NAME"]?.ToString(),
                    Value = Convert.ToDecimal(reader["DEFECT_QTY"] ?? 0)
                });
            }

            return Ok(list);
        }

    }
}



// ✅ Strongly Typed DTO Model
public class LineWiseDto
{
    public string? Name { get; set; }
    public decimal Value { get; set; }
}

public class FloorDto
{
    public int Id { get; set; }
    public string Name { get; set; }
}
public class CompanyDto
{
    public int Id { get; set; }
    public string Name { get; set; }
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
    public decimal REJECT_QTY { get; set; }
    public decimal REJECT_POINT { get; set; }
    public decimal DHU { get; set; }
}

public class DefectDTO
{
    public string? Name { get; set; }
    public decimal Value { get; set; }
}
