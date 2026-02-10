import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { ResultsPage } from './ResultsPage'

function renderWithProviders(initialUrl: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialUrl]}>
        <ResultsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

test('renders results header from URL params', async () => {
  renderWithProviders('/results?from=JFK&to=LAX&date=2026-02-20&flex=3&adults=1&cabin=economy')

  expect(await screen.findByText(/JFK → LAX/i)).toBeInTheDocument()
})

