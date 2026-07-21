import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdmin } from '../context/AdminContext'
import { EditableText } from './EditableText'

/**
 * The main admin editing interface. Loads all content from the backend on
 * mount, displays every editable field organized by section, and provides
 * a single "Save" button that sends the entire content object back.
 *
 * Each section is collapsible so the page doesn't overwhelm the admin
 * with every field at once — they can focus on one section at a time.
 */
function SectionGroup({ label, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-white/15 bg-silicon-blue/60 p-4 backdrop-blur-sm">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="font-heading text-lg font-bold text-electric-wheat">{label}</h3>
        <span className="text-sm text-walla-mist/50">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="mt-4 space-y-3">{children}</div>}
    </div>
  )
}

function RemoveButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="shrink-0 rounded-full border border-white/15 px-3 py-1 font-subhead text-xs uppercase tracking-widest text-walla-mist/50 transition-colors hover:border-red-400 hover:text-red-400"
    >
      Remove
    </button>
  )
}

function AddButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-dashed border-white/20 py-2 font-subhead text-xs uppercase tracking-widest text-walla-mist/60 transition-colors hover:border-laser-teal hover:text-laser-teal"
    >
      + {label}
    </button>
  )
}

function Field({ label, value, onChange, multiline = false }) {
  return (
    <div>
      <label className="mb-1 block font-subhead text-xs uppercase tracking-widest text-walla-mist/60">
        {label}
      </label>
      <EditableText
        value={value}
        onChange={onChange}
        isAdmin
        multiline={multiline}
        className="block w-full rounded bg-deep-space/40 px-3 py-2 font-body text-sm text-walla-mist"
        inputClassName="rounded bg-deep-space/60 px-3 py-2 font-body text-sm text-walla-mist border border-laser-teal/50"
      />
    </div>
  )
}

