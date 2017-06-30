exports.up = function(knex, Promise) {
  return knex.schema.createTable("users", table => {
    table.increments("user_id").primary();
    table.string("username").notNullable().unique();
    table.specificType("hashed_password", "char(60)").notNullable();
  });
};
exports.down = function(knex, Promise) {
  return knex.raw("DROP TABLE users CASCADE");
};
