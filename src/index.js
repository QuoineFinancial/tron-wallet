import bip39 from 'bip39'
import assert from 'assert'
import hdkey from 'hdkey'
import secp256k1 from 'secp256k1'
import { Buffer } from 'safe-buffer'
import {
  buildTransferTransaction,
  buildAccountUpdate,
  buildVote,
  buildFreezeBalance,
  buildUnfreezeBalance,
  buildAssetIssue,
  buildAssetParticipate
} from '@tronscan/client/src/utils/transactionBuilder'
import { signTransaction } from '@tronscan/client/src/utils/crypto'
import JSSHA from 'jssha'
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

  static fromMnemonic (mnemonic, isTestNet = false) {
    const seed = bip39.mnemonicToSeedHex(mnemonic)
    return new this({ seed, isTestNet })
  }

  static fromMasterSeed (seed, isTestNet = false) {
    return new this({ seed, isTestNet })
  }

  static fromExtendedKey (extendedKey, isTestNet = false) {
    return new this({ extendedKey, isTestNet })
  }

  static fromPrivateKey (privateKey, isTestNet = false) {
    return new this({ privateKey, isTestNet })
  }

  static fromTronPrivateKey (pk, isTestNet = false) {
    return new this({ privateKey: Buffer(pk, 'hex'), isTestNet })
  }

  constructor ({ seed, extendedKey, privateKey, isTestNet }) {
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
    this._isTestNet = isTestNet || false
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
    return new TronWallet({ extendedKey: this._node.privateExtendedKey, isTestNet: this._isTestNet })
  }

  deriveChild (index) {
    assert(this._node.deriveChild, 'can not derive when generate from private / public key')
    this._node = this._node.deriveChild(index)
    return new TronWallet({ extendedKey: this._node.privateExtendedKey, isTestNet: this._isTestNet })
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
    return this._node._privateKey
  }

  getTronPrivateKey () {
    return byteArray2hexStr(this._priKeyBytes)
  }

  getAddress () {
    const addressBytes = computeAddress(getPubKeyFromPriKey(this._priKeyBytes), this._isTestNet)
    return getBase58CheckAddress(addressBytes)
  }

  updateTransaction (tx, latestBlock) {
    const transactionWithRefs = addRef(tx, latestBlock)
    const signed = signTransaction(this.getTronPrivateKey(), transactionWithRefs)
    const shaObj = new JSSHA('SHA-256', 'HEX')
    shaObj.update(signed.hex)
    const txid = shaObj.getHash('HEX')
    return { txid, ...signed }
  }

  generateTransaction (to, amount, token = 'TRX', latestBlock) {
    const transaction = buildTransferTransaction(token, this.getAddress(), to, amount)
    return this.updateTransaction(transaction, latestBlock)
  }

  updateAccount (name, latestBlock) {
    const transaction = buildAccountUpdate(this.getAddress(), name)
    return this.updateTransaction(transaction, latestBlock)
  }

  freeze (amount, duration = 3, latestBlock) {
    const transaction = buildFreezeBalance(this.getAddress(), amount, duration)
    return this.updateTransaction(transaction, latestBlock)
  }

  unfreeze (latestBlock) {
    const transaction = buildUnfreezeBalance(this.getAddress())
    return this.updateTransaction(transaction, latestBlock)
  }

  vote (votes, latestBlock) {
    const transaction = buildVote(this.getAddress(), votes)
    return this.updateTransaction(transaction, latestBlock)
  }

  issueAssets (options, latestBlock) {
    const transaction = buildAssetIssue(options, latestBlock)
    return this.updateTransaction(transaction, latestBlock)
  }

  buyAssets (issuer, token, amount, latestBlock) {
    const transaction = buildAssetParticipate(this.getAddress(), issuer, token, amount)
    return this.updateTransaction(transaction, latestBlock)
  }
}

export default TronWallet
