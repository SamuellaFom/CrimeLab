const ID = require("nodejs-unique-numeric-id-generator");
const connectMongo = require("../config/database");

let db;
(async () => {
  db = await connectMongo.connectMongo();
})();

async function createTestimonials(req, res) {
  try {
    const uniqueId = ID.generate(new Date().toJSON());

    await db.collection("testimonials").insertOne({
      testimonyNumber: uniqueId,
      date: req.body.date,
      content: req.body.content,
    });

    res.status(200).json({ success: true, message: "Add a new testimony" });
  } catch (error) {
    console.log(error);

    res
      .status(500)
      .json({ success: false, message: `Error present when adding: ${error}` });
  }
}

async function getAllTestimonials(req, res) {
  try {
    // TODO: add relations
    const query = await db.testimonials.find();
    res
      .status(200)
      .json({ success: true, message: "all testimonials", data: query });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: `Error present when getting: ${error}`,
    });
  }
}

async function getByTestimonyNumber(req, res) {
  try {
    // TODO: add relations
    const query = await db.testimonials.find({
      testimonyNumber: req.params.testimonyNumber,
    });
    
    if (query === null) {
      res.status(404).json({
        success: false,
        message: `testimony ${req.params.testimonyNumber} not found`,
      });
    } else {
      res.status(200).json({
        success: true,
        message: `testimony ${req.params.testimonyNumber} recovers`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: `Error present when getting: ${error}`,
    });
  }
}

async function upadeteTestimony(req, res) {
  try {
    const search = await db.testimonials.find({
      testimonyNumber: req.params.testimonyNumber,
    });

    if (search === null) {
      res.status(404).json({
        success: false,
        message: `testimony ${req.params.testimonyNumber} not found`,
      });
    } else {
      await db.testimonials.updateOne(
        { testimonyNumber: req.params.testimonyNumber },
        {
          $set: {
            date: req.body.date,
            content: req.body.content,
          },
        }
      );

      res.status(200).json({ success: true, message: "update an testimony" });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: `Error present when updating: ${error}`,
    });
  }
}

async function deleteByTestimonyNumber(req, res) {
  try {
    const search = await db.testimonials.find({
      testimonyNumber: req.params.testimonyNumber,
    });

    if (search === null) {
      res.status(404).json({
        success: false,
        message: `testimony ${req.params.testimonyNumber} not found`,
      });
    } else {
      const query = await db.testimonials.deleteOne({
        testimonyNumber: req.params.testimonyNumber,
      });
      res.status(200).json({
        success: true,
        message: `testimony ${req.params.testimonyNumber} recovers`,
        data: query,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: `Error present when deleting: ${error}`,
    });
  }
}

module.exports = {
  createTestimonials,
  getAllTestimonials,
  getByTestimonyNumber,
  upadeteTestimony,
  deleteByTestimonyNumber,
};
