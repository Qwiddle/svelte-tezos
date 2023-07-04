# svelte-tezos

`svelte-tezos` is a svelte store with multiple helper functions to ease the connection between svelte and the tezos `@taquito/taquito` library.

available functions:
1. `createStore({ rpcUrl, networkType, dappName})` - initialized TezosToolkit & BeaconWallet and the svelte store
2. `connect()` - requests and waits for a connection through beacon
3. `disconnect()` - clears any active account through beacon

accessible via store:

1. `userAddress` - address of the currently active account
2. `connected` - boolean indicating if wallet is paired or not
3. `blockHead` - current block height, hash, and timestamp
4. `network` - current network (mainnet, ghostnet, etc)
5. `rpc` - currently connected RPC

## examples

coming soon

## usage

coming soon
