export enum MiniscriptNodeType {
  PREFIX = 'PREFIX',
  SUFFIX = 'SUFFIX',
  WRAPPED = 'WRAPPED',
  INFIX = 'INFIX',
  BINARY = 'BINARY',
  LITERAL = 'LITERAL',
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

export class MiniscriptCompiler {
  static parse(policy: string): MiniscriptNode {
    const tokens = tokenize(policy);
    let pos = { value: 0 };
    const node = parseExpression(tokens, pos);
    return node;
  }

  static compile(node: MiniscriptNode): MiniscriptPolicy {
    const script = emitScript(node);
    return { node, script };
  }

  static policyToScript(policy: string): Buffer {
    const node = this.parse(policy);
    const compiled = this.compile(node);
    return compiled.script;
  }
}

function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  for (const ch of input) {
    if (ch === '(' || ch === ')' || ch === ',') {
      if (current.trim()) tokens.push(current.trim());
      if (ch !== ',') tokens.push(ch);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) tokens.push(current.trim());
  return tokens;
}

function parseExpression(tokens: string[], pos: { value: number }): MiniscriptNode {
  if (pos.value >= tokens.length) {
    return { type: MiniscriptNodeType.LITERAL, value: '' };
  }
  const token = tokens[pos.value];
  if (token === '(') {
    pos.value++;
    const left = parseExpression(tokens, pos);
    if (pos.value < tokens.length && tokens[pos.value] === ')') {
      pos.value++;
      return left;
    }
    if (pos.value < tokens.length && isBinaryOp(tokens[pos.value])) {
      const op = tokens[pos.value++];
      const right = parseExpression(tokens, pos);
      pos.value++;
      return { type: MiniscriptNodeType.BINARY, value: op, left, right };
    }
    if (pos.value < tokens.length && isWrapper(tokens[pos.value])) {
      const wrapper = tokens[pos.value++];
      const inner = parseExpression(tokens, pos);
      pos.value++;
      return { type: MiniscriptNodeType.WRAPPED, wrapper, left: inner };
    }
    return left;
  }
  pos.value++;
  return { type: MiniscriptNodeType.LITERAL, value: token };
}

function isBinaryOp(token: string): boolean {
  return ['&&', '||', 'and', 'or', '|', '&'].includes(token);
}

function isWrapper(token: string): boolean {
  return ['older', 'after', 'sha256', 'hash256', 'pk', 'pk_k', 'pubkey'].includes(token);
}

function emitScript(node: MiniscriptNode): Buffer {
  switch (node.type) {
    case MiniscriptNodeType.LITERAL:
      if (node.value === 'true') return Buffer.from([81]);
      if (node.value === 'false') return Buffer.from([0]);
      if (node.value === '1') return Buffer.from([81]);
      if (node.value === '0') return Buffer.from([0]);
      return Buffer.from([0]);
    case MiniscriptNodeType.BINARY: {
      const left = emitScript(node.left!);
      const right = emitScript(node.right!);
      if (node.value === '&&' || node.value === 'and' || node.value === '&') {
        return Buffer.concat([left, right, Buffer.from([174])]);
      }
      return Buffer.concat([left, right, Buffer.from([177])]);
    }
    case MiniscriptNodeType.WRAPPED: {
      const inner = emitScript(node.left!);
      if (node.wrapper === 'pk' || node.wrapper === 'pk_k' || node.wrapper === 'pubkey') {
        return Buffer.concat([inner, Buffer.from([172])]);
      }
      if (node.wrapper === 'sha256' || node.wrapper === 'hash256') {
        return Buffer.concat([inner, Buffer.from([170])]);
      }
      if (node.wrapper === 'older') {
        return Buffer.concat([inner, Buffer.from([177])]);
      }
      if (node.wrapper === 'after') {
        return Buffer.concat([inner, Buffer.from([177])]);
      }
      return inner;
    }
    default:
      return Buffer.from([0]);
  }
}
