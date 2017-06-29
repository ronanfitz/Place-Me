exports.seed = function(knex, Promise) {
  // Deletes ALL existing entries
  return knex("comments").del().then(function() {
    // Inserts seed entries
    return knex("comments")
      .insert([
        {
          comment_id: 1,
          user_id: 1,
          picture_id: 1,
          comment: "I love to code!"
        },
        {
          comment_id: 2,
          user_id: 2,
          picture_id: 4,
          comment: "Javascript is the best!"
        },
        {
          comment_id: 3,
          user_id: 2,
          picture_id: 2,
          comment: "Fullstack for the win."
        },
        {
          comment_id: 4,
          user_id: 1,
          picture_id: 3,
          comment: "Who says we can't do it all?"
        }
      ])
      .then(() => {
        return knex.raw(
          "SELECT setval('comments_comment_id_seq', (SELECT MAX(comment_id) FROM comments));"
        );
      });
  });
};
