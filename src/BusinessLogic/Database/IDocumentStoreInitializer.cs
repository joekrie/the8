using System;
using Raven.Client;

namespace TheEightSuite.BusinessLogic.Database
{
    public interface IDocumentStoreInitializer
    {
        IDocumentStore Initialize(Func<IDocumentStore, IDocumentStore> configure);
    }
}