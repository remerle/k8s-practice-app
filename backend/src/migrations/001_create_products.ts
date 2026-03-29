import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('products', (table) => {
    table.increments('id').primary();
    table.string('name', 255).notNullable();
    table.text('description');
    table.string('sku', 100).unique().notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.string('image_location', 500);
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('products');
}
