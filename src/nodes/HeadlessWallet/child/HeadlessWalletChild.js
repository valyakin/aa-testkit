const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const Joi = require('joi')
const { isString } = require('lodash')
const AbstractChild = require('../../AbstractNode/child/AbstractChild')
const {
	MessageSentMulti,
	MessageSentBytes,
	MessageMyAddress,
	MessageMyBalance,
	MessageChildReady,
	MessageMyAddresses,
	MessageAaTriggered,
	MessageAssetCreated,
	MessageAgentDeployed,
	MessageSignedPackage,
	MessageJointComposed,
	MessagePasswordRequired,
	MessageIssueDivisibleAssetDone,
	MessageIssueIndivisibleAssetDone,
	MessageUnitSigned,
} = require('../../../messages')

const paramsSchema = () => ({
	id: Joi.string().required(),
	hub: Joi.string().required(),
	genesisUnit: Joi.string().required(),
	isSingleAddress: Joi.boolean().required(),
	initialWitnesses: Joi.array().items(Joi.string()).min(1),
})

class HeadlessWalletChild extends AbstractChild {
	constructor (argv) {
		const params = HeadlessWalletChild.unpackArgv(argv)
		super(params, paramsSchema)

		this
			.on('command_trigger_aa', (m) => this.triggerAa(m))
			.on('command_send_multi', (m) => this.sendMulti(m))
			.on('command_get_address', () => this.getAddress())
			.on('command_send_bytes', (m) => this.sendBytes(m))
			.on('command_get_balance', (m) => this.getBalance(m))
			.on('command_deploy_agent', (m) => this.deployAgent(m))
			.on('command_create_asset', (m) => this.createAsset(m))
			.on('command_sign_message', (m) => this.signMessage(m))
			.on('command_get_my_addresses', (m) => this.getMyAddresses(m))
			.on('command_issue_divisible_asset', (m) => this.issueDivisibleAsset(m))
			.on('command_issue_indivisible_asset', (m) => this.issueIndivisibleAsset(m))
			.on('command_compose_joint', (m) => this.composeJoint(m))
			.on('command_sign_unit', (m) => this.signUnit(m))
	}

	static unpackArgv (argv) {
		const [,,
			id,
			hub,
			genesisUnit,
			isSingleAddress,
			initialWitnessesLength,
			...rest
		] = argv

		const initialWitnesses = rest.splice(0, initialWitnessesLength)

		return {
			id,
			hub,
			genesisUnit,
			isSingleAddress,
			initialWitnesses,
		}
	}

	start () {
		super.start()

		this.constants = require('ocore/constants.js')
		this.constants.GENESIS_UNIT = this.genesisUnit

		this.constants.COUNT_WITNESSES = this.initialWitnesses.length
		this.constants.MAJORITY_OF_WITNESSES = this.constants.COUNT_WITNESSES % 2 === 0
			? this.constants.COUNT_WITNESSES / 2 + 1
			: Math.ceil(this.constants.COUNT_WITNESSES / 2)

		this.myWitnesses = require('ocore/my_witnesses')
		this.myWitnesses.insertWitnesses(this.initialWitnesses)

		this.conf = require('ocore/conf.js')
		this.conf.hub = this.hub
		this.conf.bSingleAddress = this.isSingleAddress

		this.headlessWallet = require('headless-obyte')
		this.eventBus = require('ocore/event_bus.js')

		this.composer = require('ocore/composer')
		this.network = require('ocore/network')
		this.storage = require('ocore/storage')
		this.desktopApp = require('ocore/desktop_app.js')

		if (process.env.mnemonic) {
			const appDataDir = this.desktopApp.getAppDataDir()
			const keysFilename = path.join(appDataDir, 'keys.json')
			const deviceTempPrivKey = crypto.randomBytes(32)
			const devicePrevTempPrivKey = crypto.randomBytes(32)

			const keys = {
				mnemonic_phrase: process.env.mnemonic,
				temp_priv_key: deviceTempPrivKey.toString('base64'),
				prev_temp_priv_key: devicePrevTempPrivKey.toString('base64'),
			}

			fs.writeFileSync(keysFilename, JSON.stringify(keys, null, '\t'), 'utf8')
		}
		this.eventBus.once('headless_wallet_need_pass', () => {
			this.sendToParent(new MessagePasswordRequired())
		})

		this.eventBus.once('headless_wallet_ready', () => {
			this.sendToParent(new MessageChildReady())
		})
	}

