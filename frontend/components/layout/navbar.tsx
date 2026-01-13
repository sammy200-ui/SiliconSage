"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Cpu, Menu, X, Sparkles } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home", icon: Sparkles },
  { href: "/builder", label: "PC Builder", icon: Cpu },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#171514] border-b border-[#292524]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-10 h-10 bg-[#ff4b4b] rounded-xl flex items-center justify-center group-hover:bg-[#ffa828] transition-colors">
                <Cpu className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="text-xl font-bold text-stone-100 group-hover:text-[#ff4b4b] transition-colors">
              SiliconSage
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative px-4 py-2 rounded-lg transition-colors"
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 bg-[#292524] rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className={`relative flex items-center gap-2 text-sm font-medium ${isActive ? "text-[#ff4b4b]" : "text-stone-400 hover:text-stone-200"
                    }`}>
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Link
              href="/builder"
              className="px-4 py-2 bg-[#ff4b4b] hover:bg-[#ffa828] text-white text-sm font-medium rounded-lg transition-all"
            >
              Start Building
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-stone-400 hover:text-stone-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-[#171514] border-b border-[#292524]"
        >
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? "bg-[#292524] text-[#ff4b4b]"
                    : "text-stone-400 hover:bg-[#292524] hover:text-stone-200"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/builder"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center px-4 py-3 bg-[#ff4b4b] text-white font-medium rounded-lg mt-4"
            >
              Start Building
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
