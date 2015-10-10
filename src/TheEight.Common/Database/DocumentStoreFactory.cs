using Raven.Client;
using Raven.Client.Document;
using Raven.Client.NodaTime;
using TheEight.Common.Config;

namespace TheEight.Common.Database
{
    public static class DocumentStoreFactory
    {
        public static IDocumentStore CreateAndInitialize(RavenSettings settings)
        {
            var docStore = new DocumentStore
            {
                Url = settings.Url,
                ApiKey = settings.ApiKey,
                DefaultDatabase = settings.DatabaseName
            };

            return docStore
                .Initialize()
                .ConfigureForNodaTime();
        }
    }
}
