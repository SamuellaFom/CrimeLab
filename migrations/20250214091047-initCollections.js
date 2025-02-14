module.exports = {
  async up(db, client) {
    await db.createCollection("affairs");
    await db.createCollection("individuals");
    await db.createCollection("testimonials");
    await db.createCollection("places");
  },

  async down(db, client) {
    // TODO write the statements to rollback your migration (if possible)
    // Example:
    // await db.collection('albums').updateOne({artist: 'The Beatles'}, {$set: {blacklisted: false}});
  }
};
