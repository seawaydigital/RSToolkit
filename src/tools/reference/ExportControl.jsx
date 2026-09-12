import ReferenceGuide from '../../components/ui/ReferenceGuide';
import { exportControlData } from '../../data/exportControlData';
export default function Guide({ onNavigate }) {
  return <ReferenceGuide data={exportControlData} onNavigate={onNavigate} />;
}
