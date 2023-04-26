// Creates data object with data from statesData.json file
const data = {
  states: require("../model/statesData.json"),
  setStates: function (data) {
    this.states = data;
  },
};

// Added a validation check for the state param
const verifyStates = async (req, res, next) => {
  // Able to recieve lowercase mixed-case parameter
  const stateCode_request = req.params.state.toUpperCase();
  // Pull in state codes assign them to stateCodeArray
  const stateCodeArray = data.states.map((stateObj) => stateObj.code);
  // Compare stateCode_request with values in stateCodeArray
  if (stateCodeArray.includes(stateCode_request)) {
    next();
  } else {
    res.json({ message: "Invalid state abbreviation parameter" });
  }
};

module.exports = verifyStates;
