// const assert = require('assert')
const bip39 = require('bip39')
const fetch = require('node-fetch')
const TronWallet = require('../')
const mnemonic = 'cobo wallet is awesome'
const assert = require('assert')
const seed = bip39.mnemonicToSeedHex(mnemonic)

describe('Tron Wallet', function () {
  const node = TronWallet.fromMasterSeed(seed)
  const pk = '43B75088348B0E2F0B5FABC6F43CF5C084B0010FBFA2D86160A70E5AF7E17E56'
  const node1 = TronWallet.fromTronPrivateKey(pk)

  it('Can get tron account from HD wallet structure', () => {
    assert.equal(node.getAddress(), '27QXjqR1iz6DhRNPj9PXx7W6h6NwM3r4gT2')
    assert.equal(node.getTronPrivateKey(), '2EBF15FCEF9CEF30CA13731FD08CEB6F4F7C5E1C2A5794977068FD9BAC2E2DAC')
    assert.equal(node1.getAddress(), '27UozX7c7y8iXJRQ9La9kwGozokGnBURhfV')
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
    const parentNode = TronWallet.fromMasterSeed(seed)
    const node1 = parentNode.derivePath("m/44'/194'/0'/0/0")
    assert.equal(node1.getAddress(), '27Vsbb84NX6hNgR7kAGwi74BAXV7TdCcHTp')
    const node2 = parentNode.deriveChild(0)
    assert.equal(node2.getAddress(), '27Qy2jqg5KLzwKxz4HYxabqqiEkAkBWb4aN')
  })

  it('Can generate from tron private key', async () => {
    // 43B75088348B0E2F0B5FABC6F43CF5C084B0010FBFA2D86160A70E5AF7E17E56
    const res = await fetch('https://api.tronscan.org/api/block?sort=-timestamp&limit=1')
    const { data } = await res.json()
    const tx = node1.generateTransaction('27jbeW2CXojGNeStwX4KEqvwj8aYNLmJ55P', 1000000, 'TRX', data[0])
    console.log('Hex is: ', tx.hex)
    return tx
  })

  it('Cen generate transaction offline', () => {
    const latestBlock = {
      hash: 'e996dc5c0ecc96773d31d1cdd6e9db3140cdfcd6fcdbaadfc65ab3e4ad7b352f',
      number: 195022,
      timestamp: 1527312435000
    }
    return node.generateTransaction('27Vsbb84NX6hNgR7kAGwi74BAXV7TdCcHTp', 100000000, 'TRX', latestBlock)
  })

  it('Can freeze some TRX', async () => {
    const res = await fetch('https://api.tronscan.org/api/block?sort=-timestamp&limit=1')
    const { data } = await res.json()
    const tx = node1.freeze(10000000, 3, data[0])
    console.log('Hex is: ', tx.hex)
    return tx
  })

  it('Can unfreeze TRX', async () => {
    const res = await fetch('https://api.tronscan.org/api/block?sort=-timestamp&limit=1')
    const { data } = await res.json()
    const tx = node1.unfreeze(data[0])
    console.log('Hex is: ', tx.hex)
    return tx
  })
})
