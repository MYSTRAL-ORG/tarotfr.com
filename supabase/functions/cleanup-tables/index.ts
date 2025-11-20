import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);

    const { data: waitingTables, error: waitingError } = await supabase
      .from("tables")
      .select("id, created_at, status")
      .eq("status", "WAITING")
      .lt("created_at", oneHourAgo.toISOString());

    if (waitingError) throw waitingError;

    const { data: playingTables, error: playingError } = await supabase
      .from("tables")
      .select("id, created_at, status")
      .eq("status", "PLAYING")
      .lt("created_at", threeHoursAgo.toISOString());

    if (playingError) throw playingError;

    const tablesToDelete = [...(waitingTables || []), ...(playingTables || [])];

    const deletedTables = [];

    for (const table of tablesToDelete) {
      await supabase
        .from("table_players")
        .delete()
        .eq("table_id", table.id);

      const { error: tableError } = await supabase
        .from("tables")
        .delete()
        .eq("id", table.id);

      if (!tableError) {
        deletedTables.push(table.id);
      }
    }

    const response = {
      success: true,
      message: `Cleaned up ${deletedTables.length} inactive tables`,
      deletedTables: deletedTables.length,
      waitingTablesFound: waitingTables?.length || 0,
      playingTablesFound: playingTables?.length || 0,
    };

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in cleanup-tables function:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
