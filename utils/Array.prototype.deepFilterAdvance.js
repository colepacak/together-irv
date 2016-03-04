var _ = require('lodash');

Array.prototype.deepFilterAdvance = function(filterVals) {
  return this
    .filter(childArray => {
      return _.includes(filterVals, childArray[0]);
    })
    .map(childArray => {
      return childArray.slice(1);
    })
    .filter(childArray => {
      return childArray.length;
    });
};