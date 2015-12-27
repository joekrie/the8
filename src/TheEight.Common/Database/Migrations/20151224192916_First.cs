using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using Microsoft.Data.Entity.Metadata;

namespace TheEight.Common.Database.Migrations
{
    public partial class First : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    UserId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    AccountKey = table.Column<string>(nullable: true),
                    AccountProvider = table.Column<int>(nullable: false),
                    CellPhone = table.Column<string>(nullable: true),
                    Email = table.Column<string>(nullable: true),
                    GivenName = table.Column<string>(nullable: true),
                    Surname = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_User", x => x.UserId);
                });

            migrationBuilder.CreateTable(
                name: "Club",
                columns: table => new
                {
                    ClubId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Name = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Club", x => x.ClubId);
                });

            migrationBuilder.CreateTable(
                name: "WaterPractice",
                columns: table => new
                {
                    WaterPracticeId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WaterPractice", x => x.WaterPracticeId);
                });

            migrationBuilder.CreateTable(
                name: "ClubMember",
                columns: table => new
                {
                    ClubMemberId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ClubId = table.Column<int>(nullable: false),
                    MemberSince = table.Column<DateTime>(nullable: false),
                    UserId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClubMember", x => x.ClubMemberId);
                    table.ForeignKey(
                        name: "FK_ClubMember_Club_ClubId",
                        column: x => x.ClubId,
                        principalTable: "Club",
                        principalColumn: "ClubId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ClubMember_User_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Squad",
                columns: table => new
                {
                    SquadId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ClubId = table.Column<int>(nullable: false),
                    End = table.Column<DateTime>(nullable: false),
                    Name = table.Column<string>(nullable: true),
                    Start = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Squad", x => x.SquadId);
                    table.ForeignKey(
                        name: "FK_Squad_Club_ClubId",
                        column: x => x.ClubId,
                        principalTable: "Club",
                        principalColumn: "ClubId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Boat",
                columns: table => new
                {
                    BoatId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    Discriminator = table.Column<string>(nullable: false),
                    IsCoxed = table.Column<bool>(nullable: false),
                    RowerCount = table.Column<int>(nullable: false),
                    Title = table.Column<string>(nullable: true),
                    ClubId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Boat", x => x.BoatId);
                    table.ForeignKey(
                        name: "FK_Boat_Club_ClubId",
                        column: x => x.ClubId,
                        principalTable: "Club",
                        principalColumn: "ClubId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SquadMember",
                columns: table => new
                {
                    SquadMemberId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    ClubMemberId = table.Column<int>(nullable: false),
                    Role = table.Column<int>(nullable: false),
                    SquadId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SquadMember", x => x.SquadMemberId);
                    table.ForeignKey(
                        name: "FK_SquadMember_ClubMember_ClubMemberId",
                        column: x => x.ClubMemberId,
                        principalTable: "ClubMember",
                        principalColumn: "ClubMemberId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SquadMember_Squad_SquadId",
                        column: x => x.SquadId,
                        principalTable: "Squad",
                        principalColumn: "SquadId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WaterPracticeBoat",
                columns: table => new
                {
                    WaterPracticeBoatId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    BoatId = table.Column<int>(nullable: false),
                    WaterPracticeId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WaterPracticeBoat", x => x.WaterPracticeBoatId);
                    table.ForeignKey(
                        name: "FK_WaterPracticeBoat_Boat_BoatId",
                        column: x => x.BoatId,
                        principalTable: "Boat",
                        principalColumn: "BoatId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WaterPracticeBoat_WaterPractice_WaterPracticeId",
                        column: x => x.WaterPracticeId,
                        principalTable: "WaterPractice",
                        principalColumn: "WaterPracticeId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "WaterPracticeAttendee",
                columns: table => new
                {
                    WaterPracticeAttendeeId = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn),
                    SquadMemberId = table.Column<int>(nullable: false),
                    WaterPracticeBoatId = table.Column<int>(nullable: true),
                    WaterPracticeId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WaterPracticeAttendee", x => x.WaterPracticeAttendeeId);
                    table.UniqueConstraint("AK_WaterPracticeAttendee_WaterPracticeId_SquadMemberId", x => new { x.WaterPracticeId, x.SquadMemberId });
                    table.ForeignKey(
                        name: "FK_WaterPracticeAttendee_SquadMember_SquadMemberId",
                        column: x => x.SquadMemberId,
                        principalTable: "SquadMember",
                        principalColumn: "SquadMemberId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WaterPracticeAttendee_WaterPracticeBoat_WaterPracticeBoatId",
                        column: x => x.WaterPracticeBoatId,
                        principalTable: "WaterPracticeBoat",
                        principalColumn: "WaterPracticeBoatId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_WaterPracticeAttendee_WaterPractice_WaterPracticeId",
                        column: x => x.WaterPracticeId,
                        principalTable: "WaterPractice",
                        principalColumn: "WaterPracticeId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ClubMember_ClubId",
                table: "ClubMember",
                column: "ClubId");

            migrationBuilder.CreateIndex(
                name: "IX_ClubMember_UserId",
                table: "ClubMember",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Squad_ClubId",
                table: "Squad",
                column: "ClubId");

            migrationBuilder.CreateIndex(
                name: "IX_SquadMember_ClubMemberId",
                table: "SquadMember",
                column: "ClubMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_SquadMember_SquadId",
                table: "SquadMember",
                column: "SquadId");

            migrationBuilder.CreateIndex(
                name: "IX_Boat_ClubId",
                table: "Boat",
                column: "ClubId");

            migrationBuilder.CreateIndex(
                name: "IX_WaterPracticeAttendee_SquadMemberId",
                table: "WaterPracticeAttendee",
                column: "SquadMemberId");

            migrationBuilder.CreateIndex(
                name: "IX_WaterPracticeAttendee_WaterPracticeBoatId",
                table: "WaterPracticeAttendee",
                column: "WaterPracticeBoatId");

            migrationBuilder.CreateIndex(
                name: "IX_WaterPracticeAttendee_WaterPracticeId",
                table: "WaterPracticeAttendee",
                column: "WaterPracticeId");

            migrationBuilder.CreateIndex(
                name: "IX_WaterPracticeBoat_BoatId",
                table: "WaterPracticeBoat",
                column: "BoatId");

            migrationBuilder.CreateIndex(
                name: "IX_WaterPracticeBoat_WaterPracticeId",
                table: "WaterPracticeBoat",
                column: "WaterPracticeId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "WaterPracticeAttendee");

            migrationBuilder.DropTable(
                name: "SquadMember");

            migrationBuilder.DropTable(
                name: "WaterPracticeBoat");

            migrationBuilder.DropTable(
                name: "ClubMember");

            migrationBuilder.DropTable(
                name: "Squad");

            migrationBuilder.DropTable(
                name: "Boat");

            migrationBuilder.DropTable(
                name: "WaterPractice");

            migrationBuilder.DropTable(
                name: "User");

            migrationBuilder.DropTable(
                name: "Club");
        }
    }
}
