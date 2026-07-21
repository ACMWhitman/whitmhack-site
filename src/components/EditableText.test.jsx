import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EditableText } from './EditableText'

describe('EditableText', () => {
  it('renders plain text when not admin', () => {
    render(<EditableText value="Hello world" onChange={() => {}} isAdmin={false} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders clickable text when admin', () => {
    render(<EditableText value="Edit me" onChange={() => {}} isAdmin />)
    const trigger = screen.getByRole('button', { name: /click to edit/i })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveTextContent('Edit me')
    expect(trigger).toHaveClass('admin-editable-outline')
  })

  it('switches to an input on click when admin', () => {
    render(<EditableText value="Edit me" onChange={() => {}} isAdmin />)
    fireEvent.click(screen.getByRole('button', { name: /click to edit/i }))
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('Edit me')
  })

  it('calls onChange when the input value changes', () => {
    const handleChange = vi.fn()
    render(<EditableText value="Edit me" onChange={handleChange} isAdmin />)
    fireEvent.click(screen.getByRole('button', { name: /click to edit/i }))
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'New value' } })
    expect(handleChange).toHaveBeenCalledWith('New value')
  })

  it('closes the input on Escape', () => {
    render(<EditableText value="Edit me" onChange={() => {}} isAdmin />)
    fireEvent.click(screen.getByRole('button', { name: /click to edit/i }))
    const input = screen.getByRole('textbox')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('closes the input on Enter for single-line mode', () => {
    render(<EditableText value="Edit me" onChange={() => {}} isAdmin />)
    fireEvent.click(screen.getByRole('button', { name: /click to edit/i }))
    const input = screen.getByRole('textbox')
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('renders a textarea when multiline is true', () => {
    render(<EditableText value="Long text" onChange={() => {}} isAdmin multiline />)
    fireEvent.click(screen.getByRole('button', { name: /click to edit/i }))
    const textarea = screen.getByRole('textbox')
    expect(textarea.tagName).toBe('TEXTAREA')
  })

  it('shows placeholder text when value is empty', () => {
    render(<EditableText value="" onChange={() => {}} isAdmin placeholder="Type here..." />)
    expect(screen.getByText('Type here...')).toBeInTheDocument()
  })
})