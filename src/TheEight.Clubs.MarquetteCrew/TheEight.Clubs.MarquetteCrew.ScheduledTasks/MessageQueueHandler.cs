using Microsoft.Azure.WebJobs;
using Raven.Client.Document;

namespace TheEight.ScheduledTasks
{
    public class TeamMigrator
    {
        private readonly DocumentStore _docStore;

        public TeamMigrator(DocumentStore docStore)
        {
            _docStore = docStore;
        }

        public void Migrate()
        {
            
        }
    }
}