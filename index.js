var _ = require('lodash');

// winner 'TD' - solved
var voteList1 = [
  ['HB', 'TD', 'FH'],
  ['TD', 'FH', 'HB'],
  ['HB', 'TD'],
  ['FH', 'TD']
];

// winner 'FH' - solved
var voteList2 = [
  ['HB', 'TD', 'FH'],
  ['TD', 'FH', 'HB'],
  ['HB', 'FH'],
  ['FH', 'TD']
];

class InstantRunoffVote {
  constructor(voteList) {
    // currently the thought is to use this as a global that gets changed as the rounds continue
    this.voteList = voteList;
    // ultimately building a results array of objects. each object consists of that round's votes and a loser
    this.results = [];
    this.winnerList = [];
  }

  // takes an array of votes for a specific round
  static checkForMajority(list) {
    var result = { majorityExists: false, winner: null };
    var counts = InstantRunoffVote.getCounts(list);

    for (var o in counts) {
      var count = counts[o];
      var percentage = count / list.length;

      if (percentage > 0.5) {
        result = { majorityExists: true, winner: o };
        break;
      }
    }

    return result;
  }

  // returns an object, keyed by candidates, values are their counts
  static getCounts(list) {
    return _.countBy(list, _.identity);
  }

  // takes array
  // returns an array of losers who have the lowest count, along with their counts
  getLoserCandidates(list) {
    // find lowest count, then find all candidates with that count
    let counts = InstantRunoffVote.getCounts(list);
    let lowestCount = this.voteList.length;
    for (var o in counts) {
      let count = counts[o];
      if (count < lowestCount) {
          lowestCount = count;
      }
    }

    let loserCandidates = {};
    for (var o in counts) {
      let count = counts[o];
      if (count === lowestCount) {
        loserCandidates[o] = count;
      }
    }

    return loserCandidates;
  }

  // build overall results, which consist of round data
  getResults() {
    // start with original votes
    return buildRound.call(this, this.voteList);

    function buildRound(list) {
      var round = {
        list: [],
        loserList: []
      };

      // load round list
      round.list = list.map(vote => vote[0] );

      // check for item with majority
      var majorityCheck = InstantRunoffVote.checkForMajority(round.list);
      if (majorityCheck.majorityExists) {
        this.results.push(round);
        return this.winnerList.push(majorityCheck.winner);
      }

      let loserCandidates = this.getLoserCandidates(round.list);
      round.loserList = findLoser(loserCandidates, this.voteList);

      // at this time, a loser has been declared
      // push round to results
      this.results.push(round);
      // filter out loser
      this.voteList = list.map(vote => {
        return vote.filter(item => !_.includes(round.loserList, item));
      });

      return buildRound.call(this, this.voteList);

      // takes the round list
      // if the next round needs to be consulted, use the nextIndex
      // voteList is the master list to consult from current round on
      function findLoser(loserCandidates, voteList) {
        // determine if there is a single loser from current round
        if (Object.keys(loserCandidates).length === 1) {
          return loserCandidates;
        }

        // a single loser cannot be determined from current round
        return findLoserInNextRound(loserCandidates, voteList);

        function findLoserInNextRound(loserCandidates, voteList) {
          // instead of checking for who has zero, check to see one has the least

          // check if at least one item is less than others
          let counts = _.values(loserCandidates);
          if (
            counts.length > 1 &&
            counts[0] !== counts[counts.length - 1]
          ) {
            // get all losers with lowest count
            let sortedCounts = counts.sort((a, b) => a - b );
            let lowestCount = sortedCounts[0];
            let losers = [];

            for (var key in loserCandidates) {
              let count = loserCandidates[key];
              if (count === lowestCount) {
                losers.push(key);
              }
            }
            return losers;
          }

          // as a result, look to the next round for a tie-breaker between loser candidates
          let futureRoundsFilteredByLosers = voteList.map(vote => {
            return vote
              .slice(1)
              .filter(item => {
                return _.includes(Object.keys(loserCandidates), item);
              });
          });

          // get counts for futureRoundsFilteredByLosers and update losers candidates
          let nextRoundList = futureRoundsFilteredByLosers
            .map(vote => {
              return vote[0];
            })
            .filter(item => {
              return typeof item !== 'undefined';
            });

          // update loserCandidates with new counts
          let updatedLoserCandidates = {};
          for (var candidate in loserCandidates) {
            updatedLoserCandidates[candidate] = getCount(nextRoundList, candidate);
          }

          function getCount(collection, candidate) {
            let count = 0;
            collection.forEach(item => {
              if (item === candidate) {
                count++;
              }
            });
            return count;
          }

          return findLoserInNextRound(updatedLoserCandidates, futureRoundsFilteredByLosers);
        }
      }
    }
  }
}

let vote = new InstantRunoffVote(voteList1);
vote.getResults();

console.log('the winners are:');
console.log(vote.winnerList);
console.log("\n");
