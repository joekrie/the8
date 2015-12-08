using System.Collections.Generic;

namespace TheEight.Common.Domain.Teams
{
    public class Club
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Slug { get; set; }
        public IList<string> UserIds { get; set; } = new List<string>();
    }
}