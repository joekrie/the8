using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Razor.TagHelpers;

namespace TheEight.WebApp.TagHelpers
{
    
    public class RenderReactAppTagHelper : TagHelper
    {
        public string ComponentName { get; set; } = "";
        public IDictionary<string, string> Props { get; set; } = new Dictionary<string, string>();

        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            output.TagName = null;

            var mountElement = new TagBuilder("div");
            mountElement.MergeAttribute("id", context.UniqueId);

            var props = "{ " + string.Join(", ", Props.Select(kvp => $"\"{kvp.Key}\": \"{kvp.Value}\"")) + " }";

            var script = new TagBuilder("script");
            var factory = $"React.createFactory(Apps.{ComponentName})({props})";
            var mount = $"document.getElementById(\"{context.UniqueId}\")";
            script.InnerHtml.AppendHtml($"ReactDOM.render({factory}, {mount})");
            
            output.Content.AppendHtml(mountElement);
            output.Content.AppendHtml(script);
        }
    }
}