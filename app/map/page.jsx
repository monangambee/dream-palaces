/**
 * Map Page
 *
 * Full-screen iframe embedding the external Dream Palace Web Map
 * (a separate Vercel-hosted app with Mapbox/Leaflet).
 */

"use client";

// export default function Map() {
//   return (
//     <div className="w-screen min-h-screen h-screen bg-background text-primary">
//       <iframe
//         width="100%"
//         height="100%"
//         src="https://dream-palace-web-map.vercel.app/"
//       ></iframe>
//     </div>
//   );
// }

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function MapInner() {
  const searchParams = useSearchParams();
  const cinema = searchParams.get("cinema");

  const base = "https://dream-palace-web-map.vercel.app/";
  const src = cinema ? `${base}?cinema=${encodeURIComponent(cinema)}` : base;

  return (
    <div className="w-screen min-h-screen h-screen bg-background text-primary">
      <iframe width="100%" height="100%" src={src} style={{ border: 0 }} />
    </div>
  );
}

export default function Map() {
  return (
    <Suspense fallback={null}>
      <MapInner />
    </Suspense>
  );
}
