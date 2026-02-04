import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toHaveClass(...classNames: string[]): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeVisible(): R;
      toContainElement(element: HTMLElement | null): R;
      toHaveStyle(css: Record<string, any>): R;
      toHaveFocus(): R;
      toBeChecked(): R;
      toHaveValue(value: string | string[] | number): R;
    }
  }
}
