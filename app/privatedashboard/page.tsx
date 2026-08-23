"use client";

import { useState } from "react";
import ResumeTemplateRenderer from "@/components/resume-template-renderer";
import {
  DEFAULT_RESUME_TEMPLATE_ID,
  RESUME_TEMPLATE_OPTIONS,
  type ResumeTemplateId,
} from "@/lib/resume-template";
import {
  createStoredResumeExport,
  defaultResumeJson,
  mockResumeJson,
  parseResumeJson,
  RESUME_STORAGE_KEY,
  stringifyResumeJson,
} from "@/lib/resume";
import type { ResumeData } from "@/types/resume";

const defaultJsonInput = stringifyResumeJson(defaultResumeJson);
const mockJsonInput = stringifyResumeJson(mockResumeJson);

const Page = () => {
  const [jsonInput, setJsonInput] = useState(defaultJsonInput);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [templateId, setTemplateId] = useState<ResumeTemplateId>(
    DEFAULT_RESUME_TEMPLATE_ID
  );
  const [error, setError] = useState("");

  const handleExport = () => {
    if (!resumeData) {
      setError("Please generate a preview before exporting.");
      return;
    }

    window.localStorage.setItem(
      RESUME_STORAGE_KEY,
      stringifyResumeJson(createStoredResumeExport(resumeData, templateId))
    );
    window.open("/privateexport", "_blank", "noopener,noreferrer");
  };

  const handleParse = () => {
    try {
      setResumeData(parseResumeJson(jsonInput));
      setError("");
    } catch {
      setResumeData(null);
      setError("Invalid JSON. Please check your format.");
    }
  };

  const handleLoadMockData = () => {
    setJsonInput(mockJsonInput);
    setResumeData(parseResumeJson(mockJsonInput));
    setError("");
  };

  const handleReset = () => {
    setJsonInput(defaultJsonInput);
    setResumeData(null);
    setError("");
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-5 py-6 sm:px-8 lg:px-12">
        <div className="grid flex-1 gap-10 py-8 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)] lg:gap-16">
          <section className="flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Your resume data</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  Edit the JSON below, then generate a preview.
                </p>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-sm text-zinc-500 underline decoration-zinc-300 underline-offset-4 transition hover:text-black"
              >
                Reset
              </button>
            </div>

            <textarea
              value={jsonInput}
              onChange={(event) => setJsonInput(event.target.value)}
              placeholder="Paste your resume JSON here..."
              spellCheck={false}
              className="mt-6 min-h-[520px] w-full resize-y border border-zinc-300 bg-zinc-50 p-4 font-mono text-xs leading-6 text-black outline-none transition focus:border-black sm:text-sm"
            />

            <div className="mt-3 min-h-6 text-sm">
              {error ? (
                <p className="text-red-600">{error}</p>
              ) : resumeData ? (
                <p className="text-zinc-600">Preview is ready.</p>
              ) : (
                <p className="text-zinc-400">Ready to parse.</p>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleParse}
                className="bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-zinc-700"
              >
                Generate preview
              </button>
              <button
                type="button"
                onClick={handleLoadMockData}
                className="px-2 py-3 text-sm text-zinc-500 underline decoration-zinc-300 underline-offset-4 transition hover:text-black"
              >
                Try example
              </button>
            </div>

            <div className="mt-10 border-t border-zinc-200 pt-6">
              <label htmlFor="template" className="text-sm font-semibold">
                Template
              </label>
              <select
                id="template"
                value={templateId}
                onChange={(event) =>
                  setTemplateId(event.target.value as ResumeTemplateId)
                }
                className="mt-3 w-full border border-zinc-300 bg-white px-3 py-3 text-sm outline-none focus:border-black"
              >
                {RESUME_TEMPLATE_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="min-w-0 lg:border-l lg:border-zinc-200 lg:pl-10">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Preview</h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {resumeData ? "Your latest generated resume" : "Nothing generated yet"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleExport}
                disabled={!resumeData}
                className="border border-black px-4 py-2 text-sm font-medium transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-300 disabled:hover:bg-white disabled:hover:text-zinc-300"
              >
                Export PDF
              </button>
            </div>

            <div className="mt-6 min-h-[620px] overflow-auto bg-zinc-100 p-4 sm:p-8">
              {resumeData ? (
                <div className="w-max">
                  <div className="h-fit w-[816px] shrink-0 bg-white text-black shadow-sm">
                    <ResumeTemplateRenderer
                      data={resumeData}
                      templateId={templateId}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[520px] items-center justify-center text-center">
                  <div>
                    <p className="text-lg font-medium">Your resume will appear here.</p>
                    <p className="mt-2 text-sm text-zinc-500">
                      Parse the JSON to create a live preview.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Page;
