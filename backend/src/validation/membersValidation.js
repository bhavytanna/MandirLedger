const { z } = require('zod');

const createMemberSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(6),
  address: z.string().optional().default(''),
  family_name: z.string().optional().default(''),
});

const updateMemberSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(6).optional(),
  address: z.string().optional(),
  family_name: z.string().optional(),
});

module.exports = { createMemberSchema, updateMemberSchema };
