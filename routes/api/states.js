// NPM modules
const express = require("express");
const router = express.Router();

// Import statesController
const statesController = require("../../controllers/statesController");

// Verify all routes for proper state request
router.route("/:state*").all(statesController.verifyStates);

// GET requests
router.route("/").get(statesController.getAllStates);

router.route("/:state").get(statesController.getOneState);

router.route("/:state/nickname").get(statesController.getNickname);

router.route("/:state/population").get(statesController.getPopulation);

router.route("/:state/capital").get(statesController.getCapital);

router.route("/:state/admission").get(statesController.getAdmission);

// GET, POST, PATCH, and DELETE requests for funfacts
router
  .route("/:state/funfact")
  .get(statesController.getFunFact)
  .post(statesController.createFunFacts)
  .patch(statesController.updateFunFacts)
  .delete(statesController.deleteFunFacts);

module.exports = router;
