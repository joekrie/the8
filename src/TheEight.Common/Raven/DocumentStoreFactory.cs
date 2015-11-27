using Raven.Client;
using Raven.Client.Document;
using Raven.Client.NodaTime;
using TheEight.Common.OptionsModels;

namespace TheEight.Common.Raven
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

            docStore.Initialize();

            return ConfigureInitializedDocumentStore(docStore);
        }

        public static IDocumentStore ConfigureInitializedDocumentStore(IDocumentStore docStore)
        {
            docStore.ConfigureForNodaTime();
            docStore.Conventions.IdentityPartsSeparator = "-";

            return docStore;
        }
    }
}
