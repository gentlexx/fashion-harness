/**
 * Static Fashion Agent permission prose. Dynamic project state is not written here.
 * @module @gentlexx/dsh-fashion-agent/src/prompt
 */

/** Standing read-only permission section. Project snapshots arrive per turn via pre-step. */
export const FASHION_AGENT_READONLY_PROMPT = [
  'Fashion project assistance is read-only.',
  'When this session is bound to a Fashion project, a compact snapshot is appended each user turn.',
  'Use fashion_project_query to read more of the same bound project; you cannot pass a project id.',
  'Never treat the workspace folder name as the project identity.',
  'Do not create, edit, approve, reject, export, or write Fashion project data.',
  'Return suggestions as text only.',
].join(' ')

/** Model-facing description of the bound query tool. */
export const FASHION_PROJECT_QUERY_DESCRIPTION = [
  'Read one compact section of the Fashion project bound to this session.',
  'The Host supplies the project id from the session binding; do not guess it from the workspace path.',
  'Allowed sections: project, research, analysis, brief, directions, review, deliverable, feedback, evaluation, improvement.',
  'This tool cannot modify the project.',
].join(' ')
