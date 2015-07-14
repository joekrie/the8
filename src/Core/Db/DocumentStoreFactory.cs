using System.Reflection;
using Raven.Abstractions.Util;
using Raven.Client;
using Raven.Client.Document;
using Raven.Client.Embedded;
using Raven.Client.Indexes;
using Raven.Client.NodaTime;
using TheEightSoftware.TheEightSuite.Core.Db.Models;

namespace TheEightSoftware.TheEightSuite.Core.Db
{
    public static class DocumentStoreFactory
    {
        public static IDocumentStore GetDocumentStore(string dataDirectory)
        {
            var store = new EmbeddableDocumentStore
            {
                DataDirectory = dataDirectory
            }.Initialize();

            store.ConfigureForNodaTime();
            IndexCreation.CreateIndexes(Assembly.GetExecutingAssembly(), store);

            store.Conventions.RegisterAsyncIdConvention<TeamPractices>((dbName, commands, entity) =>
                new CompletedTask<string>($"teams/{entity.TeamId}/practices/{entity.Year}"));

            return store;
        }
    }
}