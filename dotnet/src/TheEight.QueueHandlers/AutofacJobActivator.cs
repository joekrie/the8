using Autofac;
using Microsoft.Azure.WebJobs.Host;

namespace TheEight.QueueHandlers
{
    public class AutofacJobActivator : IJobActivator
    {
        private readonly IContainer _serviceProvider;

        public AutofacJobActivator(IContainer serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public T CreateInstance<T>()
        {
            return _serviceProvider.Resolve<T>();
        }
    }
}