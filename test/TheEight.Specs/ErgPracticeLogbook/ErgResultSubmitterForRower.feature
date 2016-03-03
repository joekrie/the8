Feature: Erg result submitter for rower
	As a rower
	I want to submit erg results
	So that I can log my erg results

	Background:
		Given I am a rower

	Scenario: Submit results of a personal workout
		Given a personal workout exists without results submitted
		When I submit results of the workout
		Then I can access the results

	Scenario: Modify results of a personal workouts
		Given a personal workout exists with results submitted
		When I modify results of the workout
		Then I can access the new results

	Scenario: Submit results of a team workout
		Given a team workout exists 
			And my results have not been submitted
			And the due date of the workout is in the future
		When I submit results of the workout
		Then I can access the results
		
	Scenario: Cannot submit results of a team workout after the due date
		Given a team workout exists
			And the due date of the workout is in the past
		When I attempt to submit results of the workout
		Then an error message says the due date is in the past

	Scenario: Cannot modify results of a team workout if submitted by a coach
		Given a team workout exists
			And a coach has submitted my results
		When I attempt to submit results of the workout
		Then an error message says I cannot modify results submitted by a coach