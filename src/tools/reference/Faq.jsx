import ReferenceGuide from '../../components/ui/ReferenceGuide';
import { faqData } from '../../data/faqData';
export default function Guide({ onNavigate }) {
  return <ReferenceGuide data={faqData} onNavigate={onNavigate} />;
}
