var InstantRunoffVote = require('./InstantRunoffVote.js');

// winner 'TD' - solved
var voteList1 = [
  ['HB', 'TD', 'FH'],
  ['TD', 'FH', 'HB'],
  ['HB', 'TD'],
  ['FH', 'TD']
];

// winner 'FH' - solved
var voteList2 = [
  ['HB', 'TD', 'FH'],
  ['TD', 'FH', 'HB'],
  ['HB', 'FH'],
  ['FH', 'TD']
];

var voteList3 = [
  ['HB', 'TD'],
  ['HB', 'TD'],
  ['TD', 'HB'],
  ['TD', 'HB']
];

let vote = new InstantRunoffVote(voteList2);
vote.getResults();

console.log('the winners are:');
console.log(vote.winnerList);
console.log("\n");
