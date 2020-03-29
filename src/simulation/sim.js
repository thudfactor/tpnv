import { randomNormal, randomUniform } from "d3";


const warning_dates = [13,14];
const closed_dates = [15,16];
const sim_length = 30;
const use_rate = .2;  //rolls per person per day. This works out to about 1.4 rolls a week per person.
const community_size = 3000;

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max)) + 1;
}

// This is the array of households
let households = [];

// Keeps track of whether or not the store is closing
let closing = -1; // -1 -- not closing. 0: closed. 1 closing imminently.
let pressure = 0; // No pressure to buy. 1 = emergency pressure to buy
let date = 0;

// Generate the household information at random
// The number of members in particular is nowhere near a natural distribution
// The other numbers might be improved by some buying habit information, but random
// is good enough for now.
const rollsRandom = randomUniform(2,32);
const purchaseRandom = randomNormal(8,1);
const folksRandom = randomNormal(4,1);

for(let i = 0; i < community_size; i++) {
  const rolls = Math.round(rollsRandom())
  const purchase = 4 * Math.round(purchaseRandom())
  const threshold = Math.ceil(purchase * .1)
  const members = Math.round(folksRandom());
  const th = {
    rolls,
    purchase,
    threshold,
    members
  }
  households.push(th)
}

console.log(households);

// Other logic currently assumes these dates are consecutive

// This array keeps a historical record of trips.
const sim_days = [];

// This constant sets the length of the simulation.

// Determine whether or not a household will buy toilet paper.
// This is based on their current stock and their household
// purchase threshold.
function willBuy(hh) {
  if (closing === 0) return 0;
  if (closing === 1 ) {
    const leadTime = (closed_dates.length + warning_dates.length);

    // This is the "we'll survive" logic; people purchase
    // only if they assume they will totally run out of toilet paper
    // during the closure
    // 
    // Needs to be rewritten to take into account sales pressure
    /*
    if (stockFor(hh) <= (leadTime * 2) ) { 
      const purchase = hh.purchase;
      if((purchase + hh.rolls) / use_rate < leadTime) {
        //console.log("Stock Buy");
        purchase *= 2;
      } else {
        //console.log("Early Buy", stockFor(hh));
      }
      return purchase;
    }*/

    // This logic calculates whether or not they expect
    // they will meet the threshold of rolls during 
    // the closure.
    //
    // Currently this naive logic pushes purchasing towards the early
    // part of the warning period, which is unrealistic; preassure to
    // buy increases with time
    if (hh.rolls - (leadTime * use_rate * hh.members) <= hh.threshold) {
      if(Math.random() <= pressure) {
        return hh.purchase;
      }
    }
    
    // No return here, normal behavior
  }

  return (hh.rolls <= hh.threshold) ? hh.purchase : 0;
}

// How many days stocked for
function stockFor(hh) {
  return hh.rolls / use_rate;
}

// This calculates the daily use rate for each household.
// It is currently a simple, naive assumption that usage
// remains constant for each member.
function willUse(hh) {
  return hh.members * use_rate;
}

// For each day, count the number of trips and number of rolls purchased
const grocery_trips = []

function runDay() {
  
  date = sim_days.length + 1; 

  if (closed_dates.includes(date)) {
    closing = 0;
    pressure = 0;
  } else if (warning_dates.includes(date)) {
    pressure = (warning_dates.indexOf(date) + 1) / warning_dates.length
    //console.log(warning_dates.indexOf(date), pressure)
    closing = 1
  } else {
    closing = -1;
    pressure = 0;
  }

  const trips_today = {
    visits: 0,
    rolls: 0,
    store_state: closing
  }
  
  const today = households.map(hh => {
    const thh = {...hh};
    thh.rolls -= willUse(thh);
    if(thh.rolls < 0) {
      thh.rolls = 0
    }
    const buying = willBuy(thh);
    if(buying > 0) {
      thh.rolls += buying;
      trips_today.visits += 1;
      trips_today.rolls += buying;
    }
    return thh;
  });

  households = today;
  sim_days.push(today);
  grocery_trips.push(trips_today);
  //console.log(sim_days.length,trips_today.visits, trips_today.rolls,closing);
}

export default function() {
  while (sim_days.length < sim_length) {
    runDay();
  } 
  return { sim_days, grocery_trips }
}