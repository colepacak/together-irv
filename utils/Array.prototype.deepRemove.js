Array.prototype.deepRemove = function(value) {
  return this
    .map(childArray => {
      return childArray.filter(item => item !== value);
    });
};