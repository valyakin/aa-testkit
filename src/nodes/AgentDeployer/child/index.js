const Joi = require('joi')
const AbstractChild = require('../../AbstractNode/child/AbstractChild')
const {
	MessageMyAddress,
	MessageMyBalance,
	MessageChildReady,
	MessageAAStateVars,
	MessageAgentDeployed,
	MessagePasswordRequired,
} = require('../../../messages')

const paramsSchema = () => ({
	id: Joi.string().required(),
	hub: Joi.string().required(),
	genesisUnit: Joi.string().required(),
})

class AgentDeployerChild extends AbstractChild {
	constructor (argv) {
		const params = AgentDeployerChild.unpackArgv(argv)
		super(params, paramsSchema)

		this
			.on('command_get_address', () => this.getAddress())
			.on('command_get_balance', (m) => this.getBalance(m))
			.on('command_deploy_agent', (m) => this.deployAgent(m))
			.on('command_read_aa_state_vars', (m) => this.readAAStateVars(m))
	}

	static unpackArgv (argv) {
		const [,,
			id,
			hub,
			genesisUnit,
		] = argv

		return {
			id,
			hub,
			genesisUnit,
		}
	}

	start () {
		super.start()

		this.constants = require('ocore/constants.js')
		this.constants.GENESIS_UNIT = this.genesisUnit

		this.conf = require('ocore/conf.js')
		this.conf.hub = this.hub

		this.headlessWallet = require('headless-obyte')
		this.eventBus = require('ocore/event_bus.js')
		this.composer = require('ocore/composer.js')
		this.network = require('ocore/network.js')
		this.storage = require('ocore/storage.js')

		this.sendParent(new MessagePasswordRequired())
		this.eventBus.once('headless_wallet_ready', () => {
			setTimeout(() => this.sendParent(new MessageChildReady()), 1000)
		})
	}

	async deployAgent ({ agent }) {
		const objectHash = require('ocore/object_hash')
		const aaAddress = objectHash.getChash160(agent)

		const myAddress = await new Promise((resolve, reject) => {
			this.headlessWallet.readFirstAddress(address => resolve(address))
		})

		const payload = {
			address: aaAddress,
			definition: agent,
		}

		const callbacks = this.composer.getSavingCallbacks({
			ifNotEnoughFunds: (err) => this.sendParent(new MessageAgentDeployed({ error: err })),
			ifError: (err) => this.sendParent(new MessageAgentDeployed({ error: err })),
			ifOk: (objJoint) => {
				this.network.broadcastJoint(objJoint)
				this.sendParent(new MessageAgentDeployed({ unit: objJoint.unit.unit, address: aaAddress }))
			},
		})

		this.composeContentJoint(myAddress, 'definition', payload, this.headlessWallet.signer, callbacks)
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

	async readAAStateVars ({ address }) {
		const vars = await this.getAAStateVarsFromStorage(address)
		this.sendParent(new MessageAAStateVars({ vars }))
	}

	getAAStateVarsFromStorage (address) {
		return new Promise(resolve => {
			this.storage.readAAStateVars(address, (vars) => {
				resolve(vars)
			})
		})
	}

	getAddress () {
		this.headlessWallet.readFirstAddress(address => {
			this.sendParent(new MessageMyAddress({ address }))
		})
	}

	getBalance () {
		this.headlessWallet.readSingleWallet(walletId => {
			const wallet = require('ocore/wallet')
			wallet.readBalance(walletId, (assocBalances) => {
				this.sendParent(new MessageMyBalance({ balance: assocBalances }))
			})
		})
	}
}

const child = new AgentDeployerChild(process.argv)
child.start()
