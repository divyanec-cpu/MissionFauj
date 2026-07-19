import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppStateProvider } from './context/AppStateContext';
import { OnboardingPage } from './pages/onboarding/OnboardingPage';
import { WrittenExamPrepPage } from './pages/written-exam/WrittenExamPrepPage';
import { SsbTrainingPage } from './pages/ssb/SsbTrainingPage';
import { ExpertConsultationPage } from './pages/ExpertConsultationPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { GlossaryPage } from './pages/GlossaryPage';

function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OnboardingPage />} />
          <Route path="/written-exam-prep" element={<WrittenExamPrepPage />} />
          <Route path="/ssb-training" element={<SsbTrainingPage />} />
          <Route path="/expert-consultation" element={<ExpertConsultationPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/glossary" element={<GlossaryPage />} />
        </Routes>
      </BrowserRouter>
    </AppStateProvider>
  );
}

export default App;
