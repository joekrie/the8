using System.Data;
using System.Data.SqlClient;
using Autofac;
using Dapper.NodaTime;
using Microsoft.Extensions.OptionsModel;
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

                    var connStrBuilder = new SqlConnectionStringBuilder
                    {
                        DataSource = settings.Server,
                        InitialCatalog = settings.Database,
                        UserID = settings.UserName,
                        Password = settings.Password
                    };

                    var connStr = connStrBuilder.ToString();
                    return new SqlConnection(connStr);
                })
                .InstancePerDependency()
                .As<IDbConnection>();
        }
    }
}