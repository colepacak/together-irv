var _ = require('lodash');
var filter = require('filter-values');

Array.prototype.deepRemove = function(values) {
  return this.map(childArray => {
    return childArray.filter(item => !_.includes(values, item));
  });
};

Array.prototype.getTally = function() {
  let tally = this.reduce((reduction, currentValue) => {
    let match = reduction.find(o => { return o.name === currentValue[0] });
    if (match) {
      match.count++;
    } else {
      reduction.push({ name: currentValue[0], count: 1 });
    }
    return reduction;
  }, []);
  return _.sortBy(tally, 'count');
};

class InstantRunoffVote {
  constructor(voteList) {
    this.votes = voteList;
    // ultimately building a results array of objects. each object consists of that round's votes and a loser
    this.rounds = [];
    this.winners = [];
  }

  hasWinner() {
    return !!(this.winners.length);
  }

  // takes an array of votes for a specific round
  checkForMajority(round) {
    var result = { majorityExists: false, winner: null };

    for (let i = 0; i < round.votes.length; i++) {
      let obj = round.votes[i];
      var percentage = obj.count / round.count;

      if (percentage > 0.5) {
        result = { majorityExists: true, winner: obj.name };
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
  getLoserCandidates(tally) {
    let lowestCount = tally[0].count;
    return tally.filter(t => t.count === lowestCount);
  }

  // takes an object, with candidate keys and count values
  getLowestCount(obj) {
    let lowestCount = this.votes.length;
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
  findLoser(loserCandidates, votes) {
    // determine if there is a single loser from current round
    if (loserCandidates.length === 1) {
      return loserCandidates[0];
    }

    // a single loser cannot be determined from current round
    return this.recursiveTiebreaker(loserCandidates, votes);
  }

  recursiveTiebreaker(loserCandidates, votes) {
    // first check is whether the list has been exhausted, thus an unbroken tie
    if (listHasExhausted(loserCandidates)) {
      // TODO: determine return value for ties that can't be broken
      return;
    }

    // next, check for broken tie
    if (tieIsBroken(loserCandidates)) {
      // get all losers with lowest count
      return loserCandidates[0];
    }

    // tie remains. as a result, look to the next set of votes to break tie
    // filtered by loser candidates
    let filteredVotes = deepFilter(votes, loserCandidates);

    // get counts for filteredVotes and update losers candidates
    let nextRoundList = filteredVotes
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

    return this.recursiveTiebreaker(updatedLoserCandidates, filteredVotes);


    function listHasExhausted(array) {
      return !!(_.head(array).count === 0 && _.last(array).count === 0);
    }

    function tieIsBroken(sortedArray) {
      return !!(sortedArray[0].count !== sortedArray[1].count);
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

  /**
   * Build overall results, which consist of round data
   * @param votes: an array of arrays
   * @returns {*}
   */
  setResults(votes = this.votes) {
    var round = {
      votes: [],
      loser: null,
      count: null
    };

    round.votes = votes.getTally();
    round.count = round.votes.reduce((reduction, currentValue) => {
      return reduction + currentValue.count;
    }, 0);

    // check for item with majority
    var majorityCheck = this.checkForMajority(round);
    if (majorityCheck.majorityExists) {
      this.rounds.push(round);
      return this.winners = majorityCheck.winner;
    }

    // get loser candidates for current round
    let loserCandidates = this.getLoserCandidates(round.votes);
    // determine ultimate loser from this round. resolve ties by looking at sets of lower ranked votes
    round.loser = this.findLoser(loserCandidates, votes);

    this.rounds.push(round);

    let filteredVotes = votes.deepRemove(round.losers);

    return this.setResults(filteredVotes);
  }
}

module.exports = InstantRunoffVote;