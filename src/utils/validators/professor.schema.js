const { z } = require('zod');

const createprofessorSchema = z.object({
  name: z.string().min(3),
  email: z.string().email().optional(),
  // agrega más campos según tu DB
});

const updateprofessorSchema = createprofessorSchema.partial();

module.exports = { createprofessorSchema, updateprofessorSchema };