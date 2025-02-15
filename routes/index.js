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
//router.get("/getAffair/:title", affairController.getByTitle);
router.get("/getAffair/:affairNumber", affairController.getByAffairNumber);
router.put("/update/affair/:affairNumber", affairController.updateAffair);
router.delete("/delete/affair/:affairNumber", affairController.deleteByAffairNumber);

// router individual
router.post("/create/individual", individualController.createIndividuals);
router.get("/allIndividuals", individualController.getAllIndividuals);
router.get("getIndividual/:individualNumber", individualController.getByIndividualNumber);
router.put("/update/individual/:individualNumber", individualController.updateIndividual);
router.delete("/delete/individual/:individualNumber", individualController.deleteByIndividualNumber);

// router place
router.post("/create/place", placeController.createPlaces);
router.get("/allPlaces", placeController.getAllPlaces);
//router.get("/getPlace/:address", placeController.getByAddress);
router.get("/getPlace/:placeNumber", placeController.getByPlaceNumber);
router.put("/update/place/:placaNumber", placeController.updatePlace);
router.delete("/delete/place/:placeNumber", placeController.deleteByPlaceNumber);

// router testimony
router.post("/create/testimony", testimonyController.createTestimonials);
router.get("/allTestimonies", testimonyController.getAllTestimonials);
router.get("/getTestimony/:testimonyNumber", testimonyController.getByTestimonyNumber);
router.put("/update/testimony/:testimonyNumber", testimonyController.updateTestimony);
router.delete("/delete/testimony/:testimonyNumber", testimonyController.deleteByTestimonyNumber);

// router fadette
router.post("/create/fadette", fadetteController.createFadette);

module.exports = router;
