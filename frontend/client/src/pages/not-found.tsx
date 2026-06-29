import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-display text-xl font-semibold text-foreground mb-2">Page not found</h1>
        <p className="text-sm text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
        <Link href="/" className="text-sm text-primary hover:underline">
          Go to Discover
        </Link>
      </div>
    </div>
  );
}
