import NetInfo from "@react-native-community/netinfo";

function isOnlineState(state: {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}): boolean {
  return (
    state.isConnected === true &&
    state.isInternetReachable !== false
  );
}

export async function hasInternetConnection(): Promise<boolean> {
  const state = await NetInfo.fetch();

  return isOnlineState(state);
}

export function subscribeToInternetConnection(
  listener: (isOnline: boolean) => void,
): () => void {
  return NetInfo.addEventListener((state) => {
    listener(isOnlineState(state));
  });
}
