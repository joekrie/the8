namespace TheEightSoftware.TheEightSuite.Core.Db.Models
{
    public class GenericBoat : IBoat
    {
        public int RowerCount { get; set; }
        public bool Coxed { get; set; }
        public string Name { get; set; }

        public static GenericBoat CreateSingle()
        {
            return new GenericBoat {RowerCount = 1, Coxed = false};
        }

        public static GenericBoat CreateDouble()
        {
            return new GenericBoat { RowerCount = 2, Coxed = false };
        }

        public static GenericBoat CreateQuad()
        {
            return new GenericBoat { RowerCount = 4, Coxed = false };
        }

        public static GenericBoat CreateFour()
        {
            return new GenericBoat { RowerCount = 4, Coxed = true };
        }

        public static GenericBoat CreateEight()
        {
            return new GenericBoat { RowerCount = 8, Coxed = true };
        }
    }
}