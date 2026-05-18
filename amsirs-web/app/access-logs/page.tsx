"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AccessLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    console.log("AccessLogsPage mounted, calling fetchLogs()...");
    fetchLogs();
  }, []);

  async function fetchLogs() {
    console.log("Fetching data from Supabase...");
    
    // Added 'error' to the destructuring here
    const { data, error } = await supabase
      .from("access_logs")
      .select(`
          *,
          students (
            first_name,
            last_name,
            student_id,
            face_photo_path
          )
        `)
      .order("scanned_at", {
        ascending: false,
      });

    // Log any errors returned by Supabase (like RLS or join errors)
    if (error) {
      console.error("Supabase fetch error:", error);
      console.error("Error details:", error.message, error.details, error.hint);
    }

    // Log the actual data returned
    console.log("Supabase raw data:", data);

    if (data) {
      setLogs(data);
    }
  }

  function getSnapshotUrl(path: string) {
    const url = supabase.storage
      .from("access-snapshots")
      .getPublicUrl(path).data.publicUrl;
      
    // Optional: uncomment the line below if you suspect images aren't loading properly
    // console.log(`Generated URL for path '${path}':`, url);
    
    return url;
  }

  // Log the current state before rendering
  console.log("Current logs state array length:", logs.length);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Access Logs</h1>

      <div className="overflow-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border">Snapshot</th>
              <th className="p-3 border">Student Name</th>
              <th className="p-3 border">Student ID</th>
              <th className="p-3 border">Match %</th>
              <th className="p-3 border">Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="p-3 border">
                  {log.snapshot_path && (
                    <img
                      src={getSnapshotUrl(log.snapshot_path)}
                      alt="snapshot"
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                </td>

                <td className="p-3 border">
                  {log.students?.first_name} {log.students?.last_name}
                </td>

                <td className="p-3 border">
                  {log.students?.student_id}
                </td>

                <td className="p-3 border">
                  {log.match_percentage}%
                </td>

                <td className="p-3 border">
                  {new Date(log.scanned_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}