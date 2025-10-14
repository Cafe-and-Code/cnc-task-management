using Microsoft.AspNetCore.Mvc;

namespace CNCTaskManagement.Api.Controllers
{
    [ApiController]
    [Route("/")]
    public class HealthController : ControllerBase
    {
        [HttpGet("health")]
        public IActionResult Get()
        {
            return Ok(new { status = "Healthy", timestamp = DateTime.UtcNow });
        }
    }
}