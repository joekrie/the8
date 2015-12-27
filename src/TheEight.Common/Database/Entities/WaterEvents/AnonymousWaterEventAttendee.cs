using System.ComponentModel.DataAnnotations;

namespace TheEight.Common.Database.Entities.WaterEvents
{
    public class AnonymousWaterEventAttendee : WaterEventAttendee
    {
        [Required] public string GivenName { get; set; }
        [Required] public string Surname { get; set; }
    }
}