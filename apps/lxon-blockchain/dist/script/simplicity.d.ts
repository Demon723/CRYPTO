export declare enum SimplicityCombinator {
    ID = "id",
    COMP = "comp",
    CASE = "case",
    PAIR = "pair",
    FST = "fst",
    SND = "snd",
    INJL = "injl",
    INJR = "injr",
    TAKE = "take",
    DROP = "drop",
    ENCODE = "encode",
    DECODE = "decode"
}
export declare enum SimplicityJet {
    SHA256 = "sha256",
    SHA256_TWO = "sha256_two",
    VERIFY = "verify"
}
export interface SimplicityEnv {
    jets: Map<SimplicityJet, (data: Buffer) => Buffer>;
    sources: Map<string, Buffer>;
}
export interface SimplicityNode {
    combinator: SimplicityCombinator | SimplicityJet;
    left?: SimplicityNode;
    right?: SimplicityNode;
    name?: string;
}
export declare class SimplicityInterpreter {
    private env;
    constructor(env: SimplicityEnv);
    evaluate(node: SimplicityNode, input: Buffer): Buffer;
    static defaultEnv(): SimplicityEnv;
}
export declare function parseSimplicity(source: string): SimplicityNode;
