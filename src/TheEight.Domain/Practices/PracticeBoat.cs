using System.Collections.Generic;
using System.Linq;

namespace TheEight.Domain.Practices
{
    public abstract class PracticeBoat
    {
        public string Title { get; set; }
        public int RowerCount => Rowers.Count;
        public abstract bool IsCoxed { get; }
        public IDictionary<int, Attendee> Rowers { get; set; } = new Dictionary<int, Attendee>();

        protected virtual bool HasCoxswainIfNeeded() => true;

        public bool AllSeatsFilled()
        {
            return HasCoxswainIfNeeded()
                && Rowers.All(rower => rower.Value != null);
        }

        public static PracticeBoat FromTemplate(BoatTemplate boatTemplate)
        {
            PracticeBoat pracBoat;

            if (boatTemplate.IsCoxed)
            {
                pracBoat = new CoxedPracticeBoat();
            }
            else
            {
                pracBoat = new UncoxedPracticeBoat();
            }

            pracBoat.Title = boatTemplate.Title;

            pracBoat.Rowers = Enumerable
                .Range(1, boatTemplate.RowerCount)
                .ToDictionary(i => i, i => (Attendee)null);

            return pracBoat;
        }
    }
}