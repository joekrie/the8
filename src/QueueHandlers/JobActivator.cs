using System;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Framework.DependencyInjection;

namespace TheEightSuite.QueueHandlers
{
    public class JobActivator : IJobActivator
    {
        private readonly IServiceProvider _serviceProvider;

        public JobActivator(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public T CreateInstance<T>()
        {
            return _serviceProvider.GetRequiredService<T>();
        }
    }
}
