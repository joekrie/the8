using System.Data;
using System.Data.SqlClient;
using Autofac;
using Dapper.NodaTime;
using Microsoft.Extensions.Options;
using TheEight.Common.Infrastructure.Configuration.Infrastructure;

namespace TheEight.Common.Infrastructure.DependencyInjection
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
        }
    }
}