const { z } = require('zod');

const createsubjectSchema = z.object({
  name: z.string().min(3),
  email: z.string().email().optional(),
  // agrega más campos según tu DB
});

const updatesubjectSchema = createsubjectSchema.partial();

module.exports = { createsubjectSchema, updatesubjectSchema };