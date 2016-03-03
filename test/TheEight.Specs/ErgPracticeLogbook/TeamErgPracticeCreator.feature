Feature: Team erg practice creator
	As a coach
	I want to create a team erg workout 
	So that the results of the workout can be stored

	Background: 
		Given I am a coach
	
	Scenario: Create and publish a workout
		When I create a workout for my team
			And I publish the workout
		Then I can access the workout
			And all rowers on my team can access the workout

	Scenario: Create a workout but do not publish it
		When I create a workout for my team
			But I do not publish the workout
		Then I can access the workout
			But rowers on my team cannot access the workout
				
	Scenario: Delete a workout
		Given a workout for my team exists
		When I delete the workout
		Then rowers on my team cannot access the workout

	Scenario: Delete workout with submitted results
		Given a workout for my team exists
			And results have been submitted for the workout
		When I delete the workout
		Then rowers on my team cannot access the workout
			And aggregates for the rowers no longer include the workout

	Scenario: Edit a workout piece with no results
		Given a team workout exists with no results
		When I edit a workout piece
		Then the workout piece changes