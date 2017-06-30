exports.up = function(knex, Promise) {
  return knex.schema.createTable("favorites", table => {
    table.increments("favorite_id").primary();
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
  });
};

exports.down = function(knex, Promise) {
  // return knex.schema.dropTable("favorites");
  return knex.raw("DROP TABLE favorites CASCADE");
};
