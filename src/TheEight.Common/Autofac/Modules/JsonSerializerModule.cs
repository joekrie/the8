using Autofac;
using Newtonsoft.Json;
using TheEight.Common.Json;

namespace TheEight.Common.Autofac.Modules
{
    public class JsonSerializerModule : Module
    {
        public bool PrettyPrint { get; set; }

        protected override void Load(ContainerBuilder autofacBuilder)
        {
            var settings = new JsonSerializerSettings();
            settings.Configure(PrettyPrint);
            autofacBuilder.Register(ctx => JsonSerializer.Create(settings));
        }
    }
}