/**
 * Map Page
 *
 * Full-screen iframe embedding the external Dream Palace Web Map
 * (a separate Vercel-hosted app with Mapbox/Leaflet).
 */
export default function Map() { 
    return (
        <div className="w-screen min-h-screen h-screen bg-background text-primary">
            <iframe width='100%' height='100%' src="https://dream-palace-web-map.vercel.app/"></iframe>
        </div>
    );
}