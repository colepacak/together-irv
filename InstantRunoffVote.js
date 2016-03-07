var _ = require('lodash');
var filter = require('filter-values');

require('./utils/Array.prototype.deepFilterAdvance.js');
require('./utils/Array.prototype.deepRemove.js');
require('./utils/Array.prototype.getTally.js');
var getRandomInt = require('./utils/getRandomInt.js');

class InstantRunoffVote {
  constructor(voteList, candidates) {
    this.votes = voteList;
    this.candidates = candidates;
    this.rounds = [];
    this.winner = null;
  }

  hasWinner() {
    return !!(this.winner !== null);
  }

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

  /**
   * Get the candidates with the lowest counts for a particular round.
   * Filter out candidates that have been losers in previous rounds.
   * @param tally - sorted by the length of count array
   * @returns {*}
   */
  getLoserCandidatesTally(tally) {
    let previousLosers = this.rounds.map(r => { return r.loser });
    let lowestCount;

    for (let i = 0; i < tally.length; i++) {
      let candidate = tally[i];
      if (!_.includes(previousLosers, candidate.name)) {
        lowestCount = candidate.count;
        break;
      }
    }

    return tally.filter(t => t.count === lowestCount);
  }

  /**
   * If there is more than one loser candidate, check subsequent sets of votes
   */
  findLoser(tally, votes) {
    // Determine if there is a single loser from current round
    if (tally.length === 1) {
      return tally[0].name;
    }

    let loserCandidates = this.getLoserCandidates(tally);
    /**
     * loser candidates stay the same
     * tally is reconfigured
     * votes are reconfigured
     */
    return this.recursiveTiebreaker(loserCandidates, tally, votes);
  }

  getLoserCandidates(tally) {
    return tally.map(item => item.name );
  }

  recursiveTiebreaker(loserCandidates, tally, votes) {
    // First, check is whether the list has been exhausted, thus an unbroken tie
    if (listHasExhausted(tally)) {
      let random = getRandomInt(0, loserCandidates.length - 1);
      return loserCandidates[random];
    }

    if (tieIsBroken(tally)) {
      // Get loser with lowest count
      return tally[0].name;
    }

    // Tie remains - as a result, look to the next set of votes to break tie filtered by loser candidates
    let updatedVotes = votes.deepFilterAdvance(loserCandidates);

    let updatedTally = updatedVotes
      .getTally(loserCandidates)
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

  getRoundVotes(votes, candidates) {
    let tally = votes.reduce((reduction, currentValue, currentIndex) => {
      let match = reduction.find(o => { return o.name === currentValue[0] });
      if (match) {
        match.count.push(currentIndex);
      } else {
        reduction.push({ name: currentValue[0], count: [currentIndex] });
      }
      return reduction;
    }, []);

    if (candidates) {
      candidates.forEach(r => {
        let isIncluded = tally.find(t => {
          return t.name === r;
        });

        if (!isIncluded) {
          tally.push({ name: r, count: [] });
        }
      });
    }
    return _.sortBy(tally, 'count.length');
  }

  /**
   * Build overall results, which consist of round data
   * @param votes: an array of arrays
   */
  setResults(votes = this.votes) {
    var round = {
      tally: [],
      votes: [],
      count: null,
      loserCandidates: [],
      loser: null
    };

    round.tally = votes.getTally(this.candidates);
    round.votes = this.getRoundVotes(votes, this.candidates);
    round.count = round.tally.reduce((reduction, currentValue) => {
      return reduction + currentValue.count;
    }, 0);

    var majorityCheck = this.checkForMajority(round);
    if (majorityCheck.majorityExists) {
      this.rounds.push(round);
      return this.winner = majorityCheck.winner;
    }

    let loserCandidatesTally = this.getLoserCandidatesTally(round.tally);
    round.loserCandidates = this.getLoserCandidates(loserCandidatesTally);
    // determine ultimate loser from this round. resolve ties by looking at sets of lower ranked votes
    round.loser = this.findLoser(loserCandidatesTally, votes);

    this.rounds.push(round);

    let filteredVotes = votes.deepRemove(round.loser);

    return this.setResults(filteredVotes);
  }
}

module.exports = InstantRunoffVote;