import React from 'react';

const DemoModeBanner: React.FC = () => {
  return (
    <div className="bg-yellow-400 text-yellow-900 text-center p-2 font-semibold">
      आप अभी डेमो मोड में हैं। आपका डेटा सेव नहीं होगा। Firebase को कॉन्फ़िगर करने के लिए <code className="bg-yellow-500 text-white px-1 rounded-sm">src/firebaseConfig.ts</code> फ़ाइल देखें।
    </div>
  );
};

export default DemoModeBanner;
