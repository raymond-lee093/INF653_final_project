// Custom middleware import verifyStates
const verifyStates = require("../middleware/verifyStates");

// Custom middleware import includeFunFacts
const includeFunFacts = require("../middleware/includeFunFacts");

// State schema for MongoDB
const State = require("../model/State");

// Creates data object with data from statesData.json file
const data = {
  states: require("../model/statesData.json"),
  setStates: function (data) {
    this.states = data;
  },
};

// Include all funfacts from MongoDB before request operations
includeFunFacts();

const getAllStates = (req, res) => {
  // When contiguous states query = true
  if (req.query.contig === "true") {
    states = data.states.filter(
      (stateObj) => stateObj.code !== "AK" && stateObj.code !== "HI"
    );
    res.json(states);
    return;
    // When contiguous states query = false
  } else if (req.query.contig === "false") {
    states = data.states.filter(
      (stateObj) => stateObj.code === "AK" || stateObj.code === "HI"
    );
    res.json(states);
    return;
  }
  // Return all statesData.json with no modifications
  else {
    res.json(data.states);
  }
};

const getOneState = (req, res) => {
  const state = data.states.find(
    (stateObj) => stateObj.code === req.params.state.toUpperCase()
  );
  res.json(state);
};

const getNickname = (req, res) => {
  const state = data.states.find(
    (stateObj) => stateObj.code === req.params.state.toUpperCase()
  );
  res.json({ state: `${state.state}`, nickname: `${state.nickname}` });
};

const getPopulation = (req, res) => {
  const state = data.states.find(
    (stateObj) => stateObj.code === req.params.state.toUpperCase()
  );
  // Returns population values with commas
  res.json({
    state: state.state,
    population: state.population.toLocaleString("en-US"),
  });
};

const getCapital = (req, res) => {
  const state = data.states.find(
    (stateObj) => stateObj.code === req.params.state.toUpperCase()
  );
  res.json({ state: `${state.state}`, capital: `${state.capital_city}` });
};

const getAdmission = (req, res) => {
  const state = data.states.find(
    (stateObj) => stateObj.code === req.params.state.toUpperCase()
  );
  res.json({ state: `${state.state}`, admitted: `${state.admission_date}` });
};

const getFunFact = async (req, res) => {
  const statecode = req.params.state.toUpperCase();
  // Search MongDB for state using statecode
  const state = await State.findOne({ stateCode: statecode }).exec();
  // Ternary operation, with optional chaining, if state contains funfacts
  // in MongoDB add to array otherwise leave empty array
  const funfactsArray = state?.funfacts ? state.funfacts : [];
  const jsonstateObj = data.states.find(
    (stateObj) => stateObj.code === statecode
  );
  // Get random index, based on length of funfactsArray
  const randomIndex = Math.floor(Math.random() * funfactsArray.length);
  // If funfacts array has a length value
  if (funfactsArray.length) {
    // Return funfact using random index
    return res.status(201).json({ funfact: funfactsArray[randomIndex] });
    // No funfact found for state
  } else {
    return res
      .status(400)
      .json({ message: `No Fun Facts found for ${jsonstateObj.state}` });
  }
};

const createFunFacts = async (req, res) => {
  // Optional chaining if request does not contain stateCode parameter or a body
  if (!req?.body?.funfacts) {
    return res.status(400).json({ message: "State fun facts value required" });
  }
  // If request body for funfacts property is not an array
  if (!Array.isArray(req.body.funfacts)) {
    return res
      .status(400)
      .json({ message: "State fun facts value must be an array" });
  }
  // Make statecode uppercase, can recieve mixed values from request
  const statecode = req.params.state.toUpperCase();
  try {
    // If no matching document from the request is found in the MongoDB
    // If there is code will add to the already created document
    if (
      !(await State.findOneAndUpdate(
        { stateCode: statecode },
        // $push appends array field with value, fails if field is not an array
        { $push: { funfacts: req.body.funfacts } }
      ))
    ) {
      // Create new document using schema
      await State.create({
        stateCode: statecode,
        funfacts: req.body.funfacts,
      });
    }
    // Find document to see if successfully applied to mongoDB, then display result
    const result = await State.findOne({ stateCode: statecode }).exec();
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
  }
  // Include all funfacts after modifications
  includeFunFacts();
};

