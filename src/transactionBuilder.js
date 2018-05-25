const { Transaction } = require('@tronprotocol/wallet-api/src/protocol/core/Tron_pb')
const { TransferContract } = require('@tronprotocol/wallet-api/src/protocol/core/Contract_pb')
const { longToByteArray, byteArray2hexStr } = require('@tronprotocol/wallet-api/src/utils/bytes')
const { hexStr2byteArray } = require('@tronprotocol/wallet-api/src/lib/code')
const { signTransaction, decode58Check } = require('@tronprotocol/wallet-api/src/utils/crypto')
const anyPb = require('google-protobuf/google/protobuf/any_pb.js')

export function contractBuilder (address, to, amount) {
  return new TransferContract([
    Uint8Array.from(decode58Check(address)),
    Uint8Array.from(decode58Check(to)),
    amount
  ])
}

export function buildTransferContract (message, typeName) {
  const anyValue = new anyPb.Any()
  anyValue.pack(message.serializeBinary(), 'protocol.' + typeName)
  const contract = new Transaction.Contract()
  contract.setType(Transaction.Contract.ContractType.TRANSFERCONTRACT)
  contract.setParameter(anyValue)

  var raw = new Transaction.raw() // eslint-disable-line
  raw.addContract(contract)
  raw.setTimestamp(new Date().getTime() * 1000000)

  var transaction = new Transaction()
  transaction.setRawData(raw)

  return transaction
}

export function addRef (transaction, latestBlock) {
  let latestBlockHash = latestBlock.hash
  let latestBlockNum = latestBlock.number

  let numBytes = longToByteArray(latestBlockNum)
  numBytes.reverse()
  let hashBytes = hexStr2byteArray(latestBlockHash)

  let generateBlockId = [...numBytes.slice(0, 8), ...hashBytes.slice(8, hashBytes.length - 1)]

  let rawData = transaction.getRawData()
  rawData.setRefBlockHash(Uint8Array.from(generateBlockId.slice(8, 16)))
  rawData.setRefBlockBytes(Uint8Array.from(numBytes.slice(6, 8)))
  rawData.setRefBlockNum(latestBlockNum)
  transaction.setRawData(rawData)
  return transaction
}

export function sign (privateKey, transaction) {
  let transactionSigned = signTransaction(hexStr2byteArray(privateKey), transaction)
  let transactionBytes = transactionSigned.serializeBinary()
  let transactionString = byteArray2hexStr(transactionBytes)
  return transactionString
}
