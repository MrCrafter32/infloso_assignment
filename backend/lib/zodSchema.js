const {z} = require('zod');

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    username: z.string().min(3),
    firstName: z.string().min(1),
    lastName: z.string().min(1)
});

module.exports = { signupSchema };