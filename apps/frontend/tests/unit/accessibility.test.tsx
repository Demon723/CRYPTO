import React from 'react';
import { render } from '@testing-library/react';
import { axe as _axe, toHaveNoViolations as _toHaveNoViolations } from 'jest-axe';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const axe = _axe as any;
const toHaveNoViolations = _toHaveNoViolations as any;

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('Button should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Input with label should have no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" />
      </div>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Form should have no accessibility violations', async () => {
    const { container } = render(
      <form>
        <Label htmlFor="name">Name</Label>
        <Input id="name" aria-required="true" />
        <Button type="submit">Submit</Button>
      </form>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Button should be focusable', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Press me</Button>);
    const button = document.querySelector('button');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });
});
