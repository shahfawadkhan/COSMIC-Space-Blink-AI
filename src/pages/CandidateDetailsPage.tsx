import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { candidateService } from '../services/candidateService';
import { CandidateRecord, CandidateStatus } from '../types/candidate';
import { MotionChart } from '../components/charts/MotionChart';
import { SpectralSEDChart } from '../components/charts/SpectralSEDChart';
import { StatusBadge, PriorityBadge } from '../components/ui/StatusBadge';
import { LoadingState } from '../components/ui/LoadingState';
import { formatCoordinates } from '../lib/astroUtils';
import { useSettings } from '../context/SettingsContext';
import { ArrowLeft, Clock, MessageSquarePlus, Send, Bookmark, CheckCircle2 } from 'lucide-react';

export const CandidateDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [candidate, setCandidate] = useState<CandidateRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [newNote, setNewNote] = useState<string>('');
  const [noteAuthor, setNoteAuthor] = useState<string>('');
  const [isFollowUpMarked, setIsFollowUpMarked] = useState<boolean>(false);
  const [statusSuccessMessage, setStatusSuccessMessage] = useState<string | null>(null);

  const fetchCandidate = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await candidateService.getCandidateById(id);
      setCandidate(data);
    } catch (err) {
      console.error('Error fetching candidate:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidate();
  }, [id]);

  const handleStatusChange = async (newStatus: CandidateStatus) => {
    if (!candidate) return;
    try {
      const updated = await candidateService.updateCandidateStatus(candidate.id, newStatus);
      if (updated) {
        setCandidate(updated);
        setStatusSuccessMessage(`Status → "${newStatus}" (session only)`);
        setTimeout(() => setStatusSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidate || !newNote.trim()) return;
    try {
      const updated = await candidateService.addReviewerNote(
        candidate.id,
        newNote.trim(),
        noteAuthor.trim() || 'Anonymous Reviewer'
      );
      if (updated) {
        setCandidate(updated);
        setNewNote('');
      }
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  if (loading) {
    return <LoadingState message="Loading Candidate Dossier…" subMessage={`Retrieving record ${id}`} />;
  }

  if (!candidate) {
    return (
      <div className="p-12 text-center bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-xl my-6">
        <h3 className="text-base font-bold text-[var(--cosmic-text)] mb-2">Record Not Found</h3>
        <p className="text-xs text-[var(--cosmic-text-muted)] mb-4">No matching identifier in the active candidate catalog.</p>
        <button
          onClick={() => navigate('/candidates')}
          className="px-4 py-2 rounded-lg bg-[var(--cosmic-cyan-subtle)] border border-[var(--cosmic-cyan)]/30 text-[var(--cosmic-cyan)] text-xs font-semibold font-mono"
        >
          Return to Candidate Queue
        </button>
      </div>
    );
  }

  const { raStr, decStr } = formatCoordinates(candidate.ra, candidate.dec, settings.coordinateFormat);

  return (
    <div className="space-y-5">
      {/* Navigation row */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/candidates')}
          className="flex items-center gap-1.5 text-xs font-mono text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Candidate Queue
        </button>
        <span className="text-[10px] font-mono text-[var(--cosmic-text-muted)] bg-[var(--cosmic-surface-subtle)] px-2 py-0.5 rounded border border-[var(--cosmic-border)]">
          Local Session Triage
        </span>
      </div>

      {/* Candidate identity + controls */}
      <div className="bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <StatusBadge status={candidate.reviewStatus} size="sm" />
              <PriorityBadge priority={candidate.reviewPriority} />
              {isFollowUpMarked && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--cosmic-violet-subtle)] text-[var(--cosmic-violet)] border border-[var(--cosmic-violet)]/30 flex items-center gap-1">
                  <Bookmark className="w-3 h-3 fill-current" /> Follow-Up
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold font-mono text-[var(--cosmic-text)] tracking-tight">
              {candidate.id}
            </h1>
            {candidate.flaggedReason && (
              <p className="text-xs text-[var(--cosmic-text-muted)] mt-1 max-w-xl">{candidate.flaggedReason}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-[var(--cosmic-surface-subtle)] p-1 rounded-lg border border-[var(--cosmic-border)] text-xs font-mono">
              <span className="text-[var(--cosmic-text-muted)] px-1.5">Status:</span>
              <select
                value={candidate.reviewStatus}
                onChange={e => handleStatusChange(e.target.value as CandidateStatus)}
                className="bg-[var(--cosmic-surface)] text-[var(--cosmic-cyan)] font-semibold border border-[var(--cosmic-border)] rounded px-2 py-0.5 focus:outline-none cursor-pointer text-xs"
              >
                <option value="Needs Review">Needs Review</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="Known Object Match">Known Object Match</option>
                <option value="Possible Artifact">Possible Artifact</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <button
              onClick={() => setIsFollowUpMarked(!isFollowUpMarked)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 transition-colors ${
                isFollowUpMarked
                  ? 'bg-[var(--cosmic-violet-subtle)] border-[var(--cosmic-violet)] text-[var(--cosmic-violet)]'
                  : 'bg-[var(--cosmic-surface-subtle)] border-[var(--cosmic-border)] text-[var(--cosmic-text-muted)] hover:text-[var(--cosmic-text)]'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              {isFollowUpMarked ? 'Flagged' : 'Flag Follow-up'}
            </button>
          </div>
        </div>

        {statusSuccessMessage && (
          <div className="mt-3 p-2 rounded-lg bg-[var(--cosmic-green-subtle)] border border-[var(--cosmic-green)]/30 text-[var(--cosmic-green)] text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            {statusSuccessMessage}
          </div>
        )}

        {/* Astrometry grid — 6 fields compact */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-4">
          {[
            { label: 'RA (ICRS)', value: raStr, color: 'var(--cosmic-text)' },
            { label: 'Dec (ICRS)', value: decStr, color: 'var(--cosmic-text)' },
            { label: 'ℓ, b (gal.)', value: `${candidate.galacticL.toFixed(1)}°, ${candidate.galacticB.toFixed(1)}°`, color: 'var(--cosmic-text)' },
            { label: 'Motion (illus.)', value: `${candidate.apparentMotionArcsecPerHour.toFixed(2)} ″/hr`, color: 'var(--cosmic-cyan)' },
            { label: 'Displacement', value: `${candidate.estimatedDisplacementArcsec.toFixed(1)}″`, color: 'var(--cosmic-amber)' },
            { label: 'Score (illus.)', value: `${candidate.illustrativeScore.toFixed(1)} / 100`, color: 'var(--cosmic-violet)' },
          ].map(field => (
            <div key={field.label} className="p-2.5 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)]">
              <span className="text-[var(--cosmic-text-subtle)] text-[9px] font-mono block mb-0.5 uppercase">{field.label}</span>
              <span className="font-bold text-xs font-mono" style={{ color: field.color }}>{field.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Epoch detection history */}
      <div className="bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--cosmic-border)]">
          <h3 className="text-xs font-semibold font-mono uppercase tracking-wider text-[var(--cosmic-text-muted)] flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[var(--cosmic-cyan)]" />
            Epoch Detections ({candidate.epochsDetected.length})
          </h3>
          <span className="text-[10px] font-mono text-[var(--cosmic-text-muted)]">
            Baseline {candidate.timeBaselineDays.toFixed(1)} d · illustrative values
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {candidate.epochsDetected.map((ep, idx) => (
            <div key={ep.epoch} className="p-3 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)] space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="px-1.5 py-0.5 rounded bg-[var(--cosmic-cyan-subtle)] text-[var(--cosmic-cyan)] font-bold text-[10px] border border-[var(--cosmic-cyan)]/30">
                  {ep.epoch}
                </span>
                <span className="text-[10px] text-[var(--cosmic-text-muted)]">SNR {ep.snr.toFixed(1)}</span>
              </div>

              {/* Simulated thumbnail — clearly labeled */}
              <div className="w-full h-24 rounded bg-[#070B14] border border-[var(--cosmic-border)] relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/5" />
                <div className="absolute inset-y-0 left-1/2 w-px bg-white/5" />
                <div
                  className="relative"
                  style={{ transform: `translate(${(idx - 1.5) * 12}px, ${(idx - 1.5) * 7}px)` }}
                >
                  <div className="w-7 h-7 rounded-full bg-[var(--cosmic-cyan)]/15" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  <div className="w-5 h-5 rounded-full border border-[var(--cosmic-cyan)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                {/* Explicit simulated label */}
                <span className="absolute top-1 left-1.5 text-[8px] font-mono text-white/30">simulated</span>
                <span className="absolute bottom-1 right-1.5 text-[8px] font-mono text-white/30">
                  {ep.timestamp.substring(5, 16).replace('T', ' ')}
                </span>
              </div>

              <div className="space-y-0.5 text-[10px] text-[var(--cosmic-text-muted)]">
                <div className="flex justify-between">
                  <span>Flux (illus.):</span>
                  <span className="text-[var(--cosmic-text)]">{ep.fluxMjy} ± {ep.fluxErr} mJy</span>
                </div>
                <div className="flex justify-between">
                  <span>FWHM:</span>
                  <span className="text-[var(--cosmic-text)]">{ep.fwhmArcsec}″</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-xl p-4">
          <MotionChart candidate={candidate} />
        </div>
        <div className="bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-xl p-4">
          <SpectralSEDChart candidate={candidate} />
        </div>
      </div>

      {/* Cross-match + Data quality — combined into one section with reduced prominence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cross-match */}
        <div className="bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--cosmic-border)]">
            <h4 className="text-xs font-semibold font-mono uppercase tracking-wider text-[var(--cosmic-text-muted)]">
              Catalog Cross-Match
            </h4>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--cosmic-amber-subtle)] text-[var(--cosmic-amber)] border border-[var(--cosmic-amber)]/30">
              illustrative — not a live query
            </span>
          </div>
          <div className="space-y-2 text-[11px] font-mono">
            {[
              { label: 'Status', value: candidate.crossMatch.status, accent: false },
              { label: 'Catalog', value: candidate.crossMatch.catalogName, accent: true },
              ...(candidate.crossMatch.matchedDesignation
                ? [{ label: 'Designation', value: candidate.crossMatch.matchedDesignation, accent: false }]
                : []
              ),
              ...(candidate.crossMatch.separationArcsec !== undefined
                ? [{ label: 'Offset', value: `${candidate.crossMatch.separationArcsec.toFixed(2)}″`, accent: false }]
                : []
              ),
            ].map(row => (
              <div key={row.label} className="flex justify-between p-2 rounded bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)]">
                <span className="text-[var(--cosmic-text-muted)]">{row.label}:</span>
                <span className={row.accent ? 'text-[var(--cosmic-cyan)]' : 'text-[var(--cosmic-text)]'}>{row.value}</span>
              </div>
            ))}
            <p className="text-[10px] text-[var(--cosmic-text-muted)] pt-1">{candidate.crossMatch.notes}</p>
          </div>
        </div>

        {/* Data quality */}
        <div className="bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--cosmic-border)]">
            <h4 className="text-xs font-semibold font-mono uppercase tracking-wider text-[var(--cosmic-text-muted)]">
              Quality Flags
            </h4>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[var(--cosmic-amber-subtle)] text-[var(--cosmic-amber)] border border-[var(--cosmic-amber)]/30">
              illustrative
            </span>
          </div>
          <div className="space-y-2 text-[11px] font-mono">
            {[
              { label: 'PSF Asymmetry', value: `${candidate.dataQuality.psfAsymmetry.toFixed(2)}`, limit: '(limit 0.15)', good: candidate.dataQuality.psfAsymmetry < 0.15 },
              { label: 'Edge Proximity', value: `${candidate.dataQuality.edgeProximityPixels} px`, limit: '(safe > 50)', good: candidate.dataQuality.edgeProximityPixels > 50 },
              { label: 'Cosmic Ray Prob.', value: `${(candidate.dataQuality.cosmicRayProbability * 100).toFixed(1)}%`, limit: '(flag > 5%)', good: candidate.dataQuality.cosmicRayProbability < 0.05 },
            ].map(row => (
              <div key={row.label} className="flex justify-between p-2 rounded bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)]">
                <span className="text-[var(--cosmic-text-muted)]">{row.label}</span>
                <span className={row.good ? 'text-[var(--cosmic-green)]' : 'text-[var(--cosmic-rose)]'}>
                  {row.value} <span className="text-[var(--cosmic-text-subtle)] text-[9px]">{row.limit}</span>
                </span>
              </div>
            ))}
            <div className="flex flex-wrap gap-1 pt-1">
              {candidate.dataQuality.flags.map((flag, i) => (
                <span key={i} className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[var(--cosmic-surface-subtle)] text-[var(--cosmic-text-muted)] border border-[var(--cosmic-border)]">
                  {flag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Reviewer Notes */}
      <div className="bg-[var(--cosmic-surface)] border border-[var(--cosmic-border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--cosmic-border)]">
          <h4 className="text-xs font-semibold font-mono uppercase tracking-wider text-[var(--cosmic-text-muted)] flex items-center gap-2">
            <MessageSquarePlus className="w-3.5 h-3.5 text-[var(--cosmic-cyan)]" />
            Reviewer Notes ({candidate.notes.length})
          </h4>
          <span className="text-[10px] font-mono text-[var(--cosmic-text-subtle)]">Local session</span>
        </div>

        <div className="space-y-2.5 mb-4">
          {candidate.notes.length === 0 && (
            <p className="text-xs text-[var(--cosmic-text-subtle)] font-mono italic text-center py-3">No notes yet.</p>
          )}
          {candidate.notes.map(note => (
            <div key={note.id} className="p-3 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)] space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="font-bold text-[var(--cosmic-cyan)]">{note.author}</span>
                <span className="text-[var(--cosmic-text-subtle)]">{note.timestamp.replace('T', ' ').substring(0, 16)} UTC</span>
              </div>
              <p className="text-xs text-[var(--cosmic-text)] leading-relaxed font-sans">{note.content}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleAddNote} className="space-y-2.5 pt-3 border-t border-[var(--cosmic-border)]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-[var(--cosmic-text-muted)] font-semibold">Add note:</span>
            <input
              type="text"
              placeholder="Reviewer name (optional)"
              value={noteAuthor}
              onChange={e => setNoteAuthor(e.target.value)}
              className="px-2 py-1 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)] text-xs text-[var(--cosmic-text)] font-mono w-44 focus:outline-none focus:border-[var(--cosmic-cyan)] placeholder:text-[var(--cosmic-text-subtle)] transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <textarea
              rows={2}
              placeholder="Scientific remarks, follow-up recommendations, or astrometric fit comments…"
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              className="w-full p-2 rounded-lg bg-[var(--cosmic-surface-subtle)] border border-[var(--cosmic-border)] text-xs text-[var(--cosmic-text)] placeholder:text-[var(--cosmic-text-subtle)] focus:outline-none focus:border-[var(--cosmic-cyan)] font-sans transition-colors"
            />
            <button
              type="submit"
              disabled={!newNote.trim()}
              className="px-3 py-2 rounded-lg bg-[var(--cosmic-cyan)] hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold text-xs flex items-center gap-1 transition-all shrink-0 self-end"
            >
              <Send className="w-3 h-3" />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
