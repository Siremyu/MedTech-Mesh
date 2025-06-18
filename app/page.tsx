"use client";

import * as React from "react";
import { Navbar } from "@/components/navbar";
import { ModelGrid } from "@/components/model-grid";
import { Footer } from "@/components/footer";

// Sample data
const sampleModels = Array.from({ length: 8 }, (_, i) => ({
  id: `model-${i}`,
  title: "Nama Produk",
  author: "Author",
  downloads: 474,
  likes: 474,
}));

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Add top padding to account for fixed navbar */}
      <main className="mt-[92px] space-y-12">
        <ModelGrid title="Recently Add" models={sampleModels} />
        <ModelGrid title="Popular" models={sampleModels} />
        <ModelGrid title="Other" models={sampleModels} />
      </main>

      <Footer />
    </div>
  );
}
