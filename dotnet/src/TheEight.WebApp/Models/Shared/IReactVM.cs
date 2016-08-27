namespace TheEight.WebApp.Models.Shared
{
    public interface IReactVM
    {
        string ComponentName { get; }
        string FileName { get; }
        string JsonProps { get; }
    }
}