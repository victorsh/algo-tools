import algosdk from "algosdk"
import * as dotenv from "dotenv"
import { __dirname } from './helper/dirname.js'
dotenv.config({ path: __dirname + '/.env' })

const algodClient = new algosdk.Algodv2('', process.env.ALGO_QUICKNODE!, '')

const create_account = async () => {
  try {
    let account = algosdk.generateAccount()
    let mn = algosdk.secretKeyToMnemonic(account.sk)
    console.log('Account Mnemonic: ', mn)
    let account_info = await algodClient.accountInformation(account.addr)
    console.log(account_info)
  } catch (err) {
    console.error(err)
  }
}

const send_algo = async (sender: string, receiver: string, mn: string, amount: number) => {
  const account = algosdk.mnemonicToSecretKey(mn)
  const suggestedParams = await algodClient.getTransactionParams().do();
  const ptxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender,
    suggestedParams,
    to: receiver,
    amount: amount,
    note: new Uint8Array(Buffer.from('Transaction from algo tools')),
  });

  const signedTxn = ptxn.signTxn(account.sk)
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do()
  const result = await algosdk.waitForConfirmation(algodClient, txId, 4)
  console.log(result)
  console.log(`Transaction Information: ${result.txn}`)
  console.log(`Decoded Note: ${Buffer.from(result.txn.txn.note).toString()}`)
}

const opt_in_asa = async (address: string, mn: string, assetId: number, amount: number, notes?: string) => {
  const account = algosdk.mnemonicToSecretKey(mn)
  const params = await algodClient.getTransactionParams().do()
  params.fee = 1000
  params.flatFee = true
  const revocationTarget = undefined
  const closeRemainderTo = undefined
  const uint8_note = new Uint8Array(Buffer.from(notes || ''))

  const optTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
    address,
    address,
    closeRemainderTo,
    revocationTarget,
    amount,
    uint8_note,
    assetId,
    params
  )

  const rawSignedTxn = optTxn.signTxn(account.sk)
}

const waitForConfirmation = async (txId: string) => {
  let response = await algodClient.status().do()
  let lastround = response['last-round']
  while (true) {
    const pendingInfo = await algodClient.pendingTransactionInformation(txId).do()
    if (pendingInfo['confirmed-round'] !== null && pendingInfo['confirmed-round'] > 0) {
      console.log("Transaction " + txId + " confirmed in round " + pendingInfo["confirmed-round"]);
      break;
    }
    lastround++
    await algodClient.statusAfterBlock(lastround).do()
  }
}

// Print created assets
const printCreatedAssets = async (account: string, assetId: number) => {
  let accountInfo = await algodClient.accountInformation(account).do()
  for (let i = 0; i < accountInfo['created-assets'].length; i++) {
    let scrutinizedAsset = accountInfo['created-assets'][i]
    if (scrutinizedAsset['index'] == assetId) {
      console.log("AssetID = " + scrutinizedAsset['index'])
      let myparms = JSON.stringify(scrutinizedAsset['params'], undefined, 2)
      console.log("parms = " + myparms)
      break
    }
  }
}

// Print asset holdings
const printAssetHolding = async (account: string, assetId: number) => {
  let accountInfo = await algodClient.accountInformation(account).do()
  for (let i = 0; i < accountInfo['assets']; i++) {
    let scrutinizedAsset = accountInfo['assets'][i]
    if (scrutinizedAsset['asset-id'] == assetId) {
        let myassetholding = JSON.stringify(scrutinizedAsset, undefined, 2)
        console.log("assetholdinginfo = " + myassetholding)
        break
    }
  }
}

;(async () => {
  // const mn = process.env.WALLET_MAIN!
  // console.log(mn)
  // const sk = algosdk.mnemonicToSecretKey(mn)
  // const address = sk.addr
  // console.log(address)
  // let params = await algodClient.getTransactionParams().do()
  // await create_account()
})().catch((e) => {
  console.error(e)
})
