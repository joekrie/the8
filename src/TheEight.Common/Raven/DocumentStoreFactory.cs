using System.Reflection;
using Raven.Client;
using Raven.Client.Document;
using Raven.Client.Indexes;
using Raven.Client.NodaTime;
using TheEight.Common.OptionsModels;

namespace TheEight.Common.Raven
{
    public static class DocumentStoreFactory
    {
        public static IDocumentStore Create(RavenSettings settings)
        {
            var docStore = new DocumentStore
            {
                Url = settings.Url,
                ApiKey = settings.ApiKey,
                DefaultDatabase = settings.DatabaseName
            }.Initialize();

            docStore.ConfigureForNodaTime();
            docStore.Conventions.IdentityPartsSeparator = "-";
            IndexCreation.CreateIndexes(Assembly.GetExecutingAssembly(), docStore);

            return docStore;
        }
    }
}
