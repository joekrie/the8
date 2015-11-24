using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using NodaTime;
using NodaTime.Serialization.JsonNet;

namespace TheEight.Common
{
    public class JsonSerializerConfig
    {
        public static JsonSerializerSettings ConfigureJsonSerializer(JsonSerializerSettings settings)
        {
            settings.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
            settings.Converters.Add(new StringEnumConverter { CamelCaseText = true });
            settings.ContractResolver = new CamelCasePropertyNamesContractResolver();

            return settings;
        }
    }
}
