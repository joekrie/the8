using System.Collections.Generic;
using Microsoft.AspNet.Mvc;
using TheEight.WebApp.Models.BoatLineupPlanner;

namespace TheEight.WebApp.Controllers
{
    [Route("boat")]
    public class BoatLineupPlannerController : Controller
    {
        [HttpGet("")]
        public IActionResult Client()
        {
            return View();
        }

        [HttpGet("get/{id:int}")]
        public IActionResult GetWaterEvent(int id)
        {
            var waterEvent = new WaterEventVM
            {
                Settings = new WaterEventSettingsVM
                {
                    AllowMultipleAssignments = true
                },
                Boats = new List<BoatVM>
                {
                    new BoatVM
                    {
                        BoatId = "club-boat-1",
                        Title = "Lucky",
                        IsCoxed = true,
                        SeatCount = 8,
                        SeatAssignments = new Dictionary<int, string>
                        {
                            {0, "squad-member-5"}
                        }
                    },
                    new BoatVM
                    {
                        BoatId = "club-boat-2",
                        Title = "Longhorn",
                        IsCoxed = false,
                        SeatCount = 4,
                        SeatAssignments = new Dictionary<int, string>
                        {
                            {3, "squad-member-2"}
                        }
                    }
                },
                Attendees = new List<AttendeeVM>
                {
                    new AttendeeVM
                    {
                        AttendeeId = "squad-member-2",
                        DisplayName = "John Doe",
                        SortName = "Doe, John",
                        Position = Position.COXSWAIN
                    },
                    new AttendeeVM
                    {
                        AttendeeId = "squad-member-5",
                        DisplayName = "Billy Madison",
                        SortName = "Madison, Billy",
                        Position = Position.ROWER
                    },
                    new AttendeeVM
                    {
                        AttendeeId = "anonymous-1",
                        DisplayName = "Abe Lincoln",
                        SortName = "Lincoln, Abe",
                        Position = Position.ROWER
                    }
                }
            };

            return Ok(waterEvent);
        } 
    }
}