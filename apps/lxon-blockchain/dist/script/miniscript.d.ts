export declare enum MiniscriptNodeType {
    PREFIX = "PREFIX",
    SUFFIX = "SUFFIX",
    WRAPPED = "WRAPPED",
    INFIX = "INFIX",
    BINARY = "BINARY",
    LITERAL = "LITERAL"
}
export interface MiniscriptNode {
    type: MiniscriptNodeType;
    value?: string;
    left?: MiniscriptNode;
    right?: MiniscriptNode;
    wrapper?: string;
}
export interface MiniscriptPolicy {
    node: MiniscriptNode;
    script: Buffer;
}
export declare class MiniscriptCompiler {
    static parse(policy: string): MiniscriptNode;
    static compile(node: MiniscriptNode): MiniscriptPolicy;
    static policyToScript(policy: string): Buffer;
}
