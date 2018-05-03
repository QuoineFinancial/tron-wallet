import xhr from 'axios'
import qs from 'qs'
import assert from 'assert'
import HDWallet from './hdwallet'
import HttpClient from 'tronaccount/src/client/http'
import { byteArray2hexStr } from '@tronprotocol/wallet-api/src/utils/bytes'
import { hexStr2byteArray, base64EncodeToString } from '@tronprotocol/wallet-api/src/lib/code'
import { getBase58CheckAddress, getAddressFromPriKey } from '@tronprotocol/wallet-api/src/utils/crypto'

class TronWallet extends HDWallet {
  constructor ({ seed, extendedKey, privateKey, url = 'https://tronscan.io' }) {
    super({ seed, extendedKey, privateKey })
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

  async getBalance () {
    return this.tronClient.getAccountBalances(this.getAddress())
  }

  async transfer (to, amount, token = 'TRX') {
    return this.tronClient.send(this.getTronPassword(), token, to, amount)
  }

  async vote (data) {
    // [{address: '', amount: 10}, {address: '', amount: 10}]
    return this.tronClient.voteForWitnesses(this.getTronPassword(), data)
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
