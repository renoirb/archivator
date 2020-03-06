import { createHash, getHashes, HexBase64Latin1Encoding } from 'crypto'

export type CryptoCommonHashingFunctions =
  | 'sha1'
  | 'sha256'
  | 'md5'
  | 'md5-sha1'
  | string

export type HashingFunctionType = (message: string) => string

export { HexBase64Latin1Encoding }

/**
 * Calculate the sha256 digest of a string.
 *
 * ### Example (es imports)
 * ```js
 * const hasher = createHashFunction('sha256', 'hex')
 * hasher('test')
 * // => '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
 * ```
 *
 * Related:
 * - https://nodejs.org/api/crypto.html#crypto_class_hash
 * - https://nodejs.org/api/crypto.html#crypto_determining_if_crypto_support_is_unavailable
 *
 * @param {string} [hash=sha256] - Hashing function to use against message
 * @param {string} [encoding=hex] - Output digest encoding format: hex, base64
 */
export const createHashFunction = (
  hash: CryptoCommonHashingFunctions = 'sha256',
  encoding: HexBase64Latin1Encoding = 'hex',
): HashingFunctionType => {
  // TypeScript does not necessarily transpile type checks for runtime.
  // type HexBase64Latin1Encoding from 'crypto' module.
  const encodings: HexBase64Latin1Encoding[] = ['latin1', 'hex', 'base64']

  if (encodings.indexOf(encoding) < 0) {
    const supported = encodings.join(', ')
    const message = `Unsupported digest encoding format "${encoding}", currently supported: ${supported}`
    throw new Error(message)
  }

  /**
   * ```js
   * const hashes = [
   *   'RSA-MD4',
   *   'RSA-MD5',
   *   'RSA-MDC2',
   *   'RSA-RIPEMD160',
   *   'RSA-SHA1',
   *   'RSA-SHA1-2',
   *   'RSA-SHA224',
   *   'RSA-SHA256',
   *   'RSA-SHA384',
   *   'RSA-SHA512',
   *   'blake2b512',
   *   'blake2s256',
   *   'md4',
   *   'md4WithRSAEncryption',
   *   'md5',
   *   'md5-sha1',
   *   'md5WithRSAEncryption',
   *   'mdc2',
   *   'mdc2WithRSA',
   *   'ripemd',
   *   'ripemd160',
   *   'ripemd160WithRSA',
   *   'rmd160',
   *   'sha1',
   *   'sha1WithRSAEncryption',
   *   'sha224',
   *   'sha224WithRSAEncryption',
   *   'sha256',
   *   'sha256WithRSAEncryption',
   *   'sha384',
   *   'sha384WithRSAEncryption',
   *   'sha512',
   *   'sha512WithRSAEncryption',
   *   'ssl3-md5',
   *   'ssl3-sha1',
   *   'whirlpool'
   * ]
   * ```
   */
  const hashes: ReadonlyArray<string> = Object.freeze(getHashes())

  if (hashes.indexOf(hash) < 0) {
    const supported = hashes.join(', ')
    const message = `Unsupported hash "${hash}", currently supported: ${supported}`
    throw new Error(message)
  }

  return (message: string): string => {
    const hashedMessage = createHash(hash).update(message)
    const digest: string = hashedMessage.digest(encoding)
    return digest
  }
}
