import { EmptyState } from "../../src/components/EmptyState";
import { ScreenContainer } from "../../src/components/ScreenContainer";

export default function ProfileScreen() {
  return (
    <ScreenContainer>
      <EmptyState
        title="Your IRIFE profile"
        description="Account creation, secure sessions, and profile settings will be added after the authentication design is approved."
      />
    </ScreenContainer>
  );
}
