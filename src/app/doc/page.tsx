"use client";

import React, { useEffect, useState, ComponentType } from "react";

export default function DocPage() {
  const [Loaded, setLoaded] = useState(false);

  useEffect(() => {
    import("swagger-ui-react").then(() => setLoaded(true));
  }, []);

  if (!Loaded) {
    return (
      <div style={{ maxWidth: 960, margin: "0 auto", padding: 40, textAlign: "center" }}>
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
        <p className="text-gray-400 mt-4">Loading API Docs...</p>
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const SwaggerUI = require("swagger-ui-react").default as ComponentType<{ spec: object }>;

  const spec = {
    openapi: "3.0.0",
    info: { title: "Habit Tracker API", version: "1.0.0" },
    paths: {},
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: 20 }}>
      <SwaggerUI spec={spec} />
    </div>
  );
}