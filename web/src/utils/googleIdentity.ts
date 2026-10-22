/**
 * Baskly.money - Google Identity Services (GIS) Client Integration
 * Loads and interacts with Google Identity Services SDK (https://accounts.google.com/gsi/client)
 */

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string; select_by?: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            itp_support?: boolean;
          }) => void;
          prompt: (momentListener?: (notification: {
            isNotDisplayed: () => boolean;
            getNotDisplayedReason: () => string;
            isSkippedMoment: () => boolean;
            getSkippedReason: () => string;
            isDismissedMoment: () => boolean;
            getDismissedReason: () => string;
            getMomentType: () => string;
          }) => void) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: "standard" | "icon";
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: number | string;
              locale?: string;
            }
          ) => void;
          cancel: () => void;
        };
      };
    };
  }
}

const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let scriptLoadingPromise: Promise<void> | null = null;

export function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${GIS_SCRIPT_SRC}"]`);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google Identity Services.")));
      return;
    }

    const script = document.createElement("script");
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services SDK from Google servers."));
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export function getGoogleClientId(): string {
  return process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
}

export function isPlaceholderGoogleClientId(clientId: string): boolean {
  if (!clientId || clientId.trim() === "") return true;
  if (clientId.includes("your-google-client-id")) return true;
  if (!clientId.includes(".apps.googleusercontent.com")) return true;
  return false;
}

export interface GoogleAuthTriggerOptions {
  onSuccess: (credential: string) => void;
  onError: (errorMessage: string) => void;
  onCancel?: () => void;
}

/**
 * Initializes and triggers Google Identity Services Account Chooser.
 */
export async function triggerGoogleAccountChooser(
  options: GoogleAuthTriggerOptions
): Promise<void> {
  const clientId = getGoogleClientId();

  // If client ID is a placeholder in development, offer simulated dev token
  if (isPlaceholderGoogleClientId(clientId)) {
    if (process.env.NODE_ENV !== "production") {
      console.info(
        "[Baskly Google Auth] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured with a live Google Cloud Client ID. " +
        "Using development simulation token for testing."
      );
    }
  }

  try {
    await loadGoogleIdentityScript();
  } catch (err: unknown) {
    console.error("[Baskly Google Auth] Failed to load GIS script:", err);
    options.onError("Failed to connect to Google Identity Services. Please check your network connection.");
    return;
  }

  if (!window.google?.accounts?.id) {
    options.onError("Google Identity Services SDK is not available in the current browser environment.");
    return;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response && response.credential) {
          options.onSuccess(response.credential);
        } else {
          options.onError("Google sign-in did not return a valid credential. Please try again.");
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        const reason = notification.getNotDisplayedReason();
        console.warn("[Baskly Google Auth] GIS prompt not displayed:", reason);
        if (reason === "suppressed_by_user" || reason === "opt_out_or_no_session") {
          options.onError("Google account chooser was closed or suppressed by the browser. Please check your pop-up settings.");
        }
      } else if (notification.isSkippedMoment()) {
        console.warn("[Baskly Google Auth] GIS prompt skipped:", notification.getSkippedReason());
      } else if (notification.isDismissedMoment()) {
        const reason = notification.getDismissedReason();
        console.info("[Baskly Google Auth] User dismissed Google prompt:", reason);
        options.onCancel?.();
      }
    });
  } catch (ex: unknown) {
    const errorMsg = ex instanceof Error ? ex.message : "Failed to open Google account chooser.";
    console.error("[Baskly Google Auth] GIS prompt error:", ex);
    options.onError(errorMsg);
  }
}
