import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import world from '../../data/worldBoundaries.json';
import locationData from '../../data/nroLocations.json';
import { streetTiles } from '../../data/mapProvider';
import { distanceKm, formatDistance } from '../../lib/geography';
import InstitutionLocation from './InstitutionLocation';
import { useSourceCurrency } from '../../hooks/useSourceCurrency';

function textElement(tag, value) { const element = document.createElement(tag); element.textContent = value; return element; }
function markerIcon(comparison = false) {
 const dot = document.createElement('span'); dot.className = comparison ? 'map-pin map-pin--comparison' : 'map-pin';
 return L.divIcon({ html: dot, className: 'map-marker', iconSize: [24, 24], iconAnchor: [12, 12] });
}
function popupContent(site) {
 const content = document.createElement('div');
 content.append(textElement('strong', site.name || site.label));
 if (site.name && site.label !== site.name) content.append(textElement('p', site.label));
 content.append(textElement('p', site.scope));
 content.append(textElement('p', site.sourceLabel || 'Source-reported approximate location'));
 if (site.sourceUrl) { const link = textElement('a', 'Inspect location source'); link.href = site.sourceUrl; link.target = '_blank'; link.rel = 'noopener noreferrer'; content.append(link); }
 return content;
}

function MapCanvas({ sites, comparison, focused, streets, onTileError }) {
 const container = useRef(null), map = useRef(null), markers = useRef(null);
 useEffect(() => {
  const instance = L.map(container.current, { center: [33, 80], zoom: 2, minZoom: 1, maxZoom: 18, scrollWheelZoom: false, worldCopyJump: false, maxBounds: [[-85, -180], [85, 180]], attributionControl: true, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false });
  instance.attributionControl.setPrefix(false);
  instance.attributionControl.addAttribution('Overview: <a href="https://www.naturalearthdata.com/" target="_blank" rel="noopener noreferrer">Natural Earth</a> (public domain)');
  L.geoJSON(world, { interactive: false, style: { color: '#6b9180', weight: 0.7, fillColor: '#29483c', fillOpacity: 1 } }).addTo(instance);
  instance.getPane('overlayPane').setAttribute('aria-hidden', 'true');
  L.control.scale({ imperial: false }).addTo(instance);
  markers.current = L.layerGroup().addTo(instance); map.current = instance;
  const observer = new ResizeObserver(() => instance.invalidateSize()); observer.observe(container.current);
  return () => { observer.disconnect(); instance.remove(); map.current = null; markers.current = null; };
 }, []);
 useEffect(() => {
  const group = markers.current; group.clearLayers();
  sites.forEach(site => L.marker([site.lat, site.lng], { icon: markerIcon(), title: site.name + ': approximate location', alt: site.name + ': approximate location', keyboard: true }).bindPopup(popupContent(site), { maxWidth: 300 }).addTo(group));
  if (comparison) L.marker([comparison.lat, comparison.lng], { icon: markerIcon(true), title: comparison.label, alt: 'Comparison location: ' + comparison.label, zIndexOffset: 1000 }).bindPopup(popupContent(comparison)).addTo(group);
  if (focused && comparison) L.polyline([[comparison.lat, comparison.lng], [focused.lat, focused.lng]], { color: '#f4cf7d', weight: 3, dashArray: '7 7', interactive: false }).addTo(group);
 }, [sites, comparison, focused]);
 useEffect(() => {
  if (!streets) return;
  const layer = L.tileLayer(streetTiles.url, streetTiles).addTo(map.current);
  layer.on('tileerror', onTileError);
  return () => { layer.off('tileerror', onTileError); layer.remove(); };
 }, [streets, onTileError]);
 useEffect(() => {
  const points = focused ? [[focused.lat, focused.lng]] : sites.map(s => [s.lat, s.lng]);
  if (comparison) points.push([comparison.lat, comparison.lng]);
  if (points.length) map.current.fitBounds(points, { padding: [36, 36], maxZoom: focused ? 14 : comparison ? 8 : 4, animate: false });
 }, [sites, comparison, focused]);
 return <div className="nro-map-canvas" ref={container} role="region" aria-label="NRO location map" tabIndex={0} />;
}

