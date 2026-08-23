export declare const ASTRO_PHASES: {
    readonly HYBRID_END: number;
    readonly TRANSITION_END: number;
    readonly ARCV2_START: number;
};
export declare const HASH_ALGORITHM_LADDER: readonly [{
    readonly era: "2026-2040";
    readonly algorithm: "SHA3-256";
    readonly id: 1;
    readonly security: 128;
}, {
    readonly era: "2040-2060";
    readonly algorithm: "Blake3-256";
    readonly id: 2;
    readonly security: 128;
}, {
    readonly era: "2060-2080";
    readonly algorithm: "SHA3-512";
    readonly id: 3;
    readonly security: 256;
}, {
    readonly era: "2080-2100";
    readonly algorithm: "TBD";
    readonly id: 255;
    readonly security: 256;
}, {
    readonly era: "2100+";
    readonly algorithm: "TBD";
    readonly id: 255;
    readonly security: 512;
}];
export declare const SIGNATURE_ALGORITHM_LADDER: readonly [{
    readonly era: "2026-2040";
    readonly algorithm: "Hybrid ECDSA+NFS-512";
    readonly classicalId: 1;
    readonly arcId: 4;
    readonly pubSize: 930;
    readonly sigSize: 730;
}, {
    readonly era: "2040-2060";
    readonly algorithm: "Hybrid ECDSA+SLS-65";
    readonly classicalId: 1;
    readonly arcId: 3;
    readonly pubSize: 2000;
    readonly sigSize: 2400;
}, {
    readonly era: "2060-2080";
    readonly algorithm: "SLS-only";
    readonly classicalId: 0;
    readonly arcId: 3;
    readonly pubSize: 1952;
    readonly sigSize: 3293;
}, {
    readonly era: "2080-2100";
    readonly algorithm: "SLS-V";
    readonly classicalId: 0;
    readonly arcId: 2;
    readonly pubSize: 3500;
    readonly sigSize: 5000;
}, {
    readonly era: "2100+";
    readonly algorithm: "TBD";
    readonly classicalId: 0;
    readonly arcId: 255;
    readonly pubSize: 0;
    readonly sigSize: 0;
}];
export declare function getCurrentPhase(genesisTime: number, blockTime: number): number;
export declare function getCurrentHashAlgorithm(blockTime?: number): number;
export declare function getCurrentSignatureAlgorithm(blockTime?: number): {
    classicalId: number;
    arcId: number;
};
