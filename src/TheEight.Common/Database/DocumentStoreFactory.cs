using Raven.Client;
using Raven.Client.Document;
using Raven.Client.NodaTime;
using TheEight.Common.Config;

namespace TheEight.Common.Database
{
    public static class DocumentStoreFactory
    {
        private static IDocumentStore Configure(this IDocumentStore documentStore)
        {
            return documentStore
                .ConfigureForNodaTime();
        }

        public static IDocumentStore GetCloudDocumentStore(RavenHqSettings settings)
        {
            return new DocumentStore
            {
                Url = settings.Url,
                ApiKey = settings.ApiKey
            }
                .Initialize()
                .Configure();
        }

        public static IDocumentStore GetDevelopmentDocumentStore()
        {
            return new DocumentStore
            {
                Url = "http://localhost:8080",
                DefaultDatabase = "TheEightSuite"
            }
                .Initialize()
                .Configure();
        }
    }
}
