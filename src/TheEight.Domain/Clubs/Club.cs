namespace TheEight.Domain.Clubs
{
    public class Club
    {
        public string Id { get; set; }
        public ClubInfo ClubInfo { get; set; }
        public ClubConfig ClubConfig { get; set; }
    }
}