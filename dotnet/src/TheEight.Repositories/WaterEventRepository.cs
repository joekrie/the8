using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using NodaTime;
using TheEight.Domain.WaterEvents;

namespace TheEight.Repositories
{
    public class WaterEventRepository
    {
        private readonly string _connectionString = @"Data Source=(localdb)\ProjectsV13;Initial Catalog=TheEight.Database;Integrated Security=True;Persist Security Info=False;Pooling=False;MultipleActiveResultSets=False;Connect Timeout=60;Encrypt=False;TrustServerCertificate=True";
        private readonly IDbConnection _dbConnection;

        public WaterEventRepository()
        {
            _dbConnection = new SqlConnection(_connectionString);
        }

        public async Task<WaterEvent> GetWaterEventAsync(Guid waterEventId)
        {
            const string cmdTxt = @"
                SELECT
	                evt.WaterEventId,
	                evt.WaterEventModeId,
	                evt.Date,
	                evt.Time,
	                evt.Notes,
	                attn.AttendeeId,
	                attn.GivenName,
	                attn.Surname
                FROM WATER_EVENTS AS evt
                INNER JOIN WATER_EVENT_ATTENDEES AS attn 
                    ON attn.WaterEventId = evt.WaterEventId
                INNER JOIN WATER_EVENT_BOATS AS boat
                    ON boat.WaterEventId = evt.WaterEventId
            ";

            var cmdDef = new CommandDefinition(cmdTxt);
            var queryResults = await _dbConnection.QueryAsync<GetWaterEventResult>(cmdDef);

            return new WaterEvent();
        }

        private class GetWaterEventResult
        {
            public Guid WaterEventId { get; set; }
            public Guid AttendeeId { get; set; }
            public int WaterEventModeId { get; set; }
            public LocalDate Date { get; set; }
            public LocalTime? Time { get; set; }
            public string Notes { get; set; }
        }
    }
}
