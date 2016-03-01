var assert = require('assert');

var InstantRunoffVote = require('./../InstantRunoffVote.js');
var voteList = require('../data/voteList1.js');

let vote = new InstantRunoffVote(voteList);
vote.setResults();

describe('InstantRunoffVote', function () {
  describe('#hasWinner()', function () {
    it('should be true', function () {
      assert.equal(vote.hasWinner(), true);
    });
  });
});

describe('InstantRunoffVote', function () {
  describe('#winners', function () {
    it("should equal 'TD'", function () {
      assert.equal(vote.winners[0], 'TD');
    });
  });
});

describe('InstantRunoffVote', function () {
  describe('#roundList[0].loserList[0]', function () {
    it("should equal 'FH'", function () {
      assert.equal(vote.rounds[0].losers[0], 'FH');
    });
  });
});

module.exports = voteList;