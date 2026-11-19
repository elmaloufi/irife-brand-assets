import { EmptyState } from "../../src/components/EmptyState";
import { ScreenContainer } from "../../src/components/ScreenContainer";

export default function RequestsScreen() {
  return (
    <ScreenContainer>
      <EmptyState
        title="Your requests"
        description="Your enquiry history will appear here after the authentication, API contract, and ownership controls are implemented."
      />
    </ScreenContainer>
  );
}
