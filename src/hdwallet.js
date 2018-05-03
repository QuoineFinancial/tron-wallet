import { Buffer } from 'safe-buffer'
import bip39 from 'bip39'
import assert from 'assert'
import secp256k1 from 'secp256k1'
import hdkey from 'hdkey'

class HDWallet {
  constructor ({ seed, extendedKey, privateKey }) {
    if (seed) {
      this._seed = seed
      this._node = hdkey.fromMasterSeed(Buffer(seed, 'hex'))
    } else if (extendedKey) {
      this._seed = null
      this._node = hdkey.fromExtendedKey(extendedKey)
    } else {
      assert.equal(privateKey.length, 32, 'Private key must be 32 bytes.')
      assert(secp256k1.privateKeyVerify(privateKey), 'Invalid private key')
      this._seed = null
      this._node = {
        _publicKey: secp256k1.publicKeyCreate(privateKey, true),
        _privateKey: privateKey
      }
    }
  }

  static generateMnemonic () {
    return bip39.generateMnemonic()
  }

  static fromMnemonic (mnemonic) {
    const seed = bip39.mnemonicToSeedHex(mnemonic)
    return new this({ seed })
  }

  static fromMasterSeed (seed) {
    return new this({ seed })
  }

  static fromExtendedKey (extendedKey) {
    return new this({ extendedKey })
  }

  static fromPrivateKey (privateKey) {
    return new this({ privateKey })
  }

  derivePath (path) {
    throw new Error('should be defined in extended class')
  }

  deriveChild (index) {
    throw new Error('should be defined in extended class')
  }

  getPrivateExtendedKey () {
    assert(this._node.privateExtendedKey, 'not support when generate from pubkey')
    return this._node.privateExtendedKey
  }

  getPublicExtendedKey () {
    assert(this._node.publicExtendedKey, 'can not get xpub when generate from private / public key')
    return this._node.publicExtendedKey
  }

  getPrivateKey () {
    assert(this._node._privateKey, 'not support when generate from pubkey')
    return this._node._privateKey
  }

  getPublicKey () {
    return this._node._publicKey
  }
}

export default HDWallet
