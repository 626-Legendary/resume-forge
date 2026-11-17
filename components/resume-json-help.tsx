"use client";

import { useState } from "react";
import schema from "@/constants/default.json";

// Reuse the full content schema, leaving export metadata out of this writing guide.
const framework = JSON.stringify(
  {
    ...schema,
    basicInfo: { name: "Your Name", contact: schema.basicInfo.contact },
  },
  null,
  2,
);

export default function ResumeJsonHelp() {
  const [copyStatus, setCopyStatus] = useState("");
  async function copyFramework() {
    try {
      await navigator.clipboard.writeText(framework);
      setCopyStatus("JSON framework copied.");
    } catch {
      setCopyStatus("Copy unavailable. Select and copy the JSON below.");
    }
  }
  return (
    <details className="builder-help">
      <summary>JSON format and tips</summary>
      <p>
        Start with the complete framework below. Only the name is required;
        leave optional fields empty or remove sections you do not need.
      </p>
      <ul className="schema-guide">
        <li>
          <strong>basicInfo:</strong> name, phone, email, location, profile
          links and work status.
        </li>
        <li>
          <strong>summary:</strong> a short professional introduction.
        </li>
        <li>
          <strong>skills:</strong> categories containing lists of skills.
        </li>
        <li>
          <strong>experiences:</strong> employers, roles, locations, dates and
          achievement bullets.
        </li>
        <li>
          <strong>projects:</strong> names, tools, dates, links and description
          bullets.
        </li>
        <li>
          <strong>education:</strong> schools, degrees, majors, dates, GPA,
          honors and details.
        </li>
        <li>
          <strong>certifications:</strong> names, issuers, dates, credential IDs
          and verification links.
        </li>
      </ul>
      <p>
        Keep text in double quotes, use arrays for multiple entries, and avoid
        trailing commas. Ask your AI assistant to follow this structure and
        return valid JSON without Markdown fences.
      </p>
      <p>
        After editing, select Parse JSON to update the preview. Font sizes and
        spacing can be adjusted separately.
      </p>
      <p>
        Markdown-style profile links are cleaned automatically, including Google
        search wrappers that contain a direct website URL.
      </p>
      <button type="button" onClick={copyFramework}>
        Copy JSON framework
      </button>
      <p role="status">{copyStatus}</p>
      <pre
        className="schema-example"
        tabIndex={0}
        aria-label="Complete resume JSON framework"
      >
        {framework}
      </pre>
    </details>
  );
}
