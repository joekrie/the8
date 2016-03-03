Feature: Boat lineup planner
	As a coach
	I want to arrange rowers and coxswains in boats
	So that rowers, coxwains and coaches can view boat lineups

	Background: 
		Given I am a coach
	
	Scenario: Create and publish a workout
		When I create a workout for my team
			And I publish the workout
		Then I can access the workout
			And all rowers on my team can access the workout