const updateFunFacts = async (req, res) => {
  // Get index property value of funfacts array
  let index = req.body.index;
  let validIndex = false;
  // Check if index is valid
  try {
    // Index is now an integer
    index = parseInt(index);
    // Compare index
    validIndex = index > 0;
  } catch (error) {
    validIndex = false;
  }
  // If index is not valid display message
  if (!validIndex) {
    return res
      .status(400)
      .json({ message: "State fun fact index value required" });
  }
  // Get funfact
  const funfact = req.body.funfact;
  // If funfact does not exist display message
  if (!funfact)
    return res.status(400).json({ message: "State fun fact value required" });
  // Make statecode uppercase, can recieve mixed values from request
  const statecode = req.params.state.toUpperCase();
  // Search MongoDB to see if state exists
  const state = await State.findOne({ stateCode: statecode }).exec();
  // Ternary operation, with optional chaining, if state contains funfacts
  // in MongoDB add to array otherwise leave empty array
  const funfactsArray = state?.funfacts ? state.funfacts : [];
  const jsonstateObj = data.states.find(
    (stateObj) => stateObj.code === statecode
  );
  // If array is empty
  if (!funfactsArray.length)
    return res
      .status(400)
      .json({ message: `No Fun Facts found for ${jsonstateObj.state}` });
  // If index out of bounds
  if (index > funfactsArray.length)
    return res.status(400).json({
      message: `No Fun Fact found at that index for ${jsonstateObj.state}`,
    });
  // Match up with the zero index of the array in MongoDB
  index -= 1;
  funfactsArray[index] = funfact;
  state.funfacts[index] = funfactsArray[index];
  // Save document in MongoDB
  const result = await state.save();
  res.status(201).json(result);
};

const deleteFunFacts = async (req, res) => {
  // Get index property value of funfacts array
  let index = req.body.index;
  let validIndex = false;
  // Check if index is valid
  try {
    // Index is now an integer
    index = parseInt(index);
    // Compare index
    validIndex = index > 0;
  } catch (error) {
    validIndex = false;
  }
  // If index is not valid display message
  if (!validIndex) {
    return res
      .status(400)
      .json({ message: "State fun fact index value required" });
  }
  // Make statecode uppercase, can recieve mixed values from request
  const statecode = req.params.state.toUpperCase();
  // Search MongoDB to see if state exists
  const state = await State.findOne({ stateCode: statecode }).exec();
  // Ternary operation, with optional chaining, if state contains funfacts
  // in MongoDB add to array otherwise leave empty array
  const funfactsArray = state?.funfacts ? state.funfacts : [];
  const jsonstateObj = data.states.find(
    (stateObj) => stateObj.code === statecode
  );
  // If array is empty
  if (!funfactsArray.length)
    return res
      .status(400)
      .json({ message: `No Fun Facts found for ${jsonstateObj.state}` });
  // If index out of bounds
  if (index > funfactsArray.length)
    return res.status(400).json({
      message: `No Fun Fact found at that index for ${jsonstateObj.state}`,
    });
  // Match up with the zero index of the array in MongoDB
  index -= 1;
  // At specified index, delete 1 element
  funfactsArray.splice(index, 1);
  state.funfacts[index] = funfactsArray[index];
  // Save document in MongoDB
  const result = await state.save();
  res.status(201).json(result);
  // Include all funfacts after modifications
  includeFunFacts();
};

module.exports = {
  verifyStates,
  getAllStates,
  getOneState,
  getNickname,
  getPopulation,
  getCapital,
  getAdmission,
  getFunFact,
  createFunFacts,
  updateFunFacts,
  deleteFunFacts,
};
