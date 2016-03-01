var InstantRunoffVote = require('./InstantRunoffVote.js');
var voteList1 = require('./data/voteList1.js');
var voteList2 = require('./data/voteList2.js');
var voteList3 = require('./data/voteList3.js');
var voteList4 = require('./data/voteList4.js');

let vote = new InstantRunoffVote(voteList1);
vote.setResults();

console.log('the winners are:');
console.log(vote.winners);
console.log("\n");

// notes from chatting with mf:
// when determining loser, don't look ahead at all votes for tie-breaker, just look ahead to next ranked votes for people who voted for loser candidate
// do some sort of arbitrary tie breaker function