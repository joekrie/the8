namespace TheEightSoftware.TheEightSuite.Core.Db.Models
{
    public interface IBoat
    {
        int RowerCount { get; set; }
        bool Coxed { get; set; }
        string Name { get; set; }
    }
}