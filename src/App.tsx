import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Laundry from "./pages/Laundry";
import Upload from "./pages/Upload";
import Wardrobe from "./pages/Wardrobe";
import NotFound from "./pages/NotFound";
import { BottomNav } from "./components/BottomNav";

const queryClient = new QueryClient();

const App = () => {
  // Enable dark mode by default
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/laundry" element={<Laundry />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/wardrobe" element={<Wardrobe />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
