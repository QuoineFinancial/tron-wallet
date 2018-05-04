const assert = require('assert')
const bip39 = require('bip39')
const TronWallet = require('../')
const mnemonic = 'cobo wallet is awesome'
const seed = bip39.mnemonicToSeedHex(mnemonic)

describe('Tron Wallet', function () {
  const node = TronWallet.fromMasterSeed(seed)

  it('Can get tron account from HD wallet structure', () => {
    const account = node.getAccount()
    console.log(node.getPrivateKey().toString('hex'))
    assert.equal(account.address, '27QXjqR1iz6DhRNPj9PXx7W6h6NwM3r4gT2')
    assert.equal(account.privateKey, '2EBF15FCEF9CEF30CA13731FD08CEB6F4F7C5E1C2A5794977068FD9BAC2E2DAC')
    assert.equal(account.password, 'Lr8V/O+c7zDKE3Mf0Izrb098XhwqV5SXcGj9m6wuLaw=')
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

  it('Can get address balance', async () => {
    const balance = await node.getBalance()
    console.log('balance: ', balance)
    return balance
  })

  it('Can get raw transaction data from RPC', async () => {
    const data = await node.generateTransaction('27kyrBy6aQyjxMPL6XNCjwdHooL7fJNTwxY', 5000000)
    console.log('raw data: ', data)
    return data
  })

  it('Can vote to some account', async () => {
    const res = await node.vote([{
      address: '27WK11uSBUjxmnbtQ3AArs1hLpUkPg4WAJF',
      amount: 1
    }])
    console.log('vote res: ', res)
    return res
  })

  it('Can transfer TRX', async () => {
    const res = await node.transfer('27kyrBy6aQyjxMPL6XNCjwdHooL7fJNTwxY', 1000000)
    console.log('transfer res: ', res)
    return res
  })
})
