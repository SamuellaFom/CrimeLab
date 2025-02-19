var express = require("express");
var router = express.Router();
var affairController = require("../controllers/affair");
var individualController = require("../controllers/individual");
var placeController = require("../controllers/place");
var testimonyController = require("../controllers/testimony");
var fadetteController = require("../controllers/fadette");

// router affair
router.post("/create/affair", affairController.createAffairs);
router.get("/allAffairs", affairController.getAllAffairs);
router.get("/get/statut/affair", affairController.getOldUnresolvedAffairs);
router.get("/get/count/type/affair", affairController.countAffairsByType);
router.get("/getAffair/:affairNumber", affairController.getByAffairNumber);
router.put("/update/affair/:affairNumber", affairController.updateAffair);
router.delete(
  "/delete/affair/:affairNumber",
  affairController.deleteByAffairNumber
);

// router individual
router.post("/create/individual", individualController.createIndividuals);
router.get("/allIndividuals", individualController.getAllIndividuals);
router.get("/individual", individualController.getIndividualsMultipleAffairs);
router.get(
  "/getIndividual/:individualNumber",
  individualController.getByIndividualNumber
);
router.put(
  "/update/individual/:individualNumber",
  individualController.updateIndividual
);
router.delete(
  "/delete/individual/:individualNumber",
  individualController.deleteByIndividualNumber
);

// router place
router.post("/create/place", placeController.createPlaces);
router.get("/allPlaces", placeController.getAllPlaces);
router.get("/getPlace/:placeNumber", placeController.getByPlaceNumber);
router.put("/update/place/:placaNumber", placeController.updatePlace);
router.delete(
  "/delete/place/:placeNumber",
  placeController.deleteByPlaceNumber
);

// router testimony
router.post("/create/testimony", testimonyController.createTestimonials);
router.get("/allTestimonies", testimonyController.getAllTestimonials);
router.get(
  "/getTestimony/:affairNumber",
  testimonyController.getTestimonyByAffairNumber
);
router.put(
  "/update/testimony/:testimonyNumber",
  testimonyController.updateTestimony
);
router.delete(
  "/delete/testimony/:testimonyNumber",
  testimonyController.deleteByTestimonyNumber
);

// router fadette
router.post("/create/fadette", fadetteController.createFadette);
router.get(
  "/getFadetteByPhone/:phoneNumber",
  fadetteController.getFadetteByPhone
);
router.get(
  "/getFadettesBySiteAndTime",
  fadetteController.getFadettesBySiteAndTime
);
router.get(
  "/getIndividualFadettesAndAffairs/:phoneNumber",
  fadetteController.getIndividualFadettesAndAffairs
);

module.exports = router;
