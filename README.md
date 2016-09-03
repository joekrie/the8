# The Eight
[![Build status](https://ci.appveyor.com/api/projects/status/e70qp48brvrdyxlh?svg=true)](https://ci.appveyor.com/project/joekrie/the8)

Management tool for rowing clubs to manage teams, water practices, race lineups, and erg practices.

Most recent development work has been on the [boat lineup planner UI](js/src/app/boat-lineup-planner)

## Features
* Lineup planner to set up lineups for practices and races
* Logbook for erg workouts

## Technology stack
* ASP.NET Core
* ReactJS
* Azure SQL
* Azure Queues
* Azure Scheduler
* Azure WebJobs

## Third-party services & APIs
* [Namecheap](https://www.namecheap.com/): domain registration & DNS
* [Twilio](https://www.twilio.com/): SMS
* [Postmark](https://postmarkapp.com/): transactional email
* [Azure Active Directory B2C](https://azure.microsoft.com/en-us/services/active-directory-b2c/): authentication
* [Visual Studio Application Insights](https://azure.microsoft.com/en-us/services/application-insights/): analytics & telemetry
