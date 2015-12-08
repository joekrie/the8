using System.Collections.Generic;

namespace TheEight.Common.Domain.Practices
{
    public class BoatTemplate
    {
        public string Title { get; set; }
        public int RowerCount { get; set; }
        public bool IsCoxed { get; set; }
        
        public static BoatTemplate Single = new BoatTemplate
        {
            RowerCount = 1,
            IsCoxed = false,
            Title = "Single (1x)"
        };

        public static BoatTemplate Double = new BoatTemplate
        {
            RowerCount = 2,
            IsCoxed = false,
            Title = "Double (2x)",
        };

        public static BoatTemplate Quad = new BoatTemplate
        {
            RowerCount = 4,
            IsCoxed = false,
            Title = "Quad (4x)"
        };

        public static BoatTemplate Four = new BoatTemplate
        {
            RowerCount = 4,
            IsCoxed = true,
            Title = "Four (4+)"
        };
        
        public static BoatTemplate Eight = new BoatTemplate
        {
            RowerCount = 8,
            IsCoxed = true,
            Title = "Eight (8+)"
        };

        public static IEnumerable<BoatTemplate> Boats =
            new List<BoatTemplate>
            {
                Single,
                Double,
                Quad,
                Four,
                Eight
            };
    }
}