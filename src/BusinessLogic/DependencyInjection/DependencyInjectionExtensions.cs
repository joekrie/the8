using Microsoft.Framework.DependencyInjection;
using Raven.Client.NodaTime;
using TheEightSuite.BusinessLogic.Database;
using TheEightSuite.BusinessLogic.WorkoutTracker;

namespace TheEightSuite.BusinessLogic.DependencyInjection
{
    public static class DependencyInjectionExtensions
    {
        public static IServiceCollection AddBusinessLogicServices(this IServiceCollection services, 
            IDocumentStoreInitializer docStoreInitializer)
        {
            services.AddSingleton(
                provider => docStoreInitializer.Initialize(
                    docStore =>
                    {
                        docStore.ConfigureForNodaTime();
                        return docStore;
                    }));

            services.AddScoped<WorkoutTrackerService>();

            return services;
        }
    }
}
