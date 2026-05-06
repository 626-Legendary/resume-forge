import Link from "next/link";
import Image from "next/image";
import { FaCoffee, FaEnvelope, FaGithub } from "react-icons/fa";

import logo from "@/public/logo.png";

const footerLinks = [
  {
    label: "GitHub",
    href: "https://github.com/626-Legendary",
    icon: FaGithub,
    external: true,
  },
  {
    label: "Support",
    href: "mailto:zhangzexiang626@gmail.com?subject=Resume%20Forge%20Support",
    icon: FaEnvelope,
    external: false,
  },
  {
    label: "Coffee",
    href: "https://buymeacoffee.com/zexiangzhang",
    icon: FaCoffee,
    external: true,
  },
];

const AppFooter = () => {
  return (
    <footer className="relative overflow-hidden border-t border-orange-500/25 bg-[#07090c] px-4 py-7 text-zinc-500 sm:px-5 md:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(249,115,22,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(249,115,22,0.12) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "linear-gradient(to bottom, black, transparent 78%)",
        }}
      />

      <div className="relative mx-auto max-w-[1720px]">
        <div className="mb-5 h-px w-full bg-gradient-to-r from-transparent via-orange-500/45 to-transparent" />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                aria-label="Resume Forge Home"
                className="grid h-11 w-11 shrink-0 place-items-center border border-orange-500/45 bg-orange-500/10 transition hover:border-orange-400 hover:bg-orange-500/15"
              >
                <Image
                  src={logo}
                  alt="Resume Forge Logo"
                  width={34}
                  height={34}
                  className="h-8 w-8 object-contain"
                  priority
                />
              </Link>

              <div className="min-w-0">
                <p className="font-[var(--font-orbitron)] text-sm font-black uppercase tracking-[0.24em] text-orange-400 sm:tracking-[0.28em]">
                  Resume Forge
                </p>

                <p className="mt-1 hidden font-[var(--font-mono)] text-[11px] uppercase tracking-[0.16em] text-zinc-600 sm:block">
                  JSON to print-ready resume
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-xl font-[var(--font-mono)] text-xs leading-6 text-zinc-500 sm:text-sm">
              Forge tailored resumes faster. Parse JSON, preview instantly, and
              export clean PDFs for your next application.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-3"
          >
            {footerLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="group inline-flex items-center gap-2 border border-zinc-800 bg-[#07090c]/60 px-3 py-2 font-[var(--font-orbitron)] text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-400 transition hover:border-orange-500/60 hover:text-orange-400 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:text-xs sm:tracking-[0.16em]"
                >
                  <Icon className="text-sm text-zinc-500 transition group-hover:text-orange-400" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-7 flex flex-col gap-4 border-t border-zinc-800 pt-5 font-[var(--font-mono)] text-xs leading-5 text-zinc-600 md:flex-row md:items-end md:justify-between">
          <div>
            <p>
              Copyright {new Date().getFullYear()} Resume Forge. All rights
              reserved.
            </p>

            <p className="mt-1 text-zinc-500">
              Independent project built by{" "}
              <Link
                href="https://www.linkedin.com/in/zexiangzhang/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 transition hover:text-orange-300"
              >
                Zexiang Zhang
              </Link>
              .
            </p>
          </div>

          <p className="max-w-md text-zinc-500 md:text-right">
            Built to help job seekers move faster, apply smarter, and land
            sooner.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default AppFooter;
