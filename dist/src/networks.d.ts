export type NetworkConfig = {
    pubKeyHashAddrId: number;
    ScriptHashAddrID: number;
    PrivateKeyID: number;
};
export type Networks = {
    mainnet: NetworkConfig;
    testnet: NetworkConfig;
    privnet: NetworkConfig;
    mixnet: NetworkConfig;
};
declare const networks: Networks;
export { networks };
