// The last bit is bonus
// CONTRACT:
//   The frontend must make sure the user doesn't do anything if point is 0.

var User = require("../models/user");

var negTwenty = {value: -20, types: ["block"]};
var negTen = {value: -10, types: ["unlike"]};
var negFive = {value: -5, types: ["flag"]}
var negOne = {value: -1, types: ["view"]};
var one = {value: 1, types: []};
var ten = {value: 10, types: ["like", "spread"]};

function levelConversion(type) {
	if(exists(negTwenty.types, type)) {
		return negTwenty.value;
	} else if(exists(negTen.types, type)) {
		return negTen.value;
	} else if(exists(negFive.types, type)){
		return negFive.value;
	} else if(exists(negOne.types, type)) {
    return negOne.value;
  } else if(exists(one.types, type)) {
    return one.value;
  } else if(exists(ten.types, type)) {
    return ten.value;
  } else {
		return 0;
	}
};

function exists(arr, type) {
	if(arr.indexOf(type.toLowerCase()) != -1) return true;
	return false;
}

module.exports = {
  updatePointsWithLevel: function (id, level) {
		User.findById(id, function(err, foundUser){
			if(foundUser) {
        var updatedPoints = foundUser.points + levelConversion(level);
				if(updatedPoints < 0) updatedPoints = 0;
				foundUser.points = updatedPoints;
				foundUser.save();
			}
		})
  }
}
