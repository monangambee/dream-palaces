export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About Planar Choreography</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-3">Project Overview</h2>
            <p className="text-gray-300 leading-relaxed">
              Planar Choreography is an interactive 3D visualization of cinema data, 
              built with Next.js, Three.js, and React Three Fiber. The application 
              displays cinema information in an immersive 3D environment.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-3">Technology Stack</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>Next.js 15 with App Router</li>
              <li>React Three Fiber for 3D rendering</li>
              <li>Three.js for WebGL graphics</li>
              <li>Airtable for data management</li>
              <li>Tailwind CSS for styling</li>
              <li>Zustand for state management</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold mb-3">Data Source</h2>
            <p className="text-gray-300 leading-relaxed">
              The visualization is powered by cinema data from Airtable, 
              featuring over 1,400 records of cinema information including 
              locations, types, and other relevant details.
            </p>
          </section>
        </div>
        
        <div className="mt-8">
          <a 
            href="/" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors"
          >
            ← Back to Visualization
          </a>
        </div>
      </div>
    </div>
  );
}
