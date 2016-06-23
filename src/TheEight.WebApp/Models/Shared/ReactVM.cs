using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using NodaTime;
using NodaTime.Serialization.JsonNet;

namespace TheEight.WebApp.Models.Shared
{
    public class ReactVM
    {
        public string ComponentName { get; set; }
        public string FileName { get; set; }
        public object Props { get; set; }

        public string JsonProps
        {
            get
            {
                var jsonSettings = new JsonSerializerSettings
                {
                    Converters = { new StringEnumConverter { CamelCaseText = true } },
                    ContractResolver = new CamelCasePropertyNamesContractResolver()
                };

                jsonSettings.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
                var jsonProps = JsonConvert.SerializeObject(Props);

                return jsonProps;
            }
        }
    }
}
