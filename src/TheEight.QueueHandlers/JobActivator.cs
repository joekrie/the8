using Autofac;
using Microsoft.Azure.WebJobs.Host;

namespace TheEight.QueueHandlers
{
    public class JobActivator : IJobActivator
    {
        private readonly IContainer _autofacContainer;

        public JobActivator(IContainer autofacContainer)
        {
            _autofacContainer = autofacContainer;
        }

        public T CreateInstance<T>()
        {
            return _autofacContainer.Resolve<T>();
        }
    }
}