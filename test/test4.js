var assert = require('assert');

var InstantRunoffVote = require('./../InstantRunoffVote.js');
var voteList = require('../data/voteList4.js');

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
    it("should equal undefined", function () {
      assert.equal(vote.winners[0], 'HB');
    });
  });
});
