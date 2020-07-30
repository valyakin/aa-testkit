const fs = require('fs')
const Joi = require('joi')
const path = require('path')
const { promisify } = require('util')
const { isString, isArray } = require('lodash')
const parseOjson = require('ocore/formula/parse_ojson').parse
const config = require('config')['aa-testkit']
const AbstractNode = require('../AbstractNode/AbstractNode')
const {
	CommandTriggerAa,
	CommandSendBytes,
	CommandSendMulti,
	CommandGetAddress,
	CommandGetBalance,
	CommandDeployAgent,
	CommandCreateAsset,
	CommandSignMessage,
	CommandGetMyAddresses,
} = require('../../messages')

const schemaFactory = () => ({
	id: Joi.string().required(),
	rundir: Joi.string().required(),
	genesisUnit: Joi.string().required(),
	passphrase: Joi.string().default('0000'),
	hub: Joi.string().default(`localhost:${config.NETWORK_PORT}`),
	isSingleAddress: Joi.string().default(config.WALLETS_ARE_SINGLE_ADDRESS),
	initialWitnesses: Joi.array().items(Joi.string()).min(1),
	mnemonic: Joi.string().default(null),
})

class HeadlessWallet extends AbstractNode {
	constructor (params = {}) {
		super(params, schemaFactory)
		this.runChild(__dirname,
			this.mnemonic
				? {
					mnemonic: this.mnemonic,
					passphrase: this.passphrase,
				}
				: {},
		)

		this
			.on('password_required', () => this.sendPassword())
	}

	packArgv () {
		return [
			this.id,
			this.hub,
			this.genesisUnit,
			this.isSingleAddress,
			this.initialWitnesses.length,
			...this.initialWitnesses,
		]
	}

	sendPassword () {
		this.child.stdin.write(this.passphrase + '\n')
	}

	async getAddress () {
		this.sendToChild(new CommandGetAddress())
		return new Promise((resolve) => {
			this.once('my_address', m => resolve(m.address))
		})
	}

	async getOwnedAddresses () {
		this.sendToChild(new CommandGetMyAddresses())
		return new Promise((resolve) => {
			this.once('my_addresses', m => resolve(m.addresses))
		})
	}

	async sendMulti (opts) {
		return new Promise(resolve => {
			this.once('sent_multi', (m) => resolve({ unit: m.unit, error: m.error }))
			this.sendToChild(new CommandSendMulti({ opts }))
		})
	}

	async triggerAaWithData ({ toAddress, amount, data }) {
		return new Promise(resolve => {
			this.once('aa_triggered', (m) => resolve({ unit: m.unit, error: m.error }))
			this.sendToChild(new CommandTriggerAa({ toAddress, amount, data }))
		})
	}

	async sendBytes ({ toAddress, amount }) {
		return new Promise(resolve => {
			this.once('sent_bytes', (m) => resolve({ unit: m.unit, error: m.error }))
			this.sendToChild(new CommandSendBytes({ toAddress, amount }))
		})
	}

	getBalance () {
		return new Promise((resolve) => {
			this.once('my_balance', m => resolve(m.balance))
			this.sendToChild(new CommandGetBalance())
		})
	}

	getAgentFromPath (agentPath) {
		if (path.extname(agentPath) === '.js') {
			return require(agentPath)
		} else {
			return fs.readFileSync(agentPath, 'utf8')
		}
	}

	async deployAgent (source) {
		try {
			const agent = isString(source) && fs.existsSync(source)
				? this.getAgentFromPath(source)
				: source

			const ojson = isString(agent)
				? await promisify(parseOjson)(agent)
				: agent

			const agentMessage = new CommandDeployAgent({
				ojson: isArray(ojson)
					? ojson
					: ['autonomous agent', ojson],
			})

			return new Promise((resolve) => {
				this.once('agent_deployed', m => resolve({ address: m.address, unit: m.unit, error: m.error }))
				this.sendToChild(agentMessage)
			})
		} catch (error) {
			return { error: error.message || error }
		}
	}

	async createAsset (assetDefinition) {
		if (typeof assetDefinition !== 'object') {
			return { error: 'asset definition should be an object' }
		}

		try {
			return new Promise((resolve) => {
				this.once('asset_created', m => resolve({ unit: m.unit, error: m.error }))
				this.sendToChild(new CommandCreateAsset({ assetDefinition }))
			})
		} catch (error) {
			return { error: error.message || error }
		}
	}

	async signMessage (message) {
		try {
			return new Promise((resolve) => {
				this.once('signed_package', m => resolve({ signedPackage: m.signedPackage, error: m.error }))
				this.sendToChild(new CommandSignMessage({ message }))
			})
		} catch (error) {
			return { error: error.message || error }
		}
	}
}

module.exports = HeadlessWallet
