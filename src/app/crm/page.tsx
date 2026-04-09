"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, MapPin, Ruler, Building, Euro, Phone, Mail, FileText, ChevronRight, Filter, X, Plus } from "lucide-react";

type Location = {
  id: string;
  address: string;
  city: string;
  size_sqm: number;
  ceiling_height_m: number | null;
  asking_rent: number;
  listing_url: string | null;
  status: string;
  notes: string | null;
  photos: string | null; // stored as json string
};

type Interaction = {
  id: string;
  location_id: string;
  agent_id: string | null;
  type: string;
  summary: string;
  created_at: string;
  agents?: Agent | null;
};

type Agent = {
  id: string;
  name: string;
  company: string | null;
  phone: string | null;
  email: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-gray-500 text-white",
  contacting: "bg-yellow-500 text-yellow-950",
  viewing: "bg-blue-500 text-blue-950",
  offer_sent: "bg-purple-500 text-white",
  rejected: "bg-red-500 text-white",
  lease_signed: "bg-green-500 text-green-950",
};

export default function CRMDashboard() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    setLoading(true);
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setLocations(data);
    }
    setLoading(false);
  }

  const filteredLocations = locations.filter((loc) => {
    const matchesSearch = loc.address.toLowerCase().includes(search.toLowerCase());
    const matchesCity = cityFilter ? loc.city.toLowerCase() === cityFilter.toLowerCase() : true;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="flex h-full bg-[#0B162C] text-[#f5f1e3]">
      {/* List View */}
      <div className={`flex flex-col w-full ${selectedLocation ? 'hidden md:flex md:w-1/2 lg:w-1/3' : ''} border-r border-[#f5f1e3]/20`}>
        <div className="p-4 border-b border-[#f5f1e3]/20 bg-[#080d1a]">
          <h1 className="text-2xl font-bold mb-4 font-mono tracking-wide">LOCATION CRM</h1>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#f5f1e3]/50" />
              <input
                type="text"
                placeholder="Search address..."
                className="w-full bg-[#0B162C] border border-[#f5f1e3]/20 rounded p-2 pl-9 text-sm focus:outline-none focus:border-[#f5f1e3]/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="bg-[#0B162C] border border-[#f5f1e3]/20 rounded p-2 text-sm focus:outline-none focus:border-[#f5f1e3]/50"
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
            >
              <option value="">All Cities</option>
              {Array.from(new Set(locations.map(l => l.city))).map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-10 opacity-50 font-mono">LOADING LOCATIONS...</div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center py-10 opacity-50 font-mono">NO LOCATIONS FOUND</div>
          ) : (
            filteredLocations.map((loc) => (
              <div
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                className={`p-4 rounded border cursor-pointer transition-colors ${
                  selectedLocation?.id === loc.id
                    ? "bg-[#f5f1e3]/10 border-[#f5f1e3]/50"
                    : "bg-[#0B162C] border-[#f5f1e3]/10 hover:border-[#f5f1e3]/30"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATUS_COLORS[loc.status] || "bg-gray-500 text-white"}`}>
                    {loc.status.replace("_", " ")}
                  </span>
                  <span className="text-sm font-mono opacity-60">{loc.city}</span>
                </div>
                <h3 className="font-bold truncate mb-3">{loc.address}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs opacity-80">
                  <div className="flex items-center gap-1"><Ruler className="w-3 h-3"/> {loc.size_sqm} m²</div>
                  <div className="flex items-center gap-1"><Euro className="w-3 h-3"/> {loc.asking_rent}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail View */}
      {selectedLocation ? (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0a1121]">
          <LocationDetail 
            location={selectedLocation} 
            onClose={() => setSelectedLocation(null)}
            onUpdate={(updated) => {
              setLocations(prev => prev.map(l => l.id === updated.id ? updated : l));
              setSelectedLocation(updated);
            }}
          />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center opacity-30 font-mono">
          SELECT A LOCATION TO VIEW DETAILS
        </div>
      )}
    </div>
  );
}

function LocationDetail({ location, onClose, onUpdate }: { location: Location, onClose: () => void, onUpdate: (loc: Location) => void }) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // New Interaction form state
  const [showForm, setShowForm] = useState(false);
  const [newSummary, setNewSummary] = useState("");
  const [newType, setNewType] = useState("call");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInteractions();
  }, [location.id]);

  async function fetchInteractions() {
    setLoading(true);
    const { data, error } = await supabase
      .from("interactions")
      .select(`
        *,
        agents (*)
      `)
      .eq("location_id", location.id)
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setInteractions(data as Interaction[]);
    }
    setLoading(false);
  }

  async function updateStatus(newStatus: string) {
    setStatusUpdating(true);
    const { data, error } = await supabase
      .from("locations")
      .update({ status: newStatus })
      .eq("id", location.id)
      .select()
      .single();
    
    if (!error && data) {
      onUpdate(data);
    }
    setStatusUpdating(false);
  }

  async function addInteraction(e: React.FormEvent) {
    e.preventDefault();
    if (!newSummary.trim()) return;

    setSubmitting(true);
    const { data, error } = await supabase
      .from("interactions")
      .insert({
        location_id: location.id,
        type: newType,
        summary: newSummary,
      })
      .select(`*, agents(*)`)
      .single();

    if (!error && data) {
      setInteractions([data as Interaction, ...interactions]);
      setNewSummary("");
      setShowForm(false);
    }
    setSubmitting(false);
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Detail Header */}
      <div className="p-6 border-b border-[#f5f1e3]/20 flex justify-between items-start bg-[#080d1a]">
        <div>
          <button onClick={onClose} className="md:hidden mb-4 text-sm flex items-center gap-1 opacity-70 hover:opacity-100">
            <X className="w-4 h-4" /> Close
          </button>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">{location.address}</h2>
            <select 
              value={location.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={statusUpdating}
              className={`text-xs font-bold uppercase px-2 py-1 rounded-full border-none outline-none cursor-pointer ${STATUS_COLORS[location.status] || "bg-gray-500"} ${statusUpdating ? 'opacity-50' : ''}`}
            >
              {Object.keys(STATUS_COLORS).map(s => (
                <option key={s} value={s} className="bg-white text-black">{s.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <p className="text-[#f5f1e3]/60 flex items-center gap-2"><MapPin className="w-4 h-4" /> {location.city}</p>
        </div>
        {location.listing_url && (
          <a href={location.listing_url} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline text-sm border border-blue-400/30 px-3 py-1 rounded">
            View Listing
          </a>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0B162C] border border-[#f5f1e3]/10 p-4 rounded flex flex-col gap-1">
            <span className="text-[#f5f1e3]/50 text-xs font-mono uppercase">Size</span>
            <span className="text-xl font-bold flex items-center gap-2"><Ruler className="w-5 h-5 opacity-50"/> {location.size_sqm} m²</span>
          </div>
          <div className="bg-[#0B162C] border border-[#f5f1e3]/10 p-4 rounded flex flex-col gap-1">
            <span className="text-[#f5f1e3]/50 text-xs font-mono uppercase">Rent</span>
            <span className="text-xl font-bold flex items-center gap-2"><Euro className="w-5 h-5 opacity-50"/> {location.asking_rent}</span>
          </div>
          <div className="bg-[#0B162C] border border-[#f5f1e3]/10 p-4 rounded flex flex-col gap-1">
            <span className="text-[#f5f1e3]/50 text-xs font-mono uppercase">Ceiling</span>
            <span className="text-xl font-bold flex items-center gap-2"><Building className="w-5 h-5 opacity-50"/> {location.ceiling_height_m || '?'} m</span>
          </div>
        </div>

        {location.notes && (
          <div className="bg-[#0B162C] border border-[#f5f1e3]/10 p-4 rounded">
            <h3 className="text-xs font-mono uppercase text-[#f5f1e3]/50 mb-2">Notes</h3>
            <p className="text-sm whitespace-pre-wrap">{location.notes}</p>
          </div>
        )}

        {/* Interactions Section */}
        <div className="mt-4 border-t border-[#f5f1e3]/10 pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold font-mono">INTERACTIONS</h3>
            <button 
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-1 text-sm bg-[#f5f1e3] text-[#0B162C] px-3 py-1 rounded font-bold hover:bg-[#f5f1e3]/90 transition"
            >
              {showForm ? <X className="w-4 h-4"/> : <Plus className="w-4 h-4"/>} 
              {showForm ? "Cancel" : "Add Note"}
            </button>
          </div>

          {showForm && (
            <form onSubmit={addInteraction} className="mb-6 bg-[#0B162C] border border-[#f5f1e3]/20 p-4 rounded flex flex-col gap-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input type="radio" value="call" checked={newType==='call'} onChange={e => setNewType(e.target.value)} />
                  <span className="text-sm">Call</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="email" checked={newType==='email'} onChange={e => setNewType(e.target.value)} />
                  <span className="text-sm">Email</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" value="visit" checked={newType==='visit'} onChange={e => setNewType(e.target.value)} />
                  <span className="text-sm">Visit</span>
                </label>
              </div>
              <textarea 
                className="w-full bg-[#080d1a] border border-[#f5f1e3]/20 rounded p-2 text-sm focus:outline-none focus:border-[#f5f1e3]/50 min-h-[80px]"
                placeholder="Interaction details..."
                value={newSummary}
                onChange={e => setNewSummary(e.target.value)}
                required
              />
              <button 
                type="submit" 
                disabled={submitting}
                className="self-end bg-blue-500 text-white px-4 py-1.5 rounded text-sm font-bold disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Save Interaction"}
              </button>
            </form>
          )}

          <div className="space-y-4">
            {loading ? (
              <div className="opacity-50 text-sm font-mono">Loading interactions...</div>
            ) : interactions.length === 0 ? (
              <div className="opacity-50 text-sm font-mono italic">No interactions recorded yet.</div>
            ) : (
              interactions.map(interaction => (
                <div key={interaction.id} className="border-l-2 border-[#f5f1e3]/20 pl-4 py-1">
                  <div className="flex items-center gap-2 mb-1">
                    {interaction.type === 'call' && <Phone className="w-3 h-3 text-green-400"/>}
                    {interaction.type === 'email' && <Mail className="w-3 h-3 text-blue-400"/>}
                    {interaction.type === 'visit' && <MapPin className="w-3 h-3 text-purple-400"/>}
                    <span className="text-xs font-bold uppercase opacity-80">{interaction.type}</span>
                    <span className="text-xs opacity-50 ml-auto font-mono">
                      {new Date(interaction.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{interaction.summary}</p>
                  {interaction.agents && (
                    <div className="mt-2 flex items-center gap-2 text-xs bg-[#0B162C] p-2 rounded w-fit border border-[#f5f1e3]/10">
                      <span className="font-bold">{interaction.agents.name}</span>
                      {interaction.agents.company && <span className="opacity-60">({interaction.agents.company})</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
