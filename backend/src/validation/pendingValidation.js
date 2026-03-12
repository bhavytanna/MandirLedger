const { z } = require('zod');

const setPendingSettingsSchema = z.object({
  expected_yearly_contribution: z.coerce.number().min(0),
});

module.exports = { setPendingSettingsSchema };
