const {z} = require('zod');

const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const signupSchema = z.object({
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    password: z
        .string()
        .min(8)
        .refine((value) => passwordStrengthRegex.test(value), {
            message: 'Password must include uppercase, lowercase, number, and special character'
        }),
    username: z.string().trim().min(3),
    firstName: z.string().trim().min(1),
    lastName: z.string().trim().min(1)
});

module.exports = { signupSchema };