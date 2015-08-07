using System;
using Raven.Client;
using Raven.Client.Embedded;

namespace TheEightSuite.BusinessLogic.Database
{
    public class EmbeddedDocumentStoreInitializer : IDocumentStoreInitializer
    {
        private readonly string _dataDirectory;

        public EmbeddedDocumentStoreInitializer(string dataDirectory)
        {
            _dataDirectory = dataDirectory;
        }

        public IDocumentStore Initialize(Func<IDocumentStore, IDocumentStore> configure)
        {
            var docStore = new EmbeddableDocumentStore
            {
                DataDirectory = _dataDirectory
            }.Initialize();

            return configure(docStore);
        }
    }
}