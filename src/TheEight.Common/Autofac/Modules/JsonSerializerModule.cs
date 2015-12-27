using Autofac;
using Newtonsoft.Json;
using TheEight.Common.Json;

namespace TheEight.Common.Autofac.Modules
{
    public class JsonSerializerModule : Module
    {
        private readonly bool _prettyPrint;

        public JsonSerializerModule(bool prettyPrint)
        {
            _prettyPrint = prettyPrint;
        }

        protected override void Load(ContainerBuilder autofacBuilder)
        {
            var settings = new JsonSerializerSettings();
            settings.Configure(_prettyPrint);

            autofacBuilder.Register(ctx => JsonSerializer.Create(settings));
        }
    }
}