namespace TheEight.Common.Domain.Features
{
    public enum GlobalFeatureState
    {
        Unspecified = 0,
        DevelopmentOnly = 1,
        OnByDefault = 2,
        OnGlobally = 3,
        OffByDefault = 4,
        OffGlobally = 5
    }
}