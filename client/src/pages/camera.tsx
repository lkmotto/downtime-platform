import { useData } from "@/lib/DataContext";
import { getEvents } from "@/lib/data";
import { EventCard } from "@/components/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Camera } from "lucide-react";

export default function CameraPage() {
  const { data, loading } = useData();

  if (loading || !data) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const events = getEvents(data, { cameraOnly: true });

  return (
    <div className="p-4 lg:p-6 max-w-[1400px] space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <Camera className="w-5 h-5 text-primary" />
          Bring the Camera
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Events and places worth shooting. Each pick includes a camera note with gear tips and shot ideas.
        </p>
      </div>

      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Camera className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No camera-worthy picks yet.</p>
          <p className="text-xs mt-1">Your agent is looking for the best photo and video opportunities.</p>
        </div>
      )}
    </div>
  );
}
