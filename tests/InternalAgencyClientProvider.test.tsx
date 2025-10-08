import React from 'react';
import { act, render, renderHook, waitFor } from '@testing-library/react';
import { InternalAgencyClientProvider, useInternalAgencyClient } from '../src';
import { createInternalAgencyClient } from '@simmcomm/internal-agency-client';
import { describe, expect, it, type Mock, vi } from 'vitest';
import { useSearchParams } from 'next/navigation';
import { clientConfigMock } from './shared';

// Mock dependencies
vi.mock('@simmcomm/internal-agency-client', (importOriginal) => ({
  createInternalAgencyClient: vi.fn(() => ({
    fridStore: {
      setFrid: vi.fn(),
      getFrid: vi.fn(),
    },
    saveEvent: vi.fn(() => Promise.resolve()),
  })),
  createInMemoryFridStore: vi.fn(),
  createWebStorageFridStore: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

describe('InternalAgencyClientProvider', () => {

  it('provides the client context correctly', async () => {
    const TestComponent = () => {
      const { client, initialized, initializing } = useInternalAgencyClient();
      return (
        <div>
          <span data-testid="initialized">{String(initialized)}</span>
          <span data-testid="initializing">{String(initializing)}</span>
          <span data-testid="client">{client ? 'client-set' : 'client-not-set'}</span>
        </div>
      );
    };

    const { getByTestId } = render(
      <InternalAgencyClientProvider config={clientConfigMock}>
        <TestComponent/>
      </InternalAgencyClientProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('initialized').textContent).toBe('true');
      expect(getByTestId('initializing').textContent).toBe('false');
      expect(getByTestId('client').textContent).toBe('client-set');
    });
  });

  it('handles frid parameter from searchParams', async () => {
    const mockSetFrid = vi.fn();
    (createInternalAgencyClient as Mock).mockReturnValueOnce({
      fridStore: { setFrid: mockSetFrid },
      saveEvent: vi.fn(() => Promise.resolve()),
    });

    (useSearchParams as Mock).mockReturnValueOnce(new URLSearchParams({ frid: 'test-frid' }));

    render(
      <InternalAgencyClientProvider config={clientConfigMock}>
        <div>Test</div>
      </InternalAgencyClientProvider>,
    );

    await waitFor(() => {
      expect(mockSetFrid).toHaveBeenCalledWith('test-frid');
    });
  });

  it('handles client initialization failure', async () => {
    (createInternalAgencyClient as Mock).mockReturnValueOnce({
      fridStore: {},
      saveEvent: vi.fn(() => Promise.reject(new Error('Initialization failed'))),
    });

    const TestComponent = () => {
      const { error, initialized, initializing } = useInternalAgencyClient();
      return (
        <div>
          <span data-testid="initialized">{String(initialized)}</span>
          <span data-testid="initializing">{String(initializing)}</span>
          <span data-testid="error">{error ? 'error' : 'no-error'}</span>
        </div>
      );
    };

    const { getByTestId } = render(
      <InternalAgencyClientProvider config={clientConfigMock}>
        <TestComponent/>
      </InternalAgencyClientProvider>,
    );

    await waitFor(() => {
      expect(getByTestId('initialized').textContent).toBe('false');
      expect(getByTestId('initializing').textContent).toBe('false');
      expect(getByTestId('error').textContent).toBe('error');
    });
  });

  it('throws without being wrapped in a Provider', () => {
    const TestComponent = () => {
      const { client } = useInternalAgencyClient();
      return (
        <div>
          {client ? 'client-set' : 'client-not-set'}
        </div>
      );
    };

    expect(() => {
      render(<TestComponent/>);
    }).toThrowError('useInternalAgencyClient must be used within an InternalAgencyClientProvider');
  });

  it('does not initialize client if already initialized', async () => {
    vi.useFakeTimers();

    const mockClient = {
      fridStore: { setFrid: vi.fn(), getFrid: vi.fn() },
      saveEvent: vi.fn(() => Promise.resolve()),
    };
    (createInternalAgencyClient as Mock).mockReturnValueOnce(mockClient);

    const TestComponent = () => {
      const { client, initialized, initializing } = useInternalAgencyClient();
      return (
        <div>
          <span data-testid="initialized">{String(initialized)}</span>
          <span data-testid="initializing">{String(initializing)}</span>
          <span data-testid="client">{client ? 'client-set' : 'client-not-set'}</span>
        </div>
      );
    };

    render(
      <InternalAgencyClientProvider config={clientConfigMock}>
        <TestComponent/>
        <TestComponent/>
      </InternalAgencyClientProvider>,
    );

    await act(async () => {
      await vi.advanceTimersByTime(0);
    });

    expect(mockClient.saveEvent).toHaveBeenCalledOnce();
  });

  it('does not initialize client if manualInit=true', async () => {
    vi.useFakeTimers();

    const mockClient = {
      saveEvent: vi.fn(() => Promise.resolve()),
    };
    (createInternalAgencyClient as Mock).mockReturnValueOnce(mockClient);

    renderHook(() => useInternalAgencyClient({ manualInit: true }), {
      wrapper: ({ children }) => (
        <InternalAgencyClientProvider config={clientConfigMock}>
          {children}
        </InternalAgencyClientProvider>
      ),
    });

    await act(async () => {
      await vi.advanceTimersByTime(0);
    });

    expect(mockClient.saveEvent).not.toHaveBeenCalled();
  });
});
