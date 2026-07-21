import { useWhitelabel as useWhitelabelContext } from '../providers/WhitelabelProvider.jsx';

export function useWhitelabel() {
  return useWhitelabelContext();
}
