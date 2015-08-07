using System;
using Raven.Client;
using Raven.Client.Embedded;

namespace TheEightSuite.BusinessLogic.Database
{
    public class RavenHqDocumentStoreInitializer : IDocumentStoreInitializer
    {
        private readonly string _url;
        private readonly string _apiKey;

        public RavenHqDocumentStoreInitializer(string url, string apiKey)
        {
            _url = url;
            _apiKey = apiKey;
        }

        public IDocumentStore Initialize(Func<IDocumentStore, IDocumentStore> configure)
        {
            var docStore = new EmbeddableDocumentStore
            {
                Url = _url,
                ApiKey = _apiKey
            }.Initialize();

            return configure(docStore);
        }
    }
}