using System.Data;
using System.Data.SqlClient;
using Autofac;
using Dapper.NodaTime;
using TheEight.Common.Configuration.Models;

namespace TheEight.Common.DependencyInjection
{
    public class DataAccessModule : Module
    {
        private readonly DatabaseSettings _databaseSettings;

        public DataAccessModule(DatabaseSettings databaseSettings)
        {
            _databaseSettings = databaseSettings;
        }

        protected override void Load(ContainerBuilder builder)
        {
            DapperNodaTimeSetup.Register();

            builder
                .Register(ctx => new SqlConnection(_databaseSettings.ConnectionString))
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