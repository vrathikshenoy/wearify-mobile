import { createContext, useContext, type PropsWithChildren } from "react";
import { useNetworkState } from "expo-network";

const ConnectivityContext = createContext(true);

export function ConnectivityProvider({ children }: PropsWithChildren) {
  const network = useNetworkState();
  return (
    <ConnectivityContext.Provider value={network.isConnected !== false}>
      {children}
    </ConnectivityContext.Provider>
  );
}

export const useIsOnline = () => useContext(ConnectivityContext);
