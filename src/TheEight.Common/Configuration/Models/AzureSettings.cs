namespace TheEight.Common.Configuration.Models
{
    public class AzureSettings
    {
        public StorageSettings Storage { get; set; }

        public class StorageSettings
        {
            public string StorageConnectionString { get; set; }
            public string DashboardConnectionString { get; set; }

        }
    }
}