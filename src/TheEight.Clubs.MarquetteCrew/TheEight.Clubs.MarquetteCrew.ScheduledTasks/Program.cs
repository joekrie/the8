using System;
using System.Collections.Generic;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.IO;
using System.Linq;
using System.Reflection;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Framework.DependencyInjection;
using Microsoft.Framework.Runtime;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using TheEight.Common.Database;
using TheEight.Common.DependencyInjection;
using TheEight.Extensibility;

namespace TheEight.ScheduledTasks
{
    public class Program
    {
        private readonly IJobActivator _jobActivator;
        private readonly IAssemblyLoadContextAccessor _loadContextAccessor;
        private readonly IAssemblyLoaderContainer _loaderContainer;

        public Program(IAssemblyLoadContextAccessor loadContextAccessor, IAssemblyLoaderContainer loaderContainer)
        {
            _loadContextAccessor = loadContextAccessor;
            _loaderContainer = loaderContainer;

            var services = new ServiceCollection()
                .AddSingleton(provider => DocumentStoreFactory.GetDevelopmentDocumentStore())
                .BuildServiceProvider();

            _jobActivator = new JobActivator(services);
        }

        private void RunAzureJobHost()
        {
            var host = new JobHost(_jobActivator.CreateInstance<JobHostConfiguration>());
            host.RunAndBlock();            
        }

        [ImportMany(typeof(ICalculator))]
        public IEnumerable<Lazy<ICalculator>> Calculators;

        public void Main(string[] args)
        {
            var loadContext = _loadContextAccessor.Default;

            var catalog = new AggregateCatalog();
            catalog.Catalogs.Add(new AssemblyCatalog(typeof(Program).Assembly));

            var storageAccount = CloudStorageAccount.Parse("DefaultEndpointsProtocol=https;AccountName=theeightsuite;AccountKey=aFl1A10SDRSvA73JbG/K/U0bswtYisWy89Zg5ahxWE76XI1lrlKcKgJQQBoQskyoddg89G/oqNCzZUaxktb5fw==");
            var storageClient =  storageAccount.CreateCloudBlobClient();
            var storageContainer = storageClient.GetContainerReference("theeight-plugins");

            foreach (var blob in storageContainer.ListBlobs())
            {
                using (var memStream = new MemoryStream())
                {
                    var blockBlob = (CloudBlockBlob) blob;
                    blockBlob.DownloadToStream(memStream);
                    var assembly = Assembly.Load(memStream.ToArray());
                    catalog.Catalogs.Add(new AssemblyCatalog(assembly));
                }
            }

            var container = new CompositionContainer(catalog);
            
            try
            {
                container.ComposeParts(this);
            }
            catch (CompositionException compositionException)
            {
                Console.WriteLine(compositionException.ToString());
            }

            var nextLine = "";
            while (nextLine?.Split(' ').First() != "exit")
            {
                foreach (var calc in Calculators.Select(l => l.Value))
                {
                    Console.WriteLine(calc.Calculate(nextLine));
                }

                nextLine = Console.ReadLine()?.Trim().ToLower();
            }
        }
    }

    [Export(typeof(ICalculator))]
    public class UpperCaseCalc : ICalculator
    {
        public string Calculate(string input)
        {
            return input.ToUpper();
        }
    }

    [Export(typeof(ICalculator))]
    public class RemoveFirstCharCalc : ICalculator
    {
        public string Calculate(string input)
        {
           return input.Length > 1 ? input.Substring(1) : "";
        }
    }
}
