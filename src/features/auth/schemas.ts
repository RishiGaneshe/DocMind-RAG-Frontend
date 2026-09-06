import { z } from 'zod'
import { NAME_MAX, PASSWORD_MAX, PASSWORD_MIN } from '@/lib/constants'

/**
 * Form shapes for the auth screens.
 *
 * These mirror the server's validation instead of inventing stricter rules:
 * the backend requires a password of at least 8 characters and nothing else
 * (src/api/auth.js), so demanding a symbol here would reject accounts the API
 * would happily create. Strength is advice, shown by PasswordStrengthMeter,
 * not a gate.
 */

const email = z
  .string()
  .trim()
  .min(1, 'Enter your email address.')
  .pipe(z.email('That does not look like an email address.'))
  .transform((value) => value.toLowerCase())

const name = (field: string) =>
  z
    .string()
    .trim()
    .min(1, `Enter your ${field}.`)
    .max(NAME_MAX, `That ${field} is too long.`)
    // Sequelize validates `is: /^[a-zA-Z\s'-]+$/` on both name columns.
    .regex(/^[\p{L}\s'-]+$/u, `Use letters, spaces, hyphens and apostrophes only.`)

const newPassword = z
  .string()
  .min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`)
  .max(PASSWORD_MAX, `Keep it under ${PASSWORD_MAX} characters.`)

export const loginSchema = z.object({
  email,
  // Not `newPassword`: an existing account may predate any rule, and the only
  // honest answer to a wrong password is the server's.
  password: z.string().min(1, 'Enter your password.'),
  remember: z.boolean(),
})

export const signupSchema = z
  .object({
    firstName: name('first name'),
    lastName: name('last name'),
    email,
    password: newPassword,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
    // `z.boolean().refine` rather than `z.literal(true)`: the literal makes the
    // form's own type `true`, which an unchecked default cannot satisfy.
    terms: z.boolean().refine((accepted) => accepted, {
      error: 'Please accept the terms to continue.',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Those passwords do not match.',
  })

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z
  .object({
    password: newPassword,
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Those passwords do not match.',
  })

export type LoginValues = z.infer<typeof loginSchema>
export type SignupValues = z.infer<typeof signupSchema>
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
