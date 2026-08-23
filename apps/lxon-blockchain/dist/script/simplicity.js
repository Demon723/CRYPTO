"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplicityInterpreter = exports.SimplicityJet = exports.SimplicityCombinator = void 0;
exports.parseSimplicity = parseSimplicity;
var SimplicityCombinator;
(function (SimplicityCombinator) {
    SimplicityCombinator["ID"] = "id";
    SimplicityCombinator["COMP"] = "comp";
    SimplicityCombinator["CASE"] = "case";
    SimplicityCombinator["PAIR"] = "pair";
    SimplicityCombinator["FST"] = "fst";
    SimplicityCombinator["SND"] = "snd";
    SimplicityCombinator["INJL"] = "injl";
    SimplicityCombinator["INJR"] = "injr";
    SimplicityCombinator["TAKE"] = "take";
    SimplicityCombinator["DROP"] = "drop";
    SimplicityCombinator["ENCODE"] = "encode";
    SimplicityCombinator["DECODE"] = "decode";
})(SimplicityCombinator || (exports.SimplicityCombinator = SimplicityCombinator = {}));
var SimplicityJet;
(function (SimplicityJet) {
    SimplicityJet["SHA256"] = "sha256";
    SimplicityJet["SHA256_TWO"] = "sha256_two";
    SimplicityJet["VERIFY"] = "verify";
})(SimplicityJet || (exports.SimplicityJet = SimplicityJet = {}));
class SimplicityInterpreter {
    env;
    constructor(env) {
        this.env = env;
    }
    evaluate(node, input) {
        switch (node.combinator) {
            case SimplicityCombinator.ID:
                return input;
            case SimplicityCombinator.COMP:
                if (!node.left || !node.right)
                    throw new Error('Comp requires left and right');
                const rightResult = this.evaluate(node.right, input);
                return this.evaluate(node.left, rightResult);
            case SimplicityCombinator.CASE:
                if (!node.left || !node.right)
                    throw new Error('Case requires left and right');
                if (input[0] === 0) {
                    const leftInput = input.subarray(1);
                    return this.evaluate(node.left, leftInput);
                }
                else {
                    const rightInput = input.subarray(1);
                    return this.evaluate(node.right, rightInput);
                }
            case SimplicityCombinator.PAIR:
                return Buffer.concat([Buffer.from([0]), input]);
            case SimplicityCombinator.FST:
                return input.subarray(1, input.length - 1);
            case SimplicityCombinator.SND:
                return input.subarray(input.length - 32);
            case SimplicityCombinator.INJL:
                return Buffer.concat([Buffer.from([1]), input]);
            case SimplicityCombinator.INJR:
                return Buffer.concat([Buffer.from([1]), input]);
            case SimplicityCombinator.TAKE:
                return input.subarray(0, input.length / 2);
            case SimplicityCombinator.DROP:
                return input.subarray(input.length / 2);
            case SimplicityCombinator.ENCODE:
                return Buffer.concat([Buffer.from([0]), input]);
            case SimplicityCombinator.DECODE:
                return input.subarray(1);
            default:
                if (node.combinator in SimplicityJet) {
                    const jet = node.combinator;
                    const jetFn = this.env.jets.get(jet);
                    if (jetFn)
                        return jetFn(input);
                }
                throw new Error(`Unknown combinator: ${node.combinator}`);
        }
    }
    static defaultEnv() {
        const jets = new Map();
        jets.set(SimplicityJet.SHA256, (data) => {
            const crypto = require('crypto');
            return Buffer.from(crypto.createHash('sha256').update(data).digest());
        });
        jets.set(SimplicityJet.SHA256_TWO, (data) => {
            const crypto = require('crypto');
            const once = crypto.createHash('sha256').update(data).digest();
            return Buffer.from(crypto.createHash('sha256').update(once).digest());
        });
        jets.set(SimplicityJet.VERIFY, (data) => {
            return data.length === 64 ? Buffer.from([1]) : Buffer.from([0]);
        });
        return { jets, sources: new Map() };
    }
}
exports.SimplicityInterpreter = SimplicityInterpreter;
function parseSimplicity(source) {
    const tokens = tokenizeSimplicity(source);
    const pos = { value: 0 };
    return parseSimplicityExpr(tokens, pos).node;
}
function tokenizeSimplicity(source) {
    const tokens = [];
    let current = '';
    for (const ch of source) {
        if (ch === '(' || ch === ')' || ch === ' ') {
            if (current.trim())
                tokens.push(current.trim());
            if (ch !== ' ')
                tokens.push(ch);
            current = '';
        }
        else {
            current += ch;
        }
    }
    if (current.trim())
        tokens.push(current.trim());
    return tokens;
}
function parseSimplicityExpr(tokens, pos) {
    if (pos.value >= tokens.length) {
        return { node: { combinator: SimplicityCombinator.ID }, nextPos: pos.value };
    }
    const token = tokens[pos.value];
    if (token === '(') {
        pos.value++;
        const combinator = tokens[pos.value++];
        const left = parseSimplicityExpr(tokens, pos);
        pos.value = left.nextPos;
        const right = parseSimplicityExpr(tokens, pos);
        pos.value = right.nextPos;
        if (tokens[pos.value] === ')')
            pos.value++;
        return {
            node: { combinator, left: left.node, right: right.node },
            nextPos: pos.value,
        };
    }
    pos.value++;
    return {
        node: { combinator: SimplicityCombinator.ID, name: token },
        nextPos: pos.value,
    };
}
