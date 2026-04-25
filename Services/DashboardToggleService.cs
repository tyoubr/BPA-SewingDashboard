using Microsoft.Extensions.Hosting;
using SewingDashboard.Helpers;

public class DashboardToggleService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // toggle every 2 min
            DashboardState.ShowPhp = !DashboardState.ShowPhp;

            Console.WriteLine("Switch Mode: " + DashboardState.ShowPhp);

            await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);
        }
    }
}