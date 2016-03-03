var _ = require('lodash');
var filter = require('filter-values');

Array.prototype.deepRemove = function(value) {
  return this.map(childArray => {
    return childArray.filter(item => item !== value);
  });
};

Array.prototype.deepFilterAdvance = function(filterVals) {
  return this
    .filter(childArray => {
      return _.includes(filterVals, childArray[0]);
    })
    .map(childArray => {
      return childArray.slice(1);
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

    for (let i = 0; i < round.tally.length; i++) {
      let obj = round.tally[i];
      var percentage = obj.count / round.count;

      if (percentage > 0.5) {
        result = { majorityExists: true, winner: obj.name };
        break;
      }
    }

    return result;
  }

  // takes array
  // returns an object: losers who have the lowest count, along with their counts
  getLoserCandidatesTally(tally) {
    let lowestCount = tally[0].count;
    return tally.filter(t => t.count === lowestCount);
  }

  // if there is more than one loser candidate, check subsequent sets of votes
  // takes object: keyed by loser candidates, with counts as values
  // voteList is the master list to consult from current round on
  findLoser(tally, votes) {
    // determine if there is a single loser from current round
    if (tally.length === 1) {
      return tally[0];
    }

    // a single loser cannot be determined from current round
    let loserCandidates = tally.map(item => item.name );
    /**
     * loser candidates stay the same
     * tally is reconfigured
     * votes are reconfigured
     */
    return this.recursiveTiebreaker(loserCandidates, tally, votes);
  }

  recursiveTiebreaker(loserCandidates, tally, votes) {
    // first check is whether the list has been exhausted, thus an unbroken tie
    if (listHasExhausted(tally)) {
      // TODO: determine return value for ties that can't be broken
      return;
    }

    if (tieIsBroken(tally)) {
      // get loser with lowest count
      return tally[0];
    }

    // tie remains. as a result, look to the next set of votes to break tie
    // filtered by loser candidates
    let updatedVotes = votes.deepFilterAdvance(loserCandidates);

    let updatedTally = updatedVotes
      .getTally()
      .filter(item => {
        return _.includes(loserCandidates, item.name)
      });

    return this.recursiveTiebreaker(loserCandidates, updatedTally, updatedVotes);


    function listHasExhausted(array) {
      return !!(_.head(array).count === 0 && _.last(array).count === 0);
    }

    function tieIsBroken(sortedArray) {
      return !!(sortedArray[0].count !== sortedArray[1].count);
    }
  }

  /**
   * Build overall results, which consist of round data
   * @param votes: an array of arrays
   * @returns {*}
   */
  setResults(votes = this.votes) {
    var round = {
      tally: [],
      loser: null,
      count: null
    };

    round.tally = votes.getTally();
    round.count = round.tally.reduce((reduction, currentValue) => {
      return reduction + currentValue.count;
    }, 0);

    // check for item with majority
    var majorityCheck = this.checkForMajority(round);
    if (majorityCheck.majorityExists) {
      this.rounds.push(round);
      return this.winners = majorityCheck.winner;
    }

    // get loser candidates for current round
    let loserCandidatesTally = this.getLoserCandidatesTally(round.tally);
    // determine ultimate loser from this round. resolve ties by looking at sets of lower ranked votes
    round.loser = this.findLoser(loserCandidatesTally, votes);

    this.rounds.push(round);

    let filteredVotes = votes.deepRemove(round.loser);

    return this.setResults(filteredVotes);
  }
}

module.exports = InstantRunoffVote;