/* eslint-disable camelcase */
const path = require('path')
const Joi = require('joi')
const { isString } = require('lodash')
const crypto = require('crypto')
const Mnemonic = require('bitcore-mnemonic')
const Bitcore = require('bitcore-lib')
const ecdsa = require('secp256k1')

const AbstractChild = require('../../AbstractNode/child/AbstractChild')
const {
	MessageSentMulti,
	MessageMyAddress,
	MessageSentBytes,
	MessageChildReady,
	MessageChildError,
	MessageWitnessPosted,
	MessageConnectedToHub,
	MessageGenesisCreated,
	MessagePasswordRequired,
} = require('../../../messages')

const paramsSchema = () => ({
	id: Joi.string().required(),
	hub: Joi.string().required(),
})

class GenesisNodeChild extends AbstractChild {
	constructor (argv) {
		const params = GenesisNodeChild.unpackArgv(argv)
		super(params, paramsSchema)

		this
			.on('command_send_bytes', (m) => this.sendBytes(m))
			.on('command_send_multi', (m) => this.sendMulti(m))
			.on('command_login_to_hub', () => this.loginToHub())
			.on('command_post_witness', () => this.postWitness())
			.on('command_get_address', (m) => this.getAddress(m))
			.on('command_create_genesis', (m) => this.createGenesis(m))
	}

	static unpackArgv (argv) {
		const [,,
			id,
			hub,
		] = argv

		return {
			id,
			hub,
		}
	}

	start () {
		super.start()

		this.conf = require('ocore/conf.js')
		this.conf.hub = this.hub

		this.headlessWallet = require('headless-obyte')
		this.eventBus = require('ocore/event_bus.js')
		this.device = require('ocore/device.js')
		this.db = require('ocore/db.js')
		this.constants = require('ocore/constants.js')
		this.composer = require('ocore/composer.js')
		this.network = require('ocore/network.js')
		this.signature = require('ocore/signature.js')
		this.objectHash = require('ocore/object_hash.js')

		this.eventBus.once('headless_wallet_need_pass', () => {
			this.sendToParent(new MessagePasswordRequired())
		})

		this.headlessWalletIsReady = false
		this.eventBus.once('headless_wallet_ready', () => { this.headlessWalletIsReady = true })
	}

	createGenesis ({ witnesses, transfers }) {
		if (this.headlessWalletIsReady) {
			this.genesis({ witnesses: witnesses || [], transfers: transfers || [] })
		} else {
			this.eventBus.once('headless_wallet_ready', () => { this.genesis({ witnesses: witnesses || [], transfers: transfers || [] }) })
		}
	}

	loginToHub () {
		this.eventBus.once('connected', () => {
			this.sendToParent(new MessageConnectedToHub())
		})
		this.device.loginToHub()
	}

	postWitness () {
		const callbacks = this.composer.getSavingCallbacks({
			ifNotEnoughFunds: (err) => this.sendToParent(new MessageChildError(err.error ? err : { error: err })),
			ifError: (err) => this.sendToParent(new MessageChildError(err.error ? err : { error: err })),
			ifOk: (objJoint) => {
				this.network.broadcastJoint(objJoint)
				this.sendToParent(new MessageWitnessPosted({ unit: objJoint.unit.unit }))
			},
		})

		const datafeed = {
			// time: new Date().toString(),
			timestamp: Date.now(),
		}
		this.composer.composeDataFeedJoint(this.address, datafeed, this.headlessWallet.signer, callbacks)
	}

	sendBytes ({ toAddress, amount }) {
		this.headlessWallet.issueChangeAddressAndSendPayment(null, amount, toAddress, null, (err, unit) => {
			if (err) {
				this.sendToParent(new MessageSentBytes({ error: err }))
			} else {
				this.sendToParent(new MessageSentBytes({ unit, error: null }))
			}
		})
	}

	sendMulti ({ opts }) {
		this.headlessWallet.issueChangeAddressAndSendMultiPayment(opts, (err, unit) => {
			if (err) {
				this.sendToParent(new MessageSentMulti({
					unit: null,
					...(isString(err) ? { error: err } : err),
				}))
			}
			this.sendToParent(new MessageSentMulti({ unit, error: null }))
		})
	}

	async genesis ({ witnesses, transfers }) {
		const address = await new Promise((resolve) => {
			this.headlessWallet.readSingleAddress(resolve)
		})

		const witnessesAddresses = [
			address,
			...witnesses.map(w => w.address),
		].sort()

		try {
			this.constants.COUNT_WITNESSES = witnessesAddresses.length
			this.constants.MAJORITY_OF_WITNESSES = this.constants.COUNT_WITNESSES % 2 === 0
				? this.constants.COUNT_WITNESSES / 2 + 1
				: Math.ceil(this.constants.COUNT_WITNESSES / 2)

			const genesisHash = await this.createGenesisUnit(address, { witnesses, transfers })
			await this.addMyWitnesses(witnessesAddresses)
			this.composer.setGenesis(false)
			this.address = address

			this.sendToParent(new MessageGenesisCreated({ address, genesisUnit: genesisHash }))

			if (this.network.isCatchingUp()) {
				this.eventBus.once('catching_up_done', () => this.sendToParent(new MessageChildReady()))
			} else {
				this.sendToParent(new MessageChildReady())
			}
		} catch (error) {
			this.sendToParent(new MessageChildError(error))
		}
	}

	addMyWitnesses (witnesses) {
		return new Promise((resolve) => {
			this.db.query(`INSERT INTO my_witnesses (address) VALUES ${'(?),'.repeat(witnesses.length - 1)}(?)`, witnesses, resolve)
		})
	}

