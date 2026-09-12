import ReferenceGuide from '../../components/ui/ReferenceGuide';
import { triAgencyData } from '../../data/triAgencyData';
export default function Guide({ onNavigate }) {
  return <ReferenceGuide data={triAgencyData} onNavigate={onNavigate} />;
}
