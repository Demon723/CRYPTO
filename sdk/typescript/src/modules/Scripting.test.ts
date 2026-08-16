import { EnhancedScripting } from './Scripting';

describe('EnhancedScripting', () => {
  let scripting: EnhancedScripting;

  beforeEach(() => {
    scripting = new EnhancedScripting();
  });

  describe('compileMiniscript', () => {
    it('should compile miniscript', () => {
      const miniscript = 'and(pk(user),after(100))';
      const compiled = scripting.compileMiniscript(miniscript);
      expect(compiled).toBe(miniscript);
    });

    it('should compile empty miniscript', () => {
      const compiled = scripting.compileMiniscript('');
      expect(compiled).toBe('');
    });
  });

  describe('validateMiniscript', () => {
    it('should validate valid miniscript', () => {
      expect(scripting.validateMiniscript('and(pk(user),after(100))')).toBe(true);
    });

    it('should reject empty miniscript', () => {
      expect(scripting.validateMiniscript('')).toBe(false);
    });

    it('should reject miniscript without parentheses', () => {
      expect(scripting.validateMiniscript('invalid')).toBe(false);
    });
  });

  describe('analyzeSpendingConditions', () => {
    it('should analyze spending conditions', () => {
      const miniscript = 'and(pk(user),after(100))';
      const analysis = scripting.analyzeSpendingConditions(miniscript);

      expect(analysis).toHaveProperty('satisfactions');
      expect(analysis).toHaveProperty('conditions');
      expect(analysis.satisfactions).toBe(1);
      expect(Array.isArray(analysis.conditions)).toBe(true);
    });
  });

  describe('generateWitness', () => {
    it('should generate witness with signature', () => {
      const miniscript = 'and(pk(user),after(100))';
      const data = { signature: 'sig_data' };
      const witness = scripting.generateWitness(miniscript, data);

      expect(witness).toEqual(['sig_data']);
    });

    it('should generate witness with empty signature', () => {
      const miniscript = 'and(pk(user),after(100))';
      const data = {};
      const witness = scripting.generateWitness(miniscript, data);

      expect(witness).toEqual(['']);
    });
  });

  describe('validateSimplicity', () => {
    it('should validate valid Simplicity program', () => {
      const program = '(seq (drop sig) (drop pk))';
      const result = scripting.validateSimplicity(program);

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result.valid).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate empty program', () => {
      const result = scripting.validateSimplicity('');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('analyzeResources', () => {
    it('should analyze program resources', () => {
      const program = '(seq (drop sig) (drop pk))';
      const resources = scripting.analyzeResources(program);

      expect(resources).toHaveProperty('memory');
      expect(resources).toHaveProperty('computation');
      expect(typeof resources.memory).toBe('number');
      expect(typeof resources.computation).toBe('number');
      expect(resources.memory).toBe(100);
      expect(resources.computation).toBe(100);
    });
  });

  describe('checkResourceLimits', () => {
    it('should pass when resources are within limits', () => {
      const program = '(seq (drop sig) (drop pk))';
      expect(scripting.checkResourceLimits(program, 200, 200)).toBe(true);
    });

    it('should pass when resources exactly match limits', () => {
      const program = '(seq (drop sig) (drop pk))';
      expect(scripting.checkResourceLimits(program, 100, 100)).toBe(true);
    });

    it('should fail when memory exceeds limit', () => {
      const program = '(seq (drop sig) (drop pk))';
      expect(scripting.checkResourceLimits(program, 50, 200)).toBe(false);
    });

    it('should fail when computation exceeds limit', () => {
      const program = '(seq (drop sig) (drop pk))';
      expect(scripting.checkResourceLimits(program, 200, 50)).toBe(false);
    });
  });

  describe('createTaprootKey and createTaprootAddress', () => {
    it('should create taproot key', () => {
      const internalKey = 'internal_key_123';
      const scriptTree = ['script1', 'script2'];
      const taprootKey = scripting.createTaprootKey(internalKey, scriptTree);

      expect(taprootKey).toBe(internalKey);
    });

    it('should create taproot address from key', () => {
      const taprootKey = 'a'.repeat(50);
      const address = scripting.createTaprootAddress(taprootKey);

      expect(address).toBe(`bc1p${taprootKey.slice(0, 40)}`);
      expect(address.startsWith('bc1p')).toBe(true);
    });
  });

  describe('spendTaprootKeyPath and spendTaprootScriptPath', () => {
    it('should spend via key path', () => {
      const taprootKey = 'key';
      const signature = 'sig';
      const witness = scripting.spendTaprootKeyPath(taprootKey, signature);

      expect(witness).toEqual([signature]);
    });

    it('should spend via script path', () => {
      const taprootKey = 'key';
      const script = 'script';
      const signature = 'sig';
      const witness = scripting.spendTaprootScriptPath(taprootKey, script, signature);

      expect(witness).toEqual([script, signature]);
    });
  });

  describe('validateScript', () => {
    it('should validate non-empty script', () => {
      expect(scripting.validateScript('OP_1 OP_1 OP_ADD')).toBe(true);
    });

    it('should reject empty script', () => {
      expect(scripting.validateScript('')).toBe(false);
    });
  });

  describe('executeScript', () => {
    it('should execute OP_1 OP_1 OP_ADD and return [2]', () => {
      const result = scripting.executeScript('OP_1 OP_1 OP_ADD');
      expect(result).toEqual([2]);
    });

    it('should return empty array for unknown script', () => {
      const result = scripting.executeScript('OP_1 OP_2 OP_MUL');
      expect(result).toEqual([]);
    });

    it('should return empty array for empty script', () => {
      const result = scripting.executeScript('');
      expect(result).toEqual([]);
    });
  });

  describe('composeMiniscript', () => {
    it('should compose miniscript from fragments', () => {
      const fragments = ['and(', 'pk(user)', ',', 'after(100)', ')'];
      const composed = scripting.composeMiniscript(fragments);

      expect(composed).toBe('and(pk(user),after(100))');
    });

    it('should compose empty fragments', () => {
      const composed = scripting.composeMiniscript([]);
      expect(composed).toBe('');
    });
  });

  describe('decomposeScript', () => {
    it('should decompose script by spaces', () => {
      const script = 'OP_1 OP_1 OP_ADD';
      const fragments = scripting.decomposeScript(script);

      expect(fragments).toEqual(['OP_1', 'OP_1', 'OP_ADD']);
    });

    it('should decompose empty script', () => {
      const fragments = scripting.decomposeScript('');
      expect(fragments).toEqual(['']);
    });
  });
});