export function AdminDashboard() {
  const { isAdmin, content, fetchContent, saveContent, loading, error, logout } = useAdmin()
  const [localContent, setLocalContent] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)

  useEffect(() => {
    if (isAdmin && !content) {
      fetchContent()
    }
  }, [isAdmin, content, fetchContent])

  useEffect(() => {
    if (content && !localContent) {
      setLocalContent(content)
    }
  }, [content, localContent])

  if (!isAdmin) {
    return <Navigate to="/admin" replace />
  }

  const updateField = (section, field, value) => {
    setLocalContent((prev) => {
      if (!prev) return prev
      const updated = { ...prev }
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        updated[section] = { ...updated[section], [parent]: { ...updated[section][parent], [child]: value } }
      } else {
        updated[section] = { ...updated[section], [field]: value }
      }
      return updated
    })
  }

  const updateArrayItem = (section, arrayField, index, field, value) => {
    setLocalContent((prev) => {
      if (!prev) return prev
      const updated = { ...prev }
      const arr = [...updated[section][arrayField]]
      arr[index] = { ...arr[index], [field]: value }
      updated[section] = { ...updated[section], [arrayField]: arr }
      return updated
    })
  }

  const addArrayItem = (section, arrayField, template) => {
    setLocalContent((prev) => {
      if (!prev) return prev
      const arr = [...(prev[section][arrayField] || []), { id: crypto.randomUUID(), ...template }]
      return { ...prev, [section]: { ...prev[section], [arrayField]: arr } }
    })
  }

  const removeArrayItem = (section, arrayField, index) => {
    if (!window.confirm('Remove this? This cannot be undone once you save.')) return
    setLocalContent((prev) => {
      if (!prev) return prev
      const arr = prev[section][arrayField].filter((_, i) => i !== index)
      return { ...prev, [section]: { ...prev[section], [arrayField]: arr } }
    })
  }

  const handleSave = async () => {
    if (!localContent) return
    setSaving(true)
    setSaveMessage(null)
    const success = await saveContent(localContent)
    setSaving(false)
    setSaveMessage(success ? 'Saved successfully!' : 'Save failed.')
    setTimeout(() => setSaveMessage(null), 3000)
  }

  if (!localContent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-deep-space">
        <p className="font-body text-sm text-walla-mist/60">
          {loading ? 'Loading content...' : 'No content loaded.'}
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-deep-space px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-heading text-gradient-shift text-2xl font-extrabold uppercase tracking-wide">
            Edit Content
          </h1>
          <button
            onClick={logout}
            className="rounded-full border border-white/20 px-4 py-2 font-subhead text-xs uppercase tracking-widest text-walla-mist/60 transition-colors hover:border-red-400 hover:text-red-400"
          >
            Log Out
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-900/30 px-4 py-2 font-body text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <div className="space-y-4">
          {/* Hero section */}
          <SectionGroup label="Hero" defaultOpen>
            <Field label="Eyebrow" value={localContent.hero?.eyebrow || ''} onChange={(v) => updateField('hero', 'eyebrow', v)} />
            <Field label="Title" value={localContent.hero?.title || ''} onChange={(v) => updateField('hero', 'title', v)} />
            <Field label="Subtitle" value={localContent.hero?.subtitle || ''} onChange={(v) => updateField('hero', 'subtitle', v)} multiline />
            <Field label="CTA Label" value={localContent.hero?.ctaLabel || ''} onChange={(v) => updateField('hero', 'ctaLabel', v)} />
            <Field label="CTA Href" value={localContent.hero?.ctaHref || ''} onChange={(v) => updateField('hero', 'ctaHref', v)} />
            <Field label="Target Date" value={localContent.hero?.targetDate || ''} onChange={(v) => updateField('hero', 'targetDate', v)} />
            <div>
              <label className="mb-1 block font-subhead text-xs uppercase tracking-widest text-walla-mist/60">Taglines</label>
              {(localContent.hero?.taglines || []).map((tagline, i) => (
                <div key={i} className="mb-2">
                  <EditableText
                    value={tagline}
                    onChange={(v) => updateArrayItem('hero', 'taglines', i, '', v)}
                    isAdmin
                    className="block w-full rounded bg-deep-space/40 px-3 py-2 font-body text-sm text-walla-mist"
                    inputClassName="rounded bg-deep-space/60 px-3 py-2 font-body text-sm text-walla-mist border border-laser-teal/50"
                  />
                </div>
              ))}
            </div>
          </SectionGroup>

          {/* About section */}
          <SectionGroup label="About">
            <Field label="Eyebrow" value={localContent.about?.eyebrow || ''} onChange={(v) => updateField('about', 'eyebrow', v)} />
            <Field label="Title" value={localContent.about?.title || ''} onChange={(v) => updateField('about', 'title', v)} />
            {(localContent.about?.bento || []).map((block, i) => (
              <div key={block.id} className="rounded-lg border border-white/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-subhead text-xs font-bold uppercase tracking-wider text-laser-teal">{block.heading || 'New card'}</p>
                  <RemoveButton label={`Remove ${block.heading || 'card'}`} onClick={() => removeArrayItem('about', 'bento', i)} />
                </div>
                <Field label="Heading" value={block.heading} onChange={(v) => updateArrayItem('about', 'bento', i, 'heading', v)} />
                <Field label="Body" value={block.body} onChange={(v) => updateArrayItem('about', 'bento', i, 'body', v)} multiline />
              </div>
            ))}
            <AddButton
              label="Add card"
              onClick={() => addArrayItem('about', 'bento', { span: 'md', heading: 'New card', body: '' })}
            />
          </SectionGroup>

          {/* Tracks section */}
          <SectionGroup label="Tracks">
            <Field label="Eyebrow" value={localContent.tracksSection?.eyebrow || ''} onChange={(v) => updateField('tracksSection', 'eyebrow', v)} />
            <Field label="Title" value={localContent.tracksSection?.title || ''} onChange={(v) => updateField('tracksSection', 'title', v)} />
            {(localContent.tracksSection?.tracks || []).map((track, i) => (
              <div key={track.id} className="rounded-lg border border-white/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-subhead text-xs font-bold uppercase tracking-wider text-laser-teal">{track.name || 'New track'}</p>
                  <RemoveButton label={`Remove ${track.name || 'track'}`} onClick={() => removeArrayItem('tracksSection', 'tracks', i)} />
                </div>
                <Field label="Name" value={track.name} onChange={(v) => updateArrayItem('tracksSection', 'tracks', i, 'name', v)} />
                <Field label="Description" value={track.description} onChange={(v) => updateArrayItem('tracksSection', 'tracks', i, 'description', v)} multiline />
                <Field label="Prize" value={track.prize} onChange={(v) => updateArrayItem('tracksSection', 'tracks', i, 'prize', v)} />
              </div>
            ))}
            <AddButton
              label="Add track"
              onClick={() =>
                addArrayItem('tracksSection', 'tracks', {
                  name: 'New track',
                  description: '',
                  prize: 'TBD',
                  accent: 'cyber-blue',
                })
              }
            />
          </SectionGroup>

          {/* FAQ section */}
          <SectionGroup label="FAQ">
            <Field label="Eyebrow" value={localContent.faqSection?.eyebrow || ''} onChange={(v) => updateField('faqSection', 'eyebrow', v)} />
            <Field label="Title" value={localContent.faqSection?.title || ''} onChange={(v) => updateField('faqSection', 'title', v)} />
            {(localContent.faqSection?.questions || []).map((q, i) => (
              <div key={q.id} className="rounded-lg border border-white/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-subhead text-xs font-bold uppercase tracking-wider text-laser-teal">{q.question || 'New question'}</p>
                  <RemoveButton label={`Remove ${q.question || 'question'}`} onClick={() => removeArrayItem('faqSection', 'questions', i)} />
                </div>
                <Field label="Question" value={q.question} onChange={(v) => updateArrayItem('faqSection', 'questions', i, 'question', v)} />
                <Field label="Answer" value={q.answer} onChange={(v) => updateArrayItem('faqSection', 'questions', i, 'answer', v)} multiline />
              </div>
            ))}
            <AddButton
              label="Add question"
              onClick={() => addArrayItem('faqSection', 'questions', { question: 'New question', answer: '' })}
            />
          </SectionGroup>

          {/* Organizers section */}
          <SectionGroup label="Organizers">
            <Field label="Eyebrow" value={localContent.organizersSection?.eyebrow || ''} onChange={(v) => updateField('organizersSection', 'eyebrow', v)} />
            <Field label="Title" value={localContent.organizersSection?.title || ''} onChange={(v) => updateField('organizersSection', 'title', v)} />
            {(localContent.organizersSection?.organizers || []).map((person, i) => (
              <div key={person.id} className="rounded-lg border border-white/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-subhead text-xs font-bold uppercase tracking-wider text-laser-teal">{person.name || 'New organizer'}</p>
                  <RemoveButton label={`Remove ${person.name || 'organizer'}`} onClick={() => removeArrayItem('organizersSection', 'organizers', i)} />
                </div>
                <Field label="Name" value={person.name} onChange={(v) => updateArrayItem('organizersSection', 'organizers', i, 'name', v)} />
                <Field label="Role" value={person.role} onChange={(v) => updateArrayItem('organizersSection', 'organizers', i, 'role', v)} />
              </div>
            ))}
            <AddButton
              label="Add organizer"
              onClick={() => addArrayItem('organizersSection', 'organizers', { name: 'New organizer', role: '' })}
            />
          </SectionGroup>

          {/* Footer section */}
          <SectionGroup label="Footer">
            <Field label="Organizers text" value={localContent.footerSection?.organizers || ''} onChange={(v) => updateField('footerSection', 'organizers', v)} multiline />
            <Field label="Resources Heading" value={localContent.footerSection?.resourcesHeading || ''} onChange={(v) => updateField('footerSection', 'resourcesHeading', v)} />
            {(localContent.footerSection?.resources || []).map((link, i) => (
              <div key={link.id} className="rounded-lg border border-white/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-subhead text-xs font-bold uppercase tracking-wider text-laser-teal">{link.label || 'New link'}</p>
                  <RemoveButton label={`Remove ${link.label || 'link'}`} onClick={() => removeArrayItem('footerSection', 'resources', i)} />
                </div>
                <Field label="Text" value={link.label} onChange={(v) => updateArrayItem('footerSection', 'resources', i, 'label', v)} />
                <Field label="URL" value={link.href} onChange={(v) => updateArrayItem('footerSection', 'resources', i, 'href', v)} />
              </div>
            ))}
            <AddButton
              label="Add resource link"
              onClick={() => addArrayItem('footerSection', 'resources', { label: 'New link', href: '#' })}
            />

            <Field label="Social Heading" value={localContent.footerSection?.socialHeading || ''} onChange={(v) => updateField('footerSection', 'socialHeading', v)} />
            {(localContent.footerSection?.social || []).map((link, i) => (
              <div key={link.id} className="rounded-lg border border-white/10 p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="font-subhead text-xs font-bold uppercase tracking-wider text-laser-teal">{link.label || 'New link'}</p>
                  <RemoveButton label={`Remove ${link.label || 'link'}`} onClick={() => removeArrayItem('footerSection', 'social', i)} />
                </div>
                <Field label="Text" value={link.label} onChange={(v) => updateArrayItem('footerSection', 'social', i, 'label', v)} />
                <Field label="URL" value={link.href} onChange={(v) => updateArrayItem('footerSection', 'social', i, 'href', v)} />
              </div>
            ))}
            <AddButton
              label="Add social link"
              onClick={() => addArrayItem('footerSection', 'social', { label: 'New link', href: '#' })}
            />

            <Field label="Register Label" value={localContent.footerSection?.registerLabel || ''} onChange={(v) => updateField('footerSection', 'registerLabel', v)} />
            <Field label="Register Href" value={localContent.footerSection?.registerHref || ''} onChange={(v) => updateField('footerSection', 'registerHref', v)} />
          </SectionGroup>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-electric-wheat px-8 py-3 font-subhead text-sm font-bold uppercase tracking-widest text-deep-space transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
          {saveMessage && (
            <span className={`font-body text-sm ${saveMessage.includes('failed') ? 'text-red-400' : 'text-laser-teal'}`}>
              {saveMessage}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}