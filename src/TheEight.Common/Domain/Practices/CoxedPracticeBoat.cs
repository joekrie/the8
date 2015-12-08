namespace TheEight.Common.Domain.Practices
{
    public class CoxedPracticeBoat : PracticeBoat
    {
        public Attendee Coxswain { get; set; }
        public override bool IsCoxed => true;

        protected override bool HasCoxswainIfNeeded() => Coxswain != null;
    }
}