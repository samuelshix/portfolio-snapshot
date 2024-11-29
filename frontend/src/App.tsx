import React from 'react';
import Portfolio from './components/Portfolio';

const App: React.FC = () => {

  return (
    <div className="flex h-screen bg-black text-white">
      <Portfolio />
    </div>
  );
};

export default App;