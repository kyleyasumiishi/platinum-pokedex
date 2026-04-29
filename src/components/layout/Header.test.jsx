import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GenerationProvider } from '../../context/GenerationContext'
import Header from './Header'
import { BrowserRouter } from 'react-router-dom'

function renderHeader(initialGen = 4) {
  localStorage.setItem('platinum-pokedex-active-gen', String(initialGen))
  return render(
    <BrowserRouter>
      <GenerationProvider>
        <Header />
      </GenerationProvider>
    </BrowserRouter>
  )
}

describe('Header', () => {
  it('renders "SINNOH — PLATINUM" when activeGen is 4', () => {
    renderHeader(4)
    expect(screen.getByText('SINNOH — PLATINUM')).toBeDefined()
  })

  it('renders "UNOVA — BLACK" when activeGen is 5', () => {
    renderHeader(5)
    expect(screen.getByText('UNOVA — BLACK')).toBeDefined()
  })
})
