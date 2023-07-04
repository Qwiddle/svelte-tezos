import { writable, type Writable } from 'svelte/store';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import type { NetworkType } from '@airgap/beacon-sdk';
import { BeaconEvent } from '@airgap/beacon-sdk';

export type BlockHead = { 
	protocol: string; 
	level: number; 
	lastUpdate: string 
};

export let beacon: BeaconWallet;
export let Tezos: TezosToolkit;

export const connected: Writable<boolean> = writable(false);
export const loading: Writable<boolean> = writable(true);
export const network: Writable<string | null> = writable(null);
export const rpc: Writable<string | null> = writable(null);
export const userAddress: Writable<string | null> = writable(null);
export const blockHead: Writable<BlockHead | null> = writable(null);

export const createStore = async ({ rpcUrl, networkType, dappName}: {
	rpcUrl: string,
	networkType: NetworkType,
	dappName: string,
}) => {
	try {
		Tezos = new TezosToolkit(rpcUrl);
		beacon = new BeaconWallet({
			name: dappName,
			preferredNetwork: networkType,
		});

		Tezos.setWalletProvider(beacon);

		const activeAccount = await getActiveAccount();
		if (activeAccount) {
			setUserAddress(activeAccount.address);
		}

		network.set(networkType);
		rpc.set(rpcUrl);
	} catch (e) {
		console.error('[svelte-tezos] error creating store', e);
	}
}

export const connect = async () => {
	try {
		const activeAccount = await getActiveAccount();
		if (!activeAccount) {
			await watchAccountPermissionRequest();
		} else {
			setUserAddress(activeAccount.address)
		}

		connected.set(true);
		loading.set(false);
	} catch (e) {
		console.error('[svelte-tezos] permission denied', e);
	}
}

export const disconnect = async () => {
	try {
		await beacon.client.clearActiveAccount();
		setUserAddress('');
		connected.set(false);
	} catch (e) {
		console.error('[svelte-tezos] permission denied', e);
	}
}

export const watchAccountPermissionRequest = async () => {
	try {
		beacon.client.subscribeToEvent(
			BeaconEvent.PERMISSION_REQUEST_SUCCESS, 
			({ account: { address }}) => setUserAddress(address)
		);
		await beacon.requestPermissions();
	} catch (e) {
		console.error('[svelte-tezos] error watching account permission request', e);
	}
}

export const getActiveAccount = async () => {
	try {
		return await beacon.client.getActiveAccount();
	} catch (e) {
		console.error('[svelte-tezos] error getting active account', e);
	}
}

export const subscribeToHead = () => {
	try {
		const sub = Tezos.stream.subscribeBlock('head');
		sub.on('data', (event) => {
			blockHead.set({
				protocol: event.protocol,
				level: event.header.level,
				lastUpdate: event.header.timestamp.toString(),
			});
		});
	} catch (e) {
		console.error('[svelte-tezos] error subscribing to events', e);
	}
}

export const setUserAddress = (address: string) => userAddress.set(address);