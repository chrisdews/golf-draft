import { Fixture } from '../types'

// end_date uses a far-future year so the "upcoming tournaments" filter always passes in mock mode
const mockFixtures: Fixture[] = [
  {
    id: "219",
    name: "Mock Masters Tournament",
    start_date: "2027-04-07 00:00:00",
    end_date: "2099-04-13 00:00:00",
    type: "Stroke Play",
    course: "Augusta National Golf Club",
    country: "USA",
  },
  {
    id: "220",
    name: "Mock US Open",
    start_date: "2027-06-16 00:00:00",
    end_date: "2099-06-19 00:00:00",
    type: "Stroke Play",
    course: "Pebble Beach Golf Links",
    country: "USA",
  },
  {
    id: "221",
    name: "Mock The Open Championship",
    start_date: "2027-07-15 00:00:00",
    end_date: "2099-07-18 00:00:00",
    type: "Stroke Play",
    course: "St Andrews Links",
    country: "SCO",
  },
  {
    id: "222",
    name: "Mock Team Event (excluded)",
    start_date: "2027-09-25 00:00:00",
    end_date: "2099-09-27 00:00:00",
    type: "Team",
    course: "Marco Simone Golf Club",
    country: "ITA",
  },
]

export default mockFixtures
