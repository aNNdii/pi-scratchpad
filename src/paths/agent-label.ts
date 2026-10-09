import { slugLabel } from './slug-label';

/** Label for a tintinweb agent: `<type>-<first 8 chars of id>`. */
export const agentLabel = (type: string, id: string): string => `${slugLabel(type) || 'agent'}-${id.slice(0, 8)}`;
