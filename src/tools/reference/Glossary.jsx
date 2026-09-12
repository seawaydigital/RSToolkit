import ReferenceGuide from '../../components/ui/ReferenceGuide';
import { glossaryData } from '../../data/glossaryData';
export default function Guide({ onNavigate }) {
  return <ReferenceGuide data={glossaryData} onNavigate={onNavigate} />;
}
