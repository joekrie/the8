using System.ComponentModel.Composition;

namespace TheEight.Extensibility
{
    public interface ICalculator
    {
        string Calculate(string input);
    }

    [Export(typeof(ICalculator))]
    public class UselessCalc : ICalculator
    {
        public string Calculate(string input)
        {
            return "Didn't feel like processing that";
        }
    }
}
