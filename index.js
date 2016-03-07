var InstantRunoffVote = require('./InstantRunoffVote.js');
var voteList1 = require('./data/voteList1.js');
var voteList2 = require('./data/voteList2.js');
var voteList3 = require('./data/voteList3.js');
var voteList4 = require('./data/voteList4.js');
var voteList5 = require('./data/voteList5.js');

let candidates = ['HB', 'FH', 'TD', 'PT'];
let election = new InstantRunoffVote(voteList5, candidates);
election.setResults();

console.log('the winner is:');
console.log(election.winner);
console.log("\n");

var _ = require('lodash');
election.rounds.forEach(function(round) {
  console.log(_.includes(round.loserCandidates, round.loser));
});