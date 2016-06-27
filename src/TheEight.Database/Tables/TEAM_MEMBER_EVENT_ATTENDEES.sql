﻿CREATE TABLE [dbo].[TEAM_MEMBER_EVENT_ATTENDEES]
(
    [AttendeeId] UNIQUEIDENTIFIER NOT NULL, 
	[TeamMemberUserId] UNIQUEIDENTIFIER NOT NULL, 
    CONSTRAINT [PK__TEAM_MEMBER_EVENT_ATTENDEES] PRIMARY KEY ([AttendeeId]), 
    CONSTRAINT [FK__TEAM_MEMBER_EVENT_ATTENDEES__EVENT_ATTENDEES] FOREIGN KEY ([AttendeeId]) 
		REFERENCES [EVENT_ATTENDEES]([AttendeeId]), 
    CONSTRAINT [FK__TEAM_MEMBER_EVENT_ATTENDEES__TEAM_MEMBERS] FOREIGN KEY ([TeamMemberUserId]) REFERENCES [TEAM_MEMBERS]([ClubMemberUserId])

)
