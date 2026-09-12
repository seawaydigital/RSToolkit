import ReferenceGuide from '../../components/ui/ReferenceGuide';
import { cybersecurityData } from '../../data/cybersecurityData';
export default function Guide({ onNavigate }) {
  return <ReferenceGuide data={cybersecurityData} onNavigate={onNavigate} />;
}
