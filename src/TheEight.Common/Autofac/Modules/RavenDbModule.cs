using Autofac;
using Microsoft.Extensions.OptionsModel;
using Raven.Client;
using Raven.Client.Document;
using Raven.Client.Indexes;
using TheEight.Common.Configuration.Models;
using Raven.Client.NodaTime;

namespace TheEight.Common.Autofac.Modules
{
    public class RavenDbModule : Module
    {
        protected override void Load(ContainerBuilder autofacBuilder)
        {
            autofacBuilder
                .Register(ctx =>
                {
                    var settings = ctx.Resolve<IOptions<RavenSettings>>().Value;

                    var ravenStore = new DocumentStore
                    {
                        Url = settings.Url,
                        ApiKey = settings.ApiKey,
                        DefaultDatabase = settings.DatabaseName
                    }.Initialize();

                    ravenStore.ConfigureForNodaTime();
                    ravenStore.Conventions.IdentityPartsSeparator = "-";
                    
                    IndexCreation.CreateIndexes(ThisAssembly, ravenStore);

                    return ravenStore;
                });

            autofacBuilder
                .Register(ctx =>
                {
                    var docStore = ctx.Resolve<IDocumentStore>();
                    return docStore.OpenAsyncSession();
                });
        }
    }
}
