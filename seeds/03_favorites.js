exports.seed = function(knex, Promise) {
  return knex("favorites").del().then(function() {
    return knex("favorites")
      .insert([
        // User 1 (Ronan) has 3 favorites
        // User 2 (Tyler) has 3 favorites
        // Ronan and Tyler have 2 of the same pictures in their favorites (picture_id's 2 & 3)
        {
          favorite_id: 1,
          user_id: 1,
          picture_id: 1
        },
        {
          favorite_id: 2,
          user_id: 1,
          picture_id: 2
        },
        {
          favorite_id: 3,
          user_id: 1,
          picture_id: 3
        },
        {
          favorite_id: 4,
          user_id: 2,
          picture_id: 2
        },
        {
          favorite_id: 5,
          user_id: 2,
          picture_id: 3
        },
        {
          favorite_id: 6,
          user_id: 2,
          picture_id: 4
        }
      ])
      .then(() => {
        return knex.raw(
          "SELECT setval('favorites_favorite_id_seq', (SELECT MAX(favorite_id) FROM favorites));"
        );
      });
  });
};
