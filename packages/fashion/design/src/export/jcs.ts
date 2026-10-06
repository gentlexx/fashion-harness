/**
 * RFC 8785 JCS + SHA-256 helpers for DeliverableSnapshot identity.
 * @module @gentlexx/dsh-fashion-design/src/export/jcs
 */

import { createHash } from 'node:crypto'
import canonicalize from 'canonicalize'
import { FashionDesignCanonicalizationFailedError } from '../errors.ts'

/**
 * Canonicalize one JSON-compatible value with RFC 8785 JCS.
 * @param value - Plain JSON data (no undefined, BigInt, or circular refs).
 * @returns Canonical UTF-8 JSON string.
 */
export function jcsCanonicalize(value: unknown): string {
  try {
    const out = canonicalize(value)
    if (typeof out !== 'string' || out.length === 0) {
      throw new FashionDesignCanonicalizationFailedError('empty-canonical')
    }
    return out
  } catch (caught) {
    if (caught instanceof FashionDesignCanonicalizationFailedError) throw caught
    throw new FashionDesignCanonicalizationFailedError(
      caught instanceof Error ? caught.message : 'canonicalize-threw',
    )
  }
}

/**
 * SHA-256 hex digest of a UTF-8 string.
 * @param text - Input text.
 * @returns Lowercase hex digest.
 */
export function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex')
}

/**
 * Hash a snapshot payload via JCS then SHA-256.
 * @param payload - Snapshot body excluding runtime-only fields already stripped.
 * @returns Hex digest.
 */
export function hashSnapshotPayload(payload: unknown): string {
  return sha256Hex(jcsCanonicalize(payload))
}
