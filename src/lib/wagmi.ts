import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { base } from "wagmi/chains";

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [],
  transports: {
    [base.id]: http(),
  },
  multiInjectedProviderDiscovery: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
});
