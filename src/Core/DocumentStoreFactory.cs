using Raven.Client;
using Raven.Client.Document;
using Raven.Client.NodaTime;

namespace TheEightSuite.Core
{
    public static class DocumentStoreFactory
    {
        private static IDocumentStore Configure(this IDocumentStore documentStore)
        {
            return documentStore
                .ConfigureForNodaTime();
        }

        public static IDocumentStore GetCloudDocumentStore(string url, string apiKey)
        {
            return new DocumentStore
            {
                Url = url,
                ApiKey = apiKey
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
