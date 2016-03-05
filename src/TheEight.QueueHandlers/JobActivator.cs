using System;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.DependencyInjection;

namespace TheEight.QueueHandlers
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
            return _serviceProvider.GetService<T>();
        }
    }
}