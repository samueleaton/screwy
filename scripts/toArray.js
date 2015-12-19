"use strict";

module.exports = function (list) {
  var arr = [];
  for (var i = 0, ii = list.length; i < ii; i++) {
    arr.push(list[i]);
  }
  return arr;
};