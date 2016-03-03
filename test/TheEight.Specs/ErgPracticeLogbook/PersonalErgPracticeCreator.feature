Feature: Personal erg practice creator
	As a rower
	I want to create a personal erg workout 
	So that I can store the results on the workout

	Background:
		Given I am a rower

	Scenario: Create a workout
		When I create a personal workout
		Then I can access the workout
			But other rowers on my team cannot access the workout

	Scenario: Delete a workout
		Given I have a personal workout
		When I delete the workout
		Then I can no longer access the workout

	Scenario: Edit a workout piece without results submitted
		Given a personal workout exists without results submitted
		When I edit a workout piece
		Then the workout piece changes

	Scenario: Edit a workout piece with results submitted
		Given a personal workout exists with results submitted
		When I attempt to edit a workout piece
		Then I am notified that results have been submitted