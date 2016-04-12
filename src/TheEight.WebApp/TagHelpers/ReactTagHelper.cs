using System.Collections.Generic;
using System.IO;
using Microsoft.AspNet.Html.Abstractions;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Mvc.Rendering;
using Microsoft.AspNet.Razor.TagHelpers;
using Microsoft.Extensions.WebEncoders;

namespace TheEight.WebApp.TagHelpers
{
    public class ReactScriptTagHelper : TagHelper
    {
        public string ComponentName{ get; set; }
        public IDictionary<string, string> Props { get; set; }
        public string MountElementId { get; set; }

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            output.TagName = "script";

            var mountNode = $"document.getElementById({MountElementId})";

            var componentTagBuilder = new TagBuilder(ComponentName);

            foreach (var prop in Props)
            {
                componentTagBuilder.Attributes[prop.Key] = prop.Value;
            }
            
            var mountExpr = $"ReactDOM.render(\"<BoatLineupPlannerApp \\>\" {mountNode})";
            output.Content.SetContent(mountExpr);
        }
    }


}