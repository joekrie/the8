namespace TheEight.Common.Domain.Teams
{
    public class TeamMember
    {
        public string Id { get; set; }
        public string UserId { get; set; }

        public TeamRole Role { get; set; }
    }
}