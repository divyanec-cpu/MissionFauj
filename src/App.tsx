import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { LoginSequencePage } from './pages/login/LoginSequencePage';
import { OnboardingPage } from './pages/onboarding/OnboardingPage';
import { WrittenExamPrepPage } from './pages/written-exam/WrittenExamPrepPage';
import { SsbTrainingPage } from './pages/ssb/SsbTrainingPage';
import { ExpertConsultationPage } from './pages/ExpertConsultationPage';
import { HelpCenterPage } from './pages/HelpCenterPage';
import { GlossaryPage } from './pages/GlossaryPage';

function RootGate() {
  const appState = useAppState();
  if (!appState.auth) {
    return <LoginSequencePage onDone={appState.completeLogin} />;
  }
  return <OnboardingPage />;
}

function App() {
  return (
    <AppStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootGate />} />
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
