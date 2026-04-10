"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, MapPin, Ruler, Building, Euro, Phone, Mail, FileText, ChevronRight, Filter, X, Plus, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

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
  source?: string | null;
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
  new: "bg-gray-500",
  contacting: "bg-yellow-500 text-yellow-950",
  viewing: "bg-blue-500",
  offer_sent: "bg-purple-500",
  rejected: "bg-red-500",
  lease_signed: "bg-green-500 text-green-950",
};

export default function CRMDashboard() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
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
    const matchesCity = cityFilter && cityFilter !== "all" ? loc.city.toLowerCase() === cityFilter.toLowerCase() : true;
    const matchesSource = sourceFilter && sourceFilter !== "all" ? loc.source?.toLowerCase() === sourceFilter.toLowerCase() : true;
    return matchesSearch && matchesCity && matchesSource;
  });

  const uniqueCities = Array.from(new Set(locations.map(l => l.city).filter(Boolean)));
  const uniqueSources = ['Kleinanzeigen', 'ImmoScout24', 'Immowelt', 'Website', 'Broker', 'Other'];

  return (
    <div className="flex flex-col h-full bg-background text-foreground p-4 md:p-6 gap-4 md:gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Location CRM</h1>
          <p className="text-muted-foreground mt-1">Manage and track potential property locations.</p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="bg-card">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"  />
            <Input
              type="text"
              placeholder="Search address..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
             />
          </div>

          <Select value={cityFilter} onValueChange={(val) => setCityFilter(val || "")}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Cities"  />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {uniqueCities.map(city => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={(val) => setSourceFilter(val || "")}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Sources"  />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {uniqueSources.map(src => (
                <SelectItem key={src} value={src}>{src}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Locations Table */}
      
      <Card className="flex-1 overflow-hidden flex flex-col">
        {/* Desktop Table View */}
        <div className="overflow-auto flex-1 hidden md:block">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0 z-10">
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Loading locations...
                  </TableCell>
                </TableRow>
              ) : filteredLocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No locations found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLocations.map((loc) => (
                  <TableRow key={loc.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedLocation(loc)}>
                    <TableCell className="font-medium">{loc.address}</TableCell>
                    <TableCell>{loc.city}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Ruler className="w-3 h-3" /> {loc.size_sqm} m2</span>
                        <span className="flex items-center gap-1"><Euro className="w-3 h-3" /> {loc.asking_rent}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={`${STATUS_COLORS[loc.status] || "bg-gray-500 text-white"} hover:opacity-80`}>
                        {loc.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {loc.source ? <Badge variant="outline">{loc.source}</Badge> : <span className="text-muted-foreground text-xs">-</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedLocation(loc); }}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile List View */}
        <div className="overflow-auto flex-1 md:hidden p-4 flex flex-col gap-4">
          {loading ? (
            <div className="h-24 flex items-center justify-center text-muted-foreground">Loading locations...</div>
          ) : filteredLocations.length === 0 ? (
            <div className="h-24 flex items-center justify-center text-muted-foreground">No locations found.</div>
          ) : (
            filteredLocations.map((loc) => (
              <Card key={loc.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedLocation(loc)}>
                <CardContent className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="font-medium">{loc.address}</span>
                    <Badge variant="secondary" className={`${STATUS_COLORS[loc.status] || "bg-gray-500 text-white"}`}>
                      {loc.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{loc.city}</div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1"><Ruler className="w-3 h-3" /> {loc.size_sqm} m2</span>
                    <span className="flex items-center gap-1"><Euro className="w-3 h-3" /> {loc.asking_rent}</span>
                  </div>
                  {loc.source && (
                    <div className="mt-2">
                      <Badge variant="outline">{loc.source}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </Card>


      <Sheet open={!!selectedLocation} onOpenChange={(open) => !open && setSelectedLocation(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] sm:max-w-none overflow-y-auto flex flex-col p-0">
          {selectedLocation && (
            <LocationDetail
              location={selectedLocation}
              onUpdate={(updated) => {
                setLocations(prev => prev.map(l => l.id === updated.id ? updated : l));
                setSelectedLocation(updated);
              }}
             />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function LocationDetail({ location, onUpdate }: { location: Location, onUpdate: (loc: Location) => void }) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [sourceUpdating, setSourceUpdating] = useState(false);

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

  async function updateSource(newSource: string) {
    const val = newSource === "none" ? null : newSource;
    setSourceUpdating(true);
    const { data, error } = await supabase
      .from("locations")
      .update({ source: val })
      .eq("id", location.id)
      .select()
      .single();

    if (!error && data) {
      onUpdate(data);
    }
    setSourceUpdating(false);
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
    <div className="flex flex-col h-full">
      <SheetHeader className="p-6 border-b bg-muted/20">
        <SheetTitle className="text-2xl">{location.address}</SheetTitle>
        <div className="flex items-center gap-2 text-muted-foreground mt-2">
          <MapPin className="w-4 h-4"  />
          <span>{location.city}</span>
          {location.listing_url && (
            <a href={location.listing_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline ml-auto">
              Listing <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </SheetHeader>

      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={location.status} onValueChange={(val) => val && updateStatus(val)} disabled={statusUpdating}>
              <SelectTrigger>
                <SelectValue placeholder="Status"  />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(STATUS_COLORS).map(s => (
                  <SelectItem key={s} value={s}>{s.replace("_", " ").toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Source</Label>
            <Select value={location.source || "none"} onValueChange={(val) => val && updateSource(val)} disabled={sourceUpdating}>
              <SelectTrigger>
                <SelectValue placeholder="Source"  />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {['Kleinanzeigen', 'ImmoScout24', 'Immowelt', 'Website', 'Broker', 'Other'].map(src => (
                  <SelectItem key={src} value={src}>{src}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col gap-1 items-center justify-center text-center">
              <Ruler className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-xl font-bold">{location.size_sqm} <span className="text-sm font-normal text-muted-foreground">m2</span></span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col gap-1 items-center justify-center text-center">
              <Euro className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-xl font-bold">{location.asking_rent}</span>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col gap-1 items-center justify-center text-center">
              <Building className="w-5 h-5 text-muted-foreground mb-1" />
              <span className="text-xl font-bold">{location.ceiling_height_m || '?'} <span className="text-sm font-normal text-muted-foreground">m</span></span>
            </CardContent>
          </Card>
        </div>

        {location.notes && (
          <div className="space-y-2">
            <Label>Notes</Label>
            <Card className="bg-muted/30">
              <CardContent className="p-4 text-sm whitespace-pre-wrap">
                {location.notes}
              </CardContent>
            </Card>
          </div>
        )}

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold tracking-tight text-lg">Interactions</h3>
            <Button variant={showForm ? "secondary" : "default"} size="sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? <><X className="w-4 h-4 mr-1" /> Cancel</> : <><Plus className="w-4 h-4 mr-1"/> Add Note</>}
            </Button>
          </div>

          {showForm && (
            <Card>
              <CardContent className="p-4">
                <form onSubmit={addInteraction} className="space-y-4">
                  <div className="flex gap-4">
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value="call" checked={newType==='call'} onChange={e => setNewType(e.target.value)} className="accent-primary"  />
                      Call
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value="email" checked={newType==='email'} onChange={e => setNewType(e.target.value)} className="accent-primary"  />
                      Email
                    </Label>
                    <Label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" value="visit" checked={newType==='visit'} onChange={e => setNewType(e.target.value)} className="accent-primary"  />
                      Visit
                    </Label>
                  </div>
                  <textarea 
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Interaction details..."
                    value={newSummary}
                    onChange={e => setNewSummary(e.target.value)}
                    required
                  />
                  <div className="flex justify-end">
                    <Button type="submit" disabled={submitting}>
                      {submitting ? "Saving..." : "Save Interaction"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading interactions...</p>
            ) : interactions.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No interactions recorded yet.</p>
            ) : (
              interactions.map(interaction => (
                <div key={interaction.id} className="relative pl-6 pb-4 border-l last:pb-0 border-muted">
                  <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-primary"  />
                  <div className="flex items-center gap-2 mb-1">
                    {interaction.type === 'call' && <Phone className="w-3 h-3 text-green-500" />}
                    {interaction.type === 'email' && <Mail className="w-3 h-3 text-blue-500" />}
                    {interaction.type === 'visit' && <MapPin className="w-3 h-3 text-purple-500" />}
                    <span className="text-xs font-semibold uppercase">{interaction.type}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(interaction.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{interaction.summary}</p>
                  {interaction.agents && (
                    <div className="mt-2 inline-flex items-center gap-2 text-xs bg-muted/50 px-2 py-1 rounded">
                      <span className="font-medium">{interaction.agents.name}</span>
                      {interaction.agents.company && <span className="text-muted-foreground">({interaction.agents.company})</span>}
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
