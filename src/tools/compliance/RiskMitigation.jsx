import ReferenceGuide from '../../components/ui/ReferenceGuide';
import { riskMitigationData } from '../../data/riskMitigationData';
export default function Guide({ onNavigate }) {
  return <ReferenceGuide data={riskMitigationData} onNavigate={onNavigate} />;
}
