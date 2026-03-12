const { z } = require('zod');

const actorSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(6),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

module.exports = { actorSchema, paginationSchema };
