using System;
using System.Linq;
using Microsoft.Data.Entity;
using Microsoft.Data.Entity.Metadata.Builders;
using Raven.Abstractions.Extensions;
using TheEight.Common.Database.Entities.Accounts;
using TheEight.Common.Database.Entities.Teams;
using TheEight.Common.Database.Entities.WaterEvents;

namespace TheEight.Common.Database
{
    public class TheEightContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Club> Clubs { get; set; }
        public DbSet<ClubMember> ClubMembers { get; set; }
        public DbSet<Squad> Squad { get; set; } 
        public DbSet<SquadMember> SquadMembers { get; set; }
        public DbSet<WaterEvent> WaterPractices { get; set; }
        public DbSet<WaterEventAttendee> WaterPracticeAttendees { get; set; }
        public DbSet<WaterEventBoat> WaterPracticeBoats { get; set; }
        public DbSet<Boat> Boats { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder
                .Entity<WaterEventAttendee>(WaterEventAttendee.BuildEntityType)
                .Entity<SquadMember>(SquadMember.BuildEntityType)
                .Entity<ClubMember>(ClubMember.BuildEntityType)
                .Entity<WaterEventBoat>(WaterEventBoat.BuildEntityType);

            //var dbSetTypes = GetType()
            //    .GetProperties()
            //    .Where(info => info.PropertyType.IsGenericType
            //                   && info.PropertyType.GetGenericTypeDefinition() == typeof (DbSet<>))
            //    .Select(info => info.PropertyType.GetGenericArguments().First());

            //var entityMethod = modelBuilder
            //    .GetType()
            //    .GetMethod(nameof(modelBuilder.Entity));

            //foreach (var entityType in dbSetTypes)
            //{
            //    var buildActionMethod = entityType.GetMethod("BuildEntityType");
            //    var entityTypeBuilderType = typeof (EntityTypeBuilder<>).MakeGenericType(entityType);
            //    var buildAction = Delegate.CreateDelegate(entityTypeBuilderType, buildActionMethod);

            //    var typedEntityMethod = entityMethod.MakeGenericMethod(entityType);
            //    typedEntityMethod.Invoke(modelBuilder, new object[] {buildAction});
            //}
        }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(@"Server=localhost\MSSQL2016;Database=TheEight_dev;Trusted_Connection=True;");
        }
    }
}
