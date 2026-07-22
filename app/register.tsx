import { Redirect, useLocalSearchParams } from "expo-router";
export default function LegacyRegisterLink() {
  const { inviteCode } = useLocalSearchParams<{ inviteCode?: string }>();
  return <Redirect href={{ pathname: "/c/register", params: inviteCode ? { inviteCode } : {} }} />;
}
