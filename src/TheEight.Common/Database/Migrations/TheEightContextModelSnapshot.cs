using System;
using Microsoft.Data.Entity;
using Microsoft.Data.Entity.Infrastructure;
using Microsoft.Data.Entity.Metadata;
using Microsoft.Data.Entity.Migrations;
using TheEight.Common.Database;

namespace TheEight.Common.Database.Migrations
{
    [DbContext(typeof(TheEightContext))]
    partial class TheEightContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "7.0.0-rc2-16630")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("TheEight.Common.Database.Entities.Accounts.User", b =>
                {
                    b.ToTable("User");

                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("AccountKey");

                    b.Property<int>("AccountProvider");

                    b.Property<string>("CellPhone");

                    b.Property<string>("Email");

                    b.Property<string>("GivenName");

                    b.Property<string>("Surname");

                    b.HasKey("UserId");
                });

            modelBuilder.Entity("TheEight.Common.Database.Entities.Teams.Club", b =>
                {
                    b.ToTable("Club");

                    b.Property<int>("ClubId")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Name");

                    b.HasKey("ClubId");
                });

            modelBuilder.Entity("TheEight.Common.Database.Entities.Teams.ClubMember", b =>
                {
                    b.ToTable("ClubMember");

                    b.Property<int>("ClubMemberId")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("ClubId");

                    b.Property<DateTime>("MemberSince");

                    b.Property<int>("UserId");

                    b.HasKey("ClubMemberId");

                    b.HasIndex("ClubId");

                    b.HasIndex("UserId");
                });

            modelBuilder.Entity("TheEight.Common.Database.Entities.Teams.Squad", b =>
                {
                    b.ToTable("Squad");

                    b.Property<int>("SquadId")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("ClubId");

                    b.Property<DateTime>("End");

                    b.Property<string>("Name");

                    b.Property<DateTime>("Start");

                    b.HasKey("SquadId");

                    b.HasIndex("ClubId");
                });

            modelBuilder.Entity("TheEight.Common.Database.Entities.Teams.SquadMember", b =>
                {
                    b.ToTable("SquadMember");

                    b.Property<int>("SquadMemberId")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("ClubMemberId");

                    b.Property<int>("Role");

                    b.Property<int>("SquadId");

                    b.HasKey("SquadMemberId");

                    b.HasIndex("ClubMemberId");

                    b.HasIndex("SquadId");
                });

            modelBuilder.Entity("TheEight.Common.Database.Entities.WaterPractices.Boat", b =>
                {
                    b.ToTable("Boat");

                    b.Property<int>("BoatId")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Discriminator")
                        .IsRequired();

                    b.Property<bool>("IsCoxed");

                    b.Property<int>("RowerCount");

                    b.Property<string>("Title");

                    b.HasKey("BoatId");

                    b.HasAnnotation("Relational:DiscriminatorProperty", "Discriminator");

                    b.HasAnnotation("Relational:DiscriminatorValue", "Boat");
                });

            modelBuilder.Entity("TheEight.Common.Database.Entities.WaterPractices.WaterPractice", b =>
                {
                    b.ToTable("WaterPractice");

                    b.Property<int>("WaterPracticeId")
                        .ValueGeneratedOnAdd();

                    b.HasKey("WaterPracticeId");
                });

            modelBuilder.Entity("TheEight.Common.Database.Entities.WaterPractices.WaterPracticeAttendee", b =>
                {
                    b.ToTable("WaterPracticeAttendee");

                    b.Property<int>("WaterPracticeAttendeeId")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("SquadMemberId");

                    b.Property<int?>("WaterPracticeBoatId");

                    b.Property<int>("WaterPracticeId");

                    b.HasKey("WaterPracticeAttendeeId");

                    b.HasAlternateKey("WaterPracticeId", "SquadMemberId");

                    b.HasIndex("SquadMemberId");

                    b.HasIndex("WaterPracticeBoatId");

                    b.HasIndex("WaterPracticeId");
                });

            modelBuilder.Entity("TheEight.Common.Database.Entities.WaterPractices.WaterPracticeBoat", b =>
                {
                    b.ToTable("WaterPracticeBoat");

                    b.Property<int>("WaterPracticeBoatId")
                        .ValueGeneratedOnAdd();

                    b.Property<int>("BoatId");

                    b.Property<int>("WaterPracticeId");

                    b.HasKey("WaterPracticeBoatId");

                    b.HasIndex("BoatId");

                    b.HasIndex("WaterPracticeId");
                });

            modelBuilder.Entity("TheEight.Common.Database.Entities.WaterPractices.ClubBoat", b =>
                {
                    b.HasBaseType("TheEight.Common.Database.Entities.WaterPractices.Boat");

                    b.ToTable("ClubBoat");

                    b.Property<int>("ClubId");

                    b.HasIndex("ClubId");

                    b.HasAnnotation("Relational:DiscriminatorValue", "ClubBoat");
                });

            modelBuilder.Entity("TheEight.Common.Database.Entities.Teams.ClubMember", b =>
                {
                    b.HasOne("TheEight.Common.Database.Entities.Teams.Club")
                        .WithMany()
                        .HasForeignKey("ClubId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("TheEight.Common.Database.Entities.Accounts.User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("TheEight.Common.Database.Entities.Teams.Squad", b =>
                {
                    b.HasOne("TheEight.Common.Database.Entities.Teams.Club")
                        .WithMany()
                        .HasForeignKey("ClubId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("TheEight.Common.Database.Entities.Teams.SquadMember", b =>
                {
                    b.HasOne("TheEight.Common.Database.Entities.Teams.ClubMember")
                        .WithMany()
                        .HasForeignKey("ClubMemberId");

                    b.HasOne("TheEight.Common.Database.Entities.Teams.Squad")
                        .WithMany()
                        .HasForeignKey("SquadId");
                });

            modelBuilder.Entity("TheEight.Common.Database.Entities.WaterPractices.WaterPracticeAttendee", b =>
                {
                    b.HasOne("TheEight.Common.Database.Entities.Teams.SquadMember")
                        .WithMany()
                        .HasForeignKey("SquadMemberId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("TheEight.Common.Database.Entities.WaterPractices.WaterPracticeBoat")
                        .WithMany()
                        .HasForeignKey("WaterPracticeBoatId");

                    b.HasOne("TheEight.Common.Database.Entities.WaterPractices.WaterPractice")
                        .WithMany()
                        .HasForeignKey("WaterPracticeId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("TheEight.Common.Database.Entities.WaterPractices.WaterPracticeBoat", b =>
                {
                    b.HasOne("TheEight.Common.Database.Entities.WaterPractices.Boat")
                        .WithMany()
                        .HasForeignKey("BoatId")
                        .OnDelete(DeleteBehavior.Cascade);

                    b.HasOne("TheEight.Common.Database.Entities.WaterPractices.WaterPractice")
                        .WithMany()
                        .HasForeignKey("WaterPracticeId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("TheEight.Common.Database.Entities.WaterPractices.ClubBoat", b =>
                {
                    b.HasOne("TheEight.Common.Database.Entities.Teams.Club")
                        .WithMany()
                        .HasForeignKey("ClubId")
                        .OnDelete(DeleteBehavior.Cascade);
                });
        }
    }
}
