import { z } from 'zod'
import { SLUG_PATTERN } from '@/lib/utils'
import {
  TENANT_NAME_MAX,
  TENANT_NAME_MIN,
  TENANT_SLUG_MAX,
  TENANT_SLUG_MIN,
} from '@/lib/constants'

/**
 * The workspace form, mirroring Tenant's Sequelize validation.
 *
 * `slug` is checked against the same `^[a-z0-9]+(?:-[a-z0-9]+)*$` shape the model
 * enforces, so a rejected value is caught before a round trip. Uniqueness cannot
 * be — that is the server's 409, handled in the form.
 */
export const workspaceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(TENANT_NAME_MIN, `Use at least ${TENANT_NAME_MIN} characters.`)
    .max(TENANT_NAME_MAX, `Keep it under ${TENANT_NAME_MAX} characters.`),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(TENANT_SLUG_MIN, `Use at least ${TENANT_SLUG_MIN} characters.`)
    .max(TENANT_SLUG_MAX, `Keep it under ${TENANT_SLUG_MAX} characters.`)
    .regex(SLUG_PATTERN, 'Use lowercase letters, numbers and single hyphens.'),
})

export type WorkspaceValues = z.infer<typeof workspaceSchema>
