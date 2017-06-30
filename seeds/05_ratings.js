exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("ratings").del().then(function() {
    // Inserts seed entries
    return knex("ratings")
      .insert([
        {
          rating_id: 1,
          user_id: 1,
          picture_id: 1,
          rating: 5
        }
      ])
      .then(() => {
        return knex.raw(
          "SELECT setval('ratings_rating_id_seq', (SELECT MAX(rating_id) FROM ratings));"
        );
      });
  });
};
