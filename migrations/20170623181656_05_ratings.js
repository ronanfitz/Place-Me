exports.up = function(knex, Promise) {
  return knex.schema.createTable("ratings", table => {
    table.increments("rating_id").primary();
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
    table.integer("rating").notNullable();
  });
};

exports.down = function(knex, Promise) {
  // return knex.schema.dropTable("ratings");
  return knex.raw("DROP TABLE ratings CASCADE");
};
