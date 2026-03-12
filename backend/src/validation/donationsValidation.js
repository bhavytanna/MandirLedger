const { z } = require('zod');

const createDonationSchema = z.object({
  member_id: z.string().optional().nullable(),
  donor_name: z.string().optional(),
  amount: z.coerce.number().gt(0),
  pay_later_amount: z.coerce.number().min(0).optional().default(0),
  donation_type: z.string().optional().default(''),
  payment_mode: z.enum(['cash', 'upi', 'bank']),
  transaction_reference: z.string().optional().default(''),
  donated_at: z.coerce.date().optional().default(() => new Date()),
});

const updateDonationSchema = z.object({
  member_id: z.string().optional().nullable(),
  donor_name: z.string().optional(),
  amount: z.coerce.number().gt(0).optional(),
  pay_later_amount: z.coerce.number().min(0).optional(),
  donation_type: z.string().optional(),
  payment_mode: z.enum(['cash', 'upi', 'bank']).optional(),
  transaction_reference: z.string().optional(),
  donated_at: z.coerce.date().optional(),
});

module.exports = { createDonationSchema, updateDonationSchema };
