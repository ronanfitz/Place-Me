exports.up = function(knex, Promise) {
  return knex.schema.createTable("comments", table => {
    table.increments("comment_id").primary();
    table
      .integer("user_id")
      .references("user_id")
      .inTable("users")
      .onDelete("cascade")
      .notNullable();
    table
      .integer("picture_id")
      .references("picture_id")
      .inTable("pictures")
      .onDelete("cascade")
      .notNullable();
    table.text("comment");
  });
};

exports.down = function(knex, Promise) {
  // return knex.schema.dropTable("comments");
  return knex.raw("DROP TABLE comments CASCADE");
};
