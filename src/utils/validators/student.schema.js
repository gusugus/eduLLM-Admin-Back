const { z } = require('zod');

const createstudentSchema = z.object({
  name: z.string().min(3),
  email: z.string().email().optional(),
  // agrega más campos según tu DB
});

const updatestudentSchema = createstudentSchema.partial();

module.exports = { createstudentSchema, updatestudentSchema };