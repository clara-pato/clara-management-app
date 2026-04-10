import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Auto-source logic: derive from source URL or payload or user-agent
    let source = body.source;
    if (!source) {
      const userAgent = request.headers.get('user-agent') || '';
      
      if (body.listing_url) {
        if (body.listing_url.includes('instagram.com')) {
          source = 'Instagram';
        } else if (body.listing_url.includes('immowelt.de')) {
          source = 'Immowelt';
        } else if (body.listing_url.includes('immoscout24.de')) {
          source = 'ImmoScout24';
        } else if (body.listing_url.includes('kleinanzeigen.de')) {
          source = 'Kleinanzeigen';
        } else {
          source = 'Other';
        }
      } else if (userAgent.includes('ig_scraper')) {
        source = 'Instagram';
      } else if (userAgent.includes('parse_immowelt')) {
        source = 'Immowelt';
      } else {
        source = 'System';
      }
    }

    const payload = {
      ...body,
      source
    };

    const { data, error } = await supabase
      .from('locations')
      .insert([payload])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
