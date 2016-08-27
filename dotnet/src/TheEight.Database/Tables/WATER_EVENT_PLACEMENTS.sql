CREATE TABLE [dbo].[WATER_EVENT_PLACEMENTS]
(
    [AttendeeId] UNIQUEIDENTIFIER NOT NULL, 
    [BoatId] UNIQUEIDENTIFIER NOT NULL, 
    [SeatNumber] TINYINT NOT NULL, 
    CONSTRAINT [PK__WATER_EVENT_PLACEMENTS] PRIMARY KEY ([AttendeeId], [BoatId]), 
    CONSTRAINT [AK__WATER_EVENT_PLACEMENTS__SeatNumber__BoatId] UNIQUE ([SeatNumber], [BoatId]), 
    CONSTRAINT [CK__WATER_EVENT_PLACEMENTS__SeatNumber_Positive] CHECK ([SeatNumber] > 0) 
)

GO

CREATE TRIGGER [dbo].[TRG__WATER_EVENT_PLACEMENTS]
    ON [dbo].[WATER_EVENT_PLACEMENTS]
    FOR INSERT, UPDATE
    AS
    BEGIN
        SET NOCOUNT ON;

		DECLARE @valid BIT = (
			SELECT 
				CASE 
					WHEN boat.[SeatCount] >= ins.[SeatNumber] THEN 1 
					ELSE 0 
				END
			FROM [dbo].[WATER_EVENT_BOATS] AS boat
			INNER JOIN inserted AS ins
				ON ins.[BoatId] = boat.[BoatId]
		);
		
		IF @valid = 0 
		BEGIN
			RAISERROR ('[dbo].[WATER_EVENT_PLACEMENTS].[SeatNumber] cannot be greater than [dbo].[WATER_EVENT_BOATS].[SeatCount]', 16, 1);
			ROLLBACK TRANSACTION;
		END
    END