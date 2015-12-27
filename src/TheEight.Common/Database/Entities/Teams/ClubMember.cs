using System;
using System.Collections.Generic;
using Microsoft.Data.Entity;
using Microsoft.Data.Entity.Metadata;
using Microsoft.Data.Entity.Metadata.Builders;
using TheEight.Common.Database.Entities.Accounts;

namespace TheEight.Common.Database.Entities.Teams
{
    public class ClubMember
    {
        public int ClubMemberId { get; set; }

        public DateTime MemberSince { get; set; }

        public int UserId { get; set; }
        public User User { get; set; }

        public int ClubId { get; set; }
        public Club Club { get; set; }

        public List<SquadMember> SquadMembers { get; set; }

        internal static void BuildEntityType(EntityTypeBuilder<ClubMember> entityBuilder)
        {
            entityBuilder
                .HasOne(cm => cm.User)
                .WithMany(u => u.ClubMembers)
                .HasForeignKey(cm => cm.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entityBuilder
                .HasOne(cm => cm.Club)
                .WithMany(c => c.ClubMembers)
                .HasForeignKey(cm => cm.ClubId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}