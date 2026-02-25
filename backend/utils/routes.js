// Predefined auto routes through the city
// Each route is an ordered array of stops
const ROUTES = [
  ["College", "Maqsudan", "Jyoti Chowk", "Rama Mandi", "City Station"],
  ["Bus Stand", "City Station", "Maqsudan", "College"],
  ["College", "Maqsudan", "Cantt. Station", "Rama Mandi"],
  ["Bus Stand", "Cantt. Station", "Maqsudan", "College"],
];

/**
 * Given a ride's from/to, find all rides that pass through the student's
 * requested from/to stops. A ride matches if both the student's "from" and
 * "to" appear on the same route as the ride AND in the correct travel direction.
 */
const findMatchingRides = (rides, studentFrom, studentTo) => {
  if (!studentFrom && !studentTo) return rides;

  return rides.filter((ride) => {
    // Direct match — always include
    const fromMatch =
      !studentFrom || ride.from.toLowerCase() === studentFrom.toLowerCase();
    const toMatch =
      !studentTo || ride.to.toLowerCase() === studentTo.toLowerCase();
    if (fromMatch && toMatch) return true;

    // Route-based midway matching
    for (const route of ROUTES) {
      const routeLower = route.map((s) => s.toLowerCase());

      // Find ride's from/to on this route
      const rideFromIdx = routeLower.indexOf(ride.from.toLowerCase());
      const rideToIdx = routeLower.indexOf(ride.to.toLowerCase());

      if (rideFromIdx === -1 || rideToIdx === -1) continue;

      // Determine ride direction
      const rideForward = rideFromIdx < rideToIdx;

      // Find student's from/to on this route
      const studentFromIdx = studentFrom
        ? routeLower.indexOf(studentFrom.toLowerCase())
        : rideFromIdx;
      const studentToIdx = studentTo
        ? routeLower.indexOf(studentTo.toLowerCase())
        : rideToIdx;

      if (studentFromIdx === -1 || studentToIdx === -1) continue;

      // Student points must be between ride's start and end, in the same direction
      if (rideForward) {
        if (
          studentFromIdx >= rideFromIdx &&
          studentToIdx <= rideToIdx &&
          studentFromIdx < studentToIdx
        ) {
          return true;
        }
      } else {
        if (
          studentFromIdx <= rideFromIdx &&
          studentToIdx >= rideToIdx &&
          studentFromIdx > studentToIdx
        ) {
          return true;
        }
      }
    }

    return false;
  });
};

module.exports = { ROUTES, findMatchingRides };
