var _ = require('lodash');
var filter = require('filter-values');

Array.prototype.deepRemove = function(values) {
  return this.map(childArray => {
    return childArray.filter(item => !_.includes(values, item));
  });
};

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

  // takes an array
  // returns an object, keyed by candidates, values are their counts
  static getCounts(list) {
    return _.countBy(list, _.identity);
  }

  // takes array
  // returns an object: losers who have the lowest count, along with their counts
  getLoserCandidates(list) {
    // find lowest count, then find all candidates with that count
    let counts = InstantRunoffVote.getCounts(list);
    let lowestCount = this.getLowestCount(counts);

    return filter(counts, (value, key, obj) => { return value === lowestCount });
  }

  // takes an object, with candidate keys and count values
  getLowestCount(obj) {
    let lowestCount = this.voteList.length;
    for (var key in obj) {
      let count = obj[key];
      if (count < lowestCount) {
        lowestCount = count;
      }
    }
    return lowestCount;
  }

  // if there is more than one loser candidate, check subsequent sets of votes
  // takes object: keyed by loser candidates, with counts as values
  // voteList is the master list to consult from current round on
  static findLoser(loserCandidates, voteList) {
    // determine if there is a single loser from current round
    if (hasOneLoser(loserCandidates)) {
      return loserCandidates;
    }

    // a single loser cannot be determined from current round
    return InstantRunoffVote.recursiveTiebreaker(loserCandidates, voteList);

    function hasOneLoser(obj) {
      return !!(Object.keys(obj).length === 1);
    }
  }

  static recursiveTiebreaker(loserCandidates, voteList) {
    // first check is whether the list has been exhausted, thus an unbroken tie
    let sortedCounts = getSortedValues(loserCandidates);
    if (listHasExhausted(sortedCounts)) {
      // TODO: determine return value for ties that can't be broken
      console.log('No loser determined due to unbroken tie');
      return [];
    }

    // next, check for broken tie
    if (tieIsBroken(sortedCounts)) {
      // get all losers with lowest count
      let lowestCount = sortedCounts[0];
      return getLoserByCount(loserCandidates, lowestCount);
    }

    // tie remains. as a result, look to the next set of votes to break tie
    // filtered by loser candidates
    let filteredVoteList = deepFilter(voteList, loserCandidates);

    // get counts for filteredVoteList and update losers candidates
    let nextRoundList = filteredVoteList
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

    return InstantRunoffVote.recursiveTiebreaker(updatedLoserCandidates, filteredVoteList);


    function getSortedValues(obj) {
      let values = _.values(obj);
      return values.sort((a, b) => a - b );
    }

    function listHasExhausted(array) {
      return !!(_.head(array) === 0 && _.last(array) === 0);
    }

    function tieIsBroken(sortedArray) {
      return !!(sortedArray[0] !== sortedArray[1]);
    }

    function getLoserByCount(candidates, count) {
      let losers = filter(candidates, (value, key, obj) => { return value === count });
      return Object.keys(losers);
    }

    function deepFilter(array, loserCandidates) {
      return array.map(childArray => {
        return childArray
          .slice(1)
          .filter(item => {
            return _.includes(Object.keys(loserCandidates), item);
          });
      });
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
  }

  // build overall results, which consist of round data
  getResults() {
    // start with original votes
    return buildRound.call(this, this.voteList);

    // takes an array of arrays
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

      // get loser candidates for current round
      let loserCandidates = this.getLoserCandidates(round.list);
      // determine ultimate loser from this round. resolve ties by looking at sets of lower ranked votes
      round.loserList = InstantRunoffVote.findLoser(loserCandidates, this.voteList);

      // at this time, a loser has been declared
      // push round to results
      this.results.push(round);
      // filter out loser from overall votelist so subsequent votes can matriculate
      this.voteList = list.deepRemove(round.loserList);

      return buildRound.call(this, this.voteList);
    }
  }
}

module.exports = InstantRunoffVote;