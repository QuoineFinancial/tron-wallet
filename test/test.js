// const assert = require('assert')
const bip39 = require('bip39')
const fetch = require('node-fetch')
const TronWallet = require('../')
const mnemonic = 'cobo wallet is awesome'
const assert = require('assert')
const seed = bip39.mnemonicToSeedHex(mnemonic)
const pk = '43B75088348B0E2F0B5FABC6F43CF5C084B0010FBFA2D86160A70E5AF7E17E56'
const pk1 = '2193A720B5811BE5E48D8D25CF7473D47E3556A017922ED36CC3A3A137437751'

describe('Tron Wallet', function () {
  it('Can get tron account from HD wallet structure', () => {
    const node = TronWallet.fromMasterSeed(seed, true)
    const node1 = TronWallet.fromTronPrivateKey(pk, true)
    const nodeMainnet = TronWallet.fromTronPrivateKey(pk)

    assert.equal(node.getAddress(), '27QXjqR1iz6DhRNPj9PXx7W6h6NwM3r4gT2')
    assert.equal(node.getTronPrivateKey(), '2EBF15FCEF9CEF30CA13731FD08CEB6F4F7C5E1C2A5794977068FD9BAC2E2DAC')
    assert.equal(node1.getAddress(), '27UozX7c7y8iXJRQ9La9kwGozokGnBURhfV')
    assert.equal(nodeMainnet.getAddress(), 'TFhgyoHkWzhHcF9v1iWUsMxG1poAg8xxXb')
  })

  it('Can generate new mnemonic and import', () => {
    const myMnemonic = TronWallet.generateMnemonic()
    const node = TronWallet.fromMnemonic(myMnemonic)
    assert(node.getAddress())
  })

  it('Can import from base58 string', () => {
    const node = TronWallet.fromExtendedKey('xprv9s21ZrQH143K27GwrJ5SPAZc9KPn8i8gkjeXcQe5vPtRPgUDyoq8qrh4qCRPwZAxzP8abdc9nZduW7UDYN1B5V6rjhc3YPMXzr9ArHaM4M6')
    assert(node.getAddress())
  })

  it('Can derive to child nodes and get address', () => {
    const parentNode = TronWallet.fromMasterSeed(seed, true)
    const childNode1 = parentNode.derivePath("m/44'/194'/0'/0/0")
    assert.equal(childNode1.getAddress(), '27Vsbb84NX6hNgR7kAGwi74BAXV7TdCcHTp')
    const childNode2 = parentNode.deriveChild(0)
    assert.equal(childNode2.getAddress(), '27Qy2jqg5KLzwKxz4HYxabqqiEkAkBWb4aN')
  })

  it('Can generate from tron private key', async () => {
    // 43B75088348B0E2F0B5FABC6F43CF5C084B0010FBFA2D86160A70E5AF7E17E56
    const node = TronWallet.fromTronPrivateKey(pk, false)
    const res = await fetch('https://api.tronscan.org/api/block?sort=-timestamp&limit=1')
    const { data } = await res.json()
    const tx = node.generateTransaction('TFhgyoHkWzhHcF9v1iWUsMxG1poAg8xxXb', 1000000, 'TRX', data[0])
    return tx
  })

  it('Cen generate transaction offline', () => {
    const node = TronWallet.fromTronPrivateKey(pk, false)
    const latestBlock = {
      hash: '315f1ee0e082a1dae1b9de559665c6714f3b8667f69cd5e44466ba6e34d37aef',
      number: 1936,
      timestamp: 1527682440000
    }
    const tx = node.generateTransaction('27Vsbb84NX6hNgR7kAGwi74BAXV7TdCcHTp', 100000000, 'TRX', latestBlock)
    return tx
  })

  it('Can freeze some TRX', async () => {
    const node = TronWallet.fromTronPrivateKey(pk1, false)
    const res = await fetch('https://api.tronscan.org/api/block?sort=-timestamp&limit=1')
    const { data } = await res.json()
    const tx = node.freeze(10000000, 3, data[0])
    return tx
  })

  it('Can unfreeze TRX', async () => {
    const node = TronWallet.fromTronPrivateKey(pk, false)
    const res = await fetch('https://api.tronscan.org/api/block?sort=-timestamp&limit=1')
    const { data } = await res.json()
    const tx = node.unfreeze(data[0])
    return tx
  })
})
