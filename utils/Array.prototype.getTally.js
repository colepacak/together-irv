var _ = require('lodash');

Array.prototype.getTally = function(required) {
  let tally = this.reduce((reduction, currentValue) => {
    let match = reduction.find(o => { return o.name === currentValue[0] });
    if (match) {
      match.count++;
    } else {
      reduction.push({ name: currentValue[0], count: 1 });
    }
    return reduction;
  }, []);

  if (required) {
    required.forEach(r => {
      let isIncluded = tally.find(t => {
        return t.name === r;
      });

      if (!isIncluded) {
        tally.push({ name: r, count: 0 });
      }
    });
  }
  return _.sortBy(tally, 'count');
};