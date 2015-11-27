namespace TheEight.Domain.Teams
{
    public class TeamMember
    {
        public string Id { get; set; }
        public string ClubMemberId { get; set; }

        public TeamRole Role { get; set; }
        
        public string DisplayName { get; set; }
        public string SortName { get; set; }
    }
}