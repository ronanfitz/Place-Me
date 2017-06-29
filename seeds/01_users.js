exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("users").del().then(function() {
    // Inserts seed entries
    return knex("users")
      .insert([
        {
          user_id: 1,
          username: "Ronan",
          hashed_password: "$2a$12$BgnPH2oUiLRr8rnLmAIOF.wt2GfJoijHb/qbqNLx5fEMsQOzxyHfy"
        },
        {
          user_id: 2,
          username: "Tyler",
          hashed_password: "$2a$12$BgnPH2oUiLRr9rnLmAIOF.wt2GfJoijHb/qbqNLx5fEMsQOzxyHfy"
        },
        {
          user_id: 3,
          username: "Cornelius",
          hashed_password: "$2a$12$BgnPH2oUiLRr8rnLmAIOF.wt2GfJokjHb/qbqNLx5fEMsQOzxyHfy"
        }
      ])
      .then(() => {
        return knex.raw("SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users));");
      });
  });
};
