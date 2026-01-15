import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Smartphone, Monitor, CheckCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Install() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-white">NV</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Install Note-Verse Peers</h1>
          <p className="text-muted-foreground">
            Get the full app experience on your device
          </p>
        </div>

        {isInstalled ? (
          <Card className="border-green-500/30 bg-green-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-500">
                <CheckCircle className="w-8 h-8" />
                <div>
                  <p className="font-semibold text-lg">Already Installed!</p>
                  <p className="text-sm text-muted-foreground">
                    Note-Verse Peers is already installed on your device
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Direct Install Button (Android/Desktop Chrome) */}
            {deferredPrompt && (
              <Card className="border-accent/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-accent" />
                    Quick Install
                  </CardTitle>
                  <CardDescription>
                    Install directly from your browser
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleInstall} className="w-full" size="lg">
                    <Download className="w-4 h-4 mr-2" />
                    Install App
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* iOS Instructions */}
            {isIOS && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Install on iPhone/iPad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium">1</span>
                    <p>Tap the <strong>Share</strong> button in Safari (square with arrow)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium">2</span>
                    <p>Scroll down and tap <strong>"Add to Home Screen"</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium">3</span>
                    <p>Tap <strong>"Add"</strong> to install</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Android Instructions (fallback) */}
            {isAndroid && !deferredPrompt && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5" />
                    Install on Android
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium">1</span>
                    <p>Tap the <strong>menu</strong> button (three dots)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium">2</span>
                    <p>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium">3</span>
                    <p>Follow the prompts to install</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Desktop Instructions */}
            {!isIOS && !isAndroid && !deferredPrompt && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    Install on Desktop
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium">1</span>
                    <p>Look for the <strong>install icon</strong> in your browser's address bar</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium">2</span>
                    <p>Or click the <strong>menu</strong> and select "Install Note-Verse Peers"</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">Why Install?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Works offline
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Faster loading
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Full-screen experience
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Quick access from home screen
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
