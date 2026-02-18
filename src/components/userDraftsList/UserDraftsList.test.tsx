import React from 'react'
import { render, screen } from '@testing-library/react'
import UserDraftsList from './UserDraftsList'

// next/link only needs to render an anchor in tests
jest.mock('next/link', () => {
  const Link = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  )
  Link.displayName = 'Link'
  return Link
})

describe('UserDraftsList', () => {
  it('renders "no drafts to show" when drafts is null', () => {
    render(<UserDraftsList drafts={null} />)
    expect(screen.getByText('no drafts to show')).toBeInTheDocument()
  })

  it('renders "no drafts to show" when drafts is undefined', () => {
    render(<UserDraftsList drafts={undefined} />)
    expect(screen.getByText('no drafts to show')).toBeInTheDocument()
  })

  it('renders a list item for each draft', () => {
    const drafts = {
      'draft-1': { draftName: 'Masters 2024' },
      'draft-2': { draftName: 'US Open 2024' },
    }
    render(<UserDraftsList drafts={drafts} />)

    expect(screen.getByText('Masters 2024')).toBeInTheDocument()
    expect(screen.getByText('US Open 2024')).toBeInTheDocument()
  })

  it('renders draft links with the correct href', () => {
    const drafts = { 'abc-123': { draftName: 'The Open 2024' } }
    render(<UserDraftsList drafts={drafts} />)

    const link = screen.getByText('The Open 2024').closest('a')
    expect(link).toHaveAttribute('href', '/draft/abc-123')
  })
})
