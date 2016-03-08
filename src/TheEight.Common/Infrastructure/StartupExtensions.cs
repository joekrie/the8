using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using NodaTime;
using NodaTime.Serialization.JsonNet;

namespace TheEight.Common.Infrastructure
{
    public static class StartupExtensions
    {
        public static JsonSerializerSettings ConfigureForTheEight(this JsonSerializerSettings settings, bool prettyPrint)
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
