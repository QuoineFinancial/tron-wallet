import bip39 from 'bip39'
import assert from 'assert'
import hdkey from 'hdkey'
import secp256k1 from 'secp256k1'
import { Buffer } from 'safe-buffer'
import { buildTransferTransaction } from '@tronscan/client/src/utils/transactionBuilder'
import { signTransaction } from '@tronscan/client/src/utils/crypto'
import { addRef } from './transactionBuilder'
import {
  computeAddress,
  getBase58CheckAddress,
  byteArray2hexStr,
  hexStr2byteArray,
  getPubKeyFromPriKey
} from './address'

class TronWallet {
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
    this._init()
  }

  _init () {
    const priKey = this.getPrivateKey()
    let priKeyHex = priKey.toString('hex')
    while (priKeyHex.length < 64) {
      priKeyHex = '0' + priKeyHex
    }
    this._priKeyBytes = hexStr2byteArray(priKeyHex)
  }

  derivePath (path) {
    assert(this._node.derive, 'can not derive when generate from private / public key')
    this._node = this._node.derive(path)
    return new TronWallet({ extendedKey: this._node.privateExtendedKey })
  }

  deriveChild (index) {
    assert(this._node.deriveChild, 'can not derive when generate from private / public key')
    this._node = this._node.deriveChild(index)
    return new TronWallet({ extendedKey: this._node.privateExtendedKey })
  }

  getPrivateExtendedKey () {
    assert(this._node.privateExtendedKey, 'can not get xpriv when generate from private / public key')
    return this._node.privateExtendedKey
  }

  getPublicExtendedKey () {
    assert(this._node.publicExtendedKey, 'can not get xpub when generate from private / public key')
    return this._node.publicExtendedKey
  }

  getPrivateKey () {
    assert(this._node._privateKey, 'can not get private when generate from public key')
    return this._node.privateKey
  }

  getTronPrivateKey () {
    return byteArray2hexStr(this._priKeyBytes)
  }

  getAddress () {
    const addressBytes = computeAddress(getPubKeyFromPriKey(this._priKeyBytes))
    return getBase58CheckAddress(addressBytes)
  }

  generateTransaction (latestBlock, to, amount) {
    const transaction = buildTransferTransaction('TRX', this.getAddress(), to, amount)
    const transactionWithRefs = addRef(transaction, latestBlock)
    const signed = signTransaction(this.getTronPrivateKey(), transactionWithRefs)
    return signed
  }
}

export default TronWallet
