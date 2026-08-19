import '../lab/labStyles.css';
import InterviewMode from '../components/InterviewMode';

/**
 * InterviewMode.jsx still uses PrimeReact internals (not worth rewriting for
 * a footer-only hiring-context page), so it needs the same CSS isolation as
 * /lab/* pages. Unlike /lab, this is legitimate content, not a demo, so it
 * gets no "experimental" banner — just a dark-shell wrapper for contrast.
 */
export default function CandidateBrief() {
  return (
    <div className="lab-shell p-4 sm:p-6">
      <InterviewMode />
    </div>
  );
}
