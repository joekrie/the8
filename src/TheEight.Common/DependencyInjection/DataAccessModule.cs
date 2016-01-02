using System.Data;
using System.Data.SqlClient;
using Autofac;
using Dapper.NodaTime;
using Microsoft.Extensions.Options;
using TheEight.Common.Configuration;

namespace TheEight.Common.DependencyInjection
{
    public class DataAccessModule : Module
    {
        protected override void Load(ContainerBuilder builder)
        {
            DapperNodaTimeSetup.Register();

            builder
                .Register(ctx =>
                {
                    var settings = ctx.Resolve<IOptions<DatabaseSettings>>().Value;
                    return new SqlConnection(settings.ConnectionString);
                })
                .InstancePerDependency()
                .As<IDbConnection>();

            builder
                .RegisterAssemblyTypes(ThisAssembly)
                .Where(type => type.IsInNamespace("TheEight.Common.DataAccess")
                    && type.Name.EndsWith("Repository"))
                .InstancePerDependency()
                .AsImplementedInterfaces();
        }
    }
}