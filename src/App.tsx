import { useState } from 'react';
import { Sidebar, type TabId } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { AIStudio } from '@/components/AIStudio';
import { Bookings } from '@/components/Bookings';
import { Loyalty } from '@/components/Loyalty';
import { SocialMedia } from '@/components/SocialMedia';
import { Reminders } from '@/components/Reminders';

export interface SharedContent {
  caption: string;
  imagePrompt: string | null;
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [sharedContent, setSharedContent] = useState<SharedContent | null>(null);

  function handleShareToSocial(content: SharedContent) {
    setSharedContent(content);
    setActiveTab('social');
  }

  return (
    <div className="min-h-screen bg-charcoal-900">
      <Sidebar active={activeTab} onNavigate={setActiveTab} />

      <main className="lg:ml-72 min-h-screen">
        <div className="p-6 lg:p-10 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === 'ai-studio' && <AIStudio onShareToSocial={handleShareToSocial} />}
          {activeTab === 'bookings' && <Bookings />}
          {activeTab === 'loyalty' && <Loyalty />}
          {activeTab === 'social' && <SocialMedia sharedContent={sharedContent} onSharedConsumed={() => setSharedContent(null)} />}
          {activeTab === 'reminders' && <Reminders />}
        </div>
      </main>
    </div>
  );
}

export default App;
