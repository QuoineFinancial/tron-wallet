import xhr from 'axios'
import qs from 'qs'
import bip39 from 'bip39'
import assert from 'assert'
import hdkey from 'hdkey'
import secp256k1 from 'secp256k1'
import { Buffer } from 'safe-buffer'
import HttpClient from 'tronaccount/src/client/http'
import { byteArray2hexStr } from '@tronprotocol/wallet-api/src/utils/bytes'
import { hexStr2byteArray, base64EncodeToString } from '@tronprotocol/wallet-api/src/lib/code'
import { getBase58CheckAddress, getAddressFromPriKey } from '@tronprotocol/wallet-api/src/utils/crypto'
import { contractBuilder, buildTransferContract, addRef, sign } from './transactionBuilder'
import { deserializeTransaction } from '@tronprotocol/wallet-api/src/protocol/serializer'

class TronWallet {
  static generateMnemonic () {
    return bip39.generateMnemonic()
  }

  static fromMnemonic (mnemonic, provider) {
    const seed = bip39.mnemonicToSeedHex(mnemonic)
    return new this({ seed, url: provider })
  }

  static fromMasterSeed (seed, provider) {
    return new this({ seed, url: provider })
  }

  static fromExtendedKey (extendedKey, provider) {
    return new this({ extendedKey, url: provider })
  }

  static fromPrivateKey (privateKey, provider) {
    return new this({ privateKey, url: provider })
  }

  constructor ({ seed, extendedKey, privateKey, url = 'https://tronscan.io' }) {
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
    this.tronClient = new HttpClient({ url })
    this.url = url
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

  getAddress () {
    const addressBytes = getAddressFromPriKey(this._priKeyBytes)
    return getBase58CheckAddress(addressBytes)
  }

  getTronPassword () {
    return base64EncodeToString(this._priKeyBytes)
  }

  getTronPrivateKey () {
    return byteArray2hexStr(this._priKeyBytes)
  }

  getAccount () {
    return {
      privateKey: this.getTronPrivateKey(),
      address: this.getAddress(),
      password: this.getTronPassword()
    }
  }

  getClient () {
    return this.tronClient
  }

  generateTransactionOffline (hash, number, to, amount) {
    const contract = contractBuilder(this.getAddress(), to, amount)
    const tx = buildTransferContract(contract, 'TransferContract')
    const finalTx = addRef(tx, { hash, number })
    const signedTx = sign(this.getTronPassword(), finalTx)

    console.log(deserializeTransaction(finalTx))

    console.log(JSON.stringify(signedTx, null, 2))
  }

  async getBalance () {
    return this.tronClient.getAccountBalances(this.getAddress())
  }

  async transfer (to, amount, token = 'TRX') {
    // return this.tronClient.send(this.getTronPassword(), token, to, amount)
    return this.tronClient.send(this.getTronPassword(), token, to, amount)
  }

  async getWitnesses () {
    return this.tronClient.getWitnesses()
  }

  async vote (data) {
    // [{address: '', amount: 10}, {address: '', amount: 10}]
    return this.tronClient.voteForWitnesses(this.getTronPassword(), data)
    // return this.tronClient.voteForWitnesses('Ryu5X4bQwKgIKIjfmNS73HQFFFKyFjbCybjj14FZWtQ=', data)
  }

  async generateTransaction (to, amount, token = 'TRX') {
    if (token.toUpperCase() === 'TRX') {
      const { data } = await xhr.post(`${this.url}/sendCoinToView`, qs.stringify({
        Address: this.getAddress(),
        toAddress: to,
        Amount: amount
      }))
      return data
    } else {
      const { data } = await xhr.post(`${this.url}/TransferAssetToView`, qs.stringify({
        assetName: token,
        Address: this.getAddress(),
        toAddress: to,
        Amount: amount
      }))
      return data
    }
  }
}

export default TronWallet
