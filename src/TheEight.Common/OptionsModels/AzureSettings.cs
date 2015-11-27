namespace TheEight.Common.OptionsModels
{
    public class AzureSettings
    {
        public DashboardSettings Dashboard { get; set; }
        public StorageSettings Storage { get; set; }

        public class DashboardSettings
        {
            public string ConnectionString { get; set; }
        }

        public class StorageSettings
        {
            public string ConnectionString { get; set; }
        }
    }
}