export default function NroMap({ organizations }) {
 const section = useRef(null);
 const current = useSourceCurrency(['nro'], locationData.reviewDue);
 const [comparison, setComparison] = useState(null);
 const [focusedId, setFocusedId] = useState(null);
 const [streets, setStreets] = useState(false);
 const [tileError, setTileError] = useState(false);
 const [mapVisible, setMapVisible] = useState(true);
 const sourceSites = useMemo(() => locationData.locations.flatMap(site => {
  const org = organizations.find(o => o.id === site.organizationId);
  return org ? [{ ...site, name: org.name, country: org.country }] : [];
 }), [organizations]);
 const sites = useMemo(() => current ? sourceSites : [], [current, sourceSites]);
 const mappedCount = new Set(sourceSites.map(s => s.organizationId)).size;
 const focused = sites.find(s => s.id === focusedId) || null;
 const distances = comparison ? sites.map(site => ({ ...site, distance: distanceKm(comparison, site) })).filter(s => s.distance !== null).sort((a, b) => a.distance - b.distance).slice(0, 5) : [];
 const onTileError = useMemo(() => () => { setTileError(true); setStreets(false); }, []);
 function focusSite(id) {
  setFocusedId(id); setMapVisible(true);
  requestAnimationFrame(() => {
   const canvas = section.current?.querySelector('.nro-map-canvas');
   canvas?.scrollIntoView({ block: 'center' }); canvas?.focus({ preventScroll: true });
  });
 }
 return <section ref={section} className="nro-map-section" aria-labelledby="nro-map-heading">
  <h2 id="nro-map-heading">NRO map and geographic context</h2>
  <p>Explore source-reported locations and approximate straight-line distances. Being nearby does not establish affiliation, collaboration or risk.</p>
  <p className="map-coverage" role="status">{mappedCount} of {organizations.length} organizations in this view have recorded locations ({sourceSites.length} sites). {organizations.length - mappedCount} have no mapped location here and are excluded from distance comparisons.</p>
  <p className="scope-note">Location records reviewed {locationData.reviewedOn}. Pins represent the locations described by their cited sources; they are not verified building boundaries or a complete inventory of every campus. No nearby result is not clearance.</p>
  {!current && <p className="notice" role="status">Map location review is overdue. Pins and distance comparisons are unavailable until the source snapshot is reviewed. Use the official list and location sources.</p>}
  <div className="screen-only">
   <div className="toolbar"><button aria-expanded={mapVisible} onClick={() => setMapVisible(v => !v)}>{mapVisible ? 'Hide map' : 'Show map'}</button><button disabled={!focused} onClick={() => setFocusedId(null)}>Show all mapped locations</button><button onClick={() => window.print()}>Print current lookup and comparison</button></div>
   <label className="choice-label"><input type="checkbox" checked={streets} onChange={e => { setStreets(e.target.checked); setTileError(false); }} />Load OpenStreetMap street detail for this visit</label>
   <p className="scope-note">Optional street tiles send your connection information, this site’s origin and the areas you view to OpenStreetMap. Institution names and worksheet answers are not sent to it. Turning this off stops new tile requests; requests already sent cannot be recalled. Labels follow the map’s local languages. <a href="https://osmfoundation.org/wiki/Privacy_Policy" target="_blank" rel="noopener noreferrer">OpenStreetMap privacy policy</a>.</p>
   {tileError && <p className="notice" role="status">Street detail could not load and has been switched off. The local overview and location list remain available. You can try again explicitly.</p>}
   {mapVisible && <MapCanvas sites={sites} comparison={comparison} focused={focused} streets={streets} onTileError={onTileError} />}
   <p className="map-legend"><span className="legend-dot" /> NRO source location <span className="legend-dot legend-dot--comparison" /> Your selected comparison location</p>
   <p className="scope-note">Map keyboard controls: arrow keys to pan, + and − to zoom. Tab reaches marker details. Use the location list below as a text alternative. The bundled overview is coarse; street detail is optional.</p>
   <InstitutionLocation selected={comparison} onSelect={place => { setComparison(place); setFocusedId(null); }} onClear={() => { setComparison(null); setFocusedId(null); }} />
  </div>
  {comparison && <section className="review-card" aria-labelledby="nearby-heading"><h3 id="nearby-heading">Closest mapped sites to {comparison.label}</h3>
   <p>Comparison point: {comparison.lat.toFixed(4)}, {comparison.lng.toFixed(4)}. {comparison.scope} {comparison.sourceUrl && <a href={comparison.sourceUrl} target="_blank" rel="noopener noreferrer">{comparison.sourceLabel}</a>}</p>
   <p>Among the currently filtered, mapped sites only. Distances are between source points, rounded to avoid implying building-level accuracy. Unmapped organizations and other campuses may be closer.</p>
   {distances.length ? <ol className="distance-list">{distances.map(site => <li key={site.id}><strong>{formatDistance(site.distance)}</strong> · {site.name} · {site.label} <button className="screen-only" onClick={() => focusSite(site.id)}>Compare on map</button></li>)}</ol> : <p>{current ? 'No mapped sites in this view. Clear the name/country filters to see wider coverage.' : 'Distances unavailable while the location or policy source review is overdue.'}</p>}
  </section>}
  <details className="map-location-list screen-only"><summary>Mapped location sources and text alternative ({sourceSites.length} sites)</summary>
   <LocationSources sites={sourceSites} onFocus={current ? focusSite : null} />
  </details>
  <section className="map-location-list print-only"><h3>Location sources for the current view ({sourceSites.length} sites)</h3><LocationSources sites={sourceSites} /></section>
 </section>;
}

function LocationSources({ sites, onFocus }) {
 return <ul>{sites.map(site => <li key={site.id}><strong>{site.name}</strong><p>{site.label} · {site.country} · {site.lat.toFixed(4)}, {site.lng.toFixed(4)}.</p><p>{site.scope}</p><a href={site.sourceUrl} target="_blank" rel="noopener noreferrer">{site.sourceLabel}</a> · Reviewed {site.reviewedOn} {onFocus && <button onClick={() => onFocus(site.id)}>Show this site</button>}</li>)}</ul>;
}
