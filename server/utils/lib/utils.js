
exports.removeItemFromList = function(item, list) {
  let index = list.indexOf(item);
  if (index > -1) {
    list.splice(index, 1);
  }
}