	getAddress () {
		this.headlessWallet.readFirstAddress(address => {
			this.sendToParent(new MessageMyAddress({ address }))
		})
	}

	getMyAddresses () {
		const { readMyAddresses } = require('ocore/wallet_general')
		readMyAddresses((addresses) => {
			this.sendToParent(new MessageMyAddresses({ addresses }))
		})
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
			} else {
				this.sendToParent(new MessageSentMulti({ unit, error: null }))
			}
		})
	}

	async composeJoint ({ opts, saveJoint = true, broadcastJoint = true }) {
		try {
			const myAddress = await this.headlessWallet.readFirstAddress()
			opts.paying_addresses = [myAddress]

			opts.callbacks = {
				ifNotEnoughFunds: (err) => this.sendToParent(new MessageJointComposed({ error: err })),
				ifError: (err) => this.sendToParent(new MessageJointComposed({ error: err })),
				ifOk: (objJoint, privatePayloads, unlock) => {
					if (typeof unlock === 'function') { unlock() }
					if (broadcastJoint) { this.network.broadcastJoint(objJoint) }
					this.sendToParent(new MessageJointComposed({ unit: objJoint.unit, error: null }))
				},
			}
			if (saveJoint) { opts.callbacks = this.composer.getSavingCallbacks(opts.callbacks) }

			opts.signer = this.headlessWallet.signer

			this.composer.composeJoint(opts)
		} catch (error) {
			this.sendToParent(new MessageJointComposed({ error: error.message }))
		}
	}

	issueDivisibleAsset ({ opts }) {
		const divisibleAsset = require('ocore/divisible_asset.js')
		const network = require('ocore/network')

		const onError = (err) => {
			this.sendToParent(new MessageIssueDivisibleAssetDone({
				unit: null,
				...(isString(err) ? { error: err } : err),
			}))
		}

		divisibleAsset.composeAndSaveDivisibleAssetPaymentJoint({
			signer: this.headlessWallet.signer,
			callbacks: {
				ifError: onError,
				ifNotEnoughFunds: onError,
				ifOk: (objJoint) => {
					network.broadcastJoint(objJoint)
					this.sendToParent(new MessageIssueDivisibleAssetDone({ unit: objJoint.unit.unit, error: null }))
				},
			},
			...opts,
		})
	}

	issueIndivisibleAsset ({ opts }) {
		const indivisibleAsset = require('ocore/indivisible_asset.js')
		const network = require('ocore/network')

		const onError = (err) => {
			this.sendToParent(new MessageIssueIndivisibleAssetDone({
				unit: null,
				...(isString(err) ? { error: err } : err),
			}))
		}

		indivisibleAsset.composeAndSaveIndivisibleAssetPaymentJoint({
			signer: this.headlessWallet.signer,
			callbacks: {
				ifError: onError,
				ifNotEnoughFunds: onError,
				ifOk: (objJoint) => {
					network.broadcastJoint(objJoint)
					this.sendToParent(new MessageIssueIndivisibleAssetDone({ unit: objJoint.unit.unit, error: null }))
				},
			},
			...opts,
		})
	}

	triggerAa ({ data, toAddress, amount }) {
		const objectHash = require('ocore/object_hash.js')

		const messages = [
			{
				app: 'data',
				payload_location: 'inline',
				payload_hash: objectHash.getBase64Hash(data),
				payload: data,
			},
		]
		const opts = {
			to_address: toAddress,
			amount,
			messages,
		}

		this.headlessWallet.issueChangeAddressAndSendMultiPayment(opts, (err, unit) => {
			if (err) {
				this.sendToParent(new MessageAaTriggered({
					unit: null,
					...(isString(err) ? { error: err } : err),
				}))
			}
			this.sendToParent(new MessageAaTriggered({ unit, error: null }))
		})
	}

	getBalance () {
		this.headlessWallet.readSingleWallet(walletId => {
			const wallet = require('ocore/wallet')
			wallet.readBalance(walletId, (assocBalances) => {
				this.sendToParent(new MessageMyBalance({ balance: assocBalances }))
			})
		})
	}

	async deployAgent ({ ojson }) {
		try {
			const objectHash = require('ocore/object_hash')
			const aaAddress = objectHash.getChash160(ojson)

			const myAddress = await new Promise((resolve, reject) => {
				this.headlessWallet.readFirstAddress(address => resolve(address))
			})

			const payload = {
				address: aaAddress,
				definition: ojson,
			}

			const callbacks = this.composer.getSavingCallbacks({
				ifNotEnoughFunds: (err) => this.sendToParent(new MessageAgentDeployed({ error: err })),
				ifError: (err) => this.sendToParent(new MessageAgentDeployed({ error: err })),
				ifOk: (objJoint) => {
					this.network.broadcastJoint(objJoint)
					this.sendToParent(new MessageAgentDeployed({ unit: objJoint.unit.unit, address: aaAddress, error: null }))
				},
			})

			this.composeContentJoint(myAddress, 'definition', payload, this.headlessWallet.signer, callbacks)
		} catch (error) {
			this.sendToParent(new MessageAgentDeployed({ error: error.message }))
		}
	}

	async createAsset ({ assetDefinition }) {
		try {
			const myAddress = await this.headlessWallet.readFirstAddress()

			const callbacks = this.composer.getSavingCallbacks({
				ifNotEnoughFunds: (err) => this.sendToParent(new MessageAssetCreated({ error: err })),
				ifError: (err) => this.sendToParent(new MessageAssetCreated({ error: err })),
				ifOk: (objJoint) => {
					this.network.broadcastJoint(objJoint)
					this.sendToParent(new MessageAssetCreated({ unit: objJoint.unit.unit, error: null }))
				},
			})

			this.composeContentJoint(myAddress, 'asset', assetDefinition, this.headlessWallet.signer, callbacks)
		} catch (error) {
			this.sendToParent(new MessageAssetCreated({ error: error.message }))
		}
	}

	composeContentJoint (fromAddress, app, payload, signer, callbacks) {
		const objectHash = require('ocore/object_hash')

		const objMessage = {
			app: app,
			payload_location: 'inline',
			payload_hash: objectHash.getBase64Hash(payload),
			payload: payload,
		}
		this.composer.composeJoint({
			paying_addresses: [fromAddress],
			outputs: [{ address: fromAddress, amount: 0 }],
			messages: [objMessage],
			signer: signer,
			callbacks: callbacks,
		})
	}

	signMessage ({ message }) {
		this.headlessWallet.readFirstAddress(myAddress => {
			this.headlessWallet.signMessage(myAddress, message, (error, signedPackage) => {
				if (error) { this.sendToParent(new MessageSignedPackage({ error })) } else { this.sendToParent(new MessageSignedPackage({ signedPackage })) }
			})
		})
	}

	async signUnit ({ unit }) {
		try {
			for (const author of unit.authors) {
				for (const path in author.authentifiers) {
					const sig = await this.headlessWallet.signer.sign(unit, {}, author.address, path)
					author.authentifiers[path] = sig
				}
			}
			this.sendToParent(new MessageUnitSigned({ unit }))
		} catch (error) {
			this.sendToParent(new MessageUnitSigned({ error }))
		}
	}
}

module.exports = HeadlessWalletChild
