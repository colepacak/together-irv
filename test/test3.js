var assert = require('assert');

var InstantRunoffVote = require('./../InstantRunoffVote.js');
var voteList = require('../data/voteList3.js');

let vote = new InstantRunoffVote(voteList);
vote.setResults();

describe('InstantRunoffVote', function () {
  describe('#hasWinner()', function () {
    it('should be false', function () {
      assert.equal(vote.hasWinner(), false);
    });
  });
});

describe('InstantRunoffVote', function () {
  describe('#winners', function () {
    it("should equal undefined", function () {
      assert.equal(vote.winners[0], undefined);
    });
  });
});
