"use client";

import { useState } from "react";
import { Volume2, VolumeX, Play, Pause, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTts } from "@/hooks/use-tts";

export function TtsControls({ content }) {
  const { speaking, paused, rate, setRate, voice, setVoice, voices, speak, stop, togglePlayPause, supported } = useTts();
  const [open, setOpen] = useState(false);

  if (!supported) return null;

  const handleSpeak = () => {
    if (speaking) {
      stop();
    } else if (content) {
      speak(content);
    }
  };

  return (
    <div className="relative">
      <Button
        variant={speaking ? "default" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={() => setOpen(!open)}
        aria-label="Text to speech"
      >
        {speaking ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 w-64 rounded-lg border bg-popover p-3 shadow-lg">
          <div className="space-y-3">
            <Label className="text-xs font-medium">Text-to-Speech</Label>

            <div className="flex gap-1">
              <Button
                variant={speaking ? "destructive" : "default"}
                size="sm"
                className="h-7 text-xs flex-1"
                onClick={handleSpeak}
              >
                {speaking ? <Square className="h-3 w-3 mr-1" /> : <Play className="h-3 w-3 mr-1" />}
                {speaking ? "Stop" : "Read Aloud"}
              </Button>
              {speaking && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7"
                  onClick={togglePlayPause}
                >
                  {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                </Button>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Speed: {rate}x</Label>
              <Slider
                min={0.5}
                max={2}
                step={0.1}
                value={[rate]}
                onValueChange={([v]) => setRate(v)}
              />
            </div>

            {voices.length > 0 && (
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Voice</Label>
                <Select value={voice?.name || ""} onValueChange={(name) => {
                  const v = voices.find((v) => v.name === name);
                  if (v) setVoice(v);
                }}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((v) => (
                      <SelectItem key={v.name} value={v.name} className="text-xs">
                        {v.name} ({v.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
