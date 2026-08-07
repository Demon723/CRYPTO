export enum SimplicityCombinator {
  ID = 'id',
  COMP = 'comp',
  CASE = 'case',
  PAIR = 'pair',
  FST = 'fst',
  SND = 'snd',
  INJL = 'injl',
  INJR = 'injr',
  TAKE = 'take',
  DROP = 'drop',
  ENCODE = 'encode',
  DECODE = 'decode',
}

export enum SimplicityJet {
  SHA256 = 'sha256',
  SHA256_TWO = 'sha256_two',
  VERIFY = 'verify',
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

export class SimplicityInterpreter {
  private env: SimplicityEnv;

  constructor(env: SimplicityEnv) {
    this.env = env;
  }

  evaluate(node: SimplicityNode, input: Buffer): Buffer {
    switch (node.combinator) {
      case SimplicityCombinator.ID:
        return input;

      case SimplicityCombinator.COMP:
        if (!node.left || !node.right) throw new Error('Comp requires left and right');
        const rightResult = this.evaluate(node.right, input);
        return this.evaluate(node.left, rightResult);

      case SimplicityCombinator.CASE:
        if (!node.left || !node.right) throw new Error('Case requires left and right');
        if (input[0] === 0) {
          const leftInput = input.subarray(1);
          return this.evaluate(node.left, leftInput);
        } else {
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
          const jet = node.combinator as SimplicityJet;
          const jetFn = this.env.jets.get(jet);
          if (jetFn) return jetFn(input);
        }
        throw new Error(`Unknown combinator: ${node.combinator}`);
    }
  }

  static defaultEnv(): SimplicityEnv {
    const jets = new Map<SimplicityJet, (data: Buffer) => Buffer>();
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

export function parseSimplicity(source: string): SimplicityNode {
  const tokens = tokenizeSimplicity(source);
  const pos = { value: 0 };
  return parseSimplicityExpr(tokens, pos).node;
}

function tokenizeSimplicity(source: string): string[] {
  const tokens: string[] = [];
  let current = '';
  for (const ch of source) {
    if (ch === '(' || ch === ')' || ch === ' ') {
      if (current.trim()) tokens.push(current.trim());
      if (ch !== ' ') tokens.push(ch);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) tokens.push(current.trim());
  return tokens;
}

function parseSimplicityExpr(tokens: string[], pos: { value: number }): { node: SimplicityNode; nextPos: number } {
  if (pos.value >= tokens.length) {
    return { node: { combinator: SimplicityCombinator.ID }, nextPos: pos.value };
  }
  const token = tokens[pos.value];
  if (token === '(') {
    pos.value++;
    const combinator = tokens[pos.value++] as SimplicityCombinator | SimplicityJet;
    const left = parseSimplicityExpr(tokens, pos);
    pos.value = left.nextPos;
    const right = parseSimplicityExpr(tokens, pos);
    pos.value = right.nextPos;
    if (tokens[pos.value] === ')') pos.value++;
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
