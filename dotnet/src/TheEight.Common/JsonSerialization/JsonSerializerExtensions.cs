﻿using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using NodaTime;
using NodaTime.Serialization.JsonNet;

namespace TheEight.Common.JsonSerialization
{
    public static class JsonSerializerExtensions
    {
        public static JsonSerializerSettings Configure(this JsonSerializerSettings settings, bool isDevelopment = false)
        {
            settings.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
            settings.Converters.Add(new StringEnumConverter { CamelCaseText = true });
            settings.ContractResolver = new CamelCasePropertyNamesContractResolver();

            if (isDevelopment)
            {
                settings.Formatting = Formatting.Indented;
            }

            return settings;
        }
    }
}