	derivePubkey (xPubKey, path) {
		const hdPubKey = new Bitcore.HDPublicKey(xPubKey)
		return hdPubKey.derive(path).publicKey.toBuffer().toString('base64')
	}

	getDerivedKey (mnemonic_phrase, passphrase, account, is_change, address_index) {
		const mnemonic = new Mnemonic(mnemonic_phrase)
		const xPrivKey = mnemonic.toHDPrivateKey(passphrase)
		const path = "m/44'/0'/" + account + "'/" + is_change + '/' + address_index
		const derivedPrivateKey = xPrivKey.derive(path).privateKey
		return derivedPrivateKey.bn.toBuffer({ size: 32 }) // return as buffer
	}

	createWallet (mnemonicPhrase) {
		const deviceTempPrivKey = crypto.randomBytes(32)
		const devicePrevTempPrivKey = crypto.randomBytes(32)
		const passphrase = '0000'

		const mnemonic = new Mnemonic(mnemonicPhrase)
		const xPrivKey = mnemonic.toHDPrivateKey(passphrase)
		const strXPubKey = Bitcore.HDPublicKey(xPrivKey.derive("m/44'/0'/0'")).toString()
		const pubkey = this.derivePubkey(strXPubKey, 'm/' + 0 + '/' + 0)
		const arrDefinition = ['sig', { pubkey: pubkey }]
		const address = this.objectHash.getChash160(arrDefinition)
		const wallet = crypto.createHash('sha256').update(strXPubKey, 'utf8').digest('base64')

		const devicePrivKey = xPrivKey.derive("m/1'").privateKey.bn.toBuffer({ size: 32 })
		const devicePubkey = ecdsa.publicKeyCreate(devicePrivKey, true).toString('base64')
		const device_address = this.objectHash.getDeviceAddress(devicePubkey)

		const obj = {}
		obj.passphrase = passphrase
		obj.mnemonic_phrase = mnemonic.phrase
		obj.temp_priv_key = deviceTempPrivKey.toString('base64')
		obj.prev_temp_priv_key = devicePrevTempPrivKey.toString('base64')
		obj.device_address = device_address
		obj.address = address
		obj.wallet = wallet
		obj.is_change = 0
		obj.address_index = 0
		obj.definition = arrDefinition

		return obj
	}

	createGenesisUnit (genesisAddress, { witnesses, transfers }) {
		return new Promise((resolve, reject) => {
			const savingCallbacks = this.composer.getSavingCallbacks({
				ifNotEnoughFunds: (...args) => {
					reject(JSON.stringify(args))
				},
				ifError: (...args) => {
					reject(JSON.stringify(args))
				},
				ifOk: (objJoint) => {
					this.network.broadcastJoint(objJoint)
					resolve(objJoint.unit.unit)
				},
			})

			const totalTransfered = transfers.reduce((acc, cur) => {
				return acc + cur.amount
			}, 0)

			const desktopApp = require('ocore/desktop_app.js')
			const appDataDir = desktopApp.getAppDataDir()

			const file = require(path.join(appDataDir, './keys.json'))
			const genesisMnemonic = file.mnemonic_phrase

			const mnemonics = [
				genesisMnemonic,
				...witnesses.map(w => w.mnemonic),
			]

			const walletData = mnemonics
				.map(m => this.createWallet(m))
				.reduce((acc, cur) => {
					return {
						...acc,
						[cur.address]: cur,
					}
				}, {})

			const witnessesAddresses = Object.keys(walletData).sort()

			this.composer.setGenesis(true)

			const signer = {
				readSigningPaths: (conn, address, handleLengthsBySigningPaths) => {
					handleLengthsBySigningPaths({ r: this.constants.SIG_LENGTH })
				},
				readDefinition: (conn, address, handleDefinition) => {
					const wallet = walletData[address]
					const definition = wallet.definition
					handleDefinition(null, definition)
				},
				sign: (objUnsignedUnit, assocPrivatePayloads, address, signing_path, handleSignature) => {
					const buf_to_sign = this.objectHash.getUnitHashToSign(objUnsignedUnit)
					const wallet = walletData[address]
					const derivedPrivateKey = this.getDerivedKey(
						wallet.mnemonic_phrase,
						wallet.passphrase,
						0,
						wallet.is_change,
						wallet.address_index,
					)
					handleSignature(null, this.signature.sign(buf_to_sign, derivedPrivateKey))
				},
			}

			const toSelf = 1e15 - totalTransfered - 1e4

			this.composer.composeJoint({
				witnesses: witnessesAddresses,
				paying_addresses: witnessesAddresses,
				outputs: [
					...transfers,
					{ address: genesisAddress, amount: Math.ceil(toSelf / 2) },
					{ address: genesisAddress, amount: Math.floor(toSelf / 2) },
					{ address: genesisAddress, amount: 0 }, // change output
				],
				signer: signer,
				callbacks: {
					ifNotEnoughFunds: (...args) => {
						reject(JSON.stringify(args))
					},
					ifError: (...args) => {
						reject(JSON.stringify(args))
					},
					ifOk: (objJoint, assocPrivatePayloads, composerUnlock) => {
						this.constants.GENESIS_UNIT = objJoint.unit.unit
						savingCallbacks.ifOk(objJoint, assocPrivatePayloads, composerUnlock)
					},
				},
			})
		})
	}

	getAddress () {
		this.headlessWallet.readFirstAddress(address => {
			this.sendToParent(new MessageMyAddress({ address }))
		})
	}
}

const child = new GenesisNodeChild(process.argv)
child.start()
