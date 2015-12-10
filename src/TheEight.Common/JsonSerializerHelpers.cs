using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using NodaTime;
using NodaTime.Serialization.JsonNet;

namespace TheEight.Common
{
    public static class JsonSerializerHelpers
    {
        public static JsonSerializer CreateJsonSerializer(bool prettyPrint)
        {
            var settings = new JsonSerializerSettings();
            settings.Configure(prettyPrint);
            return JsonSerializer.Create(settings);
        }

        public static JsonSerializerSettings Configure(this JsonSerializerSettings settings, bool prettyPrint)
        {
            settings.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
            settings.Converters.Add(new StringEnumConverter { CamelCaseText = true });
            settings.ContractResolver = new CamelCasePropertyNamesContractResolver();

            if (prettyPrint)
            {
                settings.Formatting = Formatting.Indented;
            }

            return settings;
        }
    }
}
