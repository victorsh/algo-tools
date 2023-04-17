const algosdk = require('algosdk')
require('dotenv').config()

const algo_client = new algosdk.Algodv2('', process.env.ALGO_QUICKNODE, '')

// ;(async () => {
//   const mn = process.env.WALLET_MAIN
//   const sk = algosdk.mnemonicToSecretKey(mn)
//   const address = sk.addr
//   let params = await algodclient.getTransactionParams().do();
// })().catch((e) => {
//   console.log(e);
// });

// Create an account
const create_account = async () => {
  try {
    let account = algosdk.generateAccount()
    let mn = algosdk.secretKeyToMnemonic(account.sk)
    console.log('Account Mnemonic: ', mn)
    let account_info = await algo_client.accountInformation(account.addr)
    console.log(account_info)
  } catch (err) {
    console.error(err)
  }
}

// Send Algo
const send_algo = async (sender, receiver, mn, amount) => {
  const suggestedParams = await algodClient.getTransactionParams().do();
  const ptxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: acct.addr,
    suggestedParams,
    to: acct2.addr,
    amount: amount,
    note: new Uint8Array(Buffer.from('hello world')),
  });
  const sk = algosdk.mnemonicToSecretKey(mn)
  const pk = algosdk.mnemonicTo

  const signedTxn = ptxn.signTxn(acct.privateKey)
  const { txId } = await algodClient.sendRawTransaction(signedTxn).do()
  const result = await algosdk.waitForConfirmation(algodClient, txId, 4)
  console.log(result)
  console.log(`Transaction Information: ${result.txn}`)
  console.log(`Decoded Note: ${Buffer.from(result.txn.txn.note).toString()}`)
}

// Send ASA

// Optin ASA
const opt_in_asa = async (address, mn, assetId) => {
  const params = await algodclient.getTransactionParams().do()
  params.fee = 1000
  params.flatFee = true
  const revocationTarget = undefined
  const closeRemainderTo = undefined
  const amount = 0

  const optTxn = algosdk.makeAssetTransferTxnWithSuggestedParams(
    address, address, closeRemainderTo, revocationTarget, amount, note, assetId, params
  )

  const rawSignedTxn = optTxn.signTxn()
}

// Optout ASA

// Generate new account

// Wait for Confirmation
const waitForConfirmation = async (algo_client, txId) => {
  let response = await algo_client.status().do()
  let lastround = response['last-round']
  while (true) {
    const pendingInfo = await algo_client.pendingTransactionInformation(txId).do()
    if (pendingInfo['confirmed-round'] !== null && pendingInfo['confirmed-round'] > 0) {
      console.log("Transaction " + txId + " confirmed in round " + pendingInfo["confirmed-round"]);
      break;
    }
    lastround++
    await algo_client.statusAfterBlock(lastround).do()
  }
}

// Print created assets
const printCreatedAssets = async (algo_client, account, asset_id) => {
  let accountInfo = await algo_client.accountInformation(account).do()
  for (let i = 0; i < accountInfo['created-assets'].length; i++) {
    let scrutinizedAsset = accountInfo['created-assets'][i]
    if (scrutinizedAsset['index'] == asset_id) {
      console.log("AssetID = " + scrutinizedAsset['index'])
      let myparms = JSON.stringify(scrutinizedAsset['params'], undefined, 2)
      console.log("parms = " + myparms)
      break
    }
  }
}

// Print asset holdings
const printAssetHolding = async (algo_client, account, asset_id) => {
  let accountInfo = await algo_client.accountInformation(account).do()
  for (let i = 0; i < accountInfo['assets']; i++) {
    let scrutinizedAsset = accountInfo['assets'][i]
    if (scrutinizedAsset['asset-id'] == assetid) {
        let myassetholding = JSON.stringify(scrutinizedAsset, undefined, 2)
        console.log("assetholdinginfo = " + myassetholding)
        break
    }
  }
}

// Sent txn with encrypted note