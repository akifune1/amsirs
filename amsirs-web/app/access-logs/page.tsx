"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

export default function AccessLogsPage() {
  const [logs, setLogs] =
    useState<any[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    const { data } =
      await supabase
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

    if (data) {
      setLogs(data);
    }
  }

  function getSnapshotUrl(
    path: string
  ) {
    return supabase.storage
      .from("access-snapshots")
      .getPublicUrl(path)
      .data.publicUrl;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Access Logs
      </h1>

      <div className="overflow-auto">
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-3 border">
                Snapshot
              </th>

              <th className="p-3 border">
                Student Name
              </th>

              <th className="p-3 border">
                Student ID
              </th>

              <th className="p-3 border">
                Match %
              </th>

              <th className="p-3 border">
                Timestamp
              </th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="p-3 border">
                  {log.snapshot_path && (
                    <img
                      src={getSnapshotUrl(
                        log.snapshot_path
                      )}
                      alt="snapshot"
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                </td>

                <td className="p-3 border">
                  {
                    log.students
                      ?.first_name
                  }{" "}
                  {
                    log.students
                      ?.last_name
                  }
                </td>

                <td className="p-3 border">
                  {
                    log.students
                      ?.student_id
                  }
                </td>

                <td className="p-3 border">
                  {
                    log.match_percentage
                  }
                  %
                </td>

                <td className="p-3 border">
                  {new Date(
                    log.scanned_at
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}