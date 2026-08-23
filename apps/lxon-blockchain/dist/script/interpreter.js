"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScriptInterpreter = void 0;
exports.evaluateScript = evaluateScript;
const hash_1 = require("../crypto/hash");
const secp256k1_1 = require("@noble/curves/secp256k1");
const opcodes_1 = require("./opcodes");
class ScriptInterpreter {
    stack = [];
    altStack = [];
    pc = 0;
    script;
    context;
    conditionalDepth = 0;
    opcount = 0;
    maxOps = 201;
    maxScriptLength = 10000;
    maxStackSize = 1000;
    maxAltStackSize = 1000;
    constructor(script, context) {
        this.script = Buffer.from(script);
        this.context = context;
    }
    setStack(stack) {
        this.stack = stack;
    }
    execute() {
        if (this.script.length > this.maxScriptLength) {
            return { success: false, error: 'Script too long', stack: this.stack, altStack: this.altStack };
        }
        while (this.pc < this.script.length) {
            const opcode = this.script[this.pc++];
            this.opcount++;
            if (this.opcount > this.maxOps) {
                return { success: false, error: 'Op count exceeded', stack: this.getStack(), altStack: this.getAltStack() };
            }
            if (opcode >= opcodes_1.OpCode.OP_DATA_1 && opcode <= opcodes_1.OpCode.OP_DATA_75) {
                this.pushData(opcode);
            }
            else if (opcode === opcodes_1.OpCode.OP_PUSHDATA1) {
                this.pushData1();
            }
            else if (opcode === opcodes_1.OpCode.OP_PUSHDATA2) {
                this.pushData2();
            }
            else if (opcode === opcodes_1.OpCode.OP_PUSHDATA4) {
                this.pushData4();
            }
            else if (opcode === opcodes_1.OpCode.OP_0) {
                this.stack.push(Buffer.from([]));
            }
            else if (opcode >= opcodes_1.OpCode.OP_1 && opcode <= opcodes_1.OpCode.OP_16) {
                this.stack.push(Buffer.from([opcode - opcodes_1.OpCode.OP_1 + 1]));
            }
            else if (opcode === opcodes_1.OpCode.OP_1NEGATE) {
                this.stack.push(Buffer.from([0x81]));
            }
            else {
                const result = this.executeOp(opcode);
                if (!result.success) {
                    return result;
                }
            }
            if (this.stack.length > this.maxStackSize || this.altStack.length > this.maxAltStackSize) {
                return { success: false, error: 'Stack size limit exceeded', stack: this.getStack(), altStack: this.getAltStack() };
            }
        }
        if (this.conditionalDepth !== 0) {
            return { success: false, error: 'Unbalanced conditional', stack: this.getStack(), altStack: this.getAltStack() };
        }
        return { success: true, stack: this.getStack(), altStack: this.getAltStack() };
    }
    getStack() {
        return this.stack.map(item => Buffer.from(item));
    }
    getAltStack() {
        return this.altStack.map(item => Buffer.from(item));
    }
    pushData(length) {
        if (this.pc + length > this.script.length) {
            throw new Error('Script truncated');
        }
        this.stack.push(Buffer.from(this.script.subarray(this.pc, this.pc + length)));
        this.pc += length;
    }
    pushData1() {
        const length = this.script[this.pc++];
        this.pushData(length);
    }
    pushData2() {
        const length = this.script.readUInt16LE(this.pc);
        this.pc += 2;
        this.pushData(length);
    }
    pushData4() {
        const length = Number(this.script.readUInt32LE(this.pc));
        this.pc += 4;
        this.pushData(length);
    }
    executeOp(opcode) {
        switch (opcode) {
            case opcodes_1.OpCode.OP_DUP:
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                this.stack.push(Buffer.from(this.stack[this.stack.length - 1]));
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_DROP:
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                this.stack.pop();
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_SWAP:
                if (this.stack.length < 2)
                    return this.fail('Stack underflow');
                const a = this.stack[this.stack.length - 1];
                const b = this.stack[this.stack.length - 2];
                this.stack[this.stack.length - 1] = b;
                this.stack[this.stack.length - 2] = a;
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_TUCK:
                if (this.stack.length < 2)
                    return this.fail('Stack underflow');
                const top = this.stack[this.stack.length - 1];
                this.stack.splice(this.stack.length - 1, 0, top);
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_OVER:
                if (this.stack.length < 2)
                    return this.fail('Stack underflow');
                this.stack.push(Buffer.from(this.stack[this.stack.length - 2]));
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_ROT:
                if (this.stack.length < 3)
                    return this.fail('Stack underflow');
                const rot1 = this.stack[this.stack.length - 1];
                const rot2 = this.stack[this.stack.length - 2];
                const rot3 = this.stack[this.stack.length - 3];
                this.stack[this.stack.length - 1] = rot2;
                this.stack[this.stack.length - 2] = rot3;
                this.stack[this.stack.length - 3] = rot1;
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_2DROP:
                if (this.stack.length < 2)
                    return this.fail('Stack underflow');
                this.stack.pop();
                this.stack.pop();
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_2DUP:
                if (this.stack.length < 2)
                    return this.fail('Stack underflow');
                const d1 = this.stack[this.stack.length - 2];
                const d2 = this.stack[this.stack.length - 1];
                this.stack.push(Buffer.from(d1));
                this.stack.push(Buffer.from(d2));
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_3DUP:
                if (this.stack.length < 3)
                    return this.fail('Stack underflow');
                const t1 = this.stack[this.stack.length - 3];
                const t2 = this.stack[this.stack.length - 2];
                const t3 = this.stack[this.stack.length - 1];
                this.stack.push(Buffer.from(t1));
                this.stack.push(Buffer.from(t2));
                this.stack.push(Buffer.from(t3));
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_2OVER:
                if (this.stack.length < 4)
                    return this.fail('Stack underflow');
                this.stack.push(Buffer.from(this.stack[this.stack.length - 4]));
                this.stack.push(Buffer.from(this.stack[this.stack.length - 4]));
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_2ROT:
                if (this.stack.length < 6)
                    return this.fail('Stack underflow');
                const r1 = this.stack[this.stack.length - 1];
                const r2 = this.stack[this.stack.length - 2];
                const r3 = this.stack[this.stack.length - 3];
                const r4 = this.stack[this.stack.length - 4];
                const r5 = this.stack[this.stack.length - 5];
                const r6 = this.stack[this.stack.length - 6];
                this.stack.splice(this.stack.length - 6, 6, r3, r4, r5, r6, r1, r2);
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_2SWAP:
                if (this.stack.length < 4)
                    return this.fail('Stack underflow');
                const s1 = this.stack[this.stack.length - 1];
                const s2 = this.stack[this.stack.length - 2];
                const s3 = this.stack[this.stack.length - 3];
                const s4 = this.stack[this.stack.length - 4];
                this.stack[this.stack.length - 1] = s3;
                this.stack[this.stack.length - 2] = s4;
                this.stack[this.stack.length - 3] = s1;
                this.stack[this.stack.length - 4] = s2;
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_IF:
            case opcodes_1.OpCode.OP_NOTIF: {
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                const cond = this.isTruthy(this.stack.pop());
                const required = opcode === opcodes_1.OpCode.OP_NOTIF ? !cond : cond;
                const result = this.skipUnless(required);
                if (!result.success)
                    return result;
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_ELSE: {
                const result = this.skipUnless(this.conditionalDepth > 0);
                if (!result.success)
                    return result;
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_ENDIF:
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_VERIFY: {
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                if (!this.isTruthy(this.stack.pop()))
                    return this.fail('Verify failed');
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_RETURN:
                return this.fail('OP_RETURN');
            case opcodes_1.OpCode.OP_TOALTSTACK:
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                this.altStack.push(this.stack.pop());
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_FROMALTSTACK:
                if (this.altStack.length < 1)
                    return this.fail('Alt stack underflow');
                this.stack.push(this.altStack.pop());
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_IFDUP:
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                if (this.isTruthy(this.stack[this.stack.length - 1])) {
                    this.stack.push(Buffer.from(this.stack[this.stack.length - 1]));
                }
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_DEPTH:
                const depth = Buffer.from([this.stack.length]);
                this.stack.push(depth);
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_NIP:
                if (this.stack.length < 2)
                    return this.fail('Stack underflow');
                this.stack.splice(this.stack.length - 2, 1);
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_PICK:
            case opcodes_1.OpCode.OP_ROLL: {
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                const n = this.decodeNumber(this.stack.pop());
                if (n < 0 || n >= this.stack.length)
                    return this.fail('Invalid pick/roll index');
                const item = Buffer.from(this.stack[this.stack.length - 1 - n]);
                if (opcode === opcodes_1.OpCode.OP_ROLL) {
                    this.stack.splice(this.stack.length - 1 - n, 1);
                }
                this.stack.push(item);
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_VERIF:
            case opcodes_1.OpCode.OP_VERNOTIF:
                return this.fail('Opcode reserved for future use');
            case opcodes_1.OpCode.OP_CAT:
            case opcodes_1.OpCode.OP_SPLIT:
            case opcodes_1.OpCode.OP_NUM2BIN:
            case opcodes_1.OpCode.OP_BIN2NUM:
                return this.fail('Opcode disabled');
            case opcodes_1.OpCode.OP_SIZE: {
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                const size = Buffer.from([this.stack[this.stack.length - 1].length]);
                this.stack.push(size);
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_ADD: {
                if (this.stack.length < 2)
                    return this.fail('Stack underflow');
                const b = this.decodeNumber(this.stack.pop());
                const a = this.decodeNumber(this.stack.pop());
                this.stack.push(this.encodeNumber(a + b));
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_SUB: {
                if (this.stack.length < 2)
                    return this.fail('Stack underflow');
                const b = this.decodeNumber(this.stack.pop());
                const a = this.decodeNumber(this.stack.pop());
                this.stack.push(this.encodeNumber(a - b));
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_NEGATE: {
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                const a = this.decodeNumber(this.stack.pop());
                this.stack.push(this.encodeNumber(-a));
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_ABS: {
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                const a = this.decodeNumber(this.stack.pop());
                this.stack.push(this.encodeNumber(a < 0 ? -a : a));
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_NOT: {
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                const a = this.decodeNumber(this.stack.pop());
                this.stack.push(Buffer.from([a === 0 ? 1 : 0]));
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_0NOTEQUAL: {
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                const a = this.decodeNumber(this.stack.pop());
                this.stack.push(Buffer.from([a !== 0 ? 1 : 0]));
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_BOOLAND: {
                if (this.stack.length < 2)
                    return this.fail('Stack underflow');
                const b = this.isTruthy(this.stack.pop());
                const a = this.isTruthy(this.stack.pop());
                this.stack.push(Buffer.from([a && b ? 1 : 0]));
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_BOOLOR: {
                if (this.stack.length < 2)
                    return this.fail('Stack underflow');
                const b = this.isTruthy(this.stack.pop());
                const a = this.isTruthy(this.stack.pop());
                this.stack.push(Buffer.from([a || b ? 1 : 0]));
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_EQUAL: {
                if (this.stack.length < 2)
                    return this.fail('Stack underflow');
                const b = this.stack.pop();
                const a = this.stack.pop();
                this.stack.push(Buffer.from([a.equals(b) ? 1 : 0]));
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_EQUALVERIFY: {
                if (this.stack.length < 2)
                    return this.fail('Stack underflow');
                const b = this.stack.pop();
                const a = this.stack.pop();
                if (!a.equals(b))
                    return this.fail('EqualVerify failed');
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_1ADD: {
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                const a = this.decodeNumber(this.stack.pop());
                this.stack.push(this.encodeNumber(a + 1));
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_1SUB: {
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                const a = this.decodeNumber(this.stack.pop());
                this.stack.push(this.encodeNumber(a - 1));
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_HASH160: {
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                const data = this.stack.pop();
                this.stack.push(Buffer.from((0, hash_1.hash160)(data)));
                return { success: true, stack: this.getStack(), altStack: this.getAltStack() };
            }
            case opcodes_1.OpCode.OP_HASH256: {
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                const data = this.stack.pop();
                this.stack.push(Buffer.from((0, hash_1.sha256)((0, hash_1.sha256)(data))));
                return { success: true, stack: this.getStack(), altStack: this.getAltStack() };
            }
            case opcodes_1.OpCode.OP_CODESEPARATOR:
                return { success: true, stack: this.stack, altStack: this.altStack };
            case opcodes_1.OpCode.OP_CHECKSIG: {
                if (this.stack.length < 2)
                    return this.fail('Stack underflow');
                const pubkey = this.stack.pop();
                const sig = this.stack.pop();
                const valid = this.verifySignature(sig, pubkey);
                this.stack.push(Buffer.from([valid ? 1 : 0]));
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_CHECKSIGVERIFY: {
                if (this.stack.length < 2)
                    return this.fail('Stack underflow');
                const pubkey = this.stack.pop();
                const sig = this.stack.pop();
                if (!this.verifySignature(sig, pubkey))
                    return this.fail('Checksig verify failed');
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_CHECKMULTISIG: {
                const n = this.stack.pop();
                if (!n)
                    return this.fail('Stack underflow');
                const nKeys = this.decodeNumber(n);
                if (this.stack.length < nKeys + 1)
                    return this.fail('Stack underflow');
                const pubkeys = [];
                for (let i = 0; i < nKeys; i++) {
                    pubkeys.push(this.stack.pop());
                }
                const m = this.stack.pop();
                if (!m)
                    return this.fail('Stack underflow');
                const mSigs = this.decodeNumber(m);
                const sigs = [];
                for (let i = 0; i < mSigs; i++) {
                    const sig = this.stack.pop();
                    if (!sig)
                        return this.fail('Stack underflow');
                    sigs.push(sig);
                }
                let validCount = 0;
                let keyIndex = pubkeys.length - 1;
                for (let i = 0; i < sigs.length && keyIndex >= 0; i++) {
                    while (keyIndex >= 0) {
                        if (this.verifySignature(sigs[i], pubkeys[keyIndex])) {
                            validCount++;
                            keyIndex--;
                            break;
                        }
                        keyIndex--;
                    }
                }
                this.stack.push(Buffer.from([validCount >= mSigs ? 1 : 0]));
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_CHECKMULTISIGVERIFY: {
                const nm = this.stack.pop();
                if (!nm)
                    return this.fail('Stack underflow');
                const nKeys = this.decodeNumber(nm);
                if (this.stack.length < nKeys + 1)
                    return this.fail('Stack underflow');
                const pubkeys = [];
                for (let i = 0; i < nKeys; i++) {
                    pubkeys.push(this.stack.pop());
                }
                const mm = this.stack.pop();
                if (!mm)
                    return this.fail('Stack underflow');
                const mSigs = this.decodeNumber(mm);
                const sigs = [];
                for (let i = 0; i < mSigs; i++) {
                    const sig = this.stack.pop();
                    if (!sig)
                        return this.fail('Stack underflow');
                    sigs.push(sig);
                }
                let validCount = 0;
                let keyIndex = pubkeys.length - 1;
                for (let i = 0; i < sigs.length && keyIndex >= 0; i++) {
                    while (keyIndex >= 0) {
                        if (this.verifySignature(sigs[i], pubkeys[keyIndex])) {
                            validCount++;
                            keyIndex--;
                            break;
                        }
                        keyIndex--;
                    }
                }
                if (validCount < mSigs)
                    return this.fail('Checkmultisig verify failed');
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_CHECKLOCKTIMEVERIFY: {
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                const locktime = this.decodeNumber(this.stack[this.stack.length - 1]);
                if (this.context.lockTime < locktime)
                    return this.fail('Locktime not satisfied');
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_CHECKSEQUENCEVERIFY: {
                if (this.stack.length < 1)
                    return this.fail('Stack underflow');
                const sequence = this.decodeNumber(this.stack[this.stack.length - 1]);
                if (this.context.inputSequence < sequence)
                    return this.fail('Sequence not satisfied');
                return { success: true, stack: this.stack, altStack: this.altStack };
            }
            case opcodes_1.OpCode.OP_NOP1:
            case opcodes_1.OpCode.OP_CHECKLOCKTIMEVERIFY:
            case opcodes_1.OpCode.OP_CHECKSEQUENCEVERIFY:
            case opcodes_1.OpCode.OP_NOP4:
            case opcodes_1.OpCode.OP_NOP5:
            case opcodes_1.OpCode.OP_NOP6:
            case opcodes_1.OpCode.OP_NOP7:
            case opcodes_1.OpCode.OP_NOP8:
            case opcodes_1.OpCode.OP_NOP9:
            case opcodes_1.OpCode.OP_NOP10:
                return { success: true, stack: this.stack, altStack: this.altStack };
            default:
                return this.fail(`Unknown opcode: 0x${opcode.toString(16)}`);
        }
    }
    skipUnless(condition) {
        let depth = 0;
        while (this.pc < this.script.length) {
            const opcode = this.script[this.pc++];
            if (opcode === opcodes_1.OpCode.OP_IF || opcode === opcodes_1.OpCode.OP_NOTIF) {
                depth++;
            }
            else if (opcode === opcodes_1.OpCode.OP_ELSE) {
                if (depth === 0) {
                    this.pc--;
                    return { success: true, stack: this.stack, altStack: this.altStack };
                }
            }
            else if (opcode === opcodes_1.OpCode.OP_ENDIF) {
                if (depth === 0) {
                    return { success: true, stack: this.stack, altStack: this.altStack };
                }
                depth--;
            }
            this.skipOp(opcode);
        }
        if (depth !== 0) {
            return this.fail('Unbalanced conditional');
        }
        return { success: true, stack: this.stack, altStack: this.altStack };
    }
    skipOp(opcode) {
        if (opcode >= opcodes_1.OpCode.OP_DATA_1 && opcode <= opcodes_1.OpCode.OP_DATA_75) {
            this.pc += opcode;
        }
        else if (opcode === opcodes_1.OpCode.OP_PUSHDATA1) {
            this.pc += 1 + this.script[this.pc];
        }
        else if (opcode === opcodes_1.OpCode.OP_PUSHDATA2) {
            this.pc += 2 + this.script.readUInt16LE(this.pc);
        }
        else if (opcode === opcodes_1.OpCode.OP_PUSHDATA4) {
            this.pc += 4 + Number(this.script.readUInt32LE(this.pc));
        }
    }
    isTruthy(data) {
        for (let i = 0; i < data.length; i++) {
            if (data[i] !== 0) {
                return true;
            }
        }
        return false;
    }
    decodeNumber(data) {
        if (data.length === 0)
            return 0;
        let result = 0;
        const negate = (data[data.length - 1] & 0x80) !== 0;
        for (let i = 0; i < data.length; i++) {
            result |= data[i] << (8 * i);
        }
        if (negate) {
            result -= Math.pow(2, 8 * data.length);
        }
        return result;
    }
    encodeNumber(value) {
        if (value === 0)
            return Buffer.from([]);
        const abs = Math.abs(value);
        const size = Math.ceil(Math.log2(abs + 1) / 8) || 1;
        const buf = Buffer.alloc(size);
        let remaining = value;
        for (let i = 0; i < size; i++) {
            buf[i] = remaining & 0xff;
            remaining >>= 8;
        }
        if (value < 0) {
            buf[buf.length - 1] |= 0x80;
        }
        return buf;
    }
    verifySignature(sig, pubkey) {
        try {
            return secp256k1_1.secp256k1.verify(sig.subarray(0, 64), this.context.txDigest, pubkey);
        }
        catch {
            return false;
        }
    }
    fail(reason) {
        return { success: false, error: reason, stack: this.stack, altStack: this.altStack };
    }
}
exports.ScriptInterpreter = ScriptInterpreter;
function evaluateScript(scriptPubKey, scriptSig, context) {
    try {
        const sigInterpreter = new ScriptInterpreter(Buffer.from(scriptSig), context);
        const sigResult = sigInterpreter.execute();
        if (!sigResult.success)
            return sigResult;
        const stack = sigResult.stack.map(item => Buffer.from(item));
        const pkInterpreter = new ScriptInterpreter(Buffer.from(scriptPubKey), context);
        pkInterpreter.setStack(stack);
        const pkResult = pkInterpreter.execute();
        return pkResult;
    }
    catch (err) {
        return { success: false, error: String(err), stack: [], altStack: [] };
    }
}
