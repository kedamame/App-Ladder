"use client";

import { useEffect, useRef, useState } from "react";

export type FarcasterUser = {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
};

type FarcasterState = {
  isInMiniApp: boolean;
  isLoading: boolean;
  user: FarcasterUser | null;
};

export function useFarcasterMiniApp(): FarcasterState {
  const initialized = useRef(false);
  const [state, setState] = useState<FarcasterState>({
    isInMiniApp: false,
    isLoading: true,
    user: null,
  });

  useEffect(() => {
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    import("@farcaster/miniapp-sdk")
      .then(async ({ sdk }) => {
        const isMiniApp = await sdk.isInMiniApp();

        if (!isMiniApp) {
          setState({ isInMiniApp: false, isLoading: false, user: null });
          return;
        }

        await sdk.actions.ready();

        try {
          const ethereumProvider = await sdk.wallet.getEthereumProvider();

          if (ethereumProvider && typeof window !== "undefined") {
            window.ethereum = ethereumProvider;
          }
        } catch {
          // Wallet provider is optional for the MVP experience.
        }

        let user: FarcasterUser | null = null;

        try {
          const context = await sdk.context;

          if (context?.user) {
            user = {
              fid: context.user.fid,
              username: context.user.username,
              displayName: context.user.displayName,
              pfpUrl: context.user.pfpUrl,
            };
          }
        } catch {
          // Context can be absent in browser mode and should not block the app.
        }

        setState({ isInMiniApp: true, isLoading: false, user });
      })
      .catch(() => {
        setState({ isInMiniApp: false, isLoading: false, user: null });
      });
  }, []);

  return state;
}
