import { http, cookieStorage, createConfig, createStorage } from "@wagmi/vue";
import { sepolia } from "@wagmi/vue/chains";
import { injected, metaMask, walletConnect } from "@wagmi/vue/connectors";

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NUXT_PUBLIC_WC_PROJECT_ID!,
    }),
    metaMask(),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [sepolia.id]: http(),
  },
});

declare module "@wagmi/vue" {
  interface Register {
    config: typeof config;
  }
}
