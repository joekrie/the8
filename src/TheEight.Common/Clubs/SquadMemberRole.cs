using System;

namespace TheEight.Common.Clubs
{
    [Flags]
    public enum SquadRoles
    {
        None = 0,
        Rower = 1,
        Coxswain = 2,
        Coach = 4
    }

    [Flags]
    public enum ClubRoles
    {
        None = 0,
        Admin = 1
    }

    
}
