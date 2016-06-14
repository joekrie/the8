using System;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Razor.TagHelpers;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using NodaTime;
using NodaTime.Serialization.JsonNet;

namespace TheEight.WebApp.TagHelpers
{
    public class RenderReactAppTagHelper : TagHelper
    {
        public string ComponentName { get; set; }
        public object Props { get; set; }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            if (string.IsNullOrWhiteSpace(ComponentName))
            {
                throw new ArgumentException("React component name must be supplied", nameof(ComponentName));
            }

            output.TagName = null;

            var id = $"app-{context.UniqueId}";

            var mountElement = new TagBuilder("div");
            mountElement.MergeAttribute("id", id);

            var jsonSettings = new JsonSerializerSettings
            {
                Converters = {new StringEnumConverter {CamelCaseText = true}},
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };
            
            jsonSettings.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
            var jsonProps = JsonConvert.SerializeObject(Props);

            var script = new TagBuilder("script");
            var factory = $"React.createFactory(Apps.{ComponentName})({jsonProps})";
            var mount = $"document.getElementById(\"{id}\")";
            script.InnerHtml.AppendHtml($"ReactDOM.render({factory}, {mount})");
            
            output.Content.AppendHtml(mountElement);
            output.Content.AppendHtml(script);
        }
    }
}