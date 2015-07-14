namespace TheEightSoftware.TheEightSuite.Core.Db.Models
{
    public class SavedBoat : IBoat
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public int RowerCount { get; set; }
        public bool Coxed { get; set; }
    }
}