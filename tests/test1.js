var expect = require('expect');

var InstantRunoffVote = require('./../InstantRunoffVote.js');
var voteList1 = require('../data/voteList1.js');
var voteList2 = require('../data/voteList2.js');
var voteList3 = require('../data/voteList3.js');
var voteList4 = require('../data/voteList4.js');
var voteList5 = require('../data/voteList5.js');
require('../utils/Array.prototype.includes.js');

var voteLists = [
  voteList1,
  voteList2,
  voteList3,
  voteList4,
  voteList5
];

voteLists.forEach((list, index) => {
  testSuite(list, index);
});


function testSuite(voteList, index) {
  let election = new InstantRunoffVote(voteList);
  election.setResults();
  /**
   * Round loser is part of loser candidates, except for last round where there is no loser
   */
  describe('Election #' + (index + 1), function() {
    describe('round loser', function() {
      election.rounds.forEach(function(round, index, array){
        if (index < array.length - 1) {
          var isIncluded = round.loserCandidates.includes(round.loser);
          it('is included in loser candidates', function() {
            expect(isIncluded).toBe(true);
          });
        } else {
          it('is NOT included in loser candidates', function() {
            expect(isIncluded).toNotBe(true);
          });
        }
      });
    });

    /**
     * Ensure loser of previous round is not included in tally of subsequent round
     */
    describe('round loser', function() {
      for (var i = 1; i < election.rounds.length; i++) {
        let round = election.rounds[i];
        let previousLoser = election.rounds[i - 1].loser;

        let candidates = round.tally.map(item => item.name);
        it("is not part of the next round's tally", function() {
          expect(!candidates.includes(previousLoser));
        });
      }
    });

    describe('#hasWinner()', function() {
      it('should be true', function() {
        expect(election.hasWinner()).toBe(true);
      });
    });
  });
}

