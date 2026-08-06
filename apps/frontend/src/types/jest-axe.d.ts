declare module 'jest-axe' {
  export function axe(container: Element | string, options?: Record<string, unknown>): Promise<{ violations: unknown[] }>;
}

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): Promise<R>;
    }
  }
}

export {};
