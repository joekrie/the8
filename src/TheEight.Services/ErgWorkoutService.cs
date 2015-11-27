using System.Threading.Tasks;
using Raven.Client;
using TheEight.Domain.Workouts;

namespace TheEight.Services
{
    public class ErgWorkoutService
    {
        private readonly IAsyncDocumentSession _docSession;

        public ErgWorkoutService(IAsyncDocumentSession docSession)
        {
            _docSession = docSession;
        }

        public async Task CreateWorkoutAsync(Workout workout)
        {
            await _docSession.StoreAsync(workout);
            await _docSession.SaveChangesAsync();
        }

        public async Task UpdateWorkoutAsync(Workout workout)
        {
            await _docSession.StoreAsync(workout);
            await _docSession.SaveChangesAsync();
        }

        public async Task<Workout> GetWorkoutAsync(string id)
        {
            return await _docSession.LoadAsync<Workout>(id);
        }
    }
}
