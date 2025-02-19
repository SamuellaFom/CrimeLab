const ID = require("nodejs-unique-numeric-id-generator");
const connectMongo = require("../config/database");

let db;
(async () => {
  db = await connectMongo.connectMongo();
})();

/**
 * The function `createTestimonials` asynchronously adds a new testimonial to a database collection
 * with error handling.
 */
async function createTestimonials(req, res) {
  try {
    const uniqueId = ID.generate(new Date().toJSON());

    await db.collection("testimonials").insertOne({
      testimonyNumber: uniqueId,
      date: req.body.date,
      content: req.body.content,
      individualNumber: req.body.individualNumber,
      affairNumber: req.body.affairNumber,
    });

    res
      .status(200)
      .json({
        success: true,
        message: "Added a new testimony",
        testimonyNumber: uniqueId,
      });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        success: false,
        message: `Error occurred while adding: ${error}`,
      });
  }
}

/**
 * The function getAllTestimonials retrieves all testimonials from a collection and sends them as a
 * JSON response with appropriate status codes.
 */
async function getAllTestimonials(req, res) {
  try {
    const collection = db.collection("testimonials");
    const query = await collection.find().toArray();

    res
      .status(200)
      .json({ success: true, message: "All testimonials", data: query });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        success: false,
        message: `Error occurred while getting testimonials: ${error}`,
      });
  }
}

/**
 * The function `getTestimonyByAffairNumber` retrieves a testimony from a collection based on the
 * affair number provided in the request parameters and returns a response with the retrieved data or
 * an error message.
 */
async function getTestimonyByAffairNumber(req, res) {
  try {
    const collection = db.collection("testimonials");
    const query = await collection
      .find({ affairNumber: req.params.affairNumber })
      .toArray();

    if (query.length === 0) {
      res.status(404).json({
        success: false,
        message: `Testimony with testimonyNumber ${req.params.testimonyNumber} not found`,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `Testimony with testimonyNumber ${req.params.testimonyNumber} found`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        success: false,
        message: `Error occurred while getting testimony: ${error}`,
      });
  }
}

/**
 * The function `updateTestimony` updates a testimony in a collection based on the testimony number
 * provided in the request parameters.
 */
async function updateTestimony(req, res) {
  try {
    const collection = db.collection("testimonials");
    const search = await collection
      .find({ testimonyNumber: req.params.testimonyNumber })
      .toArray();

    if (search.length === 0) {
      res.status(404).json({
        success: false,
        message: `Testimony with testimonyNumber ${req.params.testimonyNumber} not found`,
      });
    } else {
      await collection.updateOne(
        { testimonyNumber: req.params.testimonyNumber },
        {
          $set: {
            date: req.body.date,
            content: req.body.content,
            individualNumber: req.body.individualNumber,
            affairNumber: req.body.affairNumber,
          },
        }
      );

      res.status(200).json({ success: true, message: "Updated the testimony" });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        success: false,
        message: `Error occurred while updating testimony: ${error}`,
      });
  }
}

/**
 * The function `deleteByTestimonyNumber` deletes a testimonial from a collection based on the provided
 * testimony number.
 */
async function deleteByTestimonyNumber(req, res) {
  try {
    const collection = db.collection("testimonials");
    const search = await collection
      .find({ testimonyNumber: req.params.testimonyNumber })
      .toArray();

    if (search.length === 0) {
      res.status(404).json({
        success: false,
        message: `Testimony with testimonyNumber ${req.params.testimonyNumber} not found`,
      });
    } else {
      const query = await collection.deleteOne({
        testimonyNumber: req.params.testimonyNumber,
      });
      res.status(200).json({
        success: true,
        message: `Testimony with testimonyNumber ${req.params.testimonyNumber} deleted`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({
        success: false,
        message: `Error occurred while deleting testimony: ${error}`,
      });
  }
}

module.exports = {
  createTestimonials,
  getAllTestimonials,
  getTestimonyByAffairNumber,
  updateTestimony,
  deleteByTestimonyNumber,
};
