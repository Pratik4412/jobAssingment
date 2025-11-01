"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        process.env.NEXT_PUBLIC_API_BASE_URL + "/api/logs/import-logs"
      );
      setLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch import logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-center mb-8">
        <h1 className="text-5xl font-bold">Import Data </h1>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table
          border="1"
          cellPadding="8"
          cellSpacing="0"
          className="w-full border-collapse text-left"
        >
          <thead className="bg-gray-200">
            <tr>
              <th className="py-2 px-6 border border-black">Feed (fileName)</th>
              <th className="py-2 px-6 border border-black">Timestamp</th>
              <th className="py-2 px-6 border border-black">Total</th>
              <th className="py-2 px-6 border border-black">Imported</th>
              <th className="py-2 px-6 border border-black">New</th>
              <th className="py-2 px-6 border border-black">Updated</th>
              <th className="py-2 px-6 border border-black">Failed Count</th>
              <th className="py-2 px-6 border border-black">Failed Reasons</th>
              <th className="py-2 px-6 border border-black">Duration (ms)</th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  className="py-2 px-6 border text-center border-black"
                  colSpan="9"
                >
                  No import logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id}>
                  <td className="py-2 px-6 border border-black">
                    <a
                      href={log.fileName}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {log.fileName}
                    </a>
                  </td>
                  <td className="py-2 px-6 border border-black">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="py-2 px-6 border border-black">
                    {log.totalFetched}
                  </td>
                  <td className="py-2 px-6 border border-black">
                    {log.totalImported}
                  </td>
                  <td className="py-2 px-6 border border-black">
                    {log.newJobs}
                  </td>
                  <td className="py-2 px-6 border border-black">
                    {log.updatedJobs}
                  </td>

                  <td className="py-2 px-6 border border-black">
                    {log.failedJobs?.length || 0}
                  </td>

                  <td className="py-2 px-6 border border-black">
                    {log.failedJobs?.length > 0 ? (
                      <ul>
                        {log.failedJobs.map((fail, i) => (
                          <li key={i} style={{ color: "red" }}>
                            {fail.reason || "Unknown error"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      " "
                    )}
                  </td>

                  <td className="py-2 px-6 border border-black">
                    {log.durationMs}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
