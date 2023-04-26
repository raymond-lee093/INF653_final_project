// Creates data object with data from statesData.json file
const data = {
  states: require("../model/statesData.json"),
  setStates: function (data) {
    this.states = data;
  },
};

// State schema for MongoDB
const State = require("../model/State");

// Add the funfacts from MongoDB into the JSON stateData object
async function includeFunFacts() {
  for (const stateObj in data.states) {
    const funfact = await State.findOne({
      stateCode: data.states[stateObj].code,
    }).exec();
    if (funfact) {
      data.states[stateObj].funfacts = funfact.funfacts;
    }
  }
}

module.exports = includeFunFacts